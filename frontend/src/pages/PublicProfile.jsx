import { Link } from 'react-router-dom';
import { Clock, Video, Phone, MapPin, Monitor, CalendarDays, ArrowRight, Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { getLocationLabel } from '@/lib/constants';

function LocIcon({ location, className = 'h-4 w-4' }) {
  const m = { 'google-meet': Video, zoom: Monitor, phone: Phone, 'in-person': MapPin, teams: Monitor };
  const I = m[location] || Video;
  return <I className={className} />;
}

// Skeleton for loading state
function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center px-4 py-16 animate-pulse">
      <div className="h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-4" />
      <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
      <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded mb-8" />
      <div className="w-full max-w-lg space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 h-28" />
        ))}
      </div>
    </div>
  );
}

export default function PublicProfile() {
  const { eventTypes, user, availability, loading } = useApp();

  if (loading) return <ProfileSkeleton />;

  const activeEvents = eventTypes.filter(et => et.enabled && et.showOnProfile !== false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="flex flex-col items-center px-4 pt-16 pb-10">
        {/* Avatar */}
        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 dark:from-zinc-300 dark:to-zinc-100 flex items-center justify-center text-2xl font-bold text-white dark:text-zinc-900 mb-4 ring-4 ring-white dark:ring-zinc-950 shadow-lg">
          {user.initials}
        </div>

        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">{user.name}</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">@{user.username}</p>

        {user.bio && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 max-w-sm text-center leading-relaxed">
            {user.bio}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-3">
          <Globe className="h-3.5 w-3.5" />
          <span>{availability.timezone}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 mx-auto max-w-lg" />

      {/* Event type cards */}
      <div className="mx-auto max-w-lg px-4 py-8 space-y-3">
        {activeEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-zinc-100 dark:bg-zinc-800 p-4 rounded-full mb-4">
              <CalendarDays className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">No events available</h3>
            <p className="text-sm text-zinc-500 mt-1">Check back later.</p>
          </div>
        ) : (
          activeEvents.map(et => (
            <Link
              key={et.id}
              to={`/${user.username}/${et.slug}`}
              className="group flex items-center justify-between bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-5 py-4 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-sm transition-all duration-150"
            >
              <div className="flex items-start gap-4">
                {/* Color accent */}
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: et.color + '18' }}
                >
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: et.color }} />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{et.title}</h3>
                  {et.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 max-w-xs">
                      {et.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {et.duration} min
                    </span>
                    <span className="flex items-center gap-1">
                      <LocIcon location={et.location} className="h-3 w-3" />
                      {getLocationLabel(et.location)}
                    </span>
                  </div>
                </div>
              </div>

              <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 group-hover:translate-x-0.5 transition-all duration-150 shrink-0" />
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center pb-10">
        <p className="text-xs text-zinc-400 dark:text-zinc-600">
          Powered by{' '}
          <Link to="/dashboard" className="font-medium hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
            Slotify
          </Link>
        </p>
      </div>
    </div>
  );
}
