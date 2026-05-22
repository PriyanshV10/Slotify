const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAvailability = async (req, res) => {
  try {
    const availability = await prisma.availability.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    res.json(availability);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch availability",
    });
  }
};

const setAvailability = async (req, res) => {
  try {
    const schedules = req.body;

    await prisma.availability.deleteMany();

    await prisma.availability.createMany({
      data: schedules,
    });

    const updatedAvailability = await prisma.availability.findMany({
      orderBy: {
        dayOfWeek: "asc",
      },
    });

    res.json(updatedAvailability);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update availability",
    });
  }
};

module.exports = {
  getAvailability,
  setAvailability,
};