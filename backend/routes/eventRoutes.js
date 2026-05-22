const express = require("express");

const {
  getAllEventTypes,
  createEventType,
  updateEventType,
  deleteEventType,
} = require("../controllers/eventController");

const router = express.Router();

router.get("/", getAllEventTypes);

router.post("/", createEventType);

router.put("/:id", updateEventType);

router.delete("/:id", deleteEventType);

module.exports = router;