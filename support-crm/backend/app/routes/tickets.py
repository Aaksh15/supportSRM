from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app import crud, schemas
from app.database import get_db

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


@router.post("", response_model=schemas.TicketOut, status_code=201)
def create_ticket(ticket: schemas.TicketCreate, db: Session = Depends(get_db)):
    return crud.create_ticket(db, ticket)


@router.get("", response_model=list[schemas.TicketOut])
def list_tickets(
    search: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    return crud.list_tickets(db, search=search, ticket_status=status)


@router.get("/{ticket_id}", response_model=schemas.TicketDetailOut)
def get_ticket(ticket_id: str, db: Session = Depends(get_db)):
    return crud.get_ticket_by_public_id(db, ticket_id)


@router.put("/{ticket_id}", response_model=schemas.TicketDetailOut)
def update_ticket(
    ticket_id: str,
    payload: schemas.TicketUpdate,
    db: Session = Depends(get_db),
):
    return crud.update_ticket(db, ticket_id, payload)
