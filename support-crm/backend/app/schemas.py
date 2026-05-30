from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field

VALID_STATUSES = {"Open", "In Progress", "Closed"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}
VALID_SENTIMENTS = {"Positive", "Neutral", "Angry"}


class NoteBase(BaseModel):
    note_text: str = Field(..., min_length=1)


class NoteOut(NoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime


class TicketBase(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=120)
    customer_email: EmailStr
    subject: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=5)
    priority: str = "Medium"


class TicketCreate(TicketBase):
    pass


class TicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    note_text: Optional[str] = Field(default=None, min_length=1)


class TicketOut(TicketBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ticket_id: str
    priority: str
    sentiment: str
    sla_due_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    category: str
    status: str
    created_at: datetime
    updated_at: datetime


class TicketDetailOut(TicketOut):
    notes: List[NoteOut] = []


class AnalyticsOut(BaseModel):
    total_tickets: int
    status_counts: dict
    priority_counts: dict
    sentiment_counts: dict
    sla_breached_count: int
    resolution_rate: float
    top_customers: list
    risky_customers: list
    ai_insights: list


class CustomerOut(BaseModel):
    customer_name: str
    customer_email: str
    total_tickets: int
    open_tickets: int
    closed_tickets: int
    critical_tickets: int
    risk_score: int
    last_ticket_date: datetime
    sentiment_summary: dict


class CustomerDetailOut(CustomerOut):
    tickets: List[TicketOut]
