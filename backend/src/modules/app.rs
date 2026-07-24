use std::sync::Arc;

use axum::{routing::get, Router};

use crate::modules::contact::{repository::ContactRepository, routes::contact_routes, service::ContactService};

pub fn build_app() -> Router {
    let repository = Arc::new(ContactRepository::new());
    let contact_service = Arc::new(ContactService::new(repository));

    Router::new()
        .route("/api/ping", get(|| async { "pong" }))
        .merge(contact_routes(contact_service.clone()))
        .nest("/api", contact_routes(contact_service))
}
