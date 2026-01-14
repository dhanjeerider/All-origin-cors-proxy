import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Globe, Zap, Image as ImageIcon, Link as LinkIcon, Video, FileText, Code, List, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { CodeBlock } from '@/components/CodeBlock';
import { toast } from 'sonner';
import type { ApiResponse, ProxyResponse, ProxyFormat } from '@shared/types';
export function ProxyPlayground() {
  const [url, setUrl] = useState('https://en.wikipedia.org/wiki/Cloudflare');
  const [format, setFormat] = useState<ProxyFormat>('json');
  const [delay, setDelay] = useState(0);
  const [selector, setSelector] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxyResponse | null>(null);
  const [countdown, setCountdown] = useState(0);
  useEffect(() => {
    let timer: number;
    if (loading && countdown > 0) {
      timer = window.setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [loading, countdown]);
  const handleTest = async () => {
    if (!url) {
      toast.error('Please enter a target URL');
      return;
    }
    setLoading(true);
    setCountdown(delay);
    setResult(null);
    try {
      const params = new URLSearchParams({
        url: url, // URLSearchParams automatically handles encoding
        format: format,
        delay: delay.toString()
      });
      if ((format === 'class' || format === 'id') && selector) {
        params.append(format, selector);
      }
      const res = await fetch(`/api/proxy?${params.toString()}`);
      const data = await res.json() as ApiResponse<ProxyResponse>;
      if (data.success && data.data) {
        setResult(data.data);
        toast.success(`Success! Handled in ${data.data.status.response_time_ms}ms`);
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (err) {
      toast.error('Connection to FluxGate failed');
    } finally {
      setLoading(false);
      setCountdown(0);
    }
  };
  const codeSnippet = `/**
 * FluxGate API Integration Example
 * Note: Browser fetch() handles encoding when using URLSearchParams.
 */
const api = new URL('/api/proxy', window.location.origin);
const target = '${url}';
api.searchParams.set('url', target);
api.searchParams.set('format', '${format}');
${delay > 0 ? `api.searchParams.set('delay', '${delay}');` : ''}
${selector ? `api.searchParams.set('${format}', '${selector}');` : ''}
fetch(api)
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      console.log('Proxied Content:', data.data);
    }
  })
  .catch(err => console.error('Proxy Error:', err));`;
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <div className="glass rounded-3xl p-6 md:p-8 space-y-6 relative border-white/10 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Target URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-900/50 border-white/10 h-12 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Extraction Mode</label>
                <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat)}>
                  <SelectTrigger className="bg-slate-900/50 border-white/10 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="json">Full JSON Metadata</SelectItem>
                    <SelectItem value="html">Raw HTML Content</SelectItem>
                    <SelectItem value="text">Clean Plain Text</SelectItem>
                    <SelectItem value="images">Image Gallery</SelectItem>
                    <SelectItem value="links">Link Extractor</SelectItem>
                    <SelectItem value="videos">Video Sources</SelectItem>
                    <SelectItem value="class">CSS Class Selector</SelectItem>
                    <SelectItem value="id">Element ID Selector</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Lazy Delay</label>
                   <span className="text-xs font-mono text-indigo-400">{delay}s</span>
                </div>
                <div className="pt-4 px-2">
                  <Slider value={[delay]} onValueChange={([v]) => setDelay(v)} max={10} step={1} />
                </div>
              </div>
            </div>
            {(format === 'class' || format === 'id') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  {format === 'class' ? 'Class Name (e.g. content-body)' : 'Element ID (e.g. article-main)'}
                </label>
                <Input
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder={format === 'class' ? 'Enter class name' : 'Enter element ID'}
                  className="bg-slate-900/50 border-white/10 h-12"
                />
              </motion.div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col justify-end gap-4">
             <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-xs text-indigo-300 leading-relaxed italic">
              "Switch to <strong>Image Gallery</strong> mode to automatically extract and resolve all visual assets from the target page."
             </div>
             <Button
              onClick={handleTest}
              disabled={loading}
              className="h-16 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:scale-[1.01] active:scale-[0.98] transition-all text-lg font-bold shadow-xl shadow-indigo-500/20"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>{countdown > 0 ? `Waiting ${countdown}s...` : 'Processing...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 fill-white/20" />
                  <span>Execute Proxy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-white/5 p-1">
            <TabsTrigger value="preview" className="data-[state=active]:bg-indigo-500/20">Data View</TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-indigo-500/20">Developer Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox icon={<ImageIcon className="w-4 h-4" />} label="Images" value={result.images?.length || 0} />
                    <StatBox icon={<LinkIcon className="w-4 h-4" />} label="Links" value={result.links?.length || 0} />
                    <StatBox icon={<Video className="w-4 h-4" />} label="Videos" value={result.videos?.length || 0} />
                    <StatBox icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Latency" value={`${result.status?.response_time_ms ?? 0}ms`} />
                  </div>
                  {format === 'images' && result.images && result.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                      {result.images.slice(0, 24).map((img, i) => (
                        <div key={i} className="aspect-square rounded-xl overflow-hidden border border-white/5 bg-slate-900 group relative shadow-lg">
                          <img
                            src={img}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/0f172a/38bdf8?text=Blocked+by+CORS';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                             <span className="text-[8px] font-mono text-white truncate w-full">{img.split('/').pop()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {format === 'links' && result.links && result.links.length > 0 && (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                      {result.links.map((link, i) => (
                        <div key={i} className="px-3 py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-mono truncate text-indigo-400 hover:bg-white/10 transition-colors">
                          {link}
                        </div>
                      ))}
                    </div>
                  )}
                  {(['json', 'html', 'class', 'id'].includes(format)) && (
                     <CodeBlock
                        language={format === 'json' ? 'json' : 'html'}
                        code={
                          format === 'json' 
                            ? JSON.stringify(result, null, 2) 
                            : (format === 'class' || format === 'id') && result.extractedElements?.length
                              ? JSON.stringify(result.extractedElements, null, 2)
                              : (result.contents || 'No content found.')
                        }
                        className="max-h-[500px]"
                     />
                  )}
                  {format === 'text' && (
                    <div className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl text-sm leading-relaxed text-slate-300 max-h-[400px] overflow-y-auto whitespace-pre-wrap font-sans shadow-inner">
                      {result.text || "No text content extracted."}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-3xl text-slate-500 gap-4 bg-slate-900/20">
                  <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/5 shadow-inner">
                    <Globe className="w-12 h-12 opacity-20 text-indigo-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-slate-300">Ready for processing</p>
                    <p className="text-sm opacity-60">Enter a URL above to test the proxy engine</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="code" className="mt-6">
            <CodeBlock language="javascript" code={codeSnippet} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function StatBox({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/[0.08] transition-all hover:border-indigo-500/20 group">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">
        {icon}
        {label}
      </div>
      <div className="text-xl font-mono font-bold text-white tracking-tight">{value}</div>
    </div>
  );
}