import { useState, useEffect, useRef } from 'react';
import { CalendarDays, Clock, Video, Phone, MapPin, Monitor, XCircle, RotateCcw, Loader2, ExternalLink, ChevronLeft, ChevronRight, List as ListIcon, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/context/AppContext';
import { getLocationLabel } from '@/lib/constants';
import { format, parseISO, startOfWeek, addDays, subWeeks, addWeeks, isSameDay, isToday } from 'date-fns';
import { toast } from 'sonner';

function LocIcon({ location, className = 'h-3.5 w-3.5' }) {
  const m = { 'google-meet': Video, zoom: Monitor, phone: Phone, 'in-person': MapPin, teams: Monitor };
  const I = m[location] || Video;
  return <I className={className} />;
}

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
      <div className="hidden sm:flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 shrink-0">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">{format(dateObj, 'MMM')}</span>
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">{format(dateObj, 'd')}</span>
      </div>

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

function BookingDetailsPane({ booking, onCancel, onReschedule, cancelling, isDialog = false }) {
  if (!booking) return null;

  const dateObj = parseISO(booking.date);
  const dayStr = format(dateObj, 'EEEE, MMMM d, yyyy');
  const isPast = isPastBooking(booking);
  const isCancelled = booking.status === 'cancelled';

  let statusBadge = <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400">Confirmed</Badge>;
  if (isCancelled) statusBadge = <Badge variant="destructive">Cancelled</Badge>;
  else if (isPast) statusBadge = <Badge variant="secondary">Past</Badge>;

  return (
    <div className={`bg-white dark:bg-zinc-900 ${isDialog ? 'p-6 rounded-2xl' : 'border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sticky top-6'}`}>
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

// ── Calendar View Component ──────────────────────────────────────────────────
function CalendarView({ bookings, currentDate, onNextWeek, onPrevWeek, onToday, onSelectBooking, eventTypes }) {
  const scrollRef = useRef(null);
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday start
  const weekEnd = addDays(weekStart, 6);
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }).map((_, i) => i);

  // Set initial scroll offset to 8:00 AM (8 hours * 60px)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 8 * 60;
    }
  }, []);

  // Filter bookings for this week
  const weekBookings = bookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const d = parseISO(b.date);
    return d >= weekStart && d <= weekEnd;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-[700px] overflow-hidden shadow-sm">
      {/* Toolbar */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onToday} className="h-8 rounded-md font-medium text-xs">Today</Button>
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5 border border-zinc-200 dark:border-zinc-700/50">
            <button onClick={onPrevWeek} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
            <button onClick={onNextWeek} className="p-1 hover:bg-white dark:hover:bg-zinc-700 rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 ml-2">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </span>
        </div>
      </div>
      
      {/* Header (Days) */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950 pr-[14px]">
        <div className="w-16 shrink-0 border-r border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-zinc-400">GMT+5:30</span>
        </div>
        {days.map(d => (
          <div key={d.toString()} className="flex-1 py-3 text-center border-r border-zinc-200 dark:border-zinc-800 last:border-0 flex flex-col items-center justify-center">
            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{format(d, 'EEE')}</span>
            <span className={`text-lg font-bold mt-1 w-8 h-8 flex items-center justify-center rounded-full ${isToday(d) ? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900' : 'text-zinc-900 dark:text-zinc-50'}`}>
              {format(d, 'd')}
            </span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="flex relative" style={{ height: 24 * 60 + 'px' }}>
          {/* Time Gutter */}
          <div className="w-16 shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 absolute left-0 top-0 bottom-0 z-10">
            {hours.map(h => (
              <div key={h} className="h-[60px] relative">
                <span className="absolute -top-2.5 right-3 text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {h === 0 ? '12 AM' : h < 12 ? `${h} AM` : h === 12 ? '12 PM' : `${h-12} PM`}
                </span>
              </div>
            ))}
          </div>

          {/* Grid lines & Day columns */}
          <div className="flex-1 ml-16 flex relative bg-white dark:bg-zinc-900/50">
             {/* Horizontal lines */}
             <div className="absolute inset-0 z-0 pointer-events-none">
               {hours.map(h => (
                 <div key={h} className="h-[60px] border-b border-zinc-100 dark:border-zinc-800" />
               ))}
             </div>

             {/* Day Columns */}
             {days.map((day, dayIdx) => {
               // Get bookings for this specific day
               const dayBookings = weekBookings.filter(b => isSameDay(parseISO(b.date), day));
               const isTodayCol = isToday(day);
               
               return (
                 <div key={dayIdx} className={`flex-1 border-r border-zinc-100 dark:border-zinc-800 relative ${isTodayCol ? 'bg-zinc-50/50 dark:bg-zinc-800/20' : ''}`}>
                    {dayBookings.map(b => {
                      const [sh, sm] = b.startTime.split(':').map(Number);
                      const top = (sh * 60) + sm;
                      const duration = b.duration || 30; // fallback to 30 mins if not provided
                      const isPast = isPastBooking(b);
                      
                      // Find event type color for this booking
                      const eventType = eventTypes?.find(et => et.id === b.eventTypeId);
                      const color = eventType?.color || '#3b82f6';
                      
                      return (
                        <div 
                          key={b.id} 
                          onClick={() => onSelectBooking(b)}
                          className={`absolute left-[2px] right-[2px] rounded-md overflow-hidden cursor-pointer hover:shadow-md hover:z-20 transition-all z-10 border ${isPast ? 'bg-zinc-100/80 border-zinc-200 text-zinc-500 dark:bg-zinc-800/80 dark:border-zinc-700' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'}`}
                          style={{ top: `${top}px`, height: `${duration}px` }}
                        >
                           <div className="absolute left-0 top-0 bottom-0 w-1 opacity-80" style={{ backgroundColor: isPast ? '#9ca3af' : color }} />
                           <div className="pl-2 p-1 text-[11px] font-semibold leading-tight flex flex-col h-full">
                              <span className="truncate">{b.eventTitle}</span>
                              {duration >= 45 && (
                                <span className="font-normal opacity-70 truncate mt-0.5">{b.startTime} - {b.endTime}</span>
                              )}
                           </div>
                        </div>
                      )
                    })}
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Bookings Page ───────────────────────────────────────────────────────
export default function Bookings() {
  const { bookings, eventTypes, cancelBooking, createBooking, loading } = useApp();
  const [cancelling, setCancelling] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedCalendarBooking, setSelectedCalendarBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  // View mode and Calendar state
  const [viewMode, setViewMode] = useState('list');
  const [currentDate, setCurrentDate] = useState(new Date());

  const upcoming = bookings.filter(b => b.status !== 'cancelled' && !isPastBooking(b));
  const past = bookings.filter(b => b.status !== 'cancelled' && isPastBooking(b));
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      setSelectedCalendarBooking(null);
      if (selectedBooking?.id === id) setSelectedBooking(null);
    } catch {
      // error handled by AppContext
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

  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDate || !newStart || !newEnd) return;
    setRescheduling(true);
    try {
      await cancelBooking(rescheduleTarget.id);
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
      setSelectedCalendarBooking(null);
      setSelectedBooking(null);
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
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden shadow-sm">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Bookings</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">See upcoming and past events booked through your event type links.</p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
          <button 
            onClick={() => setViewMode('list')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'}`}
          >
            <ListIcon className="h-4 w-4" /> List
          </button>
          <button 
            onClick={() => setViewMode('calendar')} 
            className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-900 shadow-sm text-zinc-900 dark:text-zinc-50' : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50'}`}
          >
            <CalendarIcon className="h-4 w-4" /> Calendar
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
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
          
          {/* Details Pane for List View */}
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
      ) : (
        /* Calendar View */
        <div className="w-full">
          {loading ? (
            <BookingSkeleton />
          ) : (
            <CalendarView 
              bookings={bookings} 
              eventTypes={eventTypes}
              currentDate={currentDate} 
              onNextWeek={() => setCurrentDate(addWeeks(currentDate, 1))}
              onPrevWeek={() => setCurrentDate(subWeeks(currentDate, 1))}
              onToday={() => setCurrentDate(new Date())}
              onSelectBooking={setSelectedCalendarBooking}
            />
          )}
        </div>
      )}

      {/* Booking Details Dialog for Calendar View */}
      <Dialog open={!!selectedCalendarBooking} onOpenChange={(v) => !v && setSelectedCalendarBooking(null)}>
        <DialogContent className="sm:max-w-[450px] p-0 border-0 overflow-hidden bg-transparent rounded-2xl shadow-none">
           <BookingDetailsPane 
              booking={selectedCalendarBooking} 
              onCancel={handleCancel} 
              onReschedule={(b) => {
                setSelectedCalendarBooking(null);
                openReschedule(b);
              }} 
              cancelling={cancelling} 
              isDialog={true}
            />
        </DialogContent>
      </Dialog>

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
