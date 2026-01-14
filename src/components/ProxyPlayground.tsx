import React, { useState } from 'react';
import { Send, Loader2, Globe, Zap, Image as ImageIcon, Link as LinkIcon, Terminal } from 'lucide-react';
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
  const handleTest = async () => {
    if (!url) {
      toast.error('Enter a URL');
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
  const codeSnippet = `fetch('/api/proxy?url=${encodeURIComponent(url)}&format=${format}')
  .then(res => res.json())
  .then(console.log);`;
  return (
    <div className="w-full bg-slate-900/30 border border-white/10 rounded-xl overflow-hidden">
      <div className="p-6 md:p-8 space-y-6 border-b border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
          <div className="lg:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Target Endpoint</label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="bg-slate-950 border-white/10 h-12" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Protocol</label>
            <Select value={format} onValueChange={(v) => setFormat(v as ProxyFormat)}>
              <SelectTrigger className="bg-slate-950 border-white/10 h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="images">Images</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleTest} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 h-12 w-full font-bold">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
            {loading ? 'Executing...' : 'Run Proxy'}
          </Button>
        </div>
      </div>
      <div className="p-6 bg-slate-950/50">
        <Tabs defaultValue="output">
          <TabsList className="bg-slate-900 border border-white/5 mb-6">
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="code">Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-500" />
                <p className="text-sm font-medium">Fetching remote resources...</p>
              </div>
            ) : result ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-4">
                  <Badge label="Status" val={result.status.http_code} />
                  <Badge label="Type" val={result.status.content_type.split(';')[0]} />
                  <Badge label="Latency" val={`${result.status.response_time_ms}ms`} />
                </div>
                {format === 'images' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    {result.images?.slice(0, 12).map((img, i) => (
                      <div key={i} className="aspect-square bg-slate-900 border border-white/5 rounded-md overflow-hidden">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <CodeBlock language={format === 'json' ? 'json' : 'html'} code={format === 'json' ? JSON.stringify(result, null, 2) : (result.contents || '')} />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-slate-600 border-2 border-dashed border-white/5 rounded-lg">
                <Terminal className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Run a request to see output</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock language="javascript" code={codeSnippet} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function Badge({ label, val }: { label: string, val: string | number }) {
  return (
    <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-md flex items-center gap-2">
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
      <span className="text-xs font-mono text-indigo-400 font-bold">{val}</span>
    </div>
  );
}