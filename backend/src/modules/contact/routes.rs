use axum::{routing::{get, post}, Router};

use super::controller::{create_contact, list_contacts};
use crate::shared::state::AppState;

pub fn contact_routes() -> Router<AppState> {
    Router::new()
        .route("/contact", post(create_contact))
        .route("/contacts", get(list_contacts))
}

