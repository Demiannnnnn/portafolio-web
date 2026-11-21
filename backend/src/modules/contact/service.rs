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

#[cfg(test)]
mod tests {
	use super::*;

	fn request(name: &str) -> CreateContactRequest {
		CreateContactRequest {
			name: name.into(),
			email: format!("{name}@example.com"),
			subject: "Asunto".into(),
			message: "Mensaje".into(),
		}
	}

	#[tokio::test]
	async fn create_contact_devuelve_los_datos_enviados() {
		let service = ContactService::new(Arc::new(ContactRepository::new()));
		let response = service.create_contact(request("ana")).await;
		assert_eq!(response.name, "ana");
		assert_eq!(response.email, "ana@example.com");
		assert_eq!(response.subject, "Asunto");
		assert_eq!(response.message, "Mensaje");
	}

	#[tokio::test]
	async fn list_contacts_conserva_orden_de_creacion() {
		let service = ContactService::new(Arc::new(ContactRepository::new()));
		assert!(service.list_contacts().await.is_empty());
		service.create_contact(request("ana")).await;
		service.create_contact(request("beto")).await;
		let names: Vec<_> = service.list_contacts().await.into_iter().map(|c| c.name).collect();
		assert_eq!(names, ["ana", "beto"]);
	}
}
