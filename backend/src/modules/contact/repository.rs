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

#[cfg(test)]
mod tests {
	use super::*;

	fn request() -> CreateContactRequest {
		CreateContactRequest {
			name: "Ana".into(),
			email: "ana@example.com".into(),
			subject: "Hola".into(),
			message: "Mensaje".into(),
		}
	}

	#[test]
	fn create_contact_inicializa_metadatos() {
		let repo = ContactRepository::new();
		let before = chrono::Utc::now();
		let contact = repo.create_contact(request());
		assert!(!contact.is_resolved);
		assert!(contact.visitor_id.is_none());
		assert!(contact.created_at >= before);
		assert_eq!(repo.list_contacts().len(), 1);
		assert_eq!(repo.list_contacts()[0].id, contact.id);
	}

	#[test]
	fn cada_contacto_tiene_id_unico() {
		let repo = ContactRepository::new();
		let a = repo.create_contact(request());
		let b = repo.create_contact(request());
		assert_ne!(a.id, b.id);
	}
}
