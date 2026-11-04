use std::sync::Arc;

use crate::modules::contact::service::ContactService;
use crate::modules::visitors::service::VisitorService;

#[derive(Debug, Clone)]
pub struct AppState {
	pub contact_service: Arc<ContactService>,
	pub visitor_service: Arc<VisitorService>,
}

impl AppState {
	pub fn new(contact_service: Arc<ContactService>, visitor_service: Arc<VisitorService>) -> Self {
		Self {
			contact_service,
			visitor_service,
		}
	}
}
