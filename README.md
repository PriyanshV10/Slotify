# Slotify — Scheduling Platform

A full-stack scheduling application inspired by Cal.com, built as a frontend-focused engineering assignment. Slotify lets users create event types, configure availability, and share public booking links so others can book time with them.

**Live Demo:** _[Deploy link goes here]_

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui |
| State | React Context API |
| Routing | React Router v7 |
| Calendar | react-day-picker v10 |
| HTTP Client | Axios |
| Toasts | Sonner |
| Backend | Node.js, Express 5 |
| ORM | Prisma 6 |
| Database | PostgreSQL |
| Font | Geist Variable |

---

## Architecture

```
cal-clone/
├── backend/                  # Express API
│   ├── controllers/          # Request handlers
│   │   ├── eventController.js
│   │   ├── bookingController.js
│   │   └── availabilityController.js
│   ├── routes/               # Route definitions
│   ├── utils/
│   │   └── generateSlots.js  # Core slot generation algorithm
│   ├── prisma/
│   │   ├── schema.prisma     # DB models
│   │   └── seed.js           # Sample data
│   └── index.js              # Entry point
│
└── frontend/                 # React + Vite SPA
    └── src/
        ├── pages/
        │   ├── EventTypes.jsx      # /dashboard/event-types
        │   ├── Availability.jsx    # /dashboard/availability
        │   ├── Bookings.jsx        # /dashboard/bookings
        │   └── PublicBooking.jsx   # /:slug (public)
        ├── layouts/
        │   └── DashboardLayout.jsx # Sidebar + header shell
        ├── context/
        │   └── AppContext.jsx      # Global state + API calls
        └── lib/
            └── api.js              # Axios API client
```

---

## Database Schema

### EventType
```prisma
model EventType {
  id          String   @id @default(cuid())
  title       String
  description String?
  duration    Int
  slug        String   @unique
  location    String   @default("google-meet")
  color       String   @default("#6366f1")
  bufferTime  Int      @default(0)
  enabled     Boolean  @default(true)
  bookings    Booking[]
}
```

### Availability
```prisma
model Availability {
  id            String   @id @default(cuid())
  name          String   @default("Working Hours")
  timezone      String   @default("Asia/Kolkata")
  schedule      Json     // { "0": [], "1": [{startTime, endTime}], ... }
  dateOverrides Json     @default("[]")
}
```

### Booking
```prisma
model Booking {
  id               String    @id @default(cuid())
  eventTypeId      String
  eventType        EventType @relation(...)
  attendeeName     String
  attendeeEmail    String
  date             String    // "YYYY-MM-DD"
  startTime        String    // "HH:mm"
  endTime          String    // "HH:mm"
  status           String    @default("upcoming")

  @@unique([eventTypeId, date, startTime])  // prevents double-booking
}
```

> **Why `@@unique([eventTypeId, date, startTime])`?** This DB-level constraint is the true guard against double-booking. Even if two users submit a booking for the same slot at the exact same moment, the DB will reject the second insert — making the frontend checks a convenience, not the safety net.

---

## Slot Generation Algorithm

`backend/utils/generateSlots.js`

```
1. Parse startTime and endTime into minutes-since-midnight
2. Walk forward by `duration` minutes
3. Stop when the next slot end would exceed endTime
4. Return all valid start times as "HH:mm" strings
```

Used in `GET /bookings/slots`:
1. Fetch EventType for duration
2. Fetch Availability schedule
3. Get day-of-week from requested date
4. Generate all possible slots for active intervals
5. Query existing bookings for that eventTypeId + date
6. Filter out booked slots → return remaining

---

## API Routes

### Event Types
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/event-types` | List all event types |
| `POST` | `/api/event-types` | Create event type |
| `PUT` | `/api/event-types/:id` | Update event type |
| `DELETE` | `/api/event-types/:id` | Delete event type |
| `GET` | `/api/event-types/slug/:slug` | Get by slug (public) |

### Availability
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/availability` | Get schedule |
| `POST` | `/api/availability` | Save schedule |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings` | List all bookings |
| `GET` | `/api/bookings/slots?eventTypeId=&date=` | Get available slots |
| `POST` | `/api/bookings` | Create booking |
| `PATCH` | `/api/bookings/:id/cancel` | Cancel booking |

---

## Local Setup

### Prerequisites
- Node.js v18+
- PostgreSQL running locally

### 1. Clone the repo
```bash
git clone <repo-url>
cd cal-clone
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/slotify"
PORT=5000
```

Run migrations and seed:
```bash
npx prisma migrate dev --name init
node prisma/seed.js
```

Start the backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/slotify` |
| `PORT` | Server port | `5000` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the Express API | `http://localhost:5000/api` |

---

## Key Design Decisions & Assumptions

1. **No authentication** — Single-user scheduling app. The owner manages event types and availability; anyone with a link can book. Skipped intentionally per assignment scope.

2. **String-based date/time** — Bookings store `date: String ("YYYY-MM-DD")` and `startTime: String ("HH:mm")` rather than `DateTime`. This avoids timezone conversion complexity while keeping slot comparison straightforward.

3. **Availability as a single record** — One global `Availability` record with a JSON schedule. Simpler than per-event-type availability while still allowing full weekly configuration.

4. **Past/Upcoming computed on frontend** — The backend never auto-updates booking status to "past". The frontend dynamically computes whether a booking is past by comparing `date + endTime` against `new Date()`.

5. **Reschedule = cancel + create** — No separate reschedule endpoint. Rescheduling cancels the existing booking and creates a new one at the new time, ensuring full server-side slot availability checking.

6. **React + Express** — Chosen for simplicity and faster development within the assignment timeline. Both have a minimal ceremony overhead and excellent ecosystem support.

---

## Deployment

### Backend → Render
- New Web Service from repo
- Build: `npm install && npx prisma generate`
- Start: `node index.js`
- Add env: `DATABASE_URL`, `PORT`

### Frontend → Vercel
- New project from repo, set Root to `frontend/`
- Add env: `VITE_API_URL=<your-render-url>/api`

---

## What Was Not Built (Intentionally)
- ❌ Authentication / OAuth
- ❌ Google Calendar sync
- ❌ Payment processing
- ❌ Email notifications
- ❌ Websockets / real-time updates
- ❌ Per-event-type availability
- ❌ Redux or other state libraries
