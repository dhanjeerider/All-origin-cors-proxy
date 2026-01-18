import React, { useState } from 'react';
import { Copy, Check, Globe, Zap, Shield, Server, Terminal, Github } from 'lucide-react';
import { cn } from '@/lib/utils';
export function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stealth, setStealth] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };
  const handleProxy = async (mode: 'html' | 'json') => {
    if (!url) return;
    setLoading(true);
    const proxyBase = `${window.location.origin}/api/proxy?url=${encodeURIComponent(url)}`;
    const finalUrl = stealth ? `${proxyBase}&delay=500` : proxyBase;
    if (mode === 'html') {
      window.open(finalUrl, '_blank');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(finalUrl);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: 'Failed to fetch proxy data', detail: String(err) });
    } finally {
      setLoading(false);
    }
  };
  const integrationSnippet = `fetch('${window.location.origin}/api/proxy?url=${url || 'https://example.com'}')
  .then(res => res.json())
  .then(data => console.log(data.data.contents));`;
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 lg:py-16 space-y-12 font-sans text-slate-900 dark:text-slate-100">
        {/* Header & Status Badges */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe className="text-white h-5 w-5" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">FluxGate</h1>
            </div>
            <p className="text-slate-500 text-lg">High-performance allOrigins clone for modern developers.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Operational
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Zap className="w-3 h-3 mr-1.5" />
              Edge Powered
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              MIT License
            </span>
          </div>
        </header>
        {/* Playground */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold uppercase tracking-widest text-slate-400">Target URL</label>
                <span className="text-xs text-blue-500 font-mono">CORS will be bypassed</span>
              </div>
              <input
                type="text"
                placeholder="https://example.com"
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-lg shadow-inner focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleProxy('json')}
                disabled={loading}
                className="flex-1 min-w-[140px] px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Terminal className="w-5 h-5" />}
                Extract JSON
              </button>
              <button
                onClick={() => handleProxy('html')}
                disabled={loading}
                className="flex-1 min-w-[140px] px-6 py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Globe className="w-5 h-5" />
                Raw HTML
              </button>
            </div>
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={stealth}
                  onChange={(e) => setStealth(e.target.checked)}
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-700 checked:bg-blue-500 checked:border-blue-500 transition-all"
                />
                <Check className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity pointer-events-none" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-blue-500 transition-colors">
                Enable Stealth (Header Rotation + 500ms jitter)
              </span>
            </label>
          </div>
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col min-h-[400px]">
              <div className="px-4 py-3 bg-slate-800 flex items-center justify-between border-b border-slate-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                </div>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Response Preview</span>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'result')}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {copied === 'result' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-6 flex-1 overflow-auto max-h-[500px]">
                {result ? (
                  <pre className="text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {Object.entries(result).map(([key, val]) => (
                      <div key={key}>
                        <span className="text-blue-400">"{key}"</span>: <span className={cn(
                          typeof val === 'string' ? "text-amber-300" : "text-purple-400"
                        )}>{JSON.stringify(val, null, 2)}</span>
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                    <Terminal className="w-12 h-12 opacity-20" />
                    <p className="text-sm text-center">Execute a request to see the<br/>proxied payload here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        {/* Documentation Section (README content) */}
        <section className="pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-10">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="text-blue-500 w-6 h-6" />
                  Quick Start
                </h2>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 relative group">
                  <button 
                    onClick={() => copyToClipboard(integrationSnippet, 'snippet')}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-white dark:bg-slate-800 border rounded-lg shadow-sm"
                  >
                    {copied === 'snippet' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-sm font-mono overflow-x-auto text-slate-700 dark:text-slate-300">
                    <code>{integrationSnippet}</code>
                  </pre>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Terminal className="text-blue-500 w-6 h-6" />
                  API Reference
                </h2>
                <ul className="space-y-4">
                  <li className="flex gap-4">
                    <div className="font-mono text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded h-fit shrink-0">/?url=...</div>
                    <p className="text-slate-600 dark:text-slate-400">Returns raw HTML if accessed from a browser, otherwise returns JSON metadata.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="font-mono text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded h-fit shrink-0">/api?url=...</div>
                    <p className="text-slate-600 dark:text-slate-400">Always returns JSON extraction including title, images, links, and text contents.</p>
                  </li>
                  <li className="flex gap-4">
                    <div className="font-mono text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-1 rounded h-fit shrink-0">&delay=N</div>
                    <p className="text-slate-600 dark:text-slate-400">Delays the response by N seconds (max 5) to simulate slow network conditions.</p>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Server className="text-blue-500 w-6 h-6" />
                  Deployment
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <h4 className="font-bold mb-1">Cloudflare Workers</h4>
                    <p className="text-sm text-slate-500">Optimized for sub-10ms proxying at the edge.</p>
                  </div>
                  <div className="p-4 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <h4 className="font-bold mb-1">Node.js / Hono</h4>
                    <p className="text-sm text-slate-500">Adaptable for self-hosting on VPS or Hostinger.</p>
                  </div>
                </div>
              </div>
            </div>
            <aside className="space-y-8">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/50">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">Why FluxGate?</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                  Most CORS proxies are either slow or rate-limited. FluxGate leverages Cloudflare's global infrastructure to provide a transparent, high-bandwidth bridge to any resource.
                </p>
                <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:underline">
                  <Github className="w-4 h-4" /> View Source
                </a>
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs">Features</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm">CSP & Frame stripping</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <span className="text-sm">User-Agent rotation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5 text-purple-500" />
                    <span className="text-sm">IPv4 spoofing</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
        {/* Footer */}
        <footer className="pt-12 border-t border-slate-200 dark:border-slate-800 text-center space-y-4">
          <p className="text-slate-400 text-sm italic">
            Disclaimer: FluxGate is a high-performance open-source clone of the allOrigins service, designed for developers needing to bypass CORS restrictions in modern web applications.
          </p>
          <div className="text-slate-300 dark:text-slate-600 text-xs font-mono uppercase tracking-tighter">
            FluxGate v3.5 • Build 2025.04 • Global Mesh Network
          </div>
        </footer>
      </div>
    </div>
  );
}