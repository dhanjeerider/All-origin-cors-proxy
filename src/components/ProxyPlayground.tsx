import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Globe, ShieldCheck, Zap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CodeBlock } from '@/components/CodeBlock';
import { toast } from 'sonner';
import type { ApiResponse, ProxyResponse } from '@shared/types';
export function ProxyPlayground() {
  const [url, setUrl] = useState('https://api.github.com/zen');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProxyResponse | null>(null);
  const [mode, setMode] = useState<'proxy' | 'raw'>('proxy');
  const handleTest = async () => {
    if (!url) {
      toast.error('Please enter a target URL');
      return;
    }
    setLoading(true);
    try {
      const encoded = encodeURIComponent(url);
      const res = await fetch(`/api/proxy?url=${encoded}`);
      const data = await res.json() as ApiResponse<ProxyResponse>;
      if (data.success && data.data) {
        setResult(data.data);
        toast.success('Request successful!');
      } else {
        toast.error(data.error || 'Request failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };
  const integrationSnippet = `fetch('https://fluxgate.pages.dev/api/${mode}?url=' + encodeURIComponent('${url}'))
  .then(res => res.${mode === 'proxy' ? 'json()' : 'text()'})
  .then(data => console.log(data));`;

  const displayData = useMemo(() => {
    if (!result || !result.status) return null;
    const ct = result.status.content_type?.toLowerCase().split(';')[0] || 'text/plain';
    let lang = 'plaintext';
    if (ct.includes('application/json') || ct.includes('json')) lang = 'json';
    else if (ct.includes('text/html')) lang = 'html';
    else if (ct.includes('application/xml') || ct.includes('text/xml')) lang = 'xml';
    else if (ct.includes('text/javascript') || ct.includes('application/javascript')) lang = 'javascript';
    else if (ct.includes('text/css')) lang = 'css';
    else if (ct.includes('text/plain')) lang = 'plaintext';
    let code = result.contents || '';
    if (lang === 'json') {
      try {
        const parsed = JSON.parse(code);
        code = JSON.stringify(parsed, null, 2);
      } catch {
        code = (result.contents || '').substring(0, 5000) + ((result.contents || '').length > 5000 ? '\n... (truncated)' : '');
      }
    }
    return { code, lang };
  }, [result]);
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="glass rounded-3xl p-6 md:p-8 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Globe className="w-32 h-32" />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://api.example.com/data"
              className="bg-slate-900/50 border-white/10 h-12 pl-4 text-white placeholder:text-slate-500"
            />
          </div>
          <Button 
            onClick={handleTest} 
            disabled={loading}
            className="h-12 px-8 bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-white font-semibold transition-all shadow-lg shadow-indigo-500/20"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Proxy Request
          </Button>
        </div>
        <Tabs defaultValue="response" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-900/50 border border-white/5">
            <TabsTrigger value="response">Response Data</TabsTrigger>
            <TabsTrigger value="code">Integration</TabsTrigger>
          </TabsList>
          <TabsContent value="response" className="mt-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatusItem icon={<ShieldCheck className="w-4 h-4 text-green-400" />} label="Status" value={result.status?.http_code?.toString() || 'N/A'} />
                    <StatusItem icon={<Zap className="w-4 h-4 text-yellow-400" />} label="Time" value={`${result.status?.response_time_ms || 0}ms`} />
                    <StatusItem icon={<Globe className="w-4 h-4 text-blue-400" />} label="Type" value={result.status?.content_type?.split(';')[0] || 'unknown'} />
                  </div>
                  <CodeBlock
                    language={displayData?.lang || 'plaintext'}
                    code={displayData?.code || ''}
                    className="max-h-[300px]"
                  />
                </motion.div>
              ) : (
                <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-white/5 rounded-xl text-muted-foreground italic">
                  Run a request to see the magic...
                </div>
              )}
            </AnimatePresence>
          </TabsContent>
          <TabsContent value="code" className="mt-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button 
                  variant={mode === 'proxy' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setMode('proxy')}
                  className="text-xs"
                >
                  Wrapped JSON
                </Button>
                <Button 
                  variant={mode === 'raw' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => setMode('raw')}
                  className="text-xs"
                >
                  Raw Transparent
                </Button>
              </div>
              <CodeBlock language="javascript" code={integrationSnippet} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
function StatusItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
      <div className="flex items-center gap-2 text-2xs font-medium text-muted-foreground uppercase mb-1">
        {icon}
        {label}
      </div>
      <div className="text-sm font-mono text-foreground font-bold">{value}</div>
    </div>
  );
}