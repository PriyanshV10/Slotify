const express = require("express");

const {
  getAvailability,
  setAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

router.get("/", getAvailability);

router.post("/", setAvailability);

module.exports = router;