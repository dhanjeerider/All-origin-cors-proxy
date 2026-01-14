import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
interface CodeBlockProps {
  code: string;
  language?: string;
  className?: string;
}
export function CodeBlock({ code, language = 'javascript', className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopied(true);
      toast.success('Intercepted and copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy. Terminal access restricted.');
    }
  };
  return (
    <div className={cn("relative group rounded-3xl overflow-hidden glass-neon border-white/5", className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-black font-mono text-slate-500 uppercase tracking-[0.2em]">{language}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-slate-500 hover:text-white hover:bg-indigo-500/20 transition-all"
          onClick={handleCopy}
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                <Check className="h-4 w-4 text-emerald-400" />
              </motion.div>
            ) : (
              <motion.div key="copy" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                <Copy className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>
      <div className="text-sm font-mono leading-relaxed overflow-x-auto custom-scrollbar">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{
            margin: 0,
            padding: '1.5rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.7',
          }}
          codeTagProps={{
            style: {
              fontFamily: '"JetBrains Mono", monospace',
              letterSpacing: '-0.02em'
            },
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
      <div className="absolute bottom-4 right-6 pointer-events-none">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
          <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
          <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
        </div>
      </div>
    </div>
  );
}