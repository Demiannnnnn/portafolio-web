use std::sync::Mutex;

use uuid::Uuid;

use super::model::{Contact, ContactResponse, CreateContactRequest};

#[derive(Debug, Default)]
pub struct ContactService {
	contacts: Mutex<Vec<Contact>>,
}

impl ContactService {
	pub async fn create_contact(&self, payload: CreateContactRequest) -> ContactResponse {
		let contact = Contact {
			id: Uuid::new_v4(),
			name: payload.name,
			email: payload.email,
			subject: payload.subject,
			message: payload.message,
			is_resolved: false,
			created_at: chrono::Utc::now(),
			visitor_id: None,
		};

		let response = ContactResponse::from(contact.clone());

		if let Ok(mut contacts) = self.contacts.lock() {
			contacts.push(contact);
		}

		response
	}

	pub async fn list_contacts(&self) -> Vec<ContactResponse> {
		self.contacts
			.lock()
			.map(|contacts| contacts.iter().cloned().map(ContactResponse::from).collect())
			.unwrap_or_default()
	}
}
