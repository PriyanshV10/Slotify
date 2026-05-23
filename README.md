# Slotify — Scheduling Platform (Cal.com Clone)

Slotify is a full-stack scheduling and booking web application built as a clone of Cal.com. It allows users to create event types, set their availability, and share public booking links for others to seamlessly book time slots on their calendar.

## 🚀 Live Demo
- **Frontend**: [Link to your Vercel/Netlify deployment]
- **Backend API**: [Link to your Render/Railway deployment]

## 🛠 Tech Stack
- **Frontend**: React.js (Vite), Tailwind CSS v4, shadcn/ui (Radix Primitives), Lucide Icons, Date-fns
- **Backend**: Node.js, Express.js, Prisma ORM
- **Database**: PostgreSQL (Hosted on Neon — configured via Prisma ORM)

## ✨ Core Features Implemented
- **Event Types Management**: Create, edit, toggle visibility, and delete event types with unique public URLs.
- **Availability Settings**: Configure weekly working hours and timezones.
- **Public Booking Interface**: A responsive calendar view that calculates available slots dynamically and prevents double-booking.
- **Bookings Dashboard**: View upcoming/past meetings and cancel bookings.
- **Bonus Features Included**:
  - Fully responsive design (Mobile, Tablet, Desktop)
  - Buffer time configuration automatically applied between meetings
  - Date Overrides (block off specific holidays/vacations or set custom hours per day)
  - Glassmorphic, highly polished UI matching Cal.com's modern design language
  - Dark mode support

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd cal-clone
```

### 2. Backend Setup
```bash
cd backend
npm install

# Set up the PostgreSQL database
# (Ensure DATABASE_URL is set in your .env file)
npx prisma db push

# Seed the database with sample data
node prisma/seed.js

# Start the development server
npm run dev
```
*The backend will run on `http://localhost:5000`*

### 3. Frontend Setup
Open a new terminal window:
```bash
cd frontend
npm install

# Start the Vite development server
npm run dev
```
*The frontend will run on `http://localhost:5173`*

## 🤔 Assumptions & Implementation Details
- **No Authentication**: As per the requirements, no login system is implemented. A default user context is assumed for the admin side, and the public booking page is accessible to anyone.
- **Database**: PostgreSQL (Neon) is used as the primary database, satisfying the assignment's explicit relational database requirement. Prisma ORM handles all migrations and querying.
- **Double Booking Prevention**: Handled at both the frontend (by dynamically stripping booked slots from the UI) and the backend (via a concurrency check before saving to the database).

## 📄 License
MIT
