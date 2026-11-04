use std::{env, error::Error, fs, sync::Arc, time::Duration};

use tokio::time::sleep;
use tokio_postgres::{Client, NoTls};

type DynError = Box<dyn Error + Send + Sync>;

fn read_secret_file(path_var: &str) -> Result<String, DynError> {
    let path = env::var(path_var)?;
    let value = fs::read_to_string(path)?.trim().to_string();
    Ok(value)
}

pub async fn connect_postgres() -> Result<Arc<Client>, DynError> {
    let host = env::var("DATABASE_HOST").unwrap_or_else(|_| "database".to_string());
    let port = env::var("DATABASE_PORT").unwrap_or_else(|_| "5432".to_string());
    let user = read_secret_file("DATABASE_USER_FILE")?;
    let password = read_secret_file("DATABASE_PASSWORD_FILE")?;
    let dbname = read_secret_file("DATABASE_NAME_FILE")?;

    let connection_string = format!(
        "host={host} port={port} user={user} password={password} dbname={dbname}"
    );

    let mut last_error: Option<DynError> = None;

    for _attempt in 1..=10 {
        match tokio_postgres::connect(&connection_string, NoTls).await {
            Ok((client, connection)) => {
                tokio::spawn(async move {
                    if let Err(error) = connection.await {
                        eprintln!("postgres connection task ended: {error}");
                    }
                });

                return Ok(Arc::new(client));
            }
            Err(error) => {
                last_error = Some(Box::new(error));
                sleep(Duration::from_secs(2)).await;
            }
        }
    }

    Err(last_error.unwrap_or_else(|| {
        Box::new(std::io::Error::other("failed to connect to postgres"))
    }))
}
