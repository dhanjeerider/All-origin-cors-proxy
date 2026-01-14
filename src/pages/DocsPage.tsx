import React from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { Zap, ArrowLeft, Globe, FileJson, Layout, Type, ChevronRight, Table } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function DocsPage() {
  const origin = window.location.origin;
  const formats = [
    { id: 'json', name: 'JSON Metadata', desc: 'Full object with content, headers, and status.' },
    { id: 'html', name: 'Raw HTML', desc: 'Direct stream with CORS headers injected.' },
    { id: 'text', name: 'Plain Text', desc: 'Stripped content with no HTML tags.' },
    { id: 'images', name: 'Media Map', desc: 'List of all absolute image URLs.' },
    { id: 'links', name: 'Hyperlinks', desc: 'List of all resolved link addresses.' },
  ];
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans">
      <ThemeToggle />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-16">
        <header className="space-y-6">
          <Link to="/">
            <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <Zap className="w-10 h-10 text-indigo-500" />
            <h1 className="text-4xl font-bold tracking-tight">API Documentation</h1>
          </div>
        </header>
        <section id="quickstart" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ChevronRight className="w-5 h-5 text-indigo-500" /> Quickstart
          </h2>
          <p className="text-slate-400">Prepend your target URL to our proxy endpoint. Use URI encoding for safety.</p>
          <CodeBlock
            language="javascript"
            code={`const target = encodeURIComponent('https://example.com');
const url = \`${origin}/api/proxy?url=\${target}&format=json\`;
fetch(url)
  .then(res => res.json())
  .then(console.log);`}
          />
        </section>
        <section id="reference" className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-500" /> API Reference
          </h2>
          <div className="overflow-x-auto border border-white/10 rounded-lg">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-white/5 text-slate-300 font-bold uppercase text-[10px] tracking-widest">
                <tr>
                  <th className="px-6 py-4">Parameter</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Required</th>
                  <th className="px-6 py-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-400">
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400">url</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4">Yes</td>
                  <td className="px-6 py-4">The target URL to proxy.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400">format</td>
                  <td className="px-6 py-4">string</td>
                  <td className="px-6 py-4">No</td>
                  <td className="px-6 py-4">Extraction mode (json, html, text, images, links).</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-mono text-indigo-400">delay</td>
                  <td className="px-6 py-4">number</td>
                  <td className="px-6 py-4">No</td>
                  <td className="px-6 py-4">Artificial delay in seconds (0-10).</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <section id="formats" className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" /> Response Modes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formats.map(f => (
              <div key={f.id} className="p-6 bg-white/5 border border-white/10 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{f.name}</span>
                  <code className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded">format={f.id}</code>
                </div>
                <p className="text-sm text-slate-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}