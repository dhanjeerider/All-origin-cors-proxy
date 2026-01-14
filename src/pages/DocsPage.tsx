import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Layout, MousePointer2, Settings2, ShieldCheck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocsPage() {
  const origin = window.location.origin;
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 lg:py-16 space-y-20">
        <header className="space-y-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Zap className="w-8 h-8 text-indigo-500" />
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Documentation</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
              FluxGate is a high-speed, transparent CORS proxy running on Cloudflare Workers. It provides raw streaming passthrough by default.
            </p>
          </div>
        </header>
        <section id="quickstart" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-indigo-500" /> Default Usage (Streaming)
          </h2>
          <p className="text-slate-400">
            By default, FluxGate acts as a transparent proxy. Simply provide the <code>url</code> parameter. The response will be streamed directly from the origin with CORS headers injected.
          </p>
          <CodeBlock
            language="javascript"
            code={`// Minimal transparent proxy
const target = encodeURIComponent('https://example.com/data.json');
fetch(\`${origin}/api/proxy?url=\${target}\`)
  .then(res => res.json())
  .then(console.log);`}
          />
        </section>
        <section id="extraction" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-indigo-500" /> On-the-fly Extraction
          </h2>
          <p className="text-slate-400">
            Use the <code>format</code> parameter to trigger edge-side extraction using HTMLRewriter. This reduces payload size by only returning specific data.
          </p>
          <CodeBlock
            language="bash"
            code={`# Extract all image URLs from a page
curl "${origin}/api/proxy?url=https://wikipedia.org&format=images"`}
          />
        </section>
        <section id="reference" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" /> API Reference
          </h2>
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-900/20">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Param</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Default</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">url</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 text-red-500">Required</td>
                  <td className="px-6 py-4">Encoded target URL to fetch.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">format</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 italic">streaming</td>
                  <td className="px-6 py-4">json, text, images, links, class, id.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">class</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 italic">-</td>
                  <td className="px-6 py-4">CSS class to extract (requires format=class).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="security" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Security
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-xl">
              <h4 className="font-bold text-white mb-2">Zero Logs</h4>
              <p className="text-sm text-slate-500">We do not store request history, target URLs, or user data. Analytics have been removed for maximum privacy and speed.</p>
            </div>
            <div className="p-6 bg-slate-900/40 border border-white/5 rounded-xl">
              <h4 className="font-bold text-white mb-2">Header Stripping</h4>
              <p className="text-sm text-slate-500">Sensitive headers like <code>Set-Cookie</code> are removed from upstream responses before being delivered to the client.</p>
            </div>
          </div>
        </section>
        <footer className="pt-12 border-t border-white/5 text-center text-slate-600 text-xs tracking-widest uppercase">
          FluxGate Engine &bull; Streaming Optimized &bull; v2.1
        </footer>
      </div>
    </div>
  );
}