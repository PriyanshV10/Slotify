import { useState, useEffect } from 'react';
import { Clock, Copy, MoreHorizontal, Link as LinkIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { eventTypesApi } from '@/lib/api';

export default function EventTypes() {
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', slug: '', duration: 15, description: '' });

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const data = await eventTypesApi.getAll();
      setEventTypes(data);
    } catch (error) {
      console.error('Failed to fetch event types', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEventTypes();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await eventTypesApi.create({
        ...formData,
        duration: parseInt(formData.duration, 10)
      });
      setIsDialogOpen(false);
      setFormData({ title: '', slug: '', duration: 15, description: '' });
      fetchEventTypes();
    } catch (error) {
      console.error('Failed to create event type', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event type?')) return;
    try {
      await eventTypesApi.delete(id);
      fetchEventTypes();
    } catch (error) {
      console.error('Failed to delete event type', error);
    }
  };

  const handleCopyLink = (slug) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    // Ideally a toast would go here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Event Types</h2>
          <p className="text-muted-foreground mt-1">
            Create and manage your event types.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-full px-4">
              <Plus className="h-4 w-4" />
              New event type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>Add a new event type</DialogTitle>
              <DialogDescription>
                Create a new event type for people to book with you.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. 15 Min Meeting" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <div className="flex">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    /
                  </span>
                  <Input 
                    id="slug" 
                    className="rounded-l-none" 
                    placeholder="15-min" 
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input 
                  id="duration" 
                  type="number" 
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Brief details about this meeting" 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-full">Cancel</Button>
                <Button type="submit" className="rounded-full">Save event type</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-xl"></CardHeader>
              <CardContent className="h-16"></CardContent>
            </Card>
          ))}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
          <div className="bg-muted p-4 rounded-full mb-4">
            <LinkIcon className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No event types yet</h3>
          <p className="text-muted-foreground max-w-sm mt-1">
            Create your first event type to allow people to book time with you.
          </p>
          <Button onClick={() => setIsDialogOpen(true)} className="mt-6 rounded-full px-6">
            Create Event Type
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((event) => (
            <Card key={event.id} className="group relative transition-all hover:shadow-md hover:border-border/80 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <Switch defaultChecked />
                </div>
                <CardDescription className="line-clamp-2 mt-1">
                  {event.description || 'No description provided.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-4 flex-1">
                <div className="flex items-center text-sm font-medium text-muted-foreground bg-secondary/50 w-fit px-2.5 py-1 rounded-md">
                  <Clock className="mr-1.5 h-3.5 w-3.5" />
                  {event.duration}m
                </div>
              </CardContent>
              <div className="border-t bg-muted/20 px-6 py-3 flex items-center justify-between rounded-b-xl">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 -ml-2 text-muted-foreground hover:text-foreground font-medium"
                  onClick={() => handleCopyLink(event.slug)}
                >
                  <Copy className="mr-2 h-3.5 w-3.5" />
                  Copy link
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[160px] rounded-xl">
                    <DropdownMenuItem className="cursor-pointer font-medium">Edit</DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer font-medium"
                      onClick={() => handleDelete(event.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
