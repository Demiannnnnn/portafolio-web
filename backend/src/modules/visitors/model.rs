use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct RegisterVisitorRequest {
    pub browser_name: Option<String>,
    pub browser_version: Option<String>,
    pub os_name: Option<String>,
    pub device_type: Option<String>,
    pub isp_name: Option<String>,
    pub country_code: Option<String>,
    pub city_name: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemporaryVisitor {
    pub id: Uuid,
    pub session_token: Uuid,
    pub ip_hash: String,
    pub browser_name: Option<String>,
    pub browser_version: Option<String>,
    pub os_name: Option<String>,
    pub device_type: Option<String>,
    pub isp_name: Option<String>,
    pub country_code: Option<String>,
    pub city_name: Option<String>,
    pub first_seen_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TemporaryVisitorResponse {
    pub session_token: Uuid,
    pub first_seen_at: String,
}

impl From<TemporaryVisitor> for TemporaryVisitorResponse {
    fn from(visitor: TemporaryVisitor) -> Self {
        TemporaryVisitorResponse {
            session_token: visitor.session_token,
            first_seen_at: visitor.first_seen_at.to_rfc3339(),
        }
    }
}
