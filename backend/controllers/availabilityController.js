const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getAvailability = async (req, res) => {
  try {
    const availability = await prisma.availability.findFirst();

    if (!availability) {
      return res.json(null);
    }

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
    const { name, timezone, schedule, dateOverrides } = req.body;

    await prisma.availability.deleteMany();

    const newAvailability = await prisma.availability.create({
      data: {
        name: name || "Working Hours",
        timezone: timezone || "Asia/Kolkata",
        schedule: schedule || {},
        dateOverrides: dateOverrides || [],
      },
    });

    res.json(newAvailability);
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