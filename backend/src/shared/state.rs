use std::sync::Arc;

use crate::modules::contact::service::ContactService;

#[derive(Debug, Clone)]
pub struct AppState {
	pub contact_service: Arc<ContactService>,
}

impl AppState {
	pub fn new(contact_service: Arc<ContactService>) -> Self {
		Self { contact_service }
	}
}
