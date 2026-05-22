import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function Appearance() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how Slotify looks on your device.
        </p>
      </div>
      <div className="border-t border-border/60 pb-4"></div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>
            Select or customize your UI theme.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Light Theme Option */}
            <Label 
              className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-4 hover:bg-secondary/20 transition-all ${theme === 'light' ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onClick={() => setTheme('light')}
            >
              <div className="w-full h-24 rounded-md bg-[#f4f4f5] border p-2 flex flex-col gap-2">
                <div className="w-1/2 h-2 bg-white rounded shadow-sm"></div>
                <div className="w-3/4 h-2 bg-white rounded shadow-sm"></div>
                <div className="w-full h-8 bg-white rounded shadow-sm mt-auto"></div>
              </div>
              <span className="font-medium text-sm">Light</span>
            </Label>

            {/* Dark Theme Option */}
            <Label 
              className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-4 hover:bg-secondary/20 transition-all ${theme === 'dark' ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              onClick={() => setTheme('dark')}
            >
              <div className="w-full h-24 rounded-md bg-[#09090b] border border-zinc-800 p-2 flex flex-col gap-2">
                <div className="w-1/2 h-2 bg-zinc-800 rounded"></div>
                <div className="w-3/4 h-2 bg-zinc-800 rounded"></div>
                <div className="w-full h-8 bg-zinc-800 rounded mt-auto"></div>
              </div>
              <span className="font-medium text-sm">Dark</span>
            </Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
