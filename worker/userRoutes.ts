import { Hono } from "hono";
import { Env } from './core-utils';
import type { MinimalProxyResponse } from '@shared/types';
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:122.0) Gecko/20100101 Firefox/122.0"
];
function getRandomIPv4() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  // Single endpoint: /api/proxy
  app.get('/api/proxy', async (c) => {
    const targetUrlStr = c.req.query('url');
    const delay = parseInt(c.req.query('delay') || '0');
    const customUa = c.req.query('ua');
    const acceptHeader = c.req.header('Accept') || '';
    if (!targetUrlStr) {
      return c.json({ success: false, error: 'URL parameter is required' }, 400);
    }
    if (delay > 0) {
      await sleep(Math.min(delay, 5000));
    }
    try {
      const decodedUrl = decodeURIComponent(targetUrlStr);
      const url = new URL(decodedUrl.includes('://') ? decodedUrl : `https://${decodedUrl}`);
      const ua = customUa || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const response = await fetch(url.toString(), {
        headers: {
          "User-Agent": ua,
          "X-Forwarded-For": getRandomIPv4(),
          "Accept": "*/*"
        },
        redirect: 'follow'
      });
      // Permissive CORS Headers
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Proxied-By": "FluxGate-Minimal"
      };
      // Mode 1: Raw HTML / Stream (If Accept header asks for HTML)
      if (acceptHeader.includes('text/html')) {
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
        // Remove restrictive security headers from upstream
        headers.delete('content-security-policy');
        headers.delete('x-frame-options');
        return new Response(response.body, { status: response.status, headers });
      }
      // Mode 2: JSON Extraction
      const body = await response.text();
      const titleMatch = body.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const imageMatches = [...body.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)];
      const linkMatches = [...body.matchAll(/<a[^>]+href=["']([^"']+)["']/gi)];
      const result: MinimalProxyResponse = {
        url: url.toString(),
        title: titleMatch ? titleMatch[1].trim() : '',
        contents: body,
        images: Array.from(new Set(imageMatches.map(m => m[1]))).slice(0, 20),
        links: Array.from(new Set(linkMatches.map(m => m[1]))).slice(0, 20),
        meta: {
          status: response.status.toString(),
          content_type: response.headers.get('content-type') || 'unknown'
        }
      };
      return c.json({ success: true, data: result }, { headers: corsHeaders });
    } catch (e) {
      return c.json({ success: false, error: String(e) }, 500);
    }
  });
}