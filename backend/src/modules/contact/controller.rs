use std::sync::Arc;

use axum::{extract::State, Json};

use super::{model::{ContactResponse, CreateContactRequest}, service::ContactService};

pub async fn create_contact(
    State(contact_service): State<Arc<ContactService>>,
    Json(payload): Json<CreateContactRequest>,
) -> Json<ContactResponse> {
    Json(contact_service.create_contact(payload).await)
}

pub async fn list_contacts(
    State(contact_service): State<Arc<ContactService>>,
) -> Json<Vec<ContactResponse>> {
    Json(contact_service.list_contacts().await)
}
