use std::sync::Arc;

use axum::{extract::State, routing::{get, post}, Json, Router};

use super::model::{ContactResponse, CreateContactRequest};
use super::service::ContactService;

pub fn contact_routes(contact_service: Arc<ContactService>) -> Router {
    Router::new()
        .route("/contact", post(create_contact))
        .route("/contacts", get(list_contacts))
        .with_state(contact_service)
}

async fn create_contact(
    State(contact_service): State<Arc<ContactService>>,
    Json(payload): Json<CreateContactRequest>,
) -> Json<ContactResponse> {
    Json(contact_service.create_contact(payload).await)
}

async fn list_contacts(
    State(contact_service): State<Arc<ContactService>>,
) -> Json<Vec<ContactResponse>> {
    Json(contact_service.list_contacts().await)
}

