import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}
export function CodeBlock({ code, language = 'javascript', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };
  return (
    <div className={cn("relative rounded-lg overflow-hidden border border-white/10 bg-slate-950", className)}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">{language}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
      <div className="text-sm font-mono overflow-auto max-h-[400px]">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.8rem',
            lineHeight: '1.6',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}