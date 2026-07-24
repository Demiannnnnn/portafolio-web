use std::sync::Mutex;

use uuid::Uuid;

use super::model::{Contact, CreateContactRequest};

#[derive(Debug, Default)]
pub struct ContactRepository {
	    contacts: Mutex<Vec<Contact>>,
}

impl ContactRepository {
	pub fn new() -> Self {
		Self::default()
	}

	pub fn create_contact(&self, payload: CreateContactRequest) -> Contact {
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

		if let Ok(mut contacts) = self.contacts.lock() {
			contacts.push(contact.clone());
		}

		contact
	}

	pub fn list_contacts(&self) -> Vec<Contact> {
		self.contacts
			.lock()
			.map(|contacts| contacts.clone())
			.unwrap_or_default()
	}
}
