from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

PRIORITY_HOURS = {
    "Critical": 4,
    "High": 8,
    "Medium": 24,
    "Low": 48,
}


def combined_text(subject: str, description: str) -> str:
    return f"{subject} {description}".lower()


def predict_priority(subject: str, description: str) -> str:
    text = combined_text(subject, description)
    critical_words = ["urgent", "legal", "outage", "breach", "critical", "angry", "payment failed", "not working"]
    high_words = ["refund", "complaint", "failed", "cannot access", "blocked", "third time", "frustrated"]
    low_words = ["minor", "question", "how to", "feature request", "slow"]

    if any(word in text for word in critical_words):
        return "Critical"
    if any(word in text for word in high_words):
        return "High"
    if any(word in text for word in low_words):
        return "Low"
    return "Medium"


def detect_sentiment(description: str) -> str:
    text = description.lower()
    angry_words = ["angry", "frustrated", "worst", "complaint", "third time", "unacceptable", "terrible"]
    positive_words = ["thanks", "thank you", "good", "appreciate", "great", "helpful"]

    if any(word in text for word in angry_words):
        return "Angry"
    if any(word in text for word in positive_words):
        return "Positive"
    return "Neutral"


def assign_category(subject: str, description: str) -> str:
    text = combined_text(subject, description)
    categories = {
        "Billing": ["billing", "invoice", "payment", "refund", "subscription", "charge"],
        "Login Issues": ["login", "password", "mfa", "sign in", "access", "account locked"],
        "Technical Support": ["bug", "error", "not working", "slow", "webhook", "integration", "portal", "download"],
        "Reports": ["report", "analytics", "export", "csv"],
    }
    for category, words in categories.items():
        if any(word in text for word in words):
            return category
    return "General"


def calculate_sla_due_at(priority: str, created_at: datetime | None = None) -> datetime:
    start = created_at or datetime.now(timezone.utc)
    return start + timedelta(hours=PRIORITY_HOURS.get(priority, 24))


def is_sla_breached(ticket, now: datetime | None = None) -> bool:
    if not ticket.sla_due_at or ticket.status == "Closed":
        return False
    current = now or datetime.now(timezone.utc)
    due_at = ticket.sla_due_at
    if due_at.tzinfo is None:
        due_at = due_at.replace(tzinfo=timezone.utc)
    return current > due_at


def resolved_within_sla(ticket) -> bool:
    if ticket.status != "Closed" or not ticket.resolved_at or not ticket.sla_due_at:
        return False
    resolved_at = ticket.resolved_at if ticket.resolved_at.tzinfo else ticket.resolved_at.replace(tzinfo=timezone.utc)
    due_at = ticket.sla_due_at if ticket.sla_due_at.tzinfo else ticket.sla_due_at.replace(tzinfo=timezone.utc)
    return resolved_at <= due_at


def calculate_customer_risk(tickets: list) -> int:
    score = 0
    for ticket in tickets:
        if ticket.status != "Closed":
            score += 15
        if ticket.priority == "Critical":
            score += 25
        elif ticket.priority == "High":
            score += 15
        if ticket.sentiment == "Angry":
            score += 20
        if is_sla_breached(ticket):
            score += 20
    return min(score, 100)


def build_customer_groups(tickets: list) -> list[dict]:
    grouped = defaultdict(list)
    for ticket in tickets:
        grouped[ticket.customer_email.lower()].append(ticket)

    customers = []
    for email, rows in grouped.items():
        last_ticket = max(rows, key=lambda ticket: ticket.created_at)
        customers.append(
            {
                "customer_name": last_ticket.customer_name,
                "customer_email": last_ticket.customer_email,
                "total_tickets": len(rows),
                "open_tickets": sum(1 for ticket in rows if ticket.status != "Closed"),
                "closed_tickets": sum(1 for ticket in rows if ticket.status == "Closed"),
                "critical_tickets": sum(1 for ticket in rows if ticket.priority == "Critical"),
                "risk_score": calculate_customer_risk(rows),
                "last_ticket_date": last_ticket.created_at,
                "sentiment_summary": dict(Counter(ticket.sentiment for ticket in rows)),
            }
        )
    return sorted(customers, key=lambda item: item["risk_score"], reverse=True)


def build_ai_insights(tickets: list) -> list[dict]:
    total = len(tickets)
    if not total:
        return []
    category = Counter(ticket.category for ticket in tickets).most_common(1)[0][0]
    open_count = sum(1 for ticket in tickets if ticket.status != "Closed")
    breached = sum(1 for ticket in tickets if is_sla_breached(ticket))
    risky = build_customer_groups(tickets)[:1]
    risky_name = risky[0]["customer_name"] if risky else "No customer"
    suggested_action = (
        f"{category} issues are the largest queue. Prioritize high-risk {category.lower()} tickets."
        if breached or open_count
        else "Queue is healthy. Keep documenting internal notes for future handoffs."
    )
    return [
        {"title": "Most common issue category", "value": category, "detail": "Detected from subject and description keywords."},
        {"title": "Open ticket percentage", "value": f"{round((open_count / total) * 100)}%", "detail": f"{open_count} of {total} tickets are still active."},
        {"title": "SLA breached tickets", "value": breached, "detail": "Active tickets past their priority-based SLA deadline."},
        {"title": "Most risky customer", "value": risky_name, "detail": "Based on open volume, priority, sentiment, and SLA risk."},
        {"title": "Suggested action", "value": suggested_action, "detail": "Local rule-based recommendation."},
    ]
