use std::sync::Arc;

use axum::{extract::State, http::{HeaderMap, StatusCode}, Json};
use uuid::Uuid;

use super::{model::{RegisterVisitorRequest, TemporaryVisitorResponse}, service::VisitorService};
use crate::shared::state::AppState;

pub async fn register_visitor(
	State(app_state): State<AppState>,
	headers: HeaderMap,
	Json(payload): Json<RegisterVisitorRequest>,
) -> Json<TemporaryVisitorResponse> {
	let ip_source = headers
		.get("x-forwarded-for")
		.and_then(|value| value.to_str().ok())
		.or_else(|| headers.get("x-real-ip").and_then(|value| value.to_str().ok()))
		.unwrap_or("unknown")
		.to_string();

	let visitor_service: &Arc<VisitorService> = &app_state.visitor_service;
	Json(visitor_service.register_visitor(payload, ip_source).await)
}

pub async fn current_visitor(
	State(app_state): State<AppState>,
	headers: HeaderMap,
	) -> Result<Json<TemporaryVisitorResponse>, StatusCode> {
	let session_token = headers
		.get("x-session-token")
		.and_then(|value| value.to_str().ok())
		.and_then(|value| Uuid::parse_str(value).ok())
		.ok_or(StatusCode::BAD_REQUEST)?;

	let visitor_service: &Arc<VisitorService> = &app_state.visitor_service;
	visitor_service
		.find_by_session_token(session_token)
		.await
		.map(Json)
		.ok_or(StatusCode::NOT_FOUND)
}
