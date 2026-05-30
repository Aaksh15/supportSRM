# Support CRM

A complete full-stack customer support ticketing CRM built with FastAPI, SQLite, SQLAlchemy, React, Vite, and Tailwind CSS.

## Features

- Create support tickets with auto-generated IDs like `TKT-001`
- CRM dashboard table with search, status filters, loading, error, and empty states
- Ticket details page with full customer and ticket information
- Status updates and internal notes saved to SQLite
- Notes displayed in timeline format
- Rule-based AI priority prediction on ticket creation
- Keyword sentiment detection: Positive, Neutral, Angry
- Priority-based SLA deadlines with breach/resolution tracking
- Customer risk scoring and Customer 360 profiles
- AI insights dashboard using real ticket data
- Advanced Recharts analytics for status, priority, SLA, sentiment, and customers
- CSV reports generated from real ticket data
- CORS, environment variables, modular backend structure, and Railway-ready setup

## Project Structure

```text
support-crm/
  backend/
    app/
      routes/
        tickets.py
      crud.py
      database.py
      main.py
      models.py
      schemas.py
    requirements.txt
    .env.example
  frontend/
    src/
      components/
      pages/
      services/
      App.jsx
      main.jsx
      index.css
    package.json
    vite.config.js
    tailwind.config.js
    postcss.config.js
    .env.example
```

## Backend Setup

```bash
cd support-crm/backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000`.

Seed sample data:

```bash
python seed.py
```

This inserts any missing sample tickets from `TKT-001` to `TKT-010` without duplicating existing records. The seeded data appears in the dashboard, tickets page, analytics charts, reports, and customers page.

Useful endpoints:

- `POST /api/tickets`
- `GET /api/tickets`
- `GET /api/tickets?search=TKT-001&status=Open`
- `GET /api/tickets/{ticket_id}`
- `PUT /api/tickets/{ticket_id}`
- `GET /api/analytics`
- `GET /api/customers`
- `GET /api/customers/{email}`
- `GET /health`

## Frontend Setup

```bash
cd support-crm/frontend
npm install
copy .env.example .env
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment Variables

Backend:

```env
DATABASE_URL=sqlite:///./support_crm.db
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Railway Deployment

Deploy the backend and frontend as separate Railway services.

### Backend Service

1. Create a new Railway project and connect this repository.
2. Set the service root directory to `support-crm/backend`.
3. Add environment variables:

```env
DATABASE_URL=sqlite:///./support_crm.db
CORS_ORIGINS=https://your-frontend-domain.railway.app
```

4. Use this start command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Railway will install dependencies from `requirements.txt`.

### Frontend Service

1. Add a second Railway service from the same repository.
2. Set the service root directory to `support-crm/frontend`.
3. Add this environment variable, using the backend service URL:

```env
VITE_API_BASE_URL=https://your-backend-domain.railway.app
```

4. Use:

```bash
npm install
npm run build
npm run preview -- --host 0.0.0.0 --port $PORT
```

## API Payload Examples

Create a ticket:

```json
{
  "customer_name": "Jane Cooper",
  "customer_email": "jane@example.com",
  "subject": "Unable to access billing page",
  "description": "Customer sees a blank screen after opening billing.",
  "priority": "High"
}
```

Update a ticket:

```json
{
  "status": "In Progress",
  "note_text": "Reproduced the issue and escalated to engineering."
}
```
