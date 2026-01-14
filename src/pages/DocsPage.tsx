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
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">API Documentation</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed">
              FluxGate v2.1 uses high-performance, path-based routing. Choose the endpoint that matches your required output format.
            </p>
          </div>
        </header>
        <section id="endpoints" className="space-y-10">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-indigo-500" /> Primary Endpoints
          </h2>
          <div className="grid gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-400">/api/proxy — Raw Passthrough</h3>
              <p className="text-slate-400">The fastest way to bypass CORS. Returns the raw response body from the target URL with zero server-side processing.</p>
              <CodeBlock language="javascript" code={`fetch(\`${origin}/api/proxy?url=https://example.com\`)`} />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-400">/api/json — Full Extract</h3>
              <p className="text-slate-400">Returns a structured JSON response containing metadata, images, links, and page title.</p>
              <CodeBlock language="bash" code={`curl "${origin}/api/json?url=https://wikipedia.org"`} />
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-indigo-400">/api/text — Content Extraction</h3>
              <p className="text-slate-400">Strips scripts and styles, returning only the readable text content of the target page.</p>
              <CodeBlock language="javascript" code={`fetch(\`${origin}/api/text?url=https://blog.com/post\`)`} />
            </div>
          </div>
        </section>
        <section id="selectors" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-indigo-500" /> Fragment Extraction
          </h2>
          <p className="text-slate-400">Extract specific portions of the DOM by providing a class or ID selector.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-900/50 border border-white/10 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">CSS Class</p>
              <code className="text-indigo-400 text-sm">/api/class?url=...&class=my-div</code>
            </div>
            <div className="p-4 bg-slate-900/50 border border-white/10 rounded-lg space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase">Element ID</p>
              <code className="text-indigo-400 text-sm">/api/id?url=...&id=header-01</code>
            </div>
          </div>
        </section>
        <section id="reference" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" /> Reference Table
          </h2>
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-900/20">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Endpoint Path</th>
                  <th className="px-6 py-4">Response Type</th>
                  <th className="px-6 py-4">Use Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">/api/proxy</td>
                  <td className="px-6 py-4 italic">Streaming (Raw)</td>
                  <td className="px-6 py-4">Direct resource loading, APIs, media streams.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">/api/json</td>
                  <td className="px-6 py-4">JSON (Full)</td>
                  <td className="px-6 py-4">Scraping, metadata previews, enrichment.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">/api/images</td>
                  <td className="px-6 py-4">JSON (Images)</td>
                  <td className="px-6 py-4">Gallery generation, asset discovery.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">/api/links</td>
                  <td className="px-6 py-4">JSON (Links)</td>
                  <td className="px-6 py-4">Crawler development, site mapping.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <footer className="pt-12 border-t border-white/5 text-center text-slate-600 text-xs tracking-widest uppercase">
          FluxGate Engine &bull; Path-Based Routing &bull; v2.1
        </footer>
      </div>
    </div>
  );
}