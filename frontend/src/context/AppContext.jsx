import { createContext, useContext, useState, useEffect } from 'react';
import { eventTypesApi, bookingsApi, availabilityApi } from '@/lib/api';
import { defaultUser } from '@/lib/constants';

import { toast } from 'sonner';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // User persisted in localStorage — no backend for user profile
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('slotify_user');
      return saved ? { ...defaultUser, ...JSON.parse(saved) } : defaultUser;
    } catch {
      return defaultUser;
    }
  });

  const [eventTypes, setEventTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availability, setAvailability] = useState({
    name: 'Working Hours',
    timezone: 'Asia/Kolkata',
    schedule: {
      0: [], 1: [{ id: 'a1', startTime: '09:00', endTime: '17:00' }],
      2: [{ id: 'a2', startTime: '09:00', endTime: '17:00' }],
      3: [{ id: 'a3', startTime: '09:00', endTime: '17:00' }],
      4: [{ id: 'a4', startTime: '09:00', endTime: '17:00' }],
      5: [{ id: 'a5', startTime: '09:00', endTime: '17:00' }], 6: [],
    },
    dateOverrides: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evs, bks, avail] = await Promise.all([
          eventTypesApi.getAll(),
          bookingsApi.getAll(),
          availabilityApi.get(),
        ]);
        setEventTypes(evs);
        setBookings(bks);
        if (avail) {
          setAvailability(avail);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        toast.error('Failed to load data from server');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Event Types ──────────────────────────────────────────────────────────
  const createEventType = async (data) => {
    try {
      const newEvent = await eventTypesApi.create(data);
      setEventTypes((prev) => [newEvent, ...prev]); // Add to beginning (desc order)
      return newEvent;
    } catch (err) {
      toast.error('Failed to create event type');
      throw err;
    }
  };

  const updateEventType = async (id, data) => {
    try {
      const updatedEvent = await eventTypesApi.update(id, data);
      setEventTypes((prev) =>
        prev.map((et) => (et.id === id ? updatedEvent : et))
      );
    } catch (err) {
      toast.error('Failed to update event type');
      throw err;
    }
  };

  const deleteEventType = async (id) => {
    try {
      await eventTypesApi.delete(id);
      setEventTypes((prev) => prev.filter((et) => et.id !== id));
    } catch (err) {
      toast.error('Failed to delete event type');
      throw err;
    }
  };

  const toggleEventType = async (id) => {
    const et = eventTypes.find(e => e.id === id);
    if (!et) return;
    try {
      const updatedEvent = await eventTypesApi.update(id, { enabled: !et.enabled });
      setEventTypes((prev) =>
        prev.map((e) => (e.id === id ? updatedEvent : e))
      );
    } catch (err) {
      toast.error('Failed to toggle event type');
    }
  };

  // ── Bookings ─────────────────────────────────────────────────────────────
  const cancelBooking = async (id) => {
    try {
      const updated = await bookingsApi.cancel(id);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? updated : b))
      );
    } catch (err) {
      toast.error('Failed to cancel booking');
      throw err;
    }
  };

  const rescheduleBooking = async (id, { date, startTime, endTime }) => {
    // Backend doesn't have a specific reschedule endpoint, so we might need to 
    // patch the booking, but wait, the backend `bookingController.js` only has `create` and `cancel`.
    // Since this is a clone, we can just fake it locally or create a new booking + cancel old.
    // For now we'll just fake it locally with a warning.
    toast.error('Rescheduling API not implemented on backend');
  };

  const createBooking = async (data) => {
    try {
      const newBooking = await bookingsApi.create(data);
      setBookings((prev) => [...prev, newBooking]);
      return newBooking;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
      throw err;
    }
  };

  // Check if a slot is already booked for a given date + startTime + eventTypeId
  const isSlotBooked = (date, startTime, eventTypeId) => {
    return bookings.some(
      (b) =>
        b.date === date &&
        b.startTime === startTime &&
        b.eventTypeId === eventTypeId &&
        b.status !== 'cancelled'
    );
  };

  // ── Availability ─────────────────────────────────────────────────────────
  const updateAvailability = async (newAvailability) => {
    try {
      const updated = await availabilityApi.set(newAvailability);
      setAvailability(updated);
    } catch (err) {
      toast.error('Failed to save availability');
      throw err;
    }
  };

  // ── User ─────────────────────────────────────────────────────────────────
  const updateUser = (data) => {
    setUser((prev) => {
      const next = { ...prev, ...data };
      try { localStorage.setItem('slotify_user', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        updateUser,
        eventTypes,
        createEventType,
        updateEventType,
        deleteEventType,
        toggleEventType,
        bookings,
        cancelBooking,
        rescheduleBooking,
        createBooking,
        isSlotBooked,
        availability,
        updateAvailability,
        loading,
      }}
    >
      {children}

    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
