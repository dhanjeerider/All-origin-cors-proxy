import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Globe, FileJson, Layout, Type, ChevronRight, Table, MousePointer2, Settings2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocsPage() {
  const origin = window.location.origin;
  const formats = [
    { id: 'json', name: 'JSON Metadata', desc: 'Returns an object with full content, headers, latency, and extraction arrays.' },
    { id: 'html', name: 'Raw HTML', desc: 'Returns the original HTML stream with all CORS headers injected.' },
    { id: 'text', name: 'Plain Text', desc: 'Returns the text content of the page, stripped of all HTML and script tags.' },
    { id: 'images', name: 'Media Resolve', desc: 'Returns a list of absolute URLs for all images found on the target.' },
    { id: 'links', name: 'Link Resolve', desc: 'Returns a list of all hyperlinks found, resolved against the base URL.' },
    { id: 'videos', name: 'Video Map', desc: 'Returns a list of source URLs from <video> and <source> elements.' },
    { id: 'class', name: 'CSS Selector', desc: 'Returns specific DOM fragments matching a provided CSS class name.' },
    { id: 'id', name: 'ID Selector', desc: 'Returns a specific DOM element matching a provided unique ID.' },
  ];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-20">
        <header className="space-y-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to FluxGate
            </Button>
          </Link>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                <Zap className="w-8 h-8 text-indigo-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">API Documentation</h1>
            </div>
            <p className="text-xl text-slate-400 max-w-3xl">
              Understand how to leverage the FluxGate engine for cross-origin data fetching and intelligent DOM extraction.
            </p>
          </div>
        </header>
        <section id="quickstart" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-indigo-500" /> Getting Started
          </h2>
          <div className="prose prose-invert max-w-none text-slate-400">
            <p>To use the proxy, simply prepend your target URL to our API endpoint. Always ensure the target URL is URI encoded to prevent query parameter collisions.</p>
          </div>
          <CodeBlock
            language="javascript"
            code={`// Correct usage with URI encoding
const target = encodeURIComponent('https://api.github.com/users/octocat');
const apiUrl = \`${origin}/api/proxy?url=\${target}&format=json\`;
const data = await fetch(apiUrl).then(r => r.json());
console.log(data.status.http_code); // 200`}
          />
        </section>
        <section id="selectors" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MousePointer2 className="w-5 h-5 text-indigo-500" /> Smart Selectors
          </h2>
          <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              FluxGate uses a high-performance <strong>HTMLRewriter</strong> running on the Cloudflare Edge. This allows you to extract specific parts of a page without downloading the entire payload to your client.
            </p>
            <CodeBlock 
              language="bash"
              code={`# Extract all elements with class "article-body"
curl "${origin}/api/proxy?url=https://example.com&format=class&class=article-body"`}
            />
          </div>
        </section>
        <section id="reference" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-indigo-500" /> Query Parameters
          </h2>
          <div className="overflow-x-auto border border-white/10 rounded-xl bg-slate-900/20">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Key</th>
                  <th className="px-6 py-4">Value</th>
                  <th className="px-6 py-4">Required</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">url</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 text-emerald-500 font-bold">Yes</td>
                  <td className="px-6 py-4">The absolute URL of the target resource.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">format</td>
                  <td className="px-6 py-4">enum</td>
                  <td className="px-6 py-4 italic">No</td>
                  <td className="px-6 py-4">Extraction mode: json, html, text, images, links, videos, class, id.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">class</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 italic">Cond.</td>
                  <td className="px-6 py-4">Required if format is 'class'. The CSS class to target.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">id</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4 italic">Cond.</td>
                  <td className="px-6 py-4">Required if format is 'id'. The Element ID to target.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400 font-bold">delay</td>
                  <td className="px-6 py-4">number</td>
                  <td className="px-6 py-4 italic">No</td>
                  <td className="px-6 py-4">Seconds to wait before fetching (0-10) for testing latency.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="formats" className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-500" /> Response Formats
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map(f => (
              <div key={f.id} className="p-6 bg-slate-900/40 border border-white/5 rounded-xl hover:border-indigo-500/30 transition-colors group">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-white group-hover:text-indigo-400 transition-colors">{f.name}</span>
                  <code className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">?format={f.id}</code>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
        <section id="security" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-500" /> Security & Privacy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200">SSL Always</h4>
              <p className="text-xs text-slate-500">FluxGate only proxies over HTTPS, ensuring data integrity from edge to client.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200">No Logs</h4>
              <p className="text-xs text-slate-500">We do not store request bodies or URL history beyond anonymous global statistics.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-slate-200">Sanitization</h4>
              <p className="text-xs text-slate-500">Potentially dangerous headers like Cookie and Set-Cookie are stripped by default.</p>
            </div>
          </div>
        </section>
        <footer className="pt-12 border-t border-white/5 text-center">
          <p className="text-slate-600 text-xs tracking-widest uppercase">FluxGate Documentation &bull; v2.0 Production</p>
        </footer>
      </div>
    </div>
  );
}