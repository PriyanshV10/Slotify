import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useApp } from '@/context/AppContext';
import { commonTimezones } from '@/lib/constants';
import { toast } from 'sonner';

export default function Profile() {
  const { user, updateUser } = useApp();
  const [form, setForm] = useState({ name: user.name, username: user.username, email: user.email, bio: user.bio, timezone: user.timezone });

  const handleSave = () => {
    updateUser({ ...form, initials: form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) });
    toast.success('Profile updated successfully');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Profile</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage your public profile and personal details.</p>
      </div>
      <Separator />

      {/* Avatar */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative group cursor-pointer">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarFallback className="bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 text-white dark:text-zinc-900 font-semibold text-xl">
                  {form.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-[10px] font-medium">Change</span>
              </div>
            </div>
            <div>
              <p className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{form.name}</p>
              <p className="text-sm text-zinc-500">@{form.username}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base text-zinc-900 dark:text-zinc-50">Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Username</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">@</span>
                <Input className="rounded-l-none" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>About <span className="text-zinc-400 font-normal">(optional)</span></Label>
            <textarea className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Timezone</Label>
            <Select value={form.timezone} onValueChange={(v) => setForm({ ...form, timezone: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{commonTimezones.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} className="rounded-full px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200">Save changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="rounded-2xl border-red-200 dark:border-red-900/50 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          <CardDescription>Permanently delete your account and all data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled className="rounded-full">Delete account</Button>
        </CardContent>
      </Card>
    </div>
  );
}
