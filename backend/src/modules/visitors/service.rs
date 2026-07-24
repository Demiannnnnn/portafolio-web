use std::sync::Arc;

use sha2::{Digest, Sha256};

use super::{model::{RegisterVisitorRequest, TemporaryVisitorResponse}, repository::VisitorRepository};

#[derive(Debug, Default)]
pub struct VisitorService {
	repository: Arc<VisitorRepository>,
}

impl VisitorService {
	pub fn new(repository: Arc<VisitorRepository>) -> Self {
		Self { repository }
	}

	pub async fn register_visitor(
		&self,
		payload: RegisterVisitorRequest,
		ip_source: String,
	) -> TemporaryVisitorResponse {
		let ip_hash = Self::hash_value(&ip_source);
		let visitor = self.repository.register_visitor(ip_hash, payload);
		TemporaryVisitorResponse::from(visitor)
	}

	pub async fn find_by_session_token(
		&self,
		session_token: uuid::Uuid,
	) -> Option<TemporaryVisitorResponse> {
		self.repository
			.find_by_session_token(session_token)
			.map(TemporaryVisitorResponse::from)
	}

	fn hash_value(value: &str) -> String {
		let digest = Sha256::digest(value.as_bytes());
		format!("{:x}", digest)
	}
}
