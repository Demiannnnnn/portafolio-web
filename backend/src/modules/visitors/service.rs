use std::sync::Arc;

use sha2::{Digest, Sha256};

use super::{model::{IpApiResponse, RegisterVisitorRequest, TemporaryVisitorResponse}, repository::VisitorRepository};

#[derive(Debug)]
pub struct VisitorService {
	repository: Arc<VisitorRepository>,
}

impl VisitorService {
	pub fn new(repository: Arc<VisitorRepository>) -> Self {
		Self { repository }
	}

	pub async fn register_visitor(
		&self,
		ip_address: String,
		mut payload: RegisterVisitorRequest,
	) -> Result<TemporaryVisitorResponse, String> {
		let ip_hash = Self::hash_value(&ip_address);

		// Server-side IP geolocation lookup — overrides any frontend-provided values
		let geo = Self::lookup_ip_geolocation(&ip_address).await;
		payload.country_code = geo.country_code;
		payload.city_name = geo.city_name;
		payload.isp_name = geo.isp_name;

		let visitor = self
			.repository
			.register_visitor(ip_address, ip_hash, payload)
			.await
			.map_err(|error| error.to_string())?;
		Ok(TemporaryVisitorResponse::from(visitor))
	}

	pub async fn find_by_session_token(
		&self,
		session_token: uuid::Uuid,
	) -> Result<Option<TemporaryVisitorResponse>, String> {
		let visitor = self
			.repository
			.find_by_session_token(session_token)
			.await
			.map_err(|error| error.to_string())?;

		Ok(visitor.map(TemporaryVisitorResponse::from))
	}

	/// Queries ip-api.com to resolve geolocation data from an IP address.
	/// Returns extracted fields or None values if the lookup fails gracefully.
	async fn lookup_ip_geolocation(ip: &str) -> GeoResult {
		let url = format!(
			"http://ip-api.com/json/{}?fields=status,countryCode,city,isp",
			ip
		);

		let client = reqwest::Client::builder()
			.timeout(std::time::Duration::from_secs(3))
			.build();

		let client = match client {
			Ok(c) => c,
			Err(_) => return GeoResult::default(),
		};

		let response = match client.get(&url).send().await {
			Ok(resp) => resp,
			Err(_) => return GeoResult::default(),
		};

		let api_response = match response.json::<IpApiResponse>().await {
			Ok(data) => data,
			Err(_) => return GeoResult::default(),
		};

		// ip-api.com returns status: "success" or "fail"
		if api_response.status.as_deref() != Some("success") {
			return GeoResult::default();
		}

		GeoResult {
			country_code: api_response.country_code,
			city_name: api_response.city,
			isp_name: api_response.isp,
		}
	}

	fn hash_value(value: &str) -> String {
		let digest = Sha256::digest(value.as_bytes());
		format!("{:x}", digest)
	}
}

#[derive(Debug, Default)]
struct GeoResult {
	country_code: Option<String>,
	city_name: Option<String>,
	isp_name: Option<String>,
}
