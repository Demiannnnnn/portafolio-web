use axum::{routing::{get, post}, Router};

use crate::shared::state::AppState;

use super::controller::{current_visitor, register_visitor};

pub fn visitor_routes() -> Router<AppState> {
	Router::new()
		.route("/visitors/register", post(register_visitor))
		.route("/visitors/current", get(current_visitor))
}

