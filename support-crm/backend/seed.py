from app.database import Base, SessionLocal, engine
from app.intelligence import assign_category, calculate_sla_due_at, detect_sentiment
from app.models import Note, Ticket
from sqlalchemy import inspect, text


SAMPLE_TICKETS = [
    {
        "ticket_id": "TKT-001",
        "customer_name": "Maya Sharma",
        "customer_email": "maya.sharma@example.com",
        "subject": "Unable to access billing dashboard",
        "description": "Customer sees a blank screen when opening the billing dashboard after login.",
        "priority": "High",
        "status": "Open",
        "notes": ["Asked customer for browser console logs.", "Billing team notified for investigation."],
    },
    {
        "ticket_id": "TKT-002",
        "customer_name": "Rohan Mehta",
        "customer_email": "rohan.mehta@example.com",
        "subject": "Password reset email not received",
        "description": "Customer requested a password reset but has not received the email after multiple attempts.",
        "priority": "Medium",
        "status": "In Progress",
        "notes": ["Confirmed email is not bouncing.", "Checking transactional email provider logs."],
    },
    {
        "ticket_id": "TKT-003",
        "customer_name": "Priya Nair",
        "customer_email": "priya.nair@example.com",
        "subject": "Refund status request",
        "description": "Customer wants an update on a refund requested for duplicate subscription billing.",
        "priority": "Low",
        "status": "Closed",
        "notes": ["Refund processed and confirmation shared with customer."],
    },
    {
        "ticket_id": "TKT-004",
        "customer_name": "Aarav Patel",
        "customer_email": "aarav.patel@example.com",
        "subject": "Critical outage in customer portal",
        "description": "Customer reports that multiple team members cannot load the customer portal.",
        "priority": "Critical",
        "status": "Open",
        "notes": ["Escalated to engineering as P1 incident."],
    },
    {
        "ticket_id": "TKT-005",
        "customer_name": "Sneha Iyer",
        "customer_email": "sneha.iyer@example.com",
        "subject": "Invoice PDF download fails",
        "description": "Download button returns an error when customer tries to export the latest invoice PDF.",
        "priority": "Medium",
        "status": "In Progress",
        "notes": ["Reproduced in production using customer account context."],
    },
    {
        "ticket_id": "TKT-006",
        "customer_name": "Kabir Khan",
        "customer_email": "kabir.khan@example.com",
        "subject": "Update company address",
        "description": "Customer needs the billing and shipping address updated for future invoices.",
        "priority": "Low",
        "status": "Closed",
        "notes": ["Address updated and verified on account profile."],
    },
    {
        "ticket_id": "TKT-007",
        "customer_name": "Ananya Rao",
        "customer_email": "ananya.rao@example.com",
        "subject": "Integration webhook delayed",
        "description": "Customer reports that order webhooks are arriving 20 to 30 minutes late.",
        "priority": "High",
        "status": "In Progress",
        "notes": ["Webhook queue depth is elevated.", "Platform team is reviewing worker throughput."],
    },
    {
        "ticket_id": "TKT-008",
        "customer_name": "Vikram Singh",
        "customer_email": "vikram.singh@example.com",
        "subject": "Need help adding new users",
        "description": "Customer admin is unsure how to invite five new teammates to the workspace.",
        "priority": "Low",
        "status": "Open",
        "notes": [],
    },
    {
        "ticket_id": "TKT-009",
        "customer_name": "Neha Gupta",
        "customer_email": "neha.gupta@example.com",
        "subject": "Login blocked after MFA change",
        "description": "Customer changed MFA device and can no longer complete login verification.",
        "priority": "Critical",
        "status": "Closed",
        "notes": ["Identity verified.", "MFA reset completed and customer confirmed access."],
    },
    {
        "ticket_id": "TKT-010",
        "customer_name": "Aditya Verma",
        "customer_email": "aditya.verma@example.com",
        "subject": "Feature request for custom reports",
        "description": "Customer wants custom report filters by region, team, and priority.",
        "priority": "Medium",
        "status": "Open",
        "notes": ["Logged request for product review."],
    },
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    ensure_seed_columns()
    db = SessionLocal()

    try:
        existing_ticket_ids = {
            ticket_id
            for (ticket_id,) in db.query(Ticket.ticket_id).filter(
                Ticket.ticket_id.in_([item["ticket_id"] for item in SAMPLE_TICKETS])
            )
        }
        inserted_count = 0

        for item in SAMPLE_TICKETS:
            if item["ticket_id"] in existing_ticket_ids:
                continue

            notes = item["notes"]
            ticket_data = {key: value for key, value in item.items() if key != "notes"}
            ticket_data["sentiment"] = detect_sentiment(ticket_data["description"])
            ticket_data["category"] = assign_category(ticket_data["subject"], ticket_data["description"])
            ticket_data["sla_due_at"] = calculate_sla_due_at(ticket_data["priority"])
            ticket = Ticket(**ticket_data)
            ticket.notes = [Note(note_text=note) for note in notes]
            db.add(ticket)
            inserted_count += 1

        db.commit()
        if inserted_count:
            print(f"Seeded {inserted_count} missing sample support ticket(s) successfully.")
        else:
            print("All sample support tickets already exist. Seed skipped.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def ensure_seed_columns():
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


if __name__ == "__main__":
    seed_database()
