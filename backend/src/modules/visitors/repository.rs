use std::sync::Arc;

use uuid::Uuid;
use tokio_postgres::{Client, Error};

use super::model::{RegisterVisitorRequest, TemporaryVisitor};

#[derive(Debug, Clone)]
pub struct VisitorRepository {
	client: Arc<Client>,
}

impl VisitorRepository {
    pub fn new(client: Arc<Client>) -> Self {
		Self { client }
	}

	pub async fn register_visitor(
		&self,
		ip_address: String,
		ip_hash: String,
		payload: RegisterVisitorRequest,
	) -> Result<TemporaryVisitor, Error> {
		let session_token = Uuid::new_v4();
		let row = self.client.query_one(
			"INSERT INTO temporary_visitors (session_token, ip_address, ip_hash, browser_name, browser_version, os_name, device_type, isp_name, country_code, city_name)\n			 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)\n			 RETURNING id, session_token, ip_address, ip_hash, browser_name, browser_version, os_name, device_type, isp_name, country_code, city_name, first_seen_at",
			&[
				&session_token,
				&ip_address,
				&ip_hash,
				&payload.browser_name,
				&payload.browser_version,
				&payload.os_name,
				&payload.device_type,
				&payload.isp_name,
				&payload.country_code,
				&payload.city_name,
			],
		).await?;

		Ok(Self::row_to_visitor(&row))
	}

	pub async fn find_by_session_token(&self, session_token: Uuid) -> Result<Option<TemporaryVisitor>, Error> {
		let row = self.client.query_opt(
			"SELECT id, session_token, ip_address, ip_hash, browser_name, browser_version, os_name, device_type, isp_name, country_code, city_name, first_seen_at\n			 FROM temporary_visitors WHERE session_token = $1",
			&[&session_token],
		).await?;

		Ok(row.as_ref().map(Self::row_to_visitor))
	}

	fn row_to_visitor(row: &tokio_postgres::Row) -> TemporaryVisitor {
		TemporaryVisitor {
			id: row.get("id"),
			session_token: row.get("session_token"),
			ip_address: row.get("ip_address"),
			ip_hash: row.get("ip_hash"),
			browser_name: row.get("browser_name"),
			browser_version: row.get("browser_version"),
			os_name: row.get("os_name"),
			device_type: row.get("device_type"),
			isp_name: row.get("isp_name"),
			country_code: row.get("country_code"),
			city_name: row.get("city_name"),
			first_seen_at: row.get("first_seen_at"),
		}
	}
}
