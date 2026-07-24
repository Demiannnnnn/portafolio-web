use std::sync::Mutex;

use chrono::Utc;
use uuid::Uuid;

use super::model::{RegisterVisitorRequest, TemporaryVisitor};

#[derive(Debug, Default)]
pub struct VisitorRepository {
	visitors: Mutex<Vec<TemporaryVisitor>>,
}

impl VisitorRepository {
	pub fn new() -> Self {
		Self::default()
	}

	pub fn register_visitor(
		&self,
		ip_hash: String,
		payload: RegisterVisitorRequest,
	) -> TemporaryVisitor {
		let visitor = TemporaryVisitor {
			id: Uuid::new_v4(),
			session_token: Uuid::new_v4(),
			ip_hash,
			browser_name: payload.browser_name,
			browser_version: payload.browser_version,
			os_name: payload.os_name,
			device_type: payload.device_type,
			isp_name: payload.isp_name,
			country_code: payload.country_code,
			city_name: payload.city_name,
			first_seen_at: Utc::now(),
		};

		if let Ok(mut visitors) = self.visitors.lock() {
			visitors.push(visitor.clone());
		}

		visitor
	}

	pub fn find_by_session_token(&self, session_token: Uuid) -> Option<TemporaryVisitor> {
		self.visitors
			.lock()
			.ok()
			.and_then(|visitors| visitors.iter().find(|visitor| visitor.session_token == session_token).cloned())
	}
}
