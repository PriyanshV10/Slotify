import { useState, useEffect } from 'react';
import { CalendarDays, Clock, Video, Phone, MapPin, Monitor, XCircle, RotateCcw, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { getLocationLabel } from '@/lib/constants';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';

function LocIcon({ location, className = 'h-3.5 w-3.5' }) {
  const m = { 'google-meet': Video, zoom: Monitor, phone: Phone, 'in-person': MapPin, teams: Monitor };
  const I = m[location] || Video;
  return <I className={className} />;
}

/**
 * Determine if a booking is in the past by comparing date+endTime to now.
 * We intentionally don't rely on the DB `status` field for this because
 * the backend never auto-updates statuses — the frontend computes it.
 */
function isPastBooking(booking) {
  const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
  return bookingEnd < new Date();
}

// ── Skeleton loader for booking rows ──────────────────────────────────────────
function BookingSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="hidden sm:block h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="h-3 w-56 bg-zinc-100 dark:bg-zinc-800 rounded" />
          </div>
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <div className="h-7 w-7 rounded-full bg-zinc-100 dark:bg-zinc-800" />
            <div className="space-y-1.5">
              <div className="h-3 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
              <div className="h-2.5 w-28 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BookingRow({ booking, isSelected, onClick }) {
  const dateObj = parseISO(booking.date);
  const dayStr = format(dateObj, 'EEE, MMM d');
  const isPast = isPastBooking(booking);
  const isCancelled = booking.status === 'cancelled';

  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 cursor-pointer transition-colors ${isCancelled ? 'opacity-50' : ''} ${isSelected ? 'bg-zinc-50 dark:bg-zinc-800/50' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'}`}
    >
      {/* Date block */}
      <div className="hidden sm:flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">{format(dateObj, 'MMM')}</span>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">{format(dateObj, 'd')}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-sm font-semibold ${isCancelled ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-zinc-50'}`}>{booking.eventTitle}</span>
          {isCancelled && <Badge variant="destructive" className="text-[10px] h-5">Cancelled</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{booking.startTime} – {booking.endTime}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-3 w-3" />{dayStr}</span>
          <Badge variant="secondary" className="gap-1 text-xs font-normal rounded-md py-0.5 h-5">
            <LocIcon location={booking.location} className="h-3 w-3" />{getLocationLabel(booking.location)}
          </Badge>
        </div>
      </div>

      {/* Attendee */}
      <div className="hidden md:flex items-center gap-2 shrink-0">
        <Avatar className="h-7 w-7 text-[10px]"><AvatarFallback className="bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[10px] font-medium">{booking.attendeeInitials}</AvatarFallback></Avatar>
        <div className="min-w-0">
          <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate">{booking.attendeeName}</p>
          <p className="text-[11px] text-zinc-400 truncate">{booking.attendeeEmail}</p>
        </div>
      </div>
    </div>
  );
}

function BookingDetailsPane({ booking, onCancel, onReschedule, cancelling }) {
  if (!booking) return null;

  const dateObj = parseISO(booking.date);
  const dayStr = format(dateObj, 'EEEE, MMMM d, yyyy');
  const isPast = isPastBooking(booking);
  const isCancelled = booking.status === 'cancelled';

  let statusBadge = <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">Confirmed</Badge>;
  if (isCancelled) statusBadge = <Badge variant="destructive">Cancelled</Badge>;
  else if (isPast) statusBadge = <Badge variant="secondary">Past</Badge>;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-6">
      <div className="mb-6 flex items-center justify-between">
        {statusBadge}
      </div>
      
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-8 leading-tight">{booking.eventTitle}</h3>

      <div className="space-y-7">
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">When</h4>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 mb-0.5">{dayStr}</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{booking.startTime} - {booking.endTime} (India Standard Time)</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Who</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 text-xs"><AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium">You</AvatarFallback></Avatar>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  You <Badge variant="secondary" className="text-[10px] h-5 py-0">Host</Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 text-xs"><AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 font-medium">{booking.attendeeInitials}</AvatarFallback></Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{booking.attendeeName}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{booking.attendeeEmail}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Where</h4>
          <div className="flex items-center gap-2 text-sm mb-1.5">
            <LocIcon location={booking.location} className="h-4 w-4 text-zinc-500" />
            <span className="font-medium text-zinc-900 dark:text-zinc-50">{getLocationLabel(booking.location)}</span>
          </div>
          {['google-meet', 'zoom', 'teams'].includes(booking.location) && (
            <a href="#" className="inline-flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Join meeting <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        
        {booking.notes && (
          <div>
             <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">Additional Notes</h4>
             <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">{booking.notes}</p>
          </div>
        )}
      </div>

      {!isCancelled && !isPast && (
        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
          {['google-meet', 'zoom', 'teams'].includes(booking.location) && (
            <Button 
              className="flex-1 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200"
              onClick={() => {
                toast('Joining meeting is not implemented yet.');
              }}
            >
              <Video className="h-4 w-4 mr-2" /> Join Video
            </Button>
          )}
          <Button
            variant="outline"
            className={`rounded-lg text-zinc-700 dark:text-zinc-300 ${!['google-meet', 'zoom', 'teams'].includes(booking.location) ? 'flex-1' : 'flex-none w-12 p-0'}`}
            onClick={() => onReschedule(booking)}
            title="Reschedule"
          >
            <RotateCcw className="h-4 w-4" />
            {!['google-meet', 'zoom', 'teams'].includes(booking.location) && <span className="ml-2">Reschedule</span>}
          </Button>
          <Button
            variant="outline"
            className={`rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900/50 ${!['google-meet', 'zoom', 'teams'].includes(booking.location) ? 'flex-1' : 'flex-none w-12 p-0'}`}
            onClick={() => onCancel(booking.id)}
            disabled={cancelling === booking.id}
            title="Cancel booking"
          >
            {cancelling === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            {!['google-meet', 'zoom', 'teams'].includes(booking.location) && <span className="ml-2">Cancel</span>}
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyTab({ title, desc, icon: Icon }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4"><Icon className="h-6 w-6 text-zinc-400" /></div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="text-sm text-zinc-500 mt-1 max-w-sm">{desc}</p>
    </div>
  );
}

export default function Bookings() {
  const { bookings, cancelBooking, createBooking, loading } = useApp();
  const [cancelling, setCancelling] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Dynamic past/upcoming split — compare booking end datetime to now
  const upcoming = bookings.filter(b => b.status !== 'cancelled' && !isPastBooking(b));
  const past = bookings.filter(b => b.status !== 'cancelled' && isPastBooking(b));
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  // We intentionally do not auto-select the first booking here so details are only shown on click.

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
    } catch {
      // error toast handled by AppContext
    } finally {
      setCancelling(null);
    }
  };

  const openReschedule = (b) => {
    setRescheduleTarget(b);
    setNewDate(b.date);
    setNewStart(b.startTime);
    setNewEnd(b.endTime);
  };

  /**
   * Reschedule = cancel the old booking + create a new one.
   * This properly goes through server-side slot conflict checking on the new time.
   */
  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDate || !newStart || !newEnd) return;
    setRescheduling(true);
    try {
      // 1. Cancel the old booking
      await cancelBooking(rescheduleTarget.id);

      // 2. Create a new booking with updated date/time
      await createBooking({
        eventTypeId: rescheduleTarget.eventTypeId,
        eventTitle: rescheduleTarget.eventTitle,
        duration: rescheduleTarget.duration,
        attendeeName: rescheduleTarget.attendeeName,
        attendeeEmail: rescheduleTarget.attendeeEmail,
        attendeeInitials: rescheduleTarget.attendeeInitials,
        date: newDate,
        startTime: newStart,
        endTime: newEnd,
        location: rescheduleTarget.location,
        notes: rescheduleTarget.notes,
      });

      toast.success('Booking rescheduled successfully');
      setRescheduleTarget(null);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes('already booked')) {
        toast.error('That slot is already taken. Please choose a different time.');
      } else {
        toast.error('Failed to reschedule booking. Please try again.');
      }
    } finally {
      setRescheduling(false);
    }
  };

  const renderList = (list, emptyTitle, emptyDesc, emptyIcon) => {
    if (loading) return <BookingSkeleton />;
    if (list.length === 0) return <EmptyTab title={emptyTitle} desc={emptyDesc} icon={emptyIcon} />;
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
        {list.map(b => (
          <BookingRow 
            key={b.id} 
            booking={b} 
            isSelected={selectedBooking?.id === b.id} 
            onClick={() => setSelectedBooking(b)} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Bookings</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">See upcoming and past events booked through your event type links.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col">
            <TabsList className="w-full justify-start bg-zinc-100 dark:bg-zinc-800 rounded-xl h-10 p-1 overflow-x-auto">
              <TabsTrigger value="upcoming" className="rounded-lg text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex-shrink-0">
                Upcoming {!loading && `(${upcoming.length})`}
              </TabsTrigger>
              <TabsTrigger value="past" className="rounded-lg text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex-shrink-0">
                Past {!loading && `(${past.length})`}
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="rounded-lg text-sm data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-900 data-[state=active]:shadow-sm flex-shrink-0">
                Cancelled {!loading && `(${cancelled.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              {renderList(upcoming, 'No upcoming bookings', 'You have no upcoming bookings. Share your event type links to start getting booked!', CalendarDays)}
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              {renderList(past, 'No past bookings', 'Your past bookings will appear here.', Clock)}
            </TabsContent>
            <TabsContent value="cancelled" className="mt-4">
              {renderList(cancelled, 'No cancelled bookings', 'No bookings have been cancelled yet.', XCircle)}
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Details Pane (Right Side) */}
        {selectedBooking && (
          <div className="w-full lg:w-[400px] shrink-0">
            <BookingDetailsPane 
              booking={selectedBooking} 
              onCancel={handleCancel} 
              onReschedule={openReschedule} 
              cancelling={cancelling} 
            />
          </div>
        )}
      </div>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(v) => !v && setRescheduleTarget(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reschedule booking</DialogTitle>
            <DialogDescription>
              Select a new date and time for <strong>"{rescheduleTarget?.eventTitle}"</strong> with {rescheduleTarget?.attendeeName}. The current slot will be cancelled and a new booking created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>New date</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start time</Label>
                <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>End time</Label>
                <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRescheduleTarget(null)} className="rounded-full" disabled={rescheduling}>Cancel</Button>
            <Button onClick={handleReschedule} className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900" disabled={rescheduling || !newDate || !newStart || !newEnd}>
              {rescheduling ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Rescheduling…</> : 'Confirm reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
