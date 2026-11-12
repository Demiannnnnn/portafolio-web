use std::{
	net::{IpAddr, SocketAddr},
	sync::{Arc, OnceLock},
};

use axum::{
	extract::{ConnectInfo, State},
	http::{HeaderMap, StatusCode},
	Json,
};
use uuid::Uuid;

use super::{model::{RegisterVisitorRequest, TemporaryVisitorResponse}, service::VisitorService};
use crate::shared::state::AppState;

/// Que cabeceras de proxy se consideran fiables al resolver la IP del cliente.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub(crate) struct ClientIpConfig {
	/// Numero de proxies de confianza delante del backend (`TRUSTED_PROXY_COUNT`).
	pub trusted_proxies: usize,
	/// Usar `cf-connecting-ip` (`TRUST_CF_CONNECTING_IP`); solo si el trafico llega siempre via Cloudflare.
	pub trust_cf: bool,
}

impl ClientIpConfig {
	/// Interpreta los valores de `TRUSTED_PROXY_COUNT` y `TRUST_CF_CONNECTING_IP`.
	/// Ausente o invalido => 0 proxies / sin Cloudflare (lo mas conservador).
	pub(crate) fn from_values(trusted_proxies: Option<&str>, trust_cf: Option<&str>) -> Self {
		let trusted_proxies = match trusted_proxies.map(str::trim).filter(|v| !v.is_empty()) {
			None => 0,
			Some(raw) => raw.parse::<usize>().unwrap_or_else(|_| {
				eprintln!("TRUSTED_PROXY_COUNT invalido ({raw:?}); se usa 0");
				0
			}),
		};
		let trust_cf = matches!(
			trust_cf.map(|v| v.trim().to_ascii_lowercase()).as_deref(),
			Some("1" | "true" | "yes")
		);
		Self { trusted_proxies, trust_cf }
	}

	fn from_env() -> Self {
		Self::from_values(
			std::env::var("TRUSTED_PROXY_COUNT").ok().as_deref(),
			std::env::var("TRUST_CF_CONNECTING_IP").ok().as_deref(),
		)
	}
}

static CLIENT_IP_CONFIG: OnceLock<ClientIpConfig> = OnceLock::new();

/// Configuracion leida del entorno una sola vez (se fuerza al arrancar en `build_app`).
pub(crate) fn client_ip_config() -> ClientIpConfig {
	*CLIENT_IP_CONFIG.get_or_init(ClientIpConfig::from_env)
}

fn header<'a>(headers: &'a HeaderMap, name: &str) -> Option<&'a str> {
	headers
		.get(name)
		.and_then(|value| value.to_str().ok())
		.map(str::trim)
		.filter(|value| !value.is_empty())
}

/// Resuelve la IP del cliente sin fiarse de cabeceras que el propio cliente puede inventar.
///
/// - `cf-connecting-ip` solo se usa con `trust_cf`.
/// - Con 0 proxies de confianza se ignoran `x-forwarded-for` y `x-real-ip` y se usa el peer TCP.
/// - Con N proxies, cada uno anade a `x-forwarded-for` la IP que vio, asi que el cliente es la
///   N-esima entrada contando desde la derecha; lo que haya mas a la izquierda lo escribio el
///   cliente. Si hay menos de N entradas se usa la mas a la izquierda. Sin `x-forwarded-for`
///   se recurre a `x-real-ip` y despues al peer.
pub(crate) fn client_ip(headers: &HeaderMap, peer: Option<IpAddr>, config: ClientIpConfig) -> String {
	let peer = || peer.map(|ip| ip.to_string());

	if config.trust_cf {
		if let Some(ip) = header(headers, "cf-connecting-ip") {
			return ip.to_string();
		}
	}

	if config.trusted_proxies == 0 {
		return peer().unwrap_or_else(|| "unknown".to_string());
	}

	let forwarded: Vec<&str> = header(headers, "x-forwarded-for")
		.map(|value| value.split(',').map(str::trim).filter(|s| !s.is_empty()).collect())
		.unwrap_or_default();

	if !forwarded.is_empty() {
		let index = forwarded.len().saturating_sub(config.trusted_proxies);
		return forwarded[index].to_string();
	}

	header(headers, "x-real-ip")
		.map(str::to_string)
		.or_else(peer)
		.unwrap_or_else(|| "unknown".to_string())
}

