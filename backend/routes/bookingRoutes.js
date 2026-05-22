const express = require("express");

const {
  getBookings,
  createBooking,
  cancelBooking,
  getAvailableSlots,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getBookings);

router.get("/slots", getAvailableSlots);

router.post("/", createBooking);

router.patch("/:id/cancel", cancelBooking);


module.exports = router;