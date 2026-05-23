import { useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import { Clock, Video, Phone, MapPin, Monitor, CalendarDays, CheckCircle2, Globe, Loader2, ChevronLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLocationLabel } from '@/lib/constants';
import { format, addMinutes, parse, getDay, isBefore } from 'date-fns';
import { toast } from 'sonner';
import { bookingsApi } from '@/lib/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

function LocIcon({ location, className = 'h-4 w-4' }) {
  const m = { 'google-meet': Video, zoom: Monitor, phone: Phone, 'in-person': MapPin, teams: Monitor };
  const I = m[location] || Video;
  return <I className={className} />;
}

const to12h = (t) => {
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h >= 12 ? 'pm' : 'am'}`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function SlotSkeleton() {
  return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
      ))}
    </div>
  );
}

function EventInfoPanel({ event, user, availability, selectedDate, selectedTime }) {
  return (
    <div className="md:w-56 lg:w-64 p-6 shrink-0 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
      <Avatar className="h-9 w-9 mb-3">
        <AvatarFallback className="bg-zinc-800 dark:bg-zinc-700 text-white text-xs font-semibold">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{user.name}</p>
      <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mt-0.5 mb-3">{event.title}</h2>

      <div className="space-y-2.5 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" />{event.duration} min</div>
        <div className="flex items-center gap-2"><LocIcon location={event.location} className="h-4 w-4 shrink-0" />{getLocationLabel(event.location)}</div>
        <div className="flex items-center gap-2"><Globe className="h-4 w-4 shrink-0" />{availability.timezone}</div>
        {selectedDate && (
          <div className="pt-3 mt-1 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-medium">
              <CalendarDays className="h-4 w-4 shrink-0 text-zinc-400" />
              {format(selectedDate, 'EEE, MMM d, yyyy')}
            </div>
            {selectedTime && (
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50 font-medium">
                <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                {to12h(selectedTime)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PublicBooking() {
  const { slug } = useParams();
  const { eventTypes, user, availability, createBooking, isSlotBooked, loading } = useApp();
  const event = eventTypes.find(et => et.slug === slug);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [serverSlots, setServerSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const availableDays = useMemo(() => {
    const s = new Set();
    Object.entries(availability.schedule).forEach(([d, iv]) => { if (iv.length > 0) s.add(Number(d)); });
    return s;
  }, [availability.schedule]);

  const isDateDisabled = (date) => {
    const dow = getDay(date);
    const ds = format(date, 'yyyy-MM-dd');
    const ov = availability.dateOverrides?.find(o => o.date === ds);
    if (ov) return ov.unavailable;
    return !availableDays.has(dow) || isBefore(date, new Date(new Date().setHours(0,0,0,0)));
  };

  const fetchSlots = useCallback(async (date) => {
    if (!date || !event) return;
    setSlotsLoading(true);
    setServerSlots([]);
    try {
      const data = await bookingsApi.getSlots(format(date, 'yyyy-MM-dd'), event.id);
      setServerSlots(data.slots || []);
    } catch {
      toast.error('Could not load slots. Please try again.');
    } finally {
      setSlotsLoading(false);
    }
  }, [event]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    if (date) fetchSlots(date);
  };

  const handleConfirm = async () => {
    if (!name.trim() || !email.trim()) return;
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    if (isSlotBooked(dateStr, selectedTime, event.id)) {
      toast.error('Slot just taken — please pick another time.');
      fetchSlots(selectedDate);
      setSelectedTime(null);
      return;
    }
    const endTime = format(addMinutes(parse(selectedTime, 'HH:mm', new Date()), event.duration), 'HH:mm');
    setSubmitting(true);
    try {
      const created = await createBooking({
        eventTypeId: event.id, eventTitle: event.title, duration: event.duration,
        attendeeName: name, attendeeEmail: email,
        attendeeInitials: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2),
        date: dateStr, startTime: selectedTime, endTime,
        location: event.location, notes,
      });
      setConfirmedBooking(created);
      toast.success('Booking confirmed!');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Booking failed — please try again.';
      toast.error(msg);
      if (err?.response?.status === 409) { setSelectedTime(null); fetchSlots(selectedDate); }
    } finally {
      setSubmitting(false);
    }
  };

  // ── Not found ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full inline-flex mb-4"><CalendarDays className="h-6 w-6 text-zinc-400" /></div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2">Event not found</h1>
          <p className="text-sm text-zinc-500 mb-6">The event "/{slug}" doesn't exist.</p>
          <Link to="/"><Button variant="outline" className="rounded-full">Browse events</Button></Link>
        </div>
      </div>
    );
  }

  // ── Confirmation ───────────────────────────────────────────────────────────
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 text-center shadow-sm">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-50 dark:bg-green-950/30 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Confirmed!</h2>
          <p className="text-sm text-zinc-500 mb-6">A confirmation will be sent to <strong>{confirmedBooking.attendeeEmail}</strong></p>
          <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 text-left space-y-2.5 text-sm mb-6">
            <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"><CalendarDays className="h-4 w-4 text-zinc-400 shrink-0" />{format(new Date(confirmedBooking.date + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}</div>
            <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"><Clock className="h-4 w-4 text-zinc-400 shrink-0" />{to12h(confirmedBooking.startTime)} – {to12h(confirmedBooking.endTime)}</div>
            <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"><LocIcon location={event.location} className="h-4 w-4 text-zinc-400 shrink-0" />{getLocationLabel(event.location)}</div>
            <div className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"><Globe className="h-4 w-4 text-zinc-400 shrink-0" />{availability.timezone}</div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard/bookings"><Button variant="outline" className="rounded-full">View bookings</Button></Link>
            <Button className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" onClick={() => { setConfirmedBooking(null); setSelectedDate(null); setSelectedTime(null); setName(''); setEmail(''); setNotes(''); }}>Book another</Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main booking layout ────────────────────────────────────────────────────
  const showForm = selectedDate && selectedTime;
  const showSlots = selectedDate && !selectedTime;

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">

          {/* LEFT — Event info (always visible) */}
          <EventInfoPanel
            event={event}
            user={user}
            availability={availability}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
          />

          {/* CENTER — Calendar (visible when not on form step) */}
          {!showForm && (
            <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-5">
                {format(new Date(), 'MMMM yyyy')}
              </h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                fromDate={new Date()}
                className="w-full"
              />
            </div>
          )}

          {/* RIGHT — Time slots panel */}
          {showSlots && (
            <div className="md:w-56 lg:w-64 p-5 shrink-0 flex flex-col">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
                {format(selectedDate, 'EEE d')}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                {format(selectedDate, 'MMMM yyyy')}
              </p>

              {slotsLoading ? (
                <SlotSkeleton />
              ) : serverSlots.length === 0 ? (
                <p className="text-sm text-zinc-400 text-center py-8">No available slots this day.</p>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {serverSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-700 dark:text-zinc-200 transition-all"
                    >
                      <span className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                      {to12h(time)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* FORM — Replaces calendar+slots when time is selected */}
          {showForm && (
            <div className="flex-1 p-6">
              <button
                onClick={() => setSelectedTime(null)}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 mb-6 transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Back to time selection
              </button>

              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50 mb-5">Your details</h3>

              <div className="space-y-4 max-w-sm">
                <div className="space-y-1.5">
                  <Label htmlFor="b-name">Your name <span className="text-red-400">*</span></Label>
                  <Input id="b-name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-email">Email address <span className="text-red-400">*</span></Label>
                  <Input id="b-email" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="b-notes">Additional notes <span className="text-zinc-400 font-normal text-xs">(optional)</span></Label>
                  <textarea
                    id="b-notes"
                    rows={3}
                    className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    placeholder="Anything to share before the meeting?"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleConfirm}
                  disabled={!name.trim() || !email.trim() || submitting}
                  className="w-full rounded-full h-10 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-60"
                >
                  {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Confirming…</> : 'Confirm booking'}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
