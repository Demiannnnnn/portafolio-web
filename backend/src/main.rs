mod shared;
mod modules;

use std::net::SocketAddr;

use modules::app::build_app;

#[tokio::main]
async fn main() {
    let app = build_app().await;

    let addr = SocketAddr::from(([0, 0, 0, 0], 8000));
    println!("🚀 Backend Axum corriendo en http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
