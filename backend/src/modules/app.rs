use std::sync::Arc;

use axum::{routing::get, Router};

use crate::modules::contact::{repository::ContactRepository, routes::contact_routes, service::ContactService};
use crate::modules::visitors::{repository::VisitorRepository, routes::visitor_routes, service::VisitorService};
use crate::shared::state::AppState;

pub fn build_app() -> Router {
    let repository = Arc::new(ContactRepository::new());
    let contact_service = Arc::new(ContactService::new(repository));
    let visitor_repository = Arc::new(VisitorRepository::new());
    let visitor_service = Arc::new(VisitorService::new(visitor_repository));
    let app_state = AppState::new(contact_service, visitor_service);

    Router::<AppState>::new()
        .nest(
            "/api",
            Router::<AppState>::new()
                .route("/ping", get(|| async { "pong" }))
                .merge(contact_routes())
                .merge(visitor_routes()),
        )
        .with_state(app_state)
}
