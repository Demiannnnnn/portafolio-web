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
    pub ip_address: String,
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

#[derive(Debug, Deserialize)]
pub struct IpApiResponse {
    pub status: Option<String>,
    #[serde(rename = "countryCode")]
    pub country_code: Option<String>,
    pub city: Option<String>,
    pub isp: Option<String>,
}

#[cfg(test)]
mod tests {
    use chrono::TimeZone;

    use super::*;

    #[test]
    fn respuesta_expone_solo_token_y_fecha_rfc3339() {
        let token = Uuid::new_v4();
        let visitor = TemporaryVisitor {
            id: Uuid::new_v4(),
            session_token: token,
            ip_address: "1.2.3.4".into(),
            ip_hash: "hash".into(),
            browser_name: Some("Firefox".into()),
            browser_version: None,
            os_name: None,
            device_type: None,
            isp_name: None,
            country_code: None,
            city_name: None,
            first_seen_at: Utc.with_ymd_and_hms(2026, 1, 2, 3, 4, 5).unwrap(),
        };

        let response = TemporaryVisitorResponse::from(visitor);
        assert_eq!(response.session_token, token);
        assert_eq!(response.first_seen_at, "2026-01-02T03:04:05+00:00");

        let json = serde_json::to_value(&response).unwrap();
        assert_eq!(json.as_object().unwrap().len(), 2, "no debe filtrar la IP");
    }

    #[test]
    fn register_request_acepta_campos_opcionales_ausentes() {
        let req: RegisterVisitorRequest = serde_json::from_str(r#"{"browser_name":"Chrome"}"#).unwrap();
        assert_eq!(req.browser_name.as_deref(), Some("Chrome"));
        assert!(req.os_name.is_none());
    }

    #[test]
    fn ip_api_response_mapea_country_code() {
        let r: IpApiResponse = serde_json::from_str(
            r#"{"status":"success","countryCode":"CL","city":"Talca","isp":"ISP"}"#,
        )
        .unwrap();
        assert_eq!(r.status.as_deref(), Some("success"));
        assert_eq!(r.country_code.as_deref(), Some("CL"));
        assert_eq!(r.city.as_deref(), Some("Talca"));
        assert_eq!(r.isp.as_deref(), Some("ISP"));
    }
}
