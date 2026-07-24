use std::sync::Arc;

use axum::{routing::{get, post}, Router};

use super::controller::{create_contact, list_contacts};
use super::service::ContactService;

pub fn contact_routes(contact_service: Arc<ContactService>) -> Router {
    Router::new()
        .route("/contact", post(create_contact))
        .route("/contacts", get(list_contacts))
        .with_state(contact_service)
}

