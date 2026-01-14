import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Layers, ArrowRight, Github, Sparkles } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import type { ApiResponse, ProxyStats } from '@shared/types';
export function HomePage() {
  const [stats, setStats] = useState<ProxyStats | null>(null);
  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then((res: ApiResponse<ProxyStats>) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(console.error);
  }, []);
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-sky-500/30">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
      </div>
      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">FluxGate</span>
        </div>
        <a href="https://github.com" target="_blank" rel="noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors">
          <Github className="w-5 h-5 text-slate-400 hover:text-white" />
        </a>
      </header>
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12 md:py-24 space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-sky-400 backdrop-blur-sm"
          >
            <Sparkles className="w-3 h-3" />
            <span>High Performance Edge Proxy</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] max-w-4xl mx-auto"
          >
            CORS Bypassed. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">Instantly.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Seamlessly fetch any resource without CORS headaches. 
            Run on Cloudflare's global network for sub-millisecond overhead.
          </motion.p>
        </section>
        {/* Live Stats Ticker */}
        <section className="flex justify-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <div className="flex flex-col">
              <span className="text-2xs text-muted-foreground uppercase tracking-widest">Total Proxied</span>
              <span className="text-2xl font-mono font-bold text-sky-400">
                {stats?.totalRequests.toLocaleString() ?? '---'}
              </span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col">
              <span className="text-2xs text-muted-foreground uppercase tracking-widest">Network Speed</span>
              <span className="text-2xl font-mono font-bold text-indigo-400">~12ms</span>
            </div>
          </div>
        </section>
        {/* Playground */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Interactive Playground</h2>
            <p className="text-slate-400">Paste any URL below and watch FluxGate bypass restrictions in real-time.</p>
          </div>
          <ProxyPlayground />
        </section>
        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Shield className="w-6 h-6 text-sky-400" />}
            title="Privacy First"
            description="We don't log your requests. Your data is passed through our workers and never touches a disk."
          />
          <FeatureCard 
            icon={<Zap className="w-6 h-6 text-yellow-400" />}
            title="Edge Performance"
            description="Built on Hono and Cloudflare Workers for the fastest possible response times globally."
          />
          <FeatureCard 
            icon={<Layers className="w-6 h-6 text-indigo-400" />}
            title="Dual Modes"
            description="Choose between Wrapped JSON for easy API parsing or Raw mode for binary transparent streaming."
          />
        </section>
      </main>
      <footer className="border-t border-white/5 py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold">FluxGate</span>
          </div>
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <p className="text-xs text-slate-600">© 2024 FluxGate Engine. Powered by Cloudflare.</p>
        </div>
      </footer>
    </div>
  );
}
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all hover:-translate-y-1">
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed text-sm">{description}</p>
    </div>
  );
}