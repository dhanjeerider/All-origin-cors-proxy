import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Globe, Zap, Image as ImageIcon, Link as LinkIcon, Video, FileText, Code, List, Sparkles, Terminal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
        url: url,
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
        toast.success(`Request Complete: ${data.data.status.response_time_ms}ms`);
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (err) {
      toast.error('Connection failed');
    } finally {
      setLoading(false);
      setCountdown(0);
    }
  };
  const codeSnippet = `const api = new URL('/api/proxy', window.location.origin);
api.searchParams.set('url', '${url}');
api.searchParams.set('format', '${format}');
${delay > 0 ? `api.searchParams.set('delay', '${delay}');` : ''}${selector ? `api.searchParams.set('${format}', '${selector}');` : ''}
fetch(api)
  .then(res => res.json())
  .then(data => console.log('FluxGate Result:', data))
  .catch(err => console.error('Proxy Error:', err));`;
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="glass-neon rounded-[2.5rem] p-4 sm:p-8 lg:p-10 space-y-8 relative overflow-hidden">
        {/* Input Control Center */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                <Globe className="w-3 h-3 text-sky-400" /> Target Endpoint
              </label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-900/50 border-white/10 h-14 rounded-2xl text-white placeholder:text-slate-600 focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">Extraction Protocol</label>
                <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat)}>
                  <SelectTrigger className="bg-slate-900/50 border-white/10 h-14 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/20 rounded-2xl">
                    <SelectItem value="json">JSON Metadata</SelectItem>
                    <SelectItem value="html">Raw Stream (HTML)</SelectItem>
                    <SelectItem value="text">Content (Text Only)</SelectItem>
                    <SelectItem value="images">Visual (Images)</SelectItem>
                    <SelectItem value="links">Navigation (Links)</SelectItem>
                    <SelectItem value="class">Scoped (Class)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Artificial Delay</label>
                   <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">{delay}s</span>
                </div>
                <div className="pt-5 px-2">
                  <Slider value={[delay]} onValueChange={([v]) => setDelay(v)} max={10} step={1} />
                </div>
              </div>
            </div>
            <AnimatePresence>
              {(format === 'class' || format === 'id') && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }} 
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="space-y-3"
                >
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] px-1">
                    CSS Target Selector
                  </label>
                  <Input
                    value={selector}
                    onChange={(e) => setSelector(e.target.value)}
                    placeholder={format === 'class' ? 'e.g. main-content' : 'e.g. #article-body'}
                    className="bg-slate-900/50 border-white/10 h-14 rounded-2xl"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="lg:col-span-5 h-full">
             <Button
              onClick={handleTest}
              disabled={loading}
              className="h-16 lg:h-full w-full bg-gradient-to-r from-indigo-600 to-sky-500 hover:scale-[1.02] active:scale-[0.98] transition-all text-xl font-black rounded-2xl shadow-[0_0_30px_rgba(79,70,229,0.3)] group overflow-hidden"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>{countdown > 0 ? `EDGE DELAY: ${countdown}s` : 'INTERCEPTING...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6 fill-white group-hover:scale-125 transition-transform" />
                  <span>Execute Proxy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        {/* Output Console */}
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="w-full sm:w-auto bg-slate-900/80 p-1.5 rounded-2xl border border-white/5">
            <TabsTrigger value="preview" className="rounded-xl px-8 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Data View</TabsTrigger>
            <TabsTrigger value="code" className="rounded-xl px-8 data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-8 min-h-[450px]">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="h-[450px] relative overflow-hidden rounded-3xl bg-slate-900/50 flex flex-col items-center justify-center border border-white/5"
                >
                  <motion.div 
                    animate={{ y: ["-100%", "100%"] }} 
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent pointer-events-none" 
                  />
                  <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                  <p className="text-slate-400 font-mono text-sm tracking-widest uppercase animate-pulse">Scanning Remote Host...</p>
                </motion.div>
              ) : result ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatBox icon={<ImageIcon className="w-4 h-4" />} label="Assets" value={result.images?.length || 0} color="text-sky-400" />
                    <StatBox icon={<LinkIcon className="w-4 h-4" />} label="Nodes" value={result.links?.length || 0} color="text-indigo-400" />
                    <StatBox icon={<Terminal className="w-4 h-4" />} label="Format" value={result.format.toUpperCase()} color="text-purple-400" />
                    <StatBox icon={<Zap className="w-4 h-4" />} label="Latency" value={`${result.status?.response_time_ms}ms`} color="text-emerald-400" />
                  </div>
                  {format === 'images' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      {result.images?.slice(0, 18).map((img, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, scale: 0.9 }} 
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="aspect-square rounded-2xl overflow-hidden border border-white/10 bg-slate-900 group relative cursor-zoom-in"
                        >
                          <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" onError={(e) => (e.currentTarget.src = 'https://placehold.co/400?text=CORS+Blocked')} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <CodeBlock 
                      language={format === 'json' ? 'json' : 'html'} 
                      code={format === 'json' ? JSON.stringify(result, null, 2) : (result.contents || 'No raw content.')} 
                      className="max-h-[500px]"
                    />
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-[450px] rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 gap-4 bg-slate-900/20"
                >
                  <div className="p-6 rounded-full bg-slate-900/80 border border-white/10">
                    <Terminal className="w-10 h-10 opacity-30 text-indigo-500" />
                  </div>
                  <div className="text-center">
                    <p className="font-black text-slate-300 text-lg uppercase tracking-widest">Awaiting Command</p>
                    <p className="text-sm opacity-60">Enter a target URL to initiate edge interception</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="code" className="mt-8">
            <div className="space-y-4">
              <p className="text-sm text-slate-400 px-1">Universal implementation snippet using native Fetch API:</p>
              <CodeBlock language="javascript" code={codeSnippet} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function StatBox({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="glass-neon rounded-2xl p-4 flex flex-col gap-1 border-white/5 group hover:border-white/20 transition-all">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className={cn("text-xl font-mono font-black tracking-tight", color)}>{value}</div>
    </div>
  );
}