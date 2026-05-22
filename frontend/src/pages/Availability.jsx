import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2 } from 'lucide-react';
import { availabilityApi } from '@/lib/api';

const DAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' },
];

export default function Availability() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  // State maps day value (0-6) to an array of intervals or empty if disabled
  const [schedule, setSchedule] = useState({});

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const data = await availabilityApi.get();
      
      const newSchedule = {};
      DAYS.forEach(day => {
        newSchedule[day.value] = [];
      });

      if (data && data.length > 0) {
        setTimezone(data[0].timezone);
        data.forEach(item => {
          if (newSchedule[item.dayOfWeek]) {
            newSchedule[item.dayOfWeek].push({
              id: item.id || Math.random().toString(),
              startTime: item.startTime,
              endTime: item.endTime
            });
          }
        });
      } else {
        // Default Mon-Fri 9-5
        [1,2,3,4,5].forEach(day => {
          newSchedule[day] = [{ id: Math.random().toString(), startTime: '09:00', endTime: '17:00' }];
        });
      }
      setSchedule(newSchedule);
    } catch (error) {
      console.error("Failed to fetch availability", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailability();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      // Flatten schedule into array for API
      const flatSchedule = [];
      Object.keys(schedule).forEach(dayKey => {
        const dayOfWeek = parseInt(dayKey, 10);
        schedule[dayKey].forEach(interval => {
          flatSchedule.push({
            dayOfWeek,
            startTime: interval.startTime,
            endTime: interval.endTime,
            timezone
          });
        });
      });

      await availabilityApi.set({ schedule: flatSchedule });
      // Ideally show a toast
    } catch (error) {
      console.error("Failed to save availability", error);
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dayValue) => {
    setSchedule(prev => {
      const current = prev[dayValue];
      if (current && current.length > 0) {
        // Disable day
        return { ...prev, [dayValue]: [] };
      } else {
        // Enable with default 9-5
        return { ...prev, [dayValue]: [{ id: Math.random().toString(), startTime: '09:00', endTime: '17:00' }] };
      }
    });
  };

  const updateInterval = (dayValue, intervalId, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: prev[dayValue].map(interval => 
        interval.id === intervalId ? { ...interval, [field]: value } : interval
      )
    }));
  };

  const addInterval = (dayValue) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: [...prev[dayValue], { id: Math.random().toString(), startTime: '09:00', endTime: '17:00' }]
    }));
  };

  const removeInterval = (dayValue, intervalId) => {
    setSchedule(prev => ({
      ...prev,
      [dayValue]: prev[dayValue].filter(interval => interval.id !== intervalId)
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded"></div>
        <Card>
          <CardContent className="h-64"></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Availability</h2>
          <p className="text-muted-foreground mt-1">
            Configure your weekly schedule and working hours.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-6">
          {saving ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <Card className="rounded-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex justify-between items-center">
            <span>Working hours</span>
            <div className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <span>Timezone:</span>
              <span className="font-medium text-foreground">{timezone}</span>
            </div>
          </CardTitle>
          <CardDescription>Set the hours you are available for meetings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0">
          {DAYS.map((day, idx) => {
            const isActive = schedule[day.value]?.length > 0;
            const intervals = schedule[day.value] || [];

            return (
              <div 
                key={day.value} 
                className={`py-5 flex flex-col sm:flex-row sm:items-start gap-4 border-t border-border/60 ${idx === 0 ? 'border-t-0' : ''}`}
              >
                <div className="flex items-center w-full sm:w-48 shrink-0">
                  <Switch 
                    checked={isActive} 
                    onCheckedChange={() => toggleDay(day.value)} 
                    id={`day-${day.value}`}
                  />
                  <label 
                    htmlFor={`day-${day.value}`}
                    className={`ml-3 font-medium cursor-pointer ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    {day.label}
                  </label>
                </div>
                
                <div className="flex-1 flex flex-col gap-3">
                  {!isActive ? (
                    <div className="text-muted-foreground text-sm py-2">Unavailable</div>
                  ) : (
                    intervals.map((interval, i) => (
                      <div key={interval.id} className="flex flex-wrap items-center gap-2 group">
                        <div className="flex items-center gap-2">
                          <input 
                            type="time" 
                            className="flex h-10 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={interval.startTime}
                            onChange={(e) => updateInterval(day.value, interval.id, 'startTime', e.target.value)}
                          />
                          <span className="text-muted-foreground">-</span>
                          <input 
                            type="time" 
                            className="flex h-10 w-[120px] rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={interval.endTime}
                            onChange={(e) => updateInterval(day.value, interval.id, 'endTime', e.target.value)}
                          />
                        </div>
                        
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive"
                            onClick={() => removeInterval(day.value, interval.id)}
                            disabled={intervals.length === 1} // Don't let them delete the last one, just toggle the day instead
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {i === intervals.length - 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-muted-foreground hover:text-foreground"
                              onClick={() => addInterval(day.value)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
