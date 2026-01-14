import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Globe, ShieldCheck, Zap, Image as ImageIcon, Link as LinkIcon, Video, FileText, Code, List } from 'lucide-react';
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
        url: encodeURIComponent(url),
        format: format,
        delay: delay.toString()
      });
      if (format === 'class') params.append('class', selector);
      if (format === 'id') params.append('id', selector);
      const res = await fetch(`/api/proxy?${params.toString()}`);
      const data = await res.json() as ApiResponse<ProxyResponse>;
      if (data.success && data.data) {
        setResult(data.data);
        toast.success(`Extracted ${format} successfully!`);
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
      setCountdown(0);
    }
  };
  const codeSnippet = `// FluxGate Advanced Extraction
const target = encodeURIComponent('${url}');
const api = \`https://fluxgate.pages.dev/api/proxy?url=\${target}&format=${format}${delay > 0 ? `&delay=${delay}` : ''}${selector ? `&${format === 'class' ? 'class' : 'id'}=${selector}` : ''}\`;
fetch(api)
  .then(res => res.json())
  .then(data => console.log(data.data));`;
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass rounded-3xl p-6 md:p-8 space-y-6 relative border-white/10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Target URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="bg-slate-900/50 border-white/10 h-12 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Extraction Mode</label>
                <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat)}>
                  <SelectTrigger className="bg-slate-900/50 border-white/10 h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-white/10">
                    <SelectItem value="json">Full JSON</SelectItem>
                    <SelectItem value="html">Raw HTML</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="links">Links</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="class">CSS Class</SelectItem>
                    <SelectItem value="id">Element ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">Lazy Delay ({delay}s)</label>
                <div className="pt-4 px-2">
                  <Slider value={[delay]} onValueChange={([v]) => setDelay(v)} max={10} step={1} />
                </div>
              </div>
            </div>
            {(format === 'class' || format === 'id') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
                  {format === 'class' ? 'Class Name (e.g. post-card)' : 'Element ID (e.g. main-content)'}
                </label>
                <Input
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder={format === 'class' ? 'Enter class' : 'Enter ID'}
                  className="bg-slate-900/50 border-white/10 h-12"
                />
              </motion.div>
            )}
          </div>
          <div className="lg:col-span-5 flex flex-col justify-end gap-4">
             <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4 text-xs text-indigo-300 leading-relaxed italic">
              "Use JSON for full metadata, or specific formats like Images to get clean arrays instantly."
             </div>
             <Button
              onClick={handleTest}
              disabled={loading}
              className="h-16 w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 hover:scale-[1.02] transition-transform text-lg font-bold shadow-xl shadow-indigo-500/20"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>{countdown > 0 ? `Waiting ${countdown}s...` : 'Extracting...'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <span>Execute Flux Proxy</span>
                </div>
              )}
            </Button>
          </div>
        </div>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-white/5">
            <TabsTrigger value="preview">Visual Data</TabsTrigger>
            <TabsTrigger value="code">Integration Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="mt-6 min-h-[400px]">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatBox icon={<ImageIcon className="w-4 h-4" />} label="Images" value={result.images?.length || 0} />
                    <StatBox icon={<LinkIcon className="w-4 h-4" />} label="Links" value={result.links?.length || 0} />
                    <StatBox icon={<Video className="w-4 h-4" />} label="Videos" value={result.videos?.length || 0} />
                    <StatBox icon={<Zap className="w-4 h-4" />} label="Latency" value={`${result.status.response_time_ms}ms`} />
                  </div>
                  {format === 'images' && result.images && (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                      {result.images.slice(0, 18).map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/5 bg-slate-900 group relative">
                          <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                        </div>
                      ))}
                    </div>
                  )}
                  {format === 'links' && result.links && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      {result.links.map((link, i) => (
                        <div key={i} className="px-3 py-2 bg-white/5 border border-white/5 rounded text-xs font-mono truncate text-blue-400">
                          {link}
                        </div>
                      ))}
                    </div>
                  )}
                  {(format === 'json' || format === 'html' || format === 'class' || format === 'id') && (
                     <CodeBlock
                        language={format === 'json' ? 'json' : 'html'}
                        code={format === 'json' ? JSON.stringify(result, null, 2) : (result.contents || '')}
                        className="max-h-[400px]"
                     />
                  )}
                  {format === 'text' && (
                    <div className="p-4 bg-slate-900/50 border border-white/5 rounded-xl text-sm leading-relaxed text-slate-300 max-h-[400px] overflow-y-auto whitespace-pre-wrap font-sans">
                      {result.text}
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl text-slate-500 gap-4">
                  <div className="p-4 rounded-full bg-slate-900/50 border border-white/5">
                    <Globe className="w-12 h-12 opacity-20" />
                  </div>
                  <p className="font-medium">Ready for your first request</p>
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
    <div className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:bg-white/[0.07] transition-colors">
      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
        {icon}
        {label}
      </div>
      <div className="text-xl font-mono font-bold text-white">{value}</div>
    </div>
  );
}