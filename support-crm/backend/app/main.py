import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, text

from app import models
from app.database import Base, SessionLocal, engine
from app.intelligence import assign_category, calculate_sla_due_at, detect_sentiment
from app.routes import analytics, customers, tickets

load_dotenv()

Base.metadata.create_all(bind=engine)


def ensure_local_columns():
    """Keep older local SQLite databases compatible without a full migration stack."""
    if not engine.url.drivername.startswith("sqlite"):
        return

    inspector = inspect(engine)
    if "tickets" not in inspector.get_table_names():
        return

    ticket_columns = {column["name"] for column in inspector.get_columns("tickets")}
    migrations = {
        "priority": "ALTER TABLE tickets ADD COLUMN priority VARCHAR(30) NOT NULL DEFAULT 'Medium'",
        "sentiment": "ALTER TABLE tickets ADD COLUMN sentiment VARCHAR(30) NOT NULL DEFAULT 'Neutral'",
        "sla_due_at": "ALTER TABLE tickets ADD COLUMN sla_due_at DATETIME",
        "resolved_at": "ALTER TABLE tickets ADD COLUMN resolved_at DATETIME",
        "category": "ALTER TABLE tickets ADD COLUMN category VARCHAR(60) NOT NULL DEFAULT 'General'",
    }
    with engine.begin() as connection:
        for column, statement in migrations.items():
            if column not in ticket_columns:
                connection.execute(text(statement))


ensure_local_columns()


def backfill_ticket_intelligence():
    db = SessionLocal()
    try:
        changed = False
        for ticket in db.query(models.Ticket).all():
            detected_sentiment = detect_sentiment(ticket.description)
            detected_category = assign_category(ticket.subject, ticket.description)
            if ticket.sentiment != detected_sentiment:
                ticket.sentiment = detected_sentiment
                changed = True
            if ticket.category != detected_category:
                ticket.category = detected_category
                changed = True
            if not ticket.sla_due_at:
                ticket.sla_due_at = calculate_sla_due_at(ticket.priority, ticket.created_at)
                changed = True
        if changed:
            db.commit()
    finally:
        db.close()


backfill_ticket_intelligence()

app = FastAPI(
    title="Support CRM API",
    description="Customer support ticketing CRM built with FastAPI and SQLite.",
    version="1.0.0",
)

allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tickets.router)
app.include_router(analytics.router)
app.include_router(customers.router)


@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy"}
