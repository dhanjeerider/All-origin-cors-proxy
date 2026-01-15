import React from 'react';
import { Zap, Shield, Filter, Database, Github, Sparkles, Cpu, Terminal, ExternalLink, Globe, FileText, MousePointer2, ArrowRight, Share2, SearchCode, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
export function HomePage() {
  const demoTarget = 'https://en.wikipedia.org/wiki/Cloudflare';
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans bg-grid-minimal selection:bg-indigo-500/30 overflow-x-hidden">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      {/* Visual Depth Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="h-20 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative">
              <Zap className="w-6 h-6 text-indigo-500 fill-indigo-500 group-hover:scale-110 transition-transform" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-lg group-hover:bg-indigo-500/40 transition-all" />
            </div>
            <span className="text-xl font-bold tracking-tight">FluxGate</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <a href="#playground" className="hover:text-white transition-colors">Playground</a>
              <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </nav>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-all hover:scale-110">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>
        <main className="py-12 md:py-20 lg:py-24 space-y-32">
          {/* Hero Section */}
          <section className="text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edge-First Path-Based Extraction</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.05]">
              CORS Bypassed. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-shimmer bg-[length:200%_auto]">Data Extracted.</span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              High-performance proxying that transforms the web into your personal API. One endpoint, infinite possibilities.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <a href="#playground">
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-14 px-10 rounded-xl font-bold gap-3 text-lg shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                  <Terminal className="w-5 h-5" /> Try Playground
                </Button>
              </a>
              <Link to="/docs">
                <Button variant="outline" className="h-14 px-10 rounded-xl border-white/10 bg-white/5 font-bold text-lg hover:bg-white/10 transition-all">
                  View API Docs
                </Button>
              </Link>
            </div>
          </section>
          {/* Request Lifecycle Visualization */}
          <section id="how-it-works" className="py-12 scroll-mt-24 space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Request Lifecycle</h2>
              <p className="text-slate-500 text-lg">A peek under the hood of our edge-based transformation engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 z-0" />
              <LifecycleStep 
                icon={<Share2 />} 
                title="Client Request" 
                desc="Your app hits a FluxGate endpoint with a target URL." 
                delay={0}
              />
              <LifecycleStep 
                icon={<Lock />} 
                title="Edge Guard" 
                desc="Requests are sanitized and CORS headers are injected." 
                delay={0.1}
              />
              <LifecycleStep 
                icon={<Globe />} 
                title="Origin Fetch" 
                desc="FluxGate fetches the target server-side (bypass CORS)." 
                delay={0.2}
              />
              <LifecycleStep 
                icon={<SearchCode />} 
                title="DOM Extraction" 
                desc="HTMLRewriter parses content in-flight at the edge." 
                delay={0.3}
              />
              <LifecycleStep 
                icon={<Database />} 
                title="Clean Data" 
                desc="Normalized JSON or Raw content is returned to you." 
                delay={0.4}
              />
            </div>
          </section>
          {/* Quick Demos */}
          <section id="quick-demos" className="space-y-10">
            <div className="flex flex-col items-center text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">One-Click Demos</h2>
              <p className="text-slate-500 text-lg">Instant results from our production-grade edge nodes.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <DemoLink icon={<Globe />} label="Raw HTML Proxy" path={`/api/proxy?url=${encodeURIComponent(demoTarget)}`} color="text-blue-400" />
              <DemoLink icon={<Database />} label="Metadata JSON" path={`/api/json?url=${encodeURIComponent(demoTarget)}`} color="text-indigo-400" />
              <DemoLink icon={<MousePointer2 />} label="Selector Extraction" path={`/api/class?url=${encodeURIComponent(demoTarget)}&class=mw-body-content`} color="text-pink-400" />
              <DemoLink icon={<FileText />} label="Readability Text" path={`/api/text?url=${encodeURIComponent(demoTarget)}`} color="text-emerald-400" />
            </div>
          </section>
          {/* Main Playground */}
          <section id="playground" className="space-y-12 scroll-mt-24">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold tracking-tight">Interactive Playground</h2>
              <p className="text-slate-500 text-lg">Test every endpoint with your own target URLs.</p>
            </div>
            <ProxyPlayground />
          </section>
          {/* Features */}
          <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-mt-24">
            <FeatureCard icon={<Cpu />} title="Smart Routing" desc="Dedicated paths like /api/text and /api/images for clean response formats." />
            <FeatureCard icon={<Filter />} title="Edge Rewriting" desc="Uses Cloudflare HTMLRewriter to parse and modify DOM streams instantly." />
            <FeatureCard icon={<Database />} title="Zero Latency" desc="Direct streaming passthrough ensures assets load as fast as origin." />
            <FeatureCard icon={<Shield />} title="Safety First" desc="Automatically strips sensitive headers and cookies for anonymous proxying." />
          </section>
        </main>
        <footer className="border-t border-white/5 py-16 mt-32 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-300 text-lg">FluxGate</span>
            </div>
            <p>© 2025 FluxGate Engine. Edge-First Architecture. v2.1</p>
          </div>
          <div className="flex gap-12 font-medium">
            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com" className="hover:text-white transition-colors">Source Code</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
function LifecycleStep({ icon, title, desc, delay }: { icon: React.ReactNode, title: string, desc: string, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="relative z-10 flex flex-col items-center text-center p-6 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm group hover:border-indigo-500/20 transition-all"
    >
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <h3 className="text-sm font-bold text-slate-200 mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </motion.div>
  );
}
function DemoLink({ icon, label, path, color }: { icon: React.ReactNode, label: string, path: string, color: string }) {
  const fullUrl = `${window.location.origin}${path}`;
  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-5 bg-slate-900/40 border border-white/5 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300", color)}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' })}
        </div>
        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
    </a>
  );
}
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="bg-slate-900/50 border-white/5 p-8 hover:border-white/10 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="text-indigo-500 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' })}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </Card>
  );
}