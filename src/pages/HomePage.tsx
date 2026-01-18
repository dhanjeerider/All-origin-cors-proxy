import React, { useState } from 'react';
export function HomePage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stealth, setStealth] = useState(false);
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
      setResult({ error: 'Failed to fetch proxy data' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-10 lg:py-12 space-y-8 font-sans text-slate-900 dark:text-slate-100">
        <header className="border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">FluxGate</h1>
          <p className="text-slate-500">Minimalist CORS Proxy Utility</p>
        </header>
        <section className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Target URL</label>
            <input
              type="text"
              placeholder="https://example.com"
              className="w-full p-4 rounded-lg border bg-white dark:bg-slate-800 text-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={() => handleProxy('json')}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Extract as JSON'}
            </button>
            <button
              onClick={() => handleProxy('html')}
              disabled={loading}
              className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
            >
              Proxy as Raw HTML
            </button>
            <label className="flex items-center gap-2 cursor-pointer select-none ml-auto">
              <input 
                type="checkbox" 
                checked={stealth} 
                onChange={(e) => setStealth(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium">Enable Stealth (Delay + UA Rotation)</span>
            </label>
          </div>
        </section>
        {result && (
          <section className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h2 className="text-xl font-bold">Extraction Result</h2>
            <div className="rounded-lg border bg-slate-950 p-6 overflow-auto max-h-[500px]">
              <pre className="text-emerald-400 font-mono text-sm">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </section>
        )}
        <section className="pt-12 border-t">
          <h3 className="text-lg font-bold mb-4">Quick Integration</h3>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <code>
              fetch('{window.location.origin}/api/proxy?url=YOUR_URL_HERE')<br/>
              &nbsp;&nbsp;.then(res =&gt; res.json())<br/>
              &nbsp;&nbsp;.then(data =&gt; console.log(data));
            </code>
          </div>
        </section>
        <footer className="text-center text-slate-400 text-xs pt-12">
          FluxGate Minimal v3.0 • Built for Performance & Portability
        </footer>
      </div>
    </div>
  );
}