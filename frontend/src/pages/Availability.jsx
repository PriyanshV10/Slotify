import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, CalendarPlus, Globe, Loader2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { commonTimezones } from '@/lib/constants';
import { toast } from 'sonner';
import { format } from 'date-fns';

const DAYS = [
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
  { value: 0, label: 'Sunday', short: 'Sun' },
];

export default function Availability() {
  const { availability, updateAvailability, loading } = useApp();
  const [schedule, setSchedule] = useState(availability.schedule);
  const [timezone, setTimezone] = useState(availability.timezone);
  const [dateOverrides, setDateOverrides] = useState(availability.dateOverrides || []);
  const [newOverrideDate, setNewOverrideDate] = useState('');
  const [newOverrideStart, setNewOverrideStart] = useState('09:00');
  const [newOverrideEnd, setNewOverrideEnd] = useState('17:00');
  const [newOverrideUnavailable, setNewOverrideUnavailable] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAvailability({ ...availability, schedule, timezone, dateOverrides });
      toast.success('Availability saved successfully');
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayValue) => {
    setSchedule(prev => {
      const cur = prev[dayValue];
      if (cur && cur.length > 0) return { ...prev, [dayValue]: [] };
      return { ...prev, [dayValue]: [{ id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }] };
    });
  };

  const updateInterval = (dayValue, intervalId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: prev[dayValue].map(i => i.id === intervalId ? { ...i, [field]: value } : i),
    }));
  };

  const addInterval = (dayValue) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: [...prev[dayValue], { id: crypto.randomUUID(), startTime: '09:00', endTime: '17:00' }],
    }));
  };

  const removeInterval = (dayValue, intervalId) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: prev[dayValue].filter(i => i.id !== intervalId),
    }));
  };

  const addDateOverride = () => {
    if (!newOverrideDate) return;
    const existing = dateOverrides.find(o => o.date === newOverrideDate);
    if (existing) { toast.error('Override already exists for this date'); return; }
    setDateOverrides(prev => [...prev, {
      id: crypto.randomUUID(),
      date: newOverrideDate,
      unavailable: newOverrideUnavailable,
      startTime: newOverrideUnavailable ? null : newOverrideStart,
      endTime: newOverrideUnavailable ? null : newOverrideEnd,
    }]);
    setNewOverrideDate('');
    toast.success('Date override added');
  };

  const removeOverride = (id) => {
    setDateOverrides(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Availability</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure your weekly schedule and working hours.</p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="rounded-full px-6 h-9 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 disabled:opacity-60"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : 'Save changes'}
        </Button>
      </div>

      {/* Working Hours Card */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50">{availability.name}</CardTitle>
              <CardDescription>Set the hours you are available for meetings.</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe className="h-4 w-4 text-zinc-400" />
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-[200px] h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{commonTimezones.map(tz => <SelectItem key={tz} value={tz} className="text-xs">{tz}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-0">
          {DAYS.map((day, idx) => {
            const isActive = schedule[day.value]?.length > 0;
            const intervals = schedule[day.value] || [];
            return (
              <div key={day.value} className={`py-4 flex flex-col sm:flex-row sm:items-start gap-3 ${idx > 0 ? 'border-t border-zinc-100 dark:border-zinc-800' : ''}`}>
                <div className="flex items-center w-full sm:w-36 shrink-0">
                  <Switch checked={isActive} onCheckedChange={() => toggleDay(day.value)} id={`day-${day.value}`} />
                  <label htmlFor={`day-${day.value}`} className={`ml-3 text-sm font-medium cursor-pointer ${isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400'}`}>{day.label}</label>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {!isActive ? (
                    <span className="text-zinc-400 text-sm py-1">Unavailable</span>
                  ) : intervals.map((interval, i) => (
                    <div key={interval.id} className="flex items-center gap-2">
                      <input type="time" className="h-9 w-[110px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:text-zinc-50" value={interval.startTime} onChange={(e) => updateInterval(day.value, interval.id, 'startTime', e.target.value)} />
                      <span className="text-zinc-400 text-sm">–</span>
                      <input type="time" className="h-9 w-[110px] rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent px-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:text-zinc-50" value={interval.endTime} onChange={(e) => updateInterval(day.value, interval.id, 'endTime', e.target.value)} />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500" onClick={() => removeInterval(day.value, interval.id)} disabled={intervals.length === 1}><Trash2 className="h-3.5 w-3.5" /></Button>
                      {i === intervals.length - 1 && <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-700" onClick={() => addInterval(day.value)}><Plus className="h-3.5 w-3.5" /></Button>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Date Overrides */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-lg text-zinc-900 dark:text-zinc-50 flex items-center gap-2"><CalendarPlus className="h-5 w-5" /> Date Overrides</CardTitle>
          <CardDescription>Set specific dates with different hours or mark as unavailable.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add override form */}
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input type="date" className="h-9 w-[160px] text-sm" value={newOverrideDate} onChange={(e) => setNewOverrideDate(e.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newOverrideUnavailable} onCheckedChange={setNewOverrideUnavailable} id="override-unavail" />
              <Label htmlFor="override-unavail" className="text-xs cursor-pointer">Unavailable</Label>
            </div>
            {!newOverrideUnavailable && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Start</Label>
                  <Input type="time" className="h-9 w-[110px] text-sm" value={newOverrideStart} onChange={(e) => setNewOverrideStart(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">End</Label>
                  <Input type="time" className="h-9 w-[110px] text-sm" value={newOverrideEnd} onChange={(e) => setNewOverrideEnd(e.target.value)} />
                </div>
              </>
            )}
            <Button onClick={addDateOverride} size="sm" className="h-9 rounded-full gap-1.5 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>

          {/* Existing overrides */}
          {dateOverrides.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-4">No date overrides set.</p>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {dateOverrides.map(o => (
                <div key={o.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{format(new Date(o.date + 'T00:00:00'), 'EEE, MMM d, yyyy')}</span>
                    {o.unavailable ? (
                      <span className="ml-2 text-red-500 text-xs">Unavailable</span>
                    ) : (
                      <span className="ml-2 text-zinc-500 text-xs">{o.startTime} – {o.endTime}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-red-500" onClick={() => removeOverride(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
