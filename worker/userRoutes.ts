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
  // Common Handler Logic
  const handleProxyRequest = async (c: any) => {
    const targetUrlStr = c.req.query('url');
    const delay = parseInt(c.req.query('delay') || '0');
    const customUa = c.req.query('ua');
    const acceptHeader = c.req.header('Accept') || '';
    if (!targetUrlStr) {
      return c.json({ success: false, error: 'URL parameter is required' }, 400);
    }
    // Safety cap on delay to prevent worker timeout
    if (delay > 0) {
      await sleep(Math.min(delay, 5000));
    }
    try {
      const decodedUrl = decodeURIComponent(targetUrlStr);
      // Ensure protocol exists
      const finalUrl = decodedUrl.includes('://') ? decodedUrl : `https://${decodedUrl}`;
      const url = new URL(finalUrl);
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
      // Mode 1: Raw HTML / Stream
      // If Accept header explicitly asks for HTML OR if user is visiting via browser and hasn't specified /api prefix
      const isBrowser = acceptHeader.includes('text/html');
      const isApiRoute = c.req.path.startsWith('/api');
      if (isBrowser && !isApiRoute) {
        const headers = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
        // Comprehensive Security Header Strip
        headers.delete('content-security-policy');
        headers.delete('content-security-policy-report-only');
        headers.delete('x-frame-options');
        headers.delete('x-content-type-options');
        headers.delete('strict-transport-security');
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
  };
  // Standard endpoint
  app.get('/api/proxy', handleProxyRequest);
  // allOrigins Style Aliases
  app.get('/api', handleProxyRequest);
  app.get('/', handleProxyRequest);
}