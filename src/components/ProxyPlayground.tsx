import React, { useState } from 'react';
import { Send, Loader2, Globe, Terminal, MousePointer2, Zap, Copy, ExternalLink, Check, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from '@/components/CodeBlock';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ApiResponse, ProxyResponse, ProxyFormat } from '@shared/types';
type PlaygroundEndpoint = 'proxy' | ProxyFormat;
export function ProxyPlayground() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Cloudflare');
  const [endpoint, setEndpoint] = useState<PlaygroundEndpoint>('proxy');
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxyResponse | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const getFullApiUrl = () => {
    const origin = window.location.origin;
    const params = new URLSearchParams({ url });
    if (endpoint === 'class' && selector) params.append('class', selector);
    if (endpoint === 'id' && selector) params.append('id', selector);
    return `${origin}/api/${endpoint}?${params.toString()}`;
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getFullApiUrl());
      setCopiedLink(true);
      toast.success('Direct API link copied');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };
  const handleCopyJson = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopiedJson(true);
      toast.success('Response JSON copied');
      setTimeout(() => setCopiedJson(false), 2000);
    } catch (err) {
      toast.error('Failed to copy JSON');
    }
  };
  const handleTest = async () => {
    if (!url) {
      toast.error('Enter a target URL');
      return;
    }
    if ((endpoint === 'class' || endpoint === 'id') && !selector) {
      toast.error(`Please provide a ${endpoint === 'class' ? 'class name' : 'element ID'}`);
      return;
    }
    setLoading(true);
    setResult(null);
    const startTimestamp = performance.now();
    try {
      const apiUrl = getFullApiUrl();
      const res = await fetch(apiUrl);
      const contentType = res.headers.get('content-type') || '';
      const clientLatency = Math.round(performance.now() - startTimestamp);
      if (contentType.includes('application/json')) {
        const data = await res.json() as ApiResponse<ProxyResponse>;
        if (data.success && data.data) {
          setResult({
            ...data.data,
            status: { ...data.data.status, response_time_ms: clientLatency }
          });
        } else {
          toast.error(data.error || 'Request failed');
        }
      } else {
        const text = await res.text();
        setResult({
          url,
          format: 'default',
          contents: text,
          status: {
            url,
            content_type: contentType,
            http_code: res.status,
            response_time_ms: clientLatency
          }
        });
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };
  const getCodeSnippet = () => {
    const origin = window.location.origin;
    const isRaw = endpoint === 'proxy';
    return `/**
 * FluxGate Edge Proxy Implementation
 * High-performance ${endpoint} extraction
 */
const target = encodeURIComponent('${url}');
const fluxGateUrl = \`${origin}/api/${endpoint}?url=\${target}${(endpoint === 'class' || endpoint === 'id') ? `&${endpoint}=${selector}` : ''}\`;
fetch(fluxGateUrl)
  .then(res => ${isRaw ? 'res.text()' : 'res.json()'})
  .then(data => {
    // Process your proxied data here
    console.log('Success:', data);
  })
  .catch(err => console.error('FluxGate Error:', err));`;
  };
  const getOutputCode = () => {
    if (!result) return '';
    if (endpoint === 'proxy') return result.contents || '';
    const { contents, ...display } = result;
    return JSON.stringify(display, null, 2);
  };
  return (
    <div className="w-full bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden shadow-2xl transition-all duration-500">
      <div className="p-6 md:p-8 space-y-6 border-b border-white/5 bg-slate-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-4 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Target URL</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="bg-slate-950 border-white/10 h-12 pl-10 focus:ring-indigo-500/50"
              />
            </div>
          </div>
          <div className="lg:col-span-3 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Endpoint Mode</label>
            <Select value={endpoint} onValueChange={(v) => setEndpoint(v as PlaygroundEndpoint)}>
              <SelectTrigger className="bg-slate-950 border-white/10 h-12 font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="proxy">Raw Streaming</SelectItem>
                <SelectItem value="json">Full Metadata</SelectItem>
                <SelectItem value="text">Clean Text</SelectItem>
                <SelectItem value="images">Image Assets</SelectItem>
                <SelectItem value="videos">Video Assets</SelectItem>
                <SelectItem value="links">Link Graph</SelectItem>
                <SelectItem value="class">Class Selector</SelectItem>
                <SelectItem value="id">ID Selector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {(endpoint === 'class' || endpoint === 'id') && (
            <div className="lg:col-span-2 space-y-2 animate-in fade-in slide-in-from-left-2 duration-300">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
                {endpoint === 'class' ? 'CSS Class' : 'Element ID'}
              </label>
              <div className="relative">
                <MousePointer2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <Input value={selector} onChange={(e) => setSelector(e.target.value)} placeholder={endpoint === 'class' ? "article-content" : "main"} className="bg-slate-950 border-white/10 h-12 pl-9" />
              </div>
            </div>
          )}
          <div className={cn("space-y-2 flex gap-2 items-end", (endpoint === 'class' || endpoint === 'id') ? "lg:col-span-3" : "lg:col-span-5")}>
            <Button onClick={handleTest} disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-12 font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2 fill-current" />}
              {loading ? 'Fetching...' : 'Proxy Request'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 border-white/10 bg-slate-950 hover:bg-white/5"
              onClick={handleCopyLink}
              title="Copy endpoint URL"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </Button>
            <a href={getFullApiUrl()} target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                size="icon"
                className="h-12 w-12 border-white/10 bg-slate-950 hover:bg-white/5"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </a>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-950/50">
        <Tabs defaultValue="output" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList className="bg-slate-900/80 border border-white/5 p-1">
              <TabsTrigger value="output" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Response</TabsTrigger>
              <TabsTrigger value="code" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Snippet</TabsTrigger>
            </TabsList>
            {result && (
              <Button variant="ghost" size="sm" onClick={handleCopyJson} className="text-slate-500 hover:text-indigo-400 gap-2">
                {copiedJson ? <Check className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">Copy JSON</span>
              </Button>
            )}
          </div>
          <TabsContent value="output" className="min-h-[400px] outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mb-4" />
                  <div className="absolute inset-0 bg-indigo-500/20 blur-xl animate-pulse" />
                </div>
                <p className="text-sm font-medium animate-pulse">Routing through Cloudflare Edge...</p>
              </div>
            ) : result ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex flex-wrap gap-2">
                  <Badge label="Endpoint" val={`/api/${endpoint}`} />
                  <Badge label="Status" val={result.status.http_code} variant={result.status.http_code >= 400 ? 'error' : 'success'} />
                  <Badge label="Edge Latency" val={`${result.status.response_time_ms}ms`} />
                  <Badge label="Type" val={result.status.content_type.split(';')[0]} />
                </div>
                <CodeBlock language={endpoint === 'proxy' ? 'html' : 'json'} code={getOutputCode()} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-600 border-2 border-dashed border-white/5 rounded-xl">
                <Terminal className="w-12 h-12 opacity-10 mb-4" />
                <p className="text-sm font-medium opacity-40">Ready to proxy. Paste a URL to begin.</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code" className="outline-none">
            <div className="space-y-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-widest px-1">Production Integration</p>
              <CodeBlock language="javascript" code={getCodeSnippet()} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function Badge({ label, val, variant = 'default' }: { label: string, val: string | number, variant?: 'default' | 'success' | 'error' }) {
  const styles = {
    default: "bg-white/5 border-white/10 text-indigo-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400"
  };
  return (
    <div className={cn("px-3 py-1.5 border rounded-md flex items-center gap-2 max-w-full overflow-hidden transition-colors", styles[variant])}>
      <span className="text-[9px] font-bold opacity-60 uppercase tracking-widest shrink-0">{label}</span>
      <span className="text-xs font-mono font-bold truncate">{val}</span>
    </div>
  );
}