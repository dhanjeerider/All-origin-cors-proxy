import React, { useState } from 'react';
import { Send, Loader2, Globe, Zap, Image as ImageIcon, Link as LinkIcon, Terminal, Code, Hash, MousePointer2 } from 'lucide-react';
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
  const [format, setFormat] = useState<ProxyFormat>('json');
  const [delay, setDelay] = useState(0);
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
    try {
      const params = new URLSearchParams({ url, format, delay: delay.toString() });
      if ((format === 'class' || format === 'id') && selector) {
        params.append(format, selector);
      }
      const res = await fetch(`/api/proxy?${params.toString()}`);
      const data = await res.json() as ApiResponse<ProxyResponse>;
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        toast.error(data.error || 'Failed to fetch');
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
    }
  };
  const codeSnippet = `fetch('/api/proxy?url=${encodeURIComponent(url)}&format=${format}${
    (format === 'class' || format === 'id') ? `&${format}=${encodeURIComponent(selector)}` : ''
  }')
  .then(res => res.json())
  .then(console.log);`;
  const getOutputCode = () => {
    if (!result) return '';
    if (format === 'html') return result.contents || '';
    if (format === 'text') return result.text || '';
    return JSON.stringify(result, null, 2);
  };
  const getOutputLanguage = () => {
    if (format === 'html') return 'html';
    if (format === 'text') return 'text';
    return 'json';
  };
  return (
    <div className="w-full bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
      <div className="p-6 md:p-8 space-y-6 border-b border-white/5 bg-slate-900/40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-5 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Target Endpoint</label>
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
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Mode</label>
            <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat)}>
              <SelectTrigger className="bg-slate-950 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON Metadata</SelectItem>
                <SelectItem value="html">Raw HTML</SelectItem>
                <SelectItem value="text">Plain Text</SelectItem>
                <SelectItem value="images">Extract Images</SelectItem>
                <SelectItem value="links">Extract Links</SelectItem>
                <SelectItem value="videos">Extract Videos</SelectItem>
                <SelectItem value="class">CSS Class Selector</SelectItem>
                <SelectItem value="id">Element ID Selector</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={cn("transition-all duration-300 space-y-2", (format === 'class' || format === 'id') ? "lg:col-span-2 opacity-100" : "lg:col-span-0 w-0 opacity-0 overflow-hidden hidden")}>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">
              {format === 'class' ? 'Class Name' : 'ID Name'}
            </label>
            <div className="relative">
              {format === 'class' ? <MousePointer2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" /> : <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />}
              <Input 
                value={selector} 
                onChange={(e) => setSelector(e.target.value)} 
                placeholder={format === 'class' ? 'e.g. main-content' : 'e.g. entry-id'} 
                className="bg-slate-950 border-white/10 h-12 pl-9" 
              />
            </div>
          </div>
          <div className={cn("space-y-2", (format === 'class' || format === 'id') ? "lg:col-span-2" : "lg:col-span-4")}>
            <Button onClick={handleTest} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-12 w-full font-bold shadow-lg shadow-indigo-500/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              {loading ? 'Processing...' : 'Execute Proxy'}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 bg-slate-950/50">
        <Tabs defaultValue="output" className="w-full">
          <TabsList className="bg-slate-900 border border-white/5 mb-6">
            <TabsTrigger value="output" className="px-6">Output</TabsTrigger>
            <TabsTrigger value="code" className="px-6">Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="min-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500" />
                <p className="text-sm font-medium animate-pulse">Bypassing CORS on the Edge...</p>
                <p className="text-xs text-slate-600 mt-2">Connecting to {new URL(url).hostname}</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Badge label="Status" val={result.status.http_code} variant={result.status.http_code >= 400 ? 'error' : 'success'} />
                  <Badge label="Type" val={result.status.content_type.split(';')[0]} />
                  <Badge label="Latency" val={`${result.status.response_time_ms}ms`} />
                  {result.title && <Badge label="Page Title" val={result.title.length > 20 ? result.title.substring(0, 20) + '...' : result.title} />}
                </div>
                {format === 'images' && result.images && result.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {result.images.slice(0, 15).map((img, i) => (
                      <div key={i} className="group relative aspect-square bg-slate-900 border border-white/10 rounded-lg overflow-hidden hover:border-indigo-500/50 transition-colors">
                        <img src={img} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(img, '_blank')}>
                            <ImageIcon className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (format === 'links' || format === 'videos') ? (
                  <div className="space-y-2 max-h-[400px] overflow-auto rounded-lg border border-white/5 p-4 bg-slate-900/50">
                    {((format === 'links' ? result.links : result.videos) || []).map((item, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors group">
                        {format === 'links' ? <LinkIcon className="w-3.5 h-3.5 text-indigo-400" /> : <ImageIcon className="w-3.5 h-3.5 text-purple-400" />}
                        <span className="text-xs font-mono text-slate-400 truncate flex-1">{item}</span>
                        <a href={item} target="_blank" rel="noreferrer" className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-500 font-bold uppercase">Open</a>
                      </div>
                    ))}
                    {(!result.links?.length && format === 'links') && <p className="text-center text-slate-600 py-8 text-sm">No links found</p>}
                    {(!result.videos?.length && format === 'videos') && <p className="text-center text-slate-600 py-8 text-sm">No video resources found</p>}
                  </div>
                ) : (
                  <CodeBlock 
                    language={getOutputLanguage()} 
                    code={getOutputCode()} 
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-slate-600 border-2 border-dashed border-white/5 rounded-xl bg-slate-900/20">
                <div className="p-4 rounded-full bg-slate-900/50 mb-4 border border-white/5">
                  <Terminal className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="text-sm font-bold text-slate-400">Ready for Execution</h3>
                <p className="text-xs max-w-[240px] text-center mt-2 text-slate-500 leading-relaxed">
                  Enter a target URL and select an extraction mode to see the proxied output.
                </p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code">
            <div className="space-y-4">
              <p className="text-sm text-slate-400 px-1">Integrate this request directly into your application:</p>
              <CodeBlock language="javascript" code={codeSnippet} />
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Base Endpoint</p>
                  <p className="text-xs font-mono text-slate-300 truncate">{window.location.origin}/api/proxy</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Auth Requirement</p>
                  <p className="text-xs font-mono text-slate-300">Public (No Key Needed)</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function Badge({ label, val, variant = 'default' }: { label: string, val: string | number, variant?: 'default' | 'success' | 'error' }) {
  const variantStyles = {
    default: "bg-white/5 border-white/10 text-indigo-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    error: "bg-red-500/10 border-red-500/20 text-red-400"
  };
  return (
    <div className={cn("px-3 py-1 border rounded-md flex items-center gap-2", variantStyles[variant])}>
      <span className="text-[10px] font-bold opacity-50 uppercase">{label}</span>
      <span className="text-xs font-mono font-bold">{val}</span>
    </div>
  );
}