import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, ShieldCheck, Zap, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col font-sans">
      {/* Navbar */}
      <header className="px-6 lg:px-8 h-20 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Slotify" className="h-8 w-auto dark:invert" />
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          <a href="#features" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">How it works</a>
        </nav>
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button className="rounded-full px-6 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-sm transition-all hover:scale-105 active:scale-95">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-8 py-24 md:py-32 flex flex-col items-center text-center overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full -z-10 pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-4xl mx-auto relative z-10"
          >
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
              Scheduling infrastructure for <span className="text-zinc-400 dark:text-zinc-500">everyone.</span>
            </h1>
            <p className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Meet Slotify, the scheduling platform that makes booking meetings a breeze. 
              Eliminate the back-and-forth emails and focus on what matters most.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="rounded-full px-8 h-12 text-base bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all w-full sm:w-auto gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#features">
                <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-base border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all w-full sm:w-auto">
                  Learn More
                </Button>
              </a>
            </div>
          </motion.div>

          {/* Dashboard Preview Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, type: 'spring' }}
            className="mt-20 w-full max-w-5xl rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 shadow-2xl p-2 md:p-4 z-10"
          >
             <div className="rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 aspect-[16/9] flex flex-col relative">
                {/* Simulated dashboard UI header */}
                <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 flex items-center px-4 gap-2 bg-white dark:bg-zinc-950">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                </div>
                {/* Simulated dashboard UI body */}
                <div className="flex-1 flex bg-zinc-50 dark:bg-zinc-950 text-left">
                  <div className="w-48 hidden md:flex flex-col gap-1 border-r border-zinc-200 dark:border-zinc-800 p-4">
                     <div className="flex items-center gap-2 px-2 py-2 mb-4">
                       <div className="h-6 w-6 rounded-md bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs">S</div>
                       <span className="font-bold text-zinc-900 dark:text-zinc-100">Slotify</span>
                     </div>
                     <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm font-medium flex items-center gap-2">
                       <Clock className="h-4 w-4" /> Event Types
                     </div>
                     <div className="px-3 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                       <CalendarDays className="h-4 w-4" /> Bookings
                     </div>
                     <div className="px-3 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                       <Clock className="h-4 w-4 opacity-0" /> Availability
                     </div>
                     <div className="mt-auto px-3 py-2 rounded-lg text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                       <div className="h-5 w-5 rounded-full bg-zinc-200 dark:bg-zinc-700" /> Profile
                     </div>
                  </div>
                  <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-hidden">
                    <div>
                      <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Event Types</h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Configure different events for people to book on your calendar.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                       {[
                         { title: '15 Min Meeting', slug: '/15-min', min: '15m', color: '#6366f1' },
                         { title: '30 Min Meeting', slug: '/30-min', min: '30m', color: '#10b981' },
                         { title: '60 Min Meeting', slug: '/60-min', min: '60m', color: '#f59e0b' }
                       ].map((et, i) => (
                         <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: et.color + '18' }}>
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: et.color }} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{et.title}</span>
                                  <span className="text-xs text-zinc-400 font-mono">{et.slug}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-600 dark:text-zinc-300">
                                    <Clock className="h-3 w-3" /> {et.min}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="hidden sm:flex items-center gap-2">
                               <div className="h-8 w-16 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-md" />
                               <div className="h-8 w-8 border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 rounded-md" />
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
             </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-6 lg:px-8 py-24 bg-white dark:bg-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">Everything you need to schedule</h2>
              <p className="text-zinc-500 dark:text-zinc-400 text-lg">Powerful features wrapped in an elegant interface.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: Clock, title: 'Custom Availabilities', desc: 'Set granular working hours, buffer times, and date overrides for full control over your time.' },
                { icon: Zap, title: 'Instant Booking', desc: 'A frictionless, single-page booking flow ensures higher conversion and fewer drop-offs.' },
                { icon: ShieldCheck, title: 'Double Booking Prevention', desc: 'Real-time database checks ensure you are never double-booked, no matter what.' },
              ].map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800/60"
                >
                  <div className="h-12 w-12 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-6 shadow-sm">
                    <f.icon className="h-6 w-6 text-zinc-700 dark:text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">{f.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works Section */}
        <section id="how-it-works" className="px-6 lg:px-8 py-24 bg-zinc-50 dark:bg-zinc-950">
           <div className="max-w-5xl mx-auto">
             <div className="text-center mb-16">
               <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">How it works</h2>
               <p className="text-zinc-500 dark:text-zinc-400 text-lg">Three simple steps to automate your scheduling.</p>
             </div>
             
             <div className="grid md:grid-cols-3 gap-12 relative">
                <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-zinc-200 dark:bg-zinc-800 -z-10" />
                {[
                  { step: '1', title: 'Create event types', desc: 'Define your meetings, durations, and preferred locations.' },
                  { step: '2', title: 'Set your hours', desc: 'Connect your schedule and set your weekly availability.' },
                  { step: '3', title: 'Share your link', desc: 'Send your public booking page and watch the meetings roll in.' }
                ].map((s, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 0.5 }}
                    className="flex flex-col items-center text-center"
                  >
                    <div className="h-12 w-12 rounded-full bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 flex items-center justify-center text-xl font-bold mb-6 shadow-md">
                      {s.step}
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-3">{s.title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.desc}</p>
                  </motion.div>
                ))}
             </div>
           </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 lg:px-8 py-32 text-center bg-white dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800/50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Ready to take control of your time?</h2>
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full px-10 h-14 text-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 hover:scale-105 transition-all shadow-xl">
                Open Dashboard
              </Button>
            </Link>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-zinc-500 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <p>© {new Date().getFullYear()} Slotify. A scheduling platform clone.</p>
      </footer>
    </div>
  );
}
