import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

const calendars = [
  { name: 'Google Calendar', icon: '📅', desc: 'Check for conflicts and sync events with Google Calendar.', connected: false },
  { name: 'Microsoft Outlook', icon: '📧', desc: 'Check for conflicts and sync events with Outlook Calendar.', connected: false },
  { name: 'Apple Calendar', icon: '🍎', desc: 'Sync your Apple iCal calendar.', connected: false },
];

export default function Calendars() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Calendars</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Connect your calendars to prevent double bookings.</p>
      </div>
      <Separator />

      <div className="space-y-3">
        {calendars.map(cal => (
          <Card key={cal.name} className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <CardContent className="p-5 flex items-center gap-4">
              <span className="text-2xl">{cal.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{cal.name}</p>
                  <Badge variant="secondary" className="text-[10px]">{cal.connected ? 'Connected' : 'Not connected'}</Badge>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{cal.desc}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full h-8 shrink-0" disabled>Connect</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
