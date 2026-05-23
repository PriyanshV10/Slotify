import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Check } from 'lucide-react';
import { toast } from 'sonner';

const BRAND_COLORS = [
  { name: 'Zinc', value: 'zinc', bg: '#71717a', ring: '#a1a1aa' },
  { name: 'Indigo', value: 'indigo', bg: '#6366f1', ring: '#818cf8' },
  { name: 'Rose', value: 'rose', bg: '#f43f5e', ring: '#fb7185' },
  { name: 'Green', value: 'green', bg: '#10b981', ring: '#34d399' },
  { name: 'Orange', value: 'orange', bg: '#f97316', ring: '#fb923c' },
];

export default function Appearance() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [brandColor, setBrandColor] = useState(() => localStorage.getItem('brandColor') || 'zinc');

  useEffect(() => {
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('brandColor', brandColor);
  }, [brandColor]);

  const themes = [
    { key: 'light', label: 'Light', bgOuter: '#f4f4f5', bgInner: '#ffffff', border: '#e4e4e7' },
    { key: 'dark', label: 'Dark', bgOuter: '#09090b', bgInner: '#18181b', border: '#27272a' },
    { key: 'system', label: 'System', bgOuter: 'linear-gradient(135deg, #f4f4f5 50%, #09090b 50%)', bgInner: null, border: '#a1a1aa' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">Appearance</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Customize how Slotify looks on your device.</p>
      </div>
      <Separator />

      {/* Theme */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base text-zinc-900 dark:text-zinc-50">Theme</CardTitle>
          <CardDescription>Select your preferred theme.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themes.map(t => (
              <Label
                key={t.key}
                className={`cursor-pointer rounded-xl border-2 p-3 flex flex-col items-center gap-3 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${theme === t.key ? 'border-zinc-900 dark:border-zinc-50 ring-2 ring-zinc-200 dark:ring-zinc-700' : 'border-zinc-200 dark:border-zinc-700'}`}
                onClick={() => { setTheme(t.key); toast.success(`Theme set to ${t.label}`); }}
              >
                <div
                  className="w-full h-20 rounded-lg border flex flex-col gap-1.5 p-2 overflow-hidden relative"
                  style={{ background: t.bgOuter, borderColor: t.border }}
                >
                  {t.bgInner && (
                    <>
                      <div className="w-1/2 h-1.5 rounded" style={{ backgroundColor: t.bgInner, opacity: 0.8 }} />
                      <div className="w-3/4 h-1.5 rounded" style={{ backgroundColor: t.bgInner, opacity: 0.8 }} />
                      <div className="w-full h-6 rounded mt-auto" style={{ backgroundColor: t.bgInner, opacity: 0.8 }} />
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {theme === t.key && <Check className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-50" />}
                  <span className="font-medium text-sm text-zinc-900 dark:text-zinc-50">{t.label}</span>
                </div>
              </Label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Brand Color */}
      <Card className="rounded-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-base text-zinc-900 dark:text-zinc-50">Brand Color</CardTitle>
          <CardDescription>Choose a brand color for your booking pages.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {BRAND_COLORS.map(c => (
              <button
                key={c.value}
                onClick={() => { setBrandColor(c.value); toast.success(`Brand color set to ${c.name}`); }}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${brandColor === c.value ? 'border-zinc-900 dark:border-zinc-50' : 'border-transparent hover:border-zinc-200 dark:hover:border-zinc-700'}`}
              >
                <div className={`h-8 w-8 rounded-full relative flex items-center justify-center`} style={{ backgroundColor: c.bg }}>
                  {brandColor === c.value && <Check className="h-4 w-4 text-white" />}
                </div>
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{c.name}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
