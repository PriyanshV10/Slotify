// ─── Location options ──────────────────────────────────────────────
export const locationOptions = [
  { value: 'google-meet', label: 'Google Meet' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'in-person', label: 'In Person' },
  { value: 'teams', label: 'Microsoft Teams' },
];

export const getLocationLabel = (v) =>
  locationOptions.find((l) => l.value === v)?.label ?? v;

// ─── Default user profile (baseline — overridden by localStorage) ──
export const defaultUser = {
  name: 'Priyansh Verma',
  username: 'priyansh',
  email: 'priyansh@example.com',
  bio: 'Software engineer & open-source enthusiast. Book a slot to connect!',
  timezone: 'Asia/Kolkata',
  initials: 'PV',
};

// ─── Common timezones ──────────────────────────────────────────────
export const commonTimezones = [
  'Asia/Kolkata', 'UTC', 'America/New_York', 'America/Chicago',
  'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Asia/Tokyo',
  'Asia/Shanghai', 'Asia/Singapore', 'Asia/Dubai', 'Australia/Sydney',
  'Pacific/Auckland',
];
