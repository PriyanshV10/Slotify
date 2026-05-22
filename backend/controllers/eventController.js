const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAllEventTypes = async (req, res) => {
  try {
    const eventTypes = await prisma.eventType.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(eventTypes);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch event types",
    });
  }
};

const createEventType = async (req, res) => {
  try {
    const { title, description, duration, slug } = req.body;

    if (!title || !duration || !slug) {
      return res.status(400).json({
        message: "Title, duration and slug are required",
      });
    }

    const existingEvent = await prisma.eventType.findUnique({
      where: {
        slug,
      },
    });

    if (existingEvent) {
      return res.status(400).json({
        message: "Slug already exists",
      });
    }

    const eventType = await prisma.eventType.create({
      data: {
        title,
        description,
        duration: Number(duration),
        slug,
      },
    });

    res.status(201).json(eventType);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create event type",
    });
  }
};

const updateEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, duration, slug } = req.body;

    const existingEvent = await prisma.eventType.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event type not found",
      });
    }

    const updatedEvent = await prisma.eventType.update({
      where: {
        id,
      },
      data: {
        title,
        description,
        duration: Number(duration),
        slug,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update event type",
    });
  }
};

const deleteEventType = async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await prisma.eventType.findUnique({
      where: {
        id,
      },
    });

    if (!existingEvent) {
      return res.status(404).json({
        message: "Event type not found",
      });
    }

    await prisma.eventType.delete({
      where: {
        id,
      },
    });

    res.json({
      message: "Event type deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete event type",
    });
  }
};

module.exports = {
  getAllEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
};