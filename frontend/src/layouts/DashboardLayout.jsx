import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  Clock,
  Settings,
  Menu,
  BarChart2,
  Link as LinkIcon,
  ChevronDown,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useApp } from '@/context/AppContext';

const navigation = [
  { name: 'Event Types', href: '/dashboard/event-types', icon: LinkIcon },
  { name: 'Bookings', href: '/dashboard/bookings', icon: CalendarDays },
  { name: 'Availability', href: '/dashboard/availability', icon: Clock },
  { name: 'Insights', href: '/dashboard/insights', icon: BarChart2 },
  { name: 'Settings', href: '/dashboard/settings/my-account/profile', icon: Settings },
];

function NavItem({ item, isActive, onClick }) {
  return (
    <li>
      <Link
        to={item.href}
        onClick={onClick}
        className={`
          group flex gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150
          ${isActive
            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
            : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-50'
          }
        `}
      >
        <item.icon
          className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-zinc-900 dark:text-zinc-50' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}
          aria-hidden="true"
        />
        {item.name}
      </Link>
    </li>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const location = useLocation();
  const { user } = useApp();

  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const publicPageUrl = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicPageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const isActive = (href) => location.pathname.startsWith(href);

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex h-full grow flex-col overflow-y-auto border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      {/* Logo + mobile close trigger */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2.5 px-5 border-b border-zinc-100 dark:border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 p-1.5 rounded-lg">
            <CalendarDays className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Slotify</span>
        </div>
        {/* Dark mode toggle — moved here from header */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-50 dark:hover:bg-zinc-800 transition-all"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 py-4">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={isActive(item.href)}
              onClick={onNavClick}
            />
          ))}
        </ul>

        {/* Bottom section */}
        <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-2 mt-2 space-y-0.5">
          {/* View public page */}
          <a
            href={publicPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-150"
          >
            <ExternalLink className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300" />
            View public page
          </a>

          {/* Copy public page link */}
          <button
            onClick={handleCopyLink}
            className="group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-150"
          >
            {copied
              ? <Check className="h-4 w-4 shrink-0 text-green-500" />
              : <Copy className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300" />
            }
            {copied ? <span className="text-green-600 dark:text-green-400">Link copied!</span> : 'Copy public page link'}
          </button>

          {/* User row */}
          <div className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer group">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 flex items-center justify-center text-xs font-semibold text-white dark:text-zinc-900 shrink-0">
              {user.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{user.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
          </div>
        </div>
      </nav>
    </div>
  );


  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex">
      {/* Static sidebar — desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
        <SidebarContent onNavClick={() => {}} />
      </div>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Mobile-only top bar with hamburger */}
        <div className="flex lg:hidden items-center gap-3 h-14 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-60 border-r-0">
              <SidebarContent onNavClick={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Slotify</span>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto page-enter">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
