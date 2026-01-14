import React, { useState } from 'react';
import { Send, Loader2, Globe, Terminal, MousePointer2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeBlock } from '@/components/CodeBlock';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ApiResponse, ProxyResponse, ProxyFormat } from '@shared/types';
export function ProxyPlayground() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Cloudflare');
  const [format, setFormat] = useState<ProxyFormat | 'raw'>('raw');
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxyResponse | null>(null);
  const handleTest = async () => {
    if (!url) {
      toast.error('Enter a URL');
      return;
    }
    if ((format === 'class' || format === 'id') && !selector) {
      toast.error(`Please enter a ${format === 'class' ? 'CSS class name' : 'Element ID'}`);
      return;
    }
    setLoading(true);
    setResult(null);
    const startTimestamp = performance.now();
    try {
      const params = new URLSearchParams({ url });
      if (format !== 'raw') {
        params.append('format', format);
        if ((format === 'class' || format === 'id') && selector) {
          params.append(format, selector);
        }
      }
      const res = await fetch(`/api/proxy?${params.toString()}`);
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
          toast.error(data.error || 'Failed to fetch');
        }
      } else {
        const text = await res.text();
        setResult({
          url,
          format: format === 'raw' ? 'default' : (format as ProxyFormat),
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
    const encodedUrl = encodeURIComponent(url);
    const baseUrl = window.location.origin;
    if (format === 'raw') {
      return `// Raw streaming proxy\nfetch('${baseUrl}/api/proxy?url=${encodedUrl}')\n  .then(res => res.text())\n  .then(data => console.log("Proxied content:", data));`;
    }
    const selectorParam = (format === 'class' || format === 'id') ? `&${format}=${selector}` : '';
    return `// Extraction mode: ${format}\nfetch('${baseUrl}/api/proxy?url=${encodedUrl}&format=${format}${selectorParam}')\n  .then(res => res.json())\n  .then(json => console.log("Extracted data:", json.data));`;
  };
  const getOutputCode = () => {
    if (!result) return '';
    if (result.format === 'html' || (result.contents && !result.text && !result.images?.length && !result.links?.length)) {
       return result.contents || '';
    }
    if (result.format === 'text') return result.text || '';
    // Deep copy and clean for display
    const { contents, ...displayResult } = result;
    return JSON.stringify(displayResult, null, 2);
  };
  const getOutputLanguage = () => {
    if (result?.status.content_type.includes('html')) return 'html';
    if (result?.format === 'text') return 'text';
    return 'json';
  };
  return (
    <div className="w-full bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 space-y-6 border-b border-white/5 bg-slate-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-5 space-y-2">
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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Proxy Mode</label>
            <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat | 'raw')}>
              <SelectTrigger className="bg-slate-950 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="raw">Raw Streaming</SelectItem>
                <SelectItem value="json">JSON Metadata</SelectItem>
                <SelectItem value="text">Extract Text</SelectItem>
                <SelectItem value="images">Extract Images</SelectItem>
                <SelectItem value="links">Extract Links</SelectItem>
                <SelectItem value="class">CSS Selector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cn("transition-all duration-300 space-y-2", (format === 'class' || format === 'id') ? "lg:col-span-2 opacity-100" : "lg:col-span-0 w-0 opacity-0 overflow-hidden hidden")}>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Selector</label>
            <div className="relative">
              <MousePointer2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <Input
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="e.g. main-content"
                className="bg-slate-950 border-white/10 h-12 pl-9"
              />
            </div>
          </div>
          <div className={cn("space-y-2", (format === 'class' || format === 'id') ? "lg:col-span-2" : "lg:col-span-4")}>
            <Button onClick={handleTest} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-12 w-full font-bold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-transform">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {loading ? 'Fetching...' : 'Proxy Request'}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-950/50">
        <Tabs defaultValue="output" className="w-full">
          <TabsList className="bg-slate-900/80 border border-white/5 mb-6 p-1">
            <TabsTrigger value="output" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Response View</TabsTrigger>
            <TabsTrigger value="code" className="px-6 py-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-400">Implementation</TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="min-h-[400px] outline-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                <p className="text-sm font-medium animate-pulse">Streaming from Edge...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge label="Status" val={result.status.http_code} variant={result.status.http_code >= 400 ? 'error' : 'success'} />
                  <Badge label="Latency" val={`${result.status.response_time_ms}ms`} />
                  <Badge label="Format" val={format.toUpperCase()} />
                </div>
                {result.images && result.images.length > 0 && format === 'images' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {result.images.slice(0, 15).map((img, i) => (
                      <div key={i} className="aspect-square bg-slate-900 border border-white/10 rounded-lg overflow-hidden group relative">
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <a href={img} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-white bg-indigo-500 px-2 py-1 rounded">VIEW</a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <CodeBlock
                    language={getOutputLanguage()}
                    code={getOutputCode()}
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-600 border-2 border-dashed border-white/5 rounded-xl">
                <Terminal className="w-10 h-10 opacity-20 mb-4" />
                <p className="text-sm font-medium text-slate-500">Execute a request to see output</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code" className="outline-none">
            <div className="space-y-4">
              <p className="text-sm text-slate-400">Integrate this request into your application logic:</p>
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
    <div className={cn("px-3 py-1 border rounded-md flex items-center gap-2 transition-colors", styles[variant])}>
      <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{label}</span>
      <span className="text-xs font-mono font-bold">{val}</span>
    </div>
  );
}