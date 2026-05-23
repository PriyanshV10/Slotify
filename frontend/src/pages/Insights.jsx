import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';

function StatCard({ title, value, subtitle, icon: Icon, color }) {
  return (
    <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
          </div>
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Insights() {
  const { bookings, eventTypes } = useApp();

  const total = bookings.length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const avgDuration = total > 0 ? Math.round(bookings.reduce((s, b) => s + b.duration, 0) / total) : 0;

  // Group by event type
  const byType = {};
  bookings.forEach(b => {
    byType[b.eventTitle] = (byType[b.eventTitle] || 0) + 1;
  });
  const maxCount = Math.max(...Object.values(byType), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Insights</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Overview of your booking activity.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Bookings" value={total} subtitle="All time" icon={CalendarDays} color="#6366f1" />
        <StatCard title="Avg Duration" value={`${avgDuration}m`} subtitle="Per booking" icon={Clock} color="#10b981" />
        <StatCard title="Cancellations" value={cancelled} subtitle={total > 0 ? `${Math.round(cancelled / total * 100)}% rate` : '—'} icon={XCircle} color="#ef4444" />
      </div>

      {/* Bar chart */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-zinc-400" />
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Bookings by Event Type</h3>
          </div>
          {Object.keys(byType).length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No booking data yet.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(byType).map(([name, count]) => {
                const et = eventTypes.find(e => e.title === name);
                const color = et?.color || '#6366f1';
                return (
                  <div key={name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{name}</span>
                      <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{count}</span>
                    </div>
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
