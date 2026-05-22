import { Outlet, Link, useLocation } from 'react-router-dom';
import { User, Palette, Link as LinkIcon, Settings } from 'lucide-react';

const settingsNav = [
  { name: 'Profile', href: '/settings/my-account/profile', icon: User },
  { name: 'Appearance', href: '/settings/my-account/appearance', icon: Palette },
];

export default function SettingsLayout() {
  const location = useLocation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
            {settingsNav.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`
                    flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium
                    ${isActive 
                      ? 'bg-secondary text-foreground' 
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
