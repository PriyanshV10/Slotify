const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Clear old data (order matters — bookings reference eventTypes)
  await prisma.booking.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availability.deleteMany();

  // ── Event Types ───────────────────────────────────────────────────────────
  const meeting30 = await prisma.eventType.create({
    data: {
      title: "30 Minute Meeting",
      description: "Quick intro call — great for first conversations and catching up.",
      duration: 30,
      slug: "30-min-meeting",
      location: "google-meet",
      color: "#6366f1",
      bufferTime: 5,
      enabled: true,
    },
  });

  const deepDive = await prisma.eventType.create({
    data: {
      title: "60 Min Deep Dive",
      description: "An in-depth session to thoroughly discuss complex topics or review technical work.",
      duration: 60,
      slug: "60-min-deep-dive",
      location: "zoom",
      color: "#10b981",
      bufferTime: 10,
      enabled: true,
    },
  });

  // ── Availability ──────────────────────────────────────────────────────────
  await prisma.availability.create({
    data: {
      name: "Working Hours",
      timezone: "Asia/Kolkata",
      schedule: {
        0: [], // Sunday — off
        1: [{ id: "a1", startTime: "09:00", endTime: "17:00" }],
        2: [{ id: "a2", startTime: "09:00", endTime: "17:00" }],
        3: [{ id: "a3", startTime: "09:00", endTime: "17:00" }],
        4: [{ id: "a4", startTime: "09:00", endTime: "17:00" }],
        5: [{ id: "a5", startTime: "09:00", endTime: "17:00" }],
        6: [], // Saturday — off
      },
      dateOverrides: [],
    },
  });

  // ── Bookings ──────────────────────────────────────────────────────────────
  // Past booking — clearly in the past so it shows in the "Past" tab
  await prisma.booking.create({
    data: {
      eventTypeId: meeting30.id,
      eventTitle: meeting30.title,
      duration: meeting30.duration,
      attendeeName: "Rahul Sharma",
      attendeeEmail: "rahul@example.com",
      attendeeInitials: "RS",
      date: "2026-05-10",
      startTime: "10:00",
      endTime: "10:30",
      location: meeting30.location,
      status: "upcoming", // frontend derives past/upcoming from date comparison
    },
  });

  await prisma.booking.create({
    data: {
      eventTypeId: deepDive.id,
      eventTitle: deepDive.title,
      duration: deepDive.duration,
      attendeeName: "Priya Menon",
      attendeeEmail: "priya@example.com",
      attendeeInitials: "PM",
      date: "2026-05-15",
      startTime: "14:00",
      endTime: "15:00",
      location: deepDive.location,
      status: "upcoming",
    },
  });

  // Upcoming bookings — dates in the future
  await prisma.booking.create({
    data: {
      eventTypeId: meeting30.id,
      eventTitle: meeting30.title,
      duration: meeting30.duration,
      attendeeName: "Arjun Patel",
      attendeeEmail: "arjun@example.com",
      attendeeInitials: "AP",
      date: "2026-05-28",
      startTime: "11:00",
      endTime: "11:30",
      location: meeting30.location,
      status: "upcoming",
    },
  });

  await prisma.booking.create({
    data: {
      eventTypeId: deepDive.id,
      eventTitle: deepDive.title,
      duration: deepDive.duration,
      attendeeName: "Meera Nair",
      attendeeEmail: "meera@example.com",
      attendeeInitials: "MN",
      date: "2026-06-02",
      startTime: "09:00",
      endTime: "10:00",
      location: deepDive.location,
      status: "upcoming",
    },
  });

  // A cancelled booking for the cancelled tab
  await prisma.booking.create({
    data: {
      eventTypeId: meeting30.id,
      eventTitle: meeting30.title,
      duration: meeting30.duration,
      attendeeName: "Vikram Singh",
      attendeeEmail: "vikram@example.com",
      attendeeInitials: "VS",
      date: "2026-05-20",
      startTime: "15:00",
      endTime: "15:30",
      location: meeting30.location,
      status: "cancelled",
    },
  });

  console.log("🌱 Database seeded successfully");
  console.log(`   ✓ 2 event types`);
  console.log(`   ✓ 1 availability schedule`);
  console.log(`   ✓ 5 bookings (2 past, 2 upcoming, 1 cancelled)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });