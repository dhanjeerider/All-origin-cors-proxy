import React from 'react';
import { Zap, Shield, Filter, Database, Github, Sparkles, Cpu } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProxyPlayground } from '@/components/ProxyPlayground';
import { Toaster } from '@/components/ui/sonner';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans bg-grid-minimal">
      <ThemeToggle />
      <Toaster richColors position="top-center" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="h-20 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">FluxGate</span>
          </div>
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <a href="#playground" className="hover:text-white transition-colors">Playground</a>
              <Link to="/docs" className="hover:text-white transition-colors">Documentation</Link>
            </nav>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </header>
        <main className="py-12 md:py-20 lg:py-24 space-y-24">
          <section className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400">
              <Sparkles className="w-3 h-3" />
              <span>High-Performance Streaming Proxy</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Bypass CORS Restrictions. <br />
              <span className="text-indigo-500 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Access Any Origin.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              A minimalist edge utility for developers. Raw streaming passthrough by default, with powerful on-the-fly extraction when needed.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <a href="#playground">
                <Button className="bg-indigo-600 hover:bg-indigo-700 h-12 px-8 rounded-md font-semibold">
                  Open Playground
                </Button>
              </a>
              <Link to="/docs">
                <Button variant="outline" className="h-12 px-8 rounded-md border-white/10 bg-white/5 font-semibold">
                  View API Docs
                </Button>
              </Link>
            </div>
          </section>
          <section id="playground" className="space-y-10 scroll-mt-24">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold">Request Playground</h2>
              <p className="text-slate-500">Test the streaming edge engine in real-time.</p>
            </div>
            <ProxyPlayground />
          </section>
          <section id="features" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard icon={<Filter />} title="Smart Selectors" desc="Target any CSS class or ID to extract specific DOM fragments." />
            <FeatureCard icon={<Database />} title="Media Resolver" desc="Automatic conversion of relative paths to absolute URLs." />
            <FeatureCard icon={<Cpu />} title="Streaming Mode" desc="Transparent low-latency passthrough with CORS header injection." />
            <FeatureCard icon={<Shield />} title="Secure Edge" desc="Automatic SSL validation and header sanitization for privacy." />
          </section>
        </main>
        <footer className="border-t border-white/5 py-12 mt-20 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-300">FluxGate</span>
          </div>
          <p>© 2025 FluxGate Engine. Performance First.</p>
          <div className="flex gap-6">
            <Link to="/docs" className="hover:text-white">Docs</Link>
            <a href="https://github.com" className="hover:text-white">GitHub</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <Card className="bg-slate-900/50 border-white/5 p-6 hover:border-white/10 transition-colors group">
      <div className="text-indigo-500 mb-4 group-hover:scale-110 transition-transform duration-300">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
    </Card>
  );
}