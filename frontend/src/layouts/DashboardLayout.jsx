import { Link, Outlet, useLocation } from 'react-router-dom';
import { Link as LinkIcon, CalendarDays, Clock, Settings, Menu, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navigation = [
  { name: 'Event Types', href: '/dashboard/event-types', icon: LinkIcon },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { name: 'Availability', href: '/dashboard/availability', icon: Clock },
  { name: 'Settings', href: '/dashboard/settings/my-account/appearance', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const renderSidebarContent = () => (
    <div className="flex h-full grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-card px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center gap-2">
        {/* Logo Placeholder */}
        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
          <CalendarDays className="h-5 w-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">Slotify</span>
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname.startsWith(item.href);
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                        ${isActive
                          ? 'bg-secondary text-secondary-foreground'
                          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-5 w-5 shrink-0 ${isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'}`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          <li className="mt-auto">
            <div className="flex items-center gap-x-4 py-3 text-sm font-semibold leading-6 text-foreground">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold border">
                P
              </div>
              <span className="sr-only">Your profile</span>
              <span aria-hidden="true">Priyansh</span>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );

  const getPageTitle = () => {
    const item = navigation.find((n) => location.pathname.startsWith(n.href));
    return item ? item.name : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        {renderSidebarContent()}
      </div>

      <div className="flex flex-1 flex-col lg:pl-64 h-screen">
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button type="button" className="-m-2.5 p-2.5 text-muted-foreground lg:hidden hover:text-foreground">
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r">
              {renderSidebarContent()}
            </SheetContent>
          </Sheet>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold tracking-tight">{getPageTitle()}</h1>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button size="sm" className="gap-2 hidden sm:flex rounded-full px-4">
                <Plus className="h-4 w-4" />
                <span>Create</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