pub async fn register_visitor(
	State(app_state): State<AppState>,
	ConnectInfo(peer): ConnectInfo<SocketAddr>,
	headers: HeaderMap,
	Json(payload): Json<RegisterVisitorRequest>,
) -> Result<Json<TemporaryVisitorResponse>, StatusCode> {
	let ip_source = client_ip(&headers, Some(peer.ip()), client_ip_config());

	let visitor_service: &Arc<VisitorService> = &app_state.visitor_service;
	visitor_service
		.register_visitor(ip_source, payload)
		.await
		.map(Json)
		.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

pub async fn current_visitor(
	State(app_state): State<AppState>,
	headers: HeaderMap,
	) -> Result<Json<TemporaryVisitorResponse>, StatusCode> {
	let session_token = headers
		.get("x-session-token")
		.and_then(|value| value.to_str().ok())
		.and_then(|value| Uuid::parse_str(value).ok())
		.ok_or(StatusCode::BAD_REQUEST)?;

	let visitor_service: &Arc<VisitorService> = &app_state.visitor_service;
	visitor_service
		.find_by_session_token(session_token)
		.await
		.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
		.map(Json)
		.ok_or(StatusCode::NOT_FOUND)
}

#[cfg(test)]
mod tests {
	use axum::http::HeaderValue;

	use super::*;

	const PEER: Option<IpAddr> = Some(IpAddr::V4(std::net::Ipv4Addr::new(10, 0, 0, 9)));

	fn headers(pairs: &[(&'static str, &str)]) -> HeaderMap {
		let mut map = HeaderMap::new();
		for (name, value) in pairs {
			map.insert(*name, HeaderValue::from_str(value).unwrap());
		}
		map
	}

	fn proxies(n: usize) -> ClientIpConfig {
		ClientIpConfig { trusted_proxies: n, trust_cf: false }
	}

	#[test]
	fn sin_proxies_ignora_cabeceras_y_usa_el_peer() {
		let h = headers(&[("x-forwarded-for", "1.1.1.1"), ("x-real-ip", "3.3.3.3")]);
		assert_eq!(client_ip(&h, PEER, proxies(0)), "10.0.0.9");
	}

	#[test]
	fn sin_proxies_ni_peer_devuelve_unknown() {
		assert_eq!(client_ip(&HeaderMap::new(), None, proxies(0)), "unknown");
	}

	#[test]
	fn un_proxy_toma_la_ultima_entrada_aunque_la_primera_sea_falsa() {
		let h = headers(&[("x-forwarded-for", "6.6.6.6, 2.2.2.2")]);
		assert_eq!(client_ip(&h, PEER, proxies(1)), "2.2.2.2");
	}

	#[test]
	fn dos_proxies_toman_la_penultima_entrada() {
		let h = headers(&[("x-forwarded-for", "6.6.6.6, 2.2.2.2, 172.16.0.1")]);
		assert_eq!(client_ip(&h, PEER, proxies(2)), "2.2.2.2");
	}

	#[test]
	fn mas_proxies_que_entradas_usa_la_mas_a_la_izquierda() {
		let h = headers(&[("x-forwarded-for", "2.2.2.2, 172.16.0.1")]);
		assert_eq!(client_ip(&h, PEER, proxies(5)), "2.2.2.2");
	}

	#[test]
	fn x_forwarded_for_con_espacios_y_entradas_vacias() {
		let h = headers(&[("x-forwarded-for", " 6.6.6.6 ,, 2.2.2.2 , ")]);
		assert_eq!(client_ip(&h, PEER, proxies(1)), "2.2.2.2");
	}

	#[test]
	fn sin_x_forwarded_for_cae_a_x_real_ip_y_despues_al_peer() {
		let h = headers(&[("x-real-ip", "3.3.3.3")]);
		assert_eq!(client_ip(&h, PEER, proxies(1)), "3.3.3.3");
		assert_eq!(client_ip(&HeaderMap::new(), PEER, proxies(1)), "10.0.0.9");
		assert_eq!(client_ip(&HeaderMap::new(), None, proxies(1)), "unknown");
	}

	#[test]
	fn cloudflare_se_ignora_por_defecto() {
		let h = headers(&[("cf-connecting-ip", "1.1.1.1"), ("x-forwarded-for", "2.2.2.2")]);
		assert_eq!(client_ip(&h, PEER, proxies(1)), "2.2.2.2");
		assert_eq!(client_ip(&h, PEER, proxies(0)), "10.0.0.9");
	}

	#[test]
	fn cloudflare_tiene_prioridad_si_se_confia_en_el() {
		let h = headers(&[("cf-connecting-ip", "1.1.1.1"), ("x-forwarded-for", "2.2.2.2")]);
		let config = ClientIpConfig { trusted_proxies: 0, trust_cf: true };
		assert_eq!(client_ip(&h, PEER, config), "1.1.1.1");
	}

	#[test]
	fn cabecera_no_ascii_se_ignora() {
		let mut h = HeaderMap::new();
		h.insert("x-forwarded-for", HeaderValue::from_bytes(b"\xff").unwrap());
		h.insert("x-real-ip", HeaderValue::from_static("3.3.3.3"));
		assert_eq!(client_ip(&h, PEER, proxies(1)), "3.3.3.3");
	}

	#[test]
	fn configuracion_desde_variables() {
		assert_eq!(ClientIpConfig::from_values(None, None), ClientIpConfig::default());
		assert_eq!(ClientIpConfig::from_values(Some(" 2 "), Some("true")), ClientIpConfig { trusted_proxies: 2, trust_cf: true });
		assert_eq!(ClientIpConfig::from_values(Some(""), Some("1")).trusted_proxies, 0);
		assert_eq!(ClientIpConfig::from_values(Some("-1"), Some("no")), ClientIpConfig::default());
		assert_eq!(ClientIpConfig::from_values(Some("abc"), Some("TRUE")), ClientIpConfig { trusted_proxies: 0, trust_cf: true });
	}
}
