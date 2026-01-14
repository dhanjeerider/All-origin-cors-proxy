import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Layers, Github, Sparkles, Filter, Database, Terminal, Cpu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import type { ApiResponse, ProxyStats } from '@shared/types';
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
      .sort(([, a], [, b]) => (b as number) - (a as number))[0][0]
      .toUpperCase();
  }, [stats]);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 font-sans">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-sky-600/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
      <header className="relative z-10 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
            <Zap className="w-6 h-6 text-white fill-white/20" />
          </div>
          <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            FluxGate<span className="text-indigo-500">.</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#playground" className="hover:text-white transition-colors">Playground</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#docs" className="hover:text-white transition-colors">Docs</a>
          </nav>
          <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
            <Github className="w-5 h-5 text-white" />
          </a>
        </div>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-32 space-y-40">
        <section className="text-center space-y-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 backdrop-blur-md uppercase tracking-widest"
          >
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Extraction Engine</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-black tracking-tight leading-[0.85]"
          >
            Zero CORS. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500">Instant Data.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-lg md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light"
          >
            A high-performance HTML extraction proxy. Pull images, links, or specific CSS selectors from any URL without server-side configuration.
          </motion.p>
        </section>
        <section className="flex flex-wrap justify-center gap-4">
          <TickerCard 
            label="Requests Proxied" 
            value={stats?.totalRequests.toLocaleString() || '---'} 
            sub="Total global traffic" 
            color="text-sky-400" 
          />
          <TickerCard 
            label="Popular Format" 
            value={topFormat} 
            sub="Most requested mode" 
            color="text-indigo-400" 
          />
          <TickerCard 
            label="Avg. Edge Latency" 
            value="~14ms" 
            sub="Global response time" 
            color="text-purple-400" 
          />
        </section>
        <section id="playground" className="space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-black">Data Playground</h2>
            <p className="text-slate-500 text-lg">Experience the power of HTMLRewriter-based streaming extraction.</p>
          </div>
          <ProxyPlayground />
        </section>
        <section id="features" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={<Filter className="text-sky-400" />} 
            title="Smart Selectors" 
            desc="Extract data from any CSS class or ID. Get clean JSON arrays of nested content instantly." 
          />
          <FeatureCard 
            icon={<Database className="text-indigo-400" />} 
            title="Media Scraping" 
            desc="Auto-resolve relative URLs for images and videos into absolute, ready-to-use links." 
          />
          <FeatureCard 
            icon={<Cpu className="text-purple-400" />} 
            title="Lazy Processing" 
            desc="Simulate user wait times with our 'Delay' feature to handle hydration-heavy sites." 
          />
          <FeatureCard 
            icon={<Terminal className="text-emerald-400" />} 
            title="Binary Streaming" 
            desc="Raw mode supports transparent binary streaming for images, PDFs, and assets." 
          />
        </section>
      </main>
      <footer className="border-t border-white/5 py-20 mt-40 bg-slate-900/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <span className="font-black text-xl">FluxGate</span>
            </div>
            <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
              The developer's choice for bypassing CORS and extracting edge data. No logs, no limits, pure performance.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Platform</h4>
              <ul className="text-slate-500 text-sm space-y-2">
                <li><a href="#" className="hover:text-indigo-400">Documentation</a></li>
                <li><a href="#" className="hover:text-indigo-400">Edge Network</a></li>
                <li><a href="#" className="hover:text-indigo-400">Status</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-white font-bold text-sm uppercase tracking-widest">Community</h4>
              <ul className="text-slate-500 text-sm space-y-2">
                <li><a href="#" className="hover:text-indigo-400">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-400">Discord</a></li>
                <li><a href="#" className="hover:text-indigo-400">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <p className="text-xs text-slate-600 font-mono">ENV: production</p>
            <p className="text-xs text-slate-600 font-mono">REGION: global-edge</p>
            <p className="text-slate-500 text-sm mt-4">© 2025 FluxGate Engine. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
function TickerCard({ label, value, sub, color }: { label: string, value: string, sub: string, color: string }) {
  return (
    <div className="min-w-[240px] p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col gap-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</span>
      <span className={`text-4xl font-black font-mono ${color}`}>{value}</span>
      <span className="text-xs text-slate-600 font-medium">{sub}</span>
    </div>
  );
}
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-indigo-500/30 transition-all hover:-translate-y-2 group">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' }) : icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}