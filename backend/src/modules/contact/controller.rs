use std::sync::Arc;

use axum::{extract::State, Json};

use super::{model::{ContactResponse, CreateContactRequest}, service::ContactService};
use crate::shared::state::AppState;

pub async fn create_contact(
    State(app_state): State<AppState>,
    Json(payload): Json<CreateContactRequest>,
) -> Json<ContactResponse> {
    let contact_service: &Arc<ContactService> = &app_state.contact_service;
    Json(contact_service.create_contact(payload).await)
}

pub async fn list_contacts(
    State(app_state): State<AppState>,
) -> Json<Vec<ContactResponse>> {
    let contact_service: &Arc<ContactService> = &app_state.contact_service;
    Json(contact_service.list_contacts().await)
}
