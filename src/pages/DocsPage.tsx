import React from 'react';
import { motion } from 'framer-motion';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Terminal, Globe, Layout, Shield, FileJson, Image as ImageIcon, Link as LinkIcon, Video, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocsPage() {
  const origin = window.location.origin;
  const formats = [
    { id: 'json', name: 'JSON Metadata', icon: <FileJson />, desc: 'Returns structured metadata including status, headers, and full body content.' },
    { id: 'html', name: 'Raw HTML', icon: <Layout />, desc: 'Streams the original HTML with CORS headers injected. Useful for full-page rendering.' },
    { id: 'text', name: 'Plain Text', icon: <Type />, desc: 'Strips all HTML tags, scripts, and styles to return human-readable text only.' },
    { id: 'images', name: 'Image Gallery', icon: <ImageIcon />, desc: 'Automatically extracts and resolves all image sources into absolute URLs.' },
    { id: 'links', name: 'Link List', icon: <LinkIcon />, desc: 'Parses all anchor tags and returns an array of unique absolute links.' },
    { id: 'videos', name: 'Video Sources', icon: <Video />, desc: 'Finds all <video> and <source> tags to extract media paths.' },
    { id: 'class', name: 'CSS Class', icon: <Layout />, desc: 'Extracts only the elements matching a specific CSS class name.' },
    { id: 'id', name: 'Element ID', icon: <Layout />, desc: 'Finds and returns the element matching a specific DOM ID.' },
  ];
  const getExampleUrl = (f: string) => `${origin}/api/proxy?url=${encodeURIComponent('https://en.wikipedia.org/wiki/Main_Page')}&format=${f}`;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12 space-y-16">
          <header className="space-y-6">
            <Link to="/">
              <Button variant="ghost" className="text-slate-400 hover:text-white group -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Playground
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight">API Documentation</h1>
            </div>
          </header>
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <aside className="lg:col-span-3 space-y-8">
              <nav className="sticky top-12 space-y-1">
                <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Core API</p>
                <a href="#quickstart" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">Quickstart</a>
                <a href="#endpoint" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">Endpoints</a>
                <a href="#formats" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">Response Formats</a>
                <a href="#delay" className="block px-3 py-2 rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-colors">Lazy Delays</a>
              </nav>
            </aside>
            <div className="lg:col-span-9 space-y-24">
              <section id="quickstart" className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Terminal className="w-8 h-8 text-indigo-500" />
                  Quickstart
                </h2>
                <p className="text-slate-400 leading-relaxed max-w-2xl">
                  FluxGate allows you to fetch any resource from the web while automatically bypassing CORS. Simply prepend our endpoint to your target URL.
                </p>
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-slate-300">Basic Browser Usage:</p>
                  <CodeBlock 
                    language="javascript"
                    code={`// Use URLSearchParams for safe encoding
const api = new URL('${origin}/api/proxy');
api.searchParams.set('url', 'https://example.com');
api.searchParams.set('format', 'json');
fetch(api)
  .then(res => res.json())
  .then(console.log);`}
                  />
                </div>
              </section>
              <section id="endpoint" className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold">Base Endpoint</h2>
                  <div className="p-4 bg-slate-900 border border-white/5 rounded-xl font-mono text-indigo-400 text-sm overflow-x-auto">
                    GET {origin}/api/proxy?url=[encoded_url]&format=[mode]
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-sky-400 uppercase">Parameter</span>
                    <h3 className="font-bold text-white">url</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">The target URL you want to proxy. Must be <strong>URI Encoded</strong> to avoid parsing errors with query parameters.</p>
                  </div>
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase">Parameter</span>
                    <h3 className="font-bold text-white">format</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">Determines how the data is returned. Defaults to <code>json</code>. Supports 8 different modes.</p>
                  </div>
                </div>
              </section>
              <section id="formats" className="space-y-12">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Globe className="w-8 h-8 text-indigo-500" />
                  Response Formats
                </h2>
                <div className="grid grid-cols-1 gap-8">
                  {formats.map((f) => (
                    <div key={f.id} className="glass rounded-3xl p-6 md:p-8 border-white/5 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-indigo-400">
                          {f.icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{f.name}</h3>
                          <code className="text-xs text-slate-500">format={f.id}</code>
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">{f.desc}</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500 uppercase">Example CURL</span>
                          <a href={getExampleUrl(f.id)} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline">Try in Browser</a>
                        </div>
                        <CodeBlock 
                          language="bash"
                          code={`curl "${origin}/api/proxy?url=https%3A%2F%2Fen.wikipedia.org%2Fwiki%2FMain_Page&format=${f.id}"`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section id="delay" className="space-y-6">
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  <Shield className="w-8 h-8 text-indigo-500" />
                  Lazy Delays
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  Some websites require time for server-side processing or hydration. Use the <code>delay</code> parameter to wait at the edge before fetching.
                </p>
                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
                  <p className="text-sm font-mono text-indigo-300">GET /api/proxy?url=...&delay=5</p>
                  <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                    <li>Minimum: 0 seconds</li>
                    <li>Maximum: 10 seconds</li>
                    <li>Resolution: 1 second increments</li>
                  </ul>
                </div>
              </section>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}