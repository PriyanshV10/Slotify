const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const generateSlots = require("../utils/generateSlots");

// ── GET /bookings ─────────────────────────────────────────────────────────────
const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        eventType: true,
      },
      orderBy: [
        { date: "asc" },
        { startTime: "asc" },
      ],
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};

// ── GET /bookings/slots?eventTypeId=...&date=YYYY-MM-DD ───────────────────────
/**
 * Slot Generation Algorithm:
 *  1. Get requested date + eventTypeId from query
 *  2. Find the event type to get duration
 *  3. Fetch availability schedule from DB
 *  4. Determine day-of-week (0=Sun, 1=Mon, … 6=Sat)
 *  5. Get schedule intervals for that day
 *  6. Generate all possible slots with generateSlots()
 *  7. Query bookings for that date + eventTypeId (non-cancelled)
 *  8. Remove booked start times from the slot list
 *  9. Return remaining available slots
 */
const getAvailableSlots = async (req, res) => {
  try {
    const { eventTypeId, date } = req.query;

    if (!eventTypeId || !date) {
      return res.status(400).json({
        message: "eventTypeId and date are required",
      });
    }

    // Step 1 — Fetch event type for duration
    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });

    if (!eventType) {
      return res.status(404).json({ message: "Event type not found" });
    }

    // Step 2 — Fetch availability (single record)
    const availability = await prisma.availability.findFirst();

    if (!availability) {
      return res.json({ slots: [] });
    }

    // Step 3 — Determine day of week (JS getDay: 0=Sun … 6=Sat)
    // Parse date as local date (date-only string is UTC midnight, so we add T00:00 to avoid off-by-one)
    const dateObj = new Date(date + "T00:00:00");
    const dayOfWeek = dateObj.getDay();

    // Step 4 — Get schedule intervals for this weekday, or check Date Overrides!
    let intervals = [];
    
    // Check Date Overrides first
    // availability.dateOverrides is stored as a JSON array in Prisma
    const dateOverrides = availability.dateOverrides || [];
    const override = dateOverrides.find((o) => o.date === date);

    if (override) {
      if (override.unavailable) {
        return res.json({ slots: [] }); // Fully blocked out date
      } else {
        // Custom hours for this date
        intervals = [{ startTime: override.startTime, endTime: override.endTime }];
      }
    } else {
      // Fallback to regular weekly schedule
      const schedule = availability.schedule;
      intervals = schedule[String(dayOfWeek)] || [];
    }

    if (intervals.length === 0) {
      return res.json({ slots: [] });
    }

    // Step 5 — Generate all possible slots across every interval
    const allSlots = [];
    for (const interval of intervals) {
      const slotTimes = generateSlots(
        interval.startTime,
        interval.endTime,
        eventType.duration,
        eventType.bufferTime || 0
      );
      allSlots.push(...slotTimes);
    }

    // Step 6 — Fetch already-booked startTimes for this date + eventType
    const existingBookings = await prisma.booking.findMany({
      where: {
        eventTypeId,
        date,
        status: { not: "cancelled" },
      },
      select: { startTime: true },
    });

    const bookedTimes = new Set(existingBookings.map((b) => b.startTime));

    // Step 7 — Filter out booked slots
    const availableSlots = allSlots.filter((t) => !bookedTimes.has(t));

    res.json({ slots: availableSlots });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch slots",
    });
  }
};

// ── POST /bookings ────────────────────────────────────────────────────────────
const createBooking = async (req, res) => {
  try {
    const {
      eventTypeId,
      eventTitle,
      duration,
      attendeeName,
      attendeeEmail,
      attendeeInitials,
      date,
      startTime,
      endTime,
      location,
      notes,
    } = req.body;

    if (!attendeeName || !attendeeEmail || !startTime || !eventTypeId || !date || !endTime) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    // Server-side double-check: is this slot still available?
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        date,
        startTime,
        status: { not: "cancelled" },
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        message: "This slot is already booked. Please choose a different time.",
      });
    }

    const booking = await prisma.booking.create({
      data: {
        eventTypeId,
        eventTitle,
        duration: Number(duration),
        attendeeName,
        attendeeEmail,
        attendeeInitials,
        date,
        startTime,
        endTime,
        location,
        notes,
        status: "upcoming",
      },
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create booking",
    });
  }
};

// ── PATCH /bookings/:id/cancel ────────────────────────────────────────────────
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: "cancelled" },
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to cancel booking",
    });
  }
};

module.exports = {
  getBookings,
  getAvailableSlots,
  createBooking,
  cancelBooking,
};