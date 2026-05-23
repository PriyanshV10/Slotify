import { useState } from 'react';
import { Clock, Copy, MoreHorizontal, Link as LinkIcon, Plus, Pencil, Trash2, ExternalLink, Video, Phone, MapPin, Monitor, Check, Search, EyeOff, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useApp } from '@/context/AppContext';
import { locationOptions, getLocationLabel } from '@/lib/constants';
import { toast } from 'sonner';

const COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6'];
const DURATION_OPTIONS = [15, 20, 30, 45, 60, 90, 120];
const BUFFER_OPTIONS = [0, 5, 10, 15, 30];

function LocationIcon({ location, className = 'h-3.5 w-3.5' }) {
  const map = { 'google-meet': Video, zoom: Monitor, phone: Phone, 'in-person': MapPin, teams: Monitor };
  const Icon = map[location] || Video;
  return <Icon className={className} />;
}

const defaultForm = { title: '', slug: '', duration: 30, description: '', location: 'google-meet', color: '#6366f1', bufferTime: 0, showOnProfile: true };

function slugify(s) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
}

function EventTypeSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <div className="h-9 w-9 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 bg-zinc-100 dark:bg-zinc-800 rounded" />
            <div className="flex gap-2">
              <div className="h-5 w-12 bg-zinc-100 dark:bg-zinc-800 rounded" />
              <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-800 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-8 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
            <div className="h-8 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EventTypes() {
  const { eventTypes, createEventType, updateEventType, deleteEventType, toggleEventType, loading, user } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const openCreate = () => { setEditingId(null); setFormData(defaultForm); setIsDialogOpen(true); };

  const openEdit = (et) => {
    setEditingId(et.id);
    setFormData({ title: et.title, slug: et.slug, duration: et.duration, description: et.description || '', location: et.location, color: et.color, bufferTime: et.bufferTime ?? 0, showOnProfile: et.showOnProfile ?? true });
    setIsDialogOpen(true);
  };

  const handleTitleChange = (val) => {
    setFormData((p) => ({ ...p, title: val, ...(editingId === null ? { slug: slugify(val) } : {}) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = { ...formData, duration: Number(formData.duration) };
    if (editingId !== null) { updateEventType(editingId, data); toast.success('Event type updated'); }
    else { createEventType(data); toast.success('Event type created'); }
    setIsDialogOpen(false);
  };

  const handleDelete = (id) => { deleteEventType(id); toast.success('Event type deleted'); };

  const handleToggleProfile = (et) => {
    const updatedStatus = !(et.showOnProfile ?? true);
    updateEventType(et.id, { showOnProfile: updatedStatus });
    toast.success(updatedStatus ? 'Event shown on profile' : 'Event hidden from profile');
  };

  const handleCopyLink = (slug, id) => {
    navigator.clipboard.writeText(`${window.location.origin}/${user.username}/${slug}`);
    setCopiedId(id); toast.success('Link copied'); setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Event Types</h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Configure different events for people to book on your calendar.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search..."
              className="pl-9 w-64 h-9 rounded-full bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={openCreate} className="gap-2 rounded-full h-9 px-4 text-sm bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {loading ? (
        <EventTypeSkeleton />
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4"><LinkIcon className="h-6 w-6 text-zinc-400" /></div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">No event types yet</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">Create your first event type to let people book time with you.</p>
          <Button onClick={openCreate} className="mt-6 rounded-full px-6 gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900"><Plus className="h-4 w-4" /> Create event type</Button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
          <AnimatePresence>
            {eventTypes.filter(et => et.title.toLowerCase().includes(searchQuery.toLowerCase()) || et.slug.toLowerCase().includes(searchQuery.toLowerCase())).map((et, index) => (
              <motion.div 
                key={et.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors ${!et.enabled ? 'opacity-50' : ''}`}
              >
              {/* Color dot */}
              <div className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: et.color + '18' }}>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: et.color }} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{et.title}</span>
                  <span className="text-xs text-zinc-400 font-mono">/{et.slug}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="secondary" className="gap-1 text-xs font-normal rounded-md py-0.5"><Clock className="h-3 w-3" />{et.duration}m</Badge>
                  {et.showOnProfile === false && <Badge variant="outline" className="gap-1 text-xs font-normal rounded-md py-0.5 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-500"><EyeOff className="h-3 w-3" /> Hidden</Badge>}
                  <Badge variant="secondary" className="gap-1 text-xs font-normal rounded-md py-0.5"><LocationIcon location={et.location} className="h-3 w-3" />{getLocationLabel(et.location)}</Badge>
                  {et.bufferTime > 0 && <Badge variant="outline" className="text-xs font-normal rounded-md py-0.5">+{et.bufferTime}m buffer</Badge>}
                </div>
              </div>
              {/* Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <Switch checked={et.showOnProfile ?? true} onCheckedChange={(v) => {
                        updateEventType(et.id, { showOnProfile: v });
                        toast.success(v ? 'Event shown on profile' : 'Event hidden from profile');
                      }} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">{et.showOnProfile !== false ? 'Hide from profile' : 'Show on profile'}</p></TooltipContent>
                </Tooltip>
                
                <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-transparent overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a href={`/${user.username}/${et.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Preview</p></TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button onClick={() => handleCopyLink(et.slug, et.id)} className="inline-flex h-9 w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-r border-zinc-200 dark:border-zinc-800">
                        {copiedId === et.id ? <Check className="h-4 w-4 text-green-500" /> : <LinkIcon className="h-4 w-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent><p className="text-xs">Copy link</p></TooltipContent>
                  </Tooltip>

                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                          <button className="inline-flex h-9 w-10 items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent><p className="text-xs">More</p></TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent align="end" className="w-48 rounded-xl">
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => openEdit(et)}>
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => {
                        const updatedStatus = !(et.showOnProfile ?? true);
                        updateEventType(et.id, { showOnProfile: updatedStatus });
                        toast.success(updatedStatus ? 'Event shown on profile' : 'Event hidden from profile');
                      }}>
                        {et.showOnProfile === false ? <><Eye className="h-3.5 w-3.5" /> Show on profile</> : <><EyeOff className="h-3.5 w-3.5" /> Hide from profile</>}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer gap-2" onClick={() => handleDelete(et.id)}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit event type' : 'Add a new event type'}</DialogTitle>
            <DialogDescription>{editingId ? 'Update the details for this event type.' : 'Create a new event type for people to book with you.'}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="et-title">Title</Label>
              <Input id="et-title" placeholder="e.g. 30 Min Meeting" value={formData.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="et-slug">URL Slug</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground select-none">/</span>
                <Input id="et-slug" className="rounded-l-none" placeholder="30-min" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Duration</Label>
                <Select value={String(formData.duration)} onValueChange={(v) => setFormData({ ...formData, duration: Number(v) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DURATION_OPTIONS.map((d) => <SelectItem key={d} value={String(d)}>{d} minutes</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Select value={formData.location} onValueChange={(v) => setFormData({ ...formData, location: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{locationOptions.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Buffer time after event</Label>
              <Select value={String(formData.bufferTime)} onValueChange={(v) => setFormData({ ...formData, bufferTime: Number(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BUFFER_OPTIONS.map((b) => <SelectItem key={b} value={String(b)}>{b === 0 ? 'No buffer' : `${b} minutes`}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <textarea id="et-desc" className="flex min-h-[72px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" placeholder="Brief details about this event" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex gap-2">
                {COLORS.map((c) => (
                  <button key={c} type="button" onClick={() => setFormData({ ...formData, color: c })} className={`h-7 w-7 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-zinc-400 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
            <Separator />
            <div className="flex items-start space-x-3 py-1 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <input type="checkbox" id="show-profile" checked={formData.showOnProfile} onChange={(e) => setFormData({ ...formData, showOnProfile: e.target.checked })} className="mt-0.5 h-4 w-4 rounded border-zinc-300 accent-zinc-900 cursor-pointer" />
              <div className="space-y-1 leading-none">
                <Label htmlFor="show-profile" className="text-sm font-medium cursor-pointer">Show on public profile</Label>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Make this event type visible on your public page.</p>
              </div>
            </div>
            <Separator />
            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
              <Button type="submit" className="rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900">{editingId ? 'Save changes' : 'Create event type'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
    </TooltipProvider>
  );
}
