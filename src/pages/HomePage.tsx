import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Globe, Layers, Github, Sparkles, Filter, Database, Terminal, Cpu, ArrowRight, BookOpen } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ApiResponse, ProxyStats } from '@shared/types';
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};
export function HomePage() {
  const [stats, setStats] = useState<ProxyStats | null>(null);
  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/stats')
        .then(res => res.json())
        .then((res: ApiResponse<ProxyStats>) => {
          if (res.success && res.data) setStats(res.data);
        })
        .catch(err => console.error('Failed to fetch stats:', err));
    };
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);
  const topFormat = useMemo(() => {
    if (!stats?.formatCounts) return 'JSON';
    const entries = Object.entries(stats.formatCounts);
    if (entries.length === 0) return 'JSON';
    return entries
      .filter(([, count]) => (count as number) > 0)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0]?.toUpperCase() || 'JSON';
  }, [stats]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans overflow-x-hidden">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="bg-grid-slate-900 absolute inset-0 opacity-30" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-sky-600/10 blur-[120px] rounded-full" 
        />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="h-24 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <Zap className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              FluxGate<span className="text-indigo-500">.</span>
            </span>
          </motion.div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-400">
              <a href="#playground" className="hover:text-white transition-colors relative group">
                Playground
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </a>
              <Link to="/docs" className="hover:text-white transition-colors relative group">
                Documentation
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-500 transition-all group-hover:w-full" />
              </Link>
            </nav>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all hover:scale-110">
              <Github className="w-5 h-5 text-white" />
            </a>
          </div>
        </header>
        <main className="py-12 md:py-24 space-y-32">
          {/* Hero Section */}
          <section className="text-center space-y-8 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 backdrop-blur-md uppercase tracking-[0.2em]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Extraction Engine</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.9] text-glow"
            >
              CORS Bypassed.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500">Instant Access.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-light"
            >
              The high-performance edge proxy for modern developers. Extract clean JSON, media, or specific DOM nodes from any origin instantly.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4 pt-4"
            >
              <a href="#playground">
                <Button className="btn-gradient h-14 px-8 rounded-2xl text-lg">
                  Try Playground
                </Button>
              </a>
              <Link to="/docs">
                <Button variant="outline" className="h-14 px-8 rounded-2xl text-lg border-white/10 bg-white/5 hover:bg-white/10">
                  Read Docs
                </Button>
              </Link>
            </motion.div>
          </section>
          {/* Stats Ticker */}
          <motion.section 
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <TickerCard
              label="Requests Proxied"
              value={stats?.totalRequests?.toLocaleString() ?? '0'}
              sub="Global traffic processed"
              color="text-sky-400"
              glow
            />
            <TickerCard
              label="Top Protocol"
              value={topFormat}
              sub="Most popular extraction"
              color="text-indigo-400"
            />
            <TickerCard
              label="Edge Latency"
              value="~14ms"
              sub="Average global response"
              color="text-purple-400"
            />
          </motion.section>
          {/* Main Feature: Playground */}
          <section id="playground" className="space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-glow">Data Playground</h2>
              <p className="text-slate-500 text-lg max-w-xl mx-auto">Experience the speed of our HTMLRewriter engine. Test any URL with zero configuration.</p>
            </div>
            <ProxyPlayground />
          </section>
          {/* Features Grid */}
          <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Filter className="text-sky-400" />}
              title="Smart Selectors"
              desc="Target any CSS class or ID. Our engine extracts nested children into clean, typed JSON objects."
            />
            <FeatureCard
              icon={<Database className="text-indigo-400" />}
              title="Media Resolver"
              desc="Automatic relative-to-absolute URL conversion for images and videos. Get direct hotlinks instantly."
            />
            <FeatureCard
              icon={<Cpu className="text-purple-400" />}
              title="Edge Latency"
              desc="Running on 300+ global locations. We fetch data closer to your users, reducing TTFB significantly."
            />
            <FeatureCard
              icon={<Shield className="text-emerald-400" />}
              title="SSL Hardened"
              desc="Transparent HTTPS proxying with automatic certificate validation and header sanitization."
            />
          </section>
        </main>
        <footer className="border-t border-white/5 py-20 mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" />
                <span className="font-black text-xl">FluxGate</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Empowering developers to build data-rich applications without the constraints of CORS policies.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
                <ul className="text-slate-500 text-sm space-y-2">
                  <li><Link to="/docs" className="hover:text-indigo-400">Documentation</Link></li>
                  <li><a href="#" className="hover:text-indigo-400">API Status</a></li>
                  <li><a href="#" className="hover:text-indigo-400">Pricing</a></li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold text-sm uppercase tracking-widest">Connect</h4>
                <ul className="text-slate-500 text-sm space-y-2">
                  <li><a href="https://github.com" className="hover:text-indigo-400">GitHub</a></li>
                  <li><a href="#" className="hover:text-indigo-400">Discord</a></li>
                  <li><a href="#" className="hover:text-indigo-400">Twitter</a></li>
                </ul>
              </div>
            </div>
            <div className="md:text-right flex flex-col items-start md:items-end gap-2">
              <p className="text-xs text-slate-600 font-mono">GLOBAL REGION: 310 POS</p>
              <p className="text-slate-500 text-sm mt-4">© 2025 FluxGate Engine. Edge-First Architecture.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
function TickerCard({ label, value, sub, color, glow = false }: { label: string, value: string, sub: string, color: string, glow?: boolean }) {
  return (
    <motion.div 
      variants={item}
      whileHover={{ y: -5 }}
      className={cn(
        "p-8 rounded-[2rem] glass-neon flex flex-col gap-1 overflow-hidden relative group",
        glow && "before:absolute before:inset-0 before:bg-indigo-500/5"
      )}
    >
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</span>
      <span className={cn("text-5xl font-black font-mono tracking-tighter", color, glow && "text-glow-primary")}>
        {value}
      </span>
      <span className="text-xs text-slate-600 font-medium">{sub}</span>
    </motion.div>
  );
}
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="p-8 rounded-3xl glass-neon border-white/5 group hover:border-indigo-500/30 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' }) : icon}
      </div>
      <h3 className="text-xl font-bold mb-3 group-hover:text-indigo-400 transition-colors">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}