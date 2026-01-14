import React from 'react';
import { motion } from 'framer-motion';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Terminal, Globe, Layout, Shield, FileJson, Image as ImageIcon, Link as LinkIcon, Type, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
export function DocsPage() {
  const origin = window.location.origin;
  const formats = [
    { id: 'json', name: 'Structured JSON', icon: <FileJson />, desc: 'Full metadata including headers, response status, and body content.' },
    { id: 'html', name: 'Raw Stream', icon: <Layout />, desc: 'Transparent proxying with CORS headers injected. Best for full page rendering.' },
    { id: 'text', name: 'Extracted Text', icon: <Type />, desc: 'Clean, plain text output. Automatically strips scripts, styles, and HTML tags.' },
    { id: 'images', name: 'Media Map', icon: <ImageIcon />, desc: 'JSON array of resolved absolute URLs for every image found on the page.' },
    { id: 'links', name: 'Crawler Links', icon: <LinkIcon />, desc: 'Returns all <a> tag hrefs found, resolved to their absolute paths.' },
  ];
  const getExampleUrl = (f: string) => {
    const params = new URLSearchParams({
      url: 'https://en.wikipedia.org/wiki/Main_Page',
      format: f
    });
    return `${origin}/api/proxy?${params.toString()}`;
  };
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 overflow-x-hidden">
      <ThemeToggle />
      <div className="bg-grid-slate-900 fixed inset-0 opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-10 md:py-20 lg:py-24 space-y-16">
          <header className="space-y-8">
            <Link to="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white group -ml-4 rounded-xl">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Terminal
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-glow">Developer Documentation</h1>
                <p className="text-slate-500 mt-2 font-medium tracking-wide">FluxGate Edge Proxy API v2.0</p>
              </div>
            </div>
          </header>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <aside className="lg:col-span-3">
              <nav className="sticky top-24 space-y-2">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Integrate</p>
                <NavBtn href="#quickstart" label="Quickstart" />
                <NavBtn href="#endpoint" label="Base Endpoint" />
                <NavBtn href="#formats" label="Response Formats" />
                <NavBtn href="#delay" label="Edge Latency" />
              </nav>
            </aside>
            <div className="lg:col-span-9 space-y-32">
              <DocSection id="quickstart" icon={<Terminal className="w-8 h-8 text-indigo-500" />} title="Quickstart">
                <p className="text-slate-400 text-lg leading-relaxed max-w-2xl">
                  Bypass CORS in seconds. Prepend your target URL to our edge proxy endpoint to receive cross-origin content instantly.
                </p>
                <div className="space-y-6 pt-4">
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-indigo-500" /> Safe Browser Implementation
                    </p>
                    <CodeBlock
                      language="javascript"
                      code={`// Always use URLSearchParams to handle URI encoding automatically
const api = new URL('${origin}/api/proxy');
api.searchParams.set('url', 'https://example.com');
api.searchParams.set('format', 'json');
fetch(api)
  .then(res => res.json())
  .then(data => console.log('Proxied Data:', data));`}
                    />
                  </div>
                </div>
              </DocSection>
              <DocSection id="endpoint" title="Base Endpoint">
                <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/5 space-y-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HTTP GET</span>
                    <div className="font-mono text-indigo-400 text-lg break-all">
                      {origin}/api/proxy?url=<span className="text-slate-500">[target_url]</span>&format=<span className="text-slate-500">[mode]</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ParamCard name="url" type="Required" desc="The target resource URL. Must be URI Encoded for complex query strings." color="text-sky-400" />
                    <ParamCard name="format" type="Optional" desc="Extraction mode. Defaults to 'json'. Supports 5+ distinct formats." color="text-indigo-400" />
                  </div>
                </div>
              </DocSection>
              <DocSection id="formats" icon={<Globe className="w-8 h-8 text-indigo-500" />} title="Proxy Formats">
                <div className="grid grid-cols-1 gap-10">
                  {formats.map((f) => (
                    <div key={f.id} className="glass-neon rounded-[2.5rem] p-8 space-y-8 group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                          {f.icon}
                        </div>
                        <div>
                          <h3 className="text-2xl font-black group-hover:text-indigo-400 transition-colors">{f.name}</h3>
                          <code className="text-xs text-slate-500 tracking-widest uppercase">format={f.id}</code>
                        </div>
                      </div>
                      <p className="text-slate-400 text-lg leading-relaxed">{f.desc}</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Example (CURL)</span>
                          <a href={getExampleUrl(f.id)} target="_blank" rel="noreferrer" className="text-xs font-bold text-indigo-400 hover:text-sky-400 transition-colors flex items-center gap-1">
                            Run Query <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                        <CodeBlock
                          language="bash"
                          code={`curl -X GET "${origin}/api/proxy?url=https%3A%2F%2Fwikipedia.org&format=${f.id}"`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </DocSection>
              <DocSection id="delay" icon={<Shield className="w-8 h-8 text-indigo-500" />} title="Edge Latency Control">
                <p className="text-slate-400 text-lg leading-relaxed">
                  Avoid race conditions on dynamic sites by enforcing an edge-side wait period.
                </p>
                <div className="p-8 glass-neon rounded-3xl border-indigo-500/10 space-y-6">
                  <div className="flex items-center gap-3 text-indigo-400 font-mono">
                    <Terminal className="w-5 h-5" /> /api/proxy?url=...&delay=5
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <LimitBox label="Minimum" val="0s" />
                    <LimitBox label="Maximum" val="10s" />
                    <LimitBox label="Step" val="1s" />
                  </div>
                </div>
              </DocSection>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
function NavBtn({ href, label }: { href: string, label: string }) {
  return (
    <a
      href={href}
      className="block px-4 py-2.5 rounded-xl text-slate-400 font-bold hover:bg-white/5 hover:text-white transition-all border-l-2 border-transparent hover:border-indigo-500"
    >
      {label}
    </a>
  );
}
function DocSection({ id, icon, title, children }: { id: string, icon?: React.ReactNode, title: string, children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-10 scroll-mt-24">
      <div className="flex items-center gap-4">
        {icon}
        <h2 className="text-4xl font-black text-glow tracking-tight">{title}</h2>
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}
function ParamCard({ name, type, desc, color }: { name: string, type: string, desc: string, color: string }) {
  return (
    <div className="p-6 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-colors">
      <div className="flex justify-between items-center mb-2">
        <span className={cn("font-mono font-black", color)}>{name}</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase">{type}</span>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
}
function LimitBox({ label, val }: { label: string, val: string }) {
  return (
    <div className="text-center p-4 bg-slate-900/50 rounded-xl border border-white/5">
      <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">{label}</div>
      <div className="text-xl font-black font-mono text-white">{val}</div>
    </div>
  );
}