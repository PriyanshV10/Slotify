const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const generateSlots = require("../utils/generateSlots");

const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        eventType: true,
      },
      orderBy: {
        startTime: "asc",
      },
    });

    res.json(bookings);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch bookings",
    });
  }
};

const getAvailableSlots = async (req, res) => {
  try {
    const { eventTypeId, date } = req.query;

    if (!eventTypeId || !date) {
      return res.status(400).json({
        message: "eventTypeId and date are required",
      });
    }

    // Get event type
    const eventType = await prisma.eventType.findUnique({
      where: {
        id: eventTypeId,
      },
    });

    if (!eventType) {
      return res.status(404).json({
        message: "Event type not found",
      });
    }

    const selectedDate = new Date(date);

    const dayOfWeek = selectedDate.getDay();

    // Find availability
    const availability = await prisma.availability.findFirst({
      where: {
        dayOfWeek,
      },
    });

    if (!availability) {
      return res.json([]);
    }

    // Generate all slots
    const allSlots = generateSlots(
      availability.startTime,
      availability.endTime,
      eventType.duration,
      selectedDate
    );

    // Get booked slots
    const bookings = await prisma.booking.findMany({
      where: {
        eventTypeId,
        startTime: {
          gte: new Date(
            new Date(date).setHours(0, 0, 0, 0)
          ),
          lte: new Date(
            new Date(date).setHours(23, 59, 59, 999)
          ),
        },
        status: "active",
      },
    });

    const bookedTimes = bookings.map((booking) =>
      booking.startTime.toISOString()
    );

    // Remove booked slots
    const availableSlots = allSlots.filter(
      (slot) =>
        !bookedTimes.includes(slot.toISOString())
    );

    res.json(availableSlots);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch slots",
    });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      name,
      email,
      startTime,
      eventTypeId,
    } = req.body;

    if (!name || !email || !startTime || !eventTypeId) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Find event type
    const eventType = await prisma.eventType.findUnique({
      where: {
        id: eventTypeId,
      },
    });

    if (!eventType) {
      return res.status(404).json({
        message: "Event type not found",
      });
    }

    const start = new Date(startTime);

    const end = new Date(
      start.getTime() + eventType.duration * 60000
    );

    // Check existing booking
    const existingBooking = await prisma.booking.findFirst({
      where: {
        eventTypeId,
        startTime: start,
        status: "active",
      },
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "This slot is already booked",
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        startTime: start,
        endTime: end,
        eventTypeId,
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

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: {
        id,
      },
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    const updatedBooking = await prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: "cancelled",
      },
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