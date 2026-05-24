use axum::{routing::get, Router};
use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    // Definimos una ruta base para verificar la API
    let app = Router::new().route("/api/ping", get(|| async { "pong" }));

    // Escuchamos en la IP 0.0.0.0 y el puerto que configuraste (ej. 8000)
    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("🚀 Backend Axum corriendo en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}