import React from 'react';
import { Zap, Shield, Filter, Database, Github, Sparkles, Cpu, Terminal, ExternalLink, Globe, FileText, MousePointer2, Share2, SearchCode, Lock } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
export function HomePage() {
  const demoTarget = 'https://en.wikipedia.org/wiki/Cloudflare';
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12">
        <Toaster richColors position="top-center" />
        <ThemeToggle />
        {/* Header */}
        <header className="h-20 flex items-center justify-between border-b border-white/5 mb-12">
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
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </nav>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-all hover:scale-110">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>
        <main className="space-y-32">
          {/* Hero Section */}
          <section className="text-center space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-400 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Edge-First Path-Based Extraction</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-[1.1]">
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
          {/* Lifecycle */}
          <section className="py-12 space-y-16">
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Request Lifecycle</h2>
              <p className="text-slate-500 text-lg">A peek under the hood of our edge-based transformation engine.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <LifecycleStep icon={<Share2 />} title="Client Request" desc="Your app hits a FluxGate endpoint." />
              <LifecycleStep icon={<Lock />} title="Edge Guard" desc="CORS headers are injected." />
              <LifecycleStep icon={<Globe />} title="Origin Fetch" desc="FluxGate fetches the target server-side." />
              <LifecycleStep icon={<SearchCode />} title="DOM Parsing" desc="HTMLRewriter extracts content." />
              <LifecycleStep icon={<Database />} title="Clean Data" desc="Normalized JSON is returned." />
            </div>
          </section>
          {/* Quick Demos */}
          <section className="space-y-10">
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
          {/* Playground */}
          <section id="playground" className="scroll-mt-24 space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold tracking-tight">Interactive Playground</h2>
              <p className="text-slate-500 text-lg">Test every endpoint with your own target URLs.</p>
            </div>
            <ProxyPlayground />
          </section>
          {/* Features */}
          <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 scroll-mt-24 pb-20">
            <FeatureCard icon={<Cpu />} title="Smart Routing" desc="Dedicated paths for specific data formats." />
            <FeatureCard icon={<Filter />} title="Edge Rewriting" desc="Uses Cloudflare HTMLRewriter for DOM streams." />
            <FeatureCard icon={<Database />} title="Zero Latency" desc="Direct streaming passthrough ensure asset speed." />
            <FeatureCard icon={<Shield />} title="Safety First" desc="Automatically strips sensitive headers and cookies." />
          </section>
        </main>
        <footer className="border-t border-white/5 py-16 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-slate-500">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" />
              <span className="font-bold text-slate-300 text-lg">FluxGate</span>
            </div>
            <p>© 2025 FluxGate Engine. Edge-First Architecture. v2.1</p>
          </div>
          <div className="flex gap-12 font-medium">
            <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
            <a href="https://github.com" className="hover:text-white transition-colors">Source</a>
            <a href="#" className="hover:text-white transition-colors">Status</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
function LifecycleStep({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6 bg-slate-900/50 border border-white/5 rounded-2xl backdrop-blur-sm group hover:border-indigo-500/20 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' }) : icon}
      </div>
      <h3 className="text-sm font-bold text-slate-200 mb-2 uppercase tracking-tight">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
function DemoLink({ icon, label, path, color }: { icon: React.ReactNode, label: string, path: string, color: string }) {
  const fullUrl = `${window.location.origin}${path}`;
  return (
    <a
      href={fullUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-5 bg-slate-900/40 border border-white/5 rounded-xl hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300"
    >
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-lg bg-white/5 group-hover:scale-110 transition-transform duration-300", color)}>
          {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-5 h-5' }) : icon}
        </div>
        <span className="font-bold text-slate-300 group-hover:text-white transition-colors">{label}</span>
      </div>
      <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
    </a>
  );
}
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="bg-slate-900/50 border-white/5 p-8 hover:border-white/10 transition-all duration-300 group">
      <div className="text-indigo-500 mb-6 group-hover:scale-110 transition-transform duration-300">
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' }) : icon}
      </div>
      <h3 className="text-xl font-bold mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 leading-relaxed font-medium">{desc}</p>
    </Card>
  );
}