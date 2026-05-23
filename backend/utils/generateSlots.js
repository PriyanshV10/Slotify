/**
 * Generate time slots between startTime and endTime with a given duration.
 *
 * @param {string} startTime - "HH:mm" e.g. "09:00"
 * @param {string} endTime   - "HH:mm" e.g. "17:00"
 * @param {number} duration  - slot length in minutes e.g. 30
 * @returns {string[]}       - array of "HH:mm" slot start times
 *
 * Algorithm:
 *  1. Parse startTime and endTime into minutes-since-midnight
 *  2. Walk forward by `duration` minutes
 *  3. Stop when the slot end would exceed endTime
 *  4. Return all valid slot start times as "HH:mm" strings
 */
const generateSlots = (startTime, endTime, duration, bufferTime = 0) => {
  const slots = [];

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const toHHMM = (totalMinutes) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const startMin = toMinutes(startTime);
  const endMin = toMinutes(endTime);

  let cur = startMin;
  // A slot is valid only if it fully fits before endTime
  while (cur + duration <= endMin) {
    slots.push(toHHMM(cur));
    cur += duration + bufferTime;
  }

  return slots;
};

module.exports = generateSlots;