const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Clear old data
  await prisma.booking.deleteMany();
  await prisma.eventType.deleteMany();
  await prisma.availability.deleteMany();

  // Event Types
  const meeting30 = await prisma.eventType.create({
    data: {
      title: "30 Minute Meeting",
      description: "Quick intro and discussion call",
      duration: 30,
      slug: "30-min-meeting",
    },
  });

  const interview = await prisma.eventType.create({
    data: {
      title: "Frontend Interview",
      description: "Technical interview session",
      duration: 60,
      slug: "frontend-interview",
    },
  });

  const consultation = await prisma.eventType.create({
    data: {
      title: "Consultation Call",
      description: "Project consultation and planning",
      duration: 45,
      slug: "consultation-call",
    },
  });

  // Availability
  await prisma.availability.createMany({
    data: [
      {
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "Asia/Kolkata",
      },
      {
        dayOfWeek: 2,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "Asia/Kolkata",
      },
      {
        dayOfWeek: 3,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "Asia/Kolkata",
      },
      {
        dayOfWeek: 4,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "Asia/Kolkata",
      },
      {
        dayOfWeek: 5,
        startTime: "09:00",
        endTime: "17:00",
        timezone: "Asia/Kolkata",
      },
    ],
  });

  // Bookings
  await prisma.booking.createMany({
    data: [
      {
        name: "Rahul Sharma",
        email: "rahul@example.com",
        startTime: new Date("2026-05-25T10:00:00.000Z"),
        endTime: new Date("2026-05-25T10:30:00.000Z"),
        eventTypeId: meeting30.id,
      },
      {
        name: "Ananya Gupta",
        email: "ananya@example.com",
        startTime: new Date("2026-05-26T12:00:00.000Z"),
        endTime: new Date("2026-05-26T13:00:00.000Z"),
        eventTypeId: interview.id,
      },
      {
        name: "Amit Verma",
        email: "amit@example.com",
        startTime: new Date("2026-05-27T14:00:00.000Z"),
        endTime: new Date("2026-05-27T14:45:00.000Z"),
        eventTypeId: consultation.id,
      },
    ],
  });

  console.log("🌱 Database seeded successfully");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });