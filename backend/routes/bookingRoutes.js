const express = require("express");

const {
  getBookings,
  createBooking,
  cancelBooking,
} = require("../controllers/bookingController");

const router = express.Router();

router.get("/", getBookings);

router.post("/", createBooking);

router.patch("/:id/cancel", cancelBooking);

module.exports = router;