from typing import Optional
from collections import Counter
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app import models, schemas
from app.intelligence import (
    assign_category,
    build_ai_insights,
    build_customer_groups,
    calculate_sla_due_at,
    detect_sentiment,
    is_sla_breached,
    predict_priority,
)


def _next_ticket_id(db: Session) -> str:
    """Create sequential public IDs in the TKT-001 format."""
    last_ticket = db.query(models.Ticket).order_by(models.Ticket.id.desc()).first()
    next_number = 1 if last_ticket is None else last_ticket.id + 1
    return f"TKT-{next_number:03d}"


def _validate_status(ticket_status: Optional[str]) -> None:
    if ticket_status and ticket_status not in schemas.VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status must be one of: Open, In Progress, Closed",
        )


def _validate_priority(priority: Optional[str]) -> None:
    if priority and priority not in schemas.VALID_PRIORITIES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Priority must be one of: Low, Medium, High, Critical",
        )


def create_ticket(db: Session, ticket: schemas.TicketCreate) -> models.Ticket:
    _validate_priority(ticket.priority)
    final_priority = ticket.priority or predict_priority(ticket.subject, ticket.description)
    db_ticket = models.Ticket(
        ticket_id=_next_ticket_id(db),
        customer_name=ticket.customer_name,
        customer_email=str(ticket.customer_email),
        subject=ticket.subject,
        description=ticket.description,
        priority=final_priority,
        sentiment=detect_sentiment(ticket.description),
        sla_due_at=calculate_sla_due_at(final_priority),
        category=assign_category(ticket.subject, ticket.description),
        status="Open",
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


def list_tickets(
    db: Session,
    search: Optional[str] = None,
    ticket_status: Optional[str] = None,
) -> list[models.Ticket]:
    _validate_status(ticket_status)
    query = db.query(models.Ticket)

    if ticket_status:
        query = query.filter(models.Ticket.status == ticket_status)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Ticket.ticket_id.ilike(search_term),
                models.Ticket.customer_name.ilike(search_term),
                models.Ticket.customer_email.ilike(search_term),
                models.Ticket.subject.ilike(search_term),
                models.Ticket.description.ilike(search_term),
            )
        )

    return query.order_by(models.Ticket.created_at.desc()).all()


def get_ticket_by_public_id(db: Session, ticket_id: str) -> models.Ticket:
    ticket = (
        db.query(models.Ticket)
        .options(joinedload(models.Ticket.notes))
        .filter(models.Ticket.ticket_id == ticket_id)
        .first()
    )
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found")
    return ticket


def update_ticket(
    db: Session,
    ticket_id: str,
    payload: schemas.TicketUpdate,
) -> models.Ticket:
    _validate_status(payload.status)
    _validate_priority(payload.priority)
    ticket = get_ticket_by_public_id(db, ticket_id)

    if payload.status:
        previous_status = ticket.status
        ticket.status = payload.status
        if payload.status == "Closed" and previous_status != "Closed":
            ticket.resolved_at = datetime.now(timezone.utc)
        elif payload.status != "Closed":
            ticket.resolved_at = None

    if payload.priority:
        ticket.priority = payload.priority

    if payload.note_text:
        ticket.notes.append(models.Note(note_text=payload.note_text.strip()))
        ticket.updated_at = datetime.now(timezone.utc)

    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return get_ticket_by_public_id(db, ticket_id)


def list_all_tickets(db: Session) -> list[models.Ticket]:
    return db.query(models.Ticket).order_by(models.Ticket.created_at.desc()).all()


def get_analytics(db: Session) -> dict:
    tickets = list_all_tickets(db)
    total = len(tickets)
    closed = sum(1 for ticket in tickets if ticket.status == "Closed")
    customers = build_customer_groups(tickets)
    return {
        "total_tickets": total,
        "status_counts": dict(Counter(ticket.status for ticket in tickets)),
        "priority_counts": dict(Counter(ticket.priority for ticket in tickets)),
        "sentiment_counts": dict(Counter(ticket.sentiment for ticket in tickets)),
        "sla_breached_count": sum(1 for ticket in tickets if is_sla_breached(ticket)),
        "resolution_rate": round((closed / total) * 100, 2) if total else 0,
        "top_customers": sorted(customers, key=lambda item: item["total_tickets"], reverse=True)[:5],
        "risky_customers": customers[:5],
        "ai_insights": build_ai_insights(tickets),
    }


def list_customers(db: Session) -> list[dict]:
    return build_customer_groups(list_all_tickets(db))


def get_customer_detail(db: Session, email: str) -> dict:
    tickets = (
        db.query(models.Ticket)
        .filter(models.Ticket.customer_email.ilike(email))
        .order_by(models.Ticket.created_at.desc())
        .all()
    )
    if not tickets:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Customer not found")
    customer = build_customer_groups(tickets)[0]
    customer["tickets"] = tickets
    return customer
