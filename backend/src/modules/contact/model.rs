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
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub subject: String,
    pub message: String,
    pub is_resolved: bool,
    pub created_at: String,
    pub visitor_id: Option<Uuid>,
}

impl From<Contact> for ContactResponse {
    fn from(contact: Contact) -> Self {
        ContactResponse {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            subject: contact.subject,
            message: contact.message,
            is_resolved: contact.is_resolved,
            created_at: contact.created_at.to_rfc3339(),
            visitor_id: contact.visitor_id,
        }
    }
}
