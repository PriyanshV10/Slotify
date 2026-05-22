const generateSlots = (
  startTime,
  endTime,
  duration,
  selectedDate
) => {
  const slots = [];

  const [startHour, startMinute] = startTime
    .split(":")
    .map(Number);

  const [endHour, endMinute] = endTime
    .split(":")
    .map(Number);

  const start = new Date(selectedDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(selectedDate);
  end.setHours(endHour, endMinute, 0, 0);

  while (start < end) {
    slots.push(new Date(start));

    start.setMinutes(start.getMinutes() + duration);
  }

  return slots;
};

module.exports = generateSlots;