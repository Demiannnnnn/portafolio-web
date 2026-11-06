use std::sync::Arc;

use axum::{extract::State, http::{HeaderMap, StatusCode}, Json};
use uuid::Uuid;

use super::{model::{RegisterVisitorRequest, TemporaryVisitorResponse}, service::VisitorService};
use crate::shared::state::AppState;

/// Resuelve la IP del cliente desde las cabeceras del proxy:
/// `cf-connecting-ip`, luego el primer valor de `x-forwarded-for`, luego `x-real-ip`.
pub(crate) fn client_ip(headers: &HeaderMap) -> String {
	headers
		.get("cf-connecting-ip")
		.and_then(|value| value.to_str().ok())
		.or_else(|| {
			headers
				.get("x-forwarded-for")
				.and_then(|value| value.to_str().ok())
				.and_then(|s| s.split(',').next())
				.map(|s| s.trim())
		})
		.or_else(|| headers.get("x-real-ip").and_then(|value| value.to_str().ok()))
		.unwrap_or("unknown")
		.to_string()
}

pub async fn register_visitor(
	State(app_state): State<AppState>,
	headers: HeaderMap,
	Json(payload): Json<RegisterVisitorRequest>,
) -> Result<Json<TemporaryVisitorResponse>, StatusCode> {
	let ip_source = client_ip(&headers);

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

	fn headers(pairs: &[(&'static str, &str)]) -> HeaderMap {
		let mut map = HeaderMap::new();
		for (name, value) in pairs {
			map.insert(*name, HeaderValue::from_str(value).unwrap());
		}
		map
	}

	#[test]
	fn sin_cabeceras_devuelve_unknown() {
		assert_eq!(client_ip(&HeaderMap::new()), "unknown");
	}

	#[test]
	fn cloudflare_tiene_prioridad() {
		let h = headers(&[
			("cf-connecting-ip", "1.1.1.1"),
			("x-forwarded-for", "2.2.2.2"),
			("x-real-ip", "3.3.3.3"),
		]);
		assert_eq!(client_ip(&h), "1.1.1.1");
	}

	#[test]
	fn x_forwarded_for_usa_el_primer_valor_sin_espacios() {
		let h = headers(&[("x-forwarded-for", " 2.2.2.2 , 10.0.0.1"), ("x-real-ip", "3.3.3.3")]);
		assert_eq!(client_ip(&h), "2.2.2.2");
	}

	#[test]
	fn x_real_ip_como_ultimo_recurso() {
		assert_eq!(client_ip(&headers(&[("x-real-ip", "3.3.3.3")])), "3.3.3.3");
	}

	#[test]
	fn cabecera_no_ascii_se_ignora() {
		let mut h = HeaderMap::new();
		h.insert("cf-connecting-ip", HeaderValue::from_bytes(b"\xff").unwrap());
		h.insert("x-real-ip", HeaderValue::from_static("3.3.3.3"));
		assert_eq!(client_ip(&h), "3.3.3.3");
	}
}
