use std::sync::Arc;

use super::{model::{ContactResponse, CreateContactRequest}, repository::ContactRepository};

#[derive(Debug, Default)]
pub struct ContactService {
	repository: Arc<ContactRepository>,
}

impl ContactService {
	pub fn new(repository: Arc<ContactRepository>) -> Self {
		Self { repository }
	}

	pub async fn create_contact(&self, payload: CreateContactRequest) -> ContactResponse {
		let contact = self.repository.create_contact(payload);
		ContactResponse::from(contact)
	}

	pub async fn list_contacts(&self) -> Vec<ContactResponse> {
		self.repository
			.list_contacts()
			.into_iter()
			.map(ContactResponse::from)
			.collect()
	}
}
