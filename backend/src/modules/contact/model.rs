use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateContactRequest {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Contact {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
    pub is_resolved: bool,
    pub created_at: DateTime<Utc>,
    pub visitor_id: Option<Uuid>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ContactResponse {
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
}

impl From<Contact> for ContactResponse {
    fn from(contact: Contact) -> Self {
        ContactResponse {
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn create_request_exige_todos_los_campos() {
        let missing = serde_json::from_str::<CreateContactRequest>(
            r#"{"name":"Ana","email":"a@b.cl","subject":"Hola"}"#,
        );
        assert!(missing.is_err());
    }

    #[test]
    fn response_no_expone_id_ni_estado() {
        let contact = Contact {
            id: Uuid::new_v4(),
            name: "Ana".into(),
            email: "a@b.cl".into(),
            subject: "Hola".into(),
            message: "Msg".into(),
            is_resolved: true,
            created_at: Utc::now(),
            visitor_id: None,
        };
        let json = serde_json::to_value(ContactResponse::from(contact)).unwrap();
        let keys: Vec<_> = json.as_object().unwrap().keys().cloned().collect();
        assert_eq!(keys, ["email", "message", "name", "subject"]);
    }
}
