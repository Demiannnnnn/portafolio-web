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
