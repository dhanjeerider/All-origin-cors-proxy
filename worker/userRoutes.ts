import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyStats, ProxyFormat, ExtractedElement } from '@shared/types';
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const USER_AGENT = "FluxGate/2.0 (Cloudflare Worker; Advanced Extraction)";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    app.get('/api/stats', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getStats();
        return c.json({ success: true, data } satisfies ApiResponse<ProxyStats>);
    });
    // Advanced Proxy Endpoint
    app.get('/api/proxy', async (c) => {
        const urlParam = c.req.query('url');
        const format = (c.req.query('format') || 'default') as ProxyFormat;
        const className = c.req.query('class');
        const idName = c.req.query('id');
        const delay = parseInt(c.req.query('delay') || '0');
        if (!urlParam) return c.json({ success: false, error: 'URL parameter is required' }, 400);
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.incrementStats(format);
        // Handle delay
        if (delay > 0) {
            const wait = Math.min(delay, 10) * 1000;
            await new Promise(resolve => setTimeout(resolve, wait));
        }
        const startTime = Date.now();
        const targetUrl = new URL(decodeURIComponent(urlParam));
        try {
            const response = await fetch(targetUrl.toString(), {
                headers: { "User-Agent": USER_AGENT }
            });
            if (!response.ok && response.status !== 304) {
              throw new Error(`Target responded with ${response.status}`);
            }
            // Content Negotiation
            const accept = c.req.header('Accept') || '';
            const isBrowserRequest = accept.includes('text/html');
            if ((format === 'html' || format === 'default') && isBrowserRequest) {
                const newHeaders = new Headers(response.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
                newHeaders.set("X-Proxied-By", "FluxGate/2.0");
                return new Response(response.body, { status: response.status, headers: newHeaders });
            }
            // Advanced Extraction Logic
            const result: Partial<ProxyResponse> = {
                url: targetUrl.toString(),
                format,
                status: {
                    url: targetUrl.toString(),
                    content_type: response.headers.get("content-type") || "text/plain",
                    http_code: response.status,
                    response_time_ms: Date.now() - startTime
                }
            };
            const images = new Set<string>();
            const links = new Set<string>();
            const videos = new Set<string>();
            const elements: ExtractedElement[] = [];
            let title = "";
            let textParts: string[] = [];
            const rewriter = new HTMLRewriter()
                .on('title', { text(t) { title += t.text; } })
                .on('img', {
                    element(e) {
                        const src = e.getAttribute('src');
                        if (src) images.add(new URL(src, targetUrl).href);
                    }
                })
                .on('a', {
                    element(e) {
                        const href = e.getAttribute('href');
                        if (href && !href.startsWith('#')) links.add(new URL(href, targetUrl).href);
                    }
                })
                .on('video, source', {
                    element(e) {
                        const src = e.getAttribute('src');
                        if (src) videos.add(new URL(src, targetUrl).href);
                    }
                });
            if (format === 'class' && className) {
                rewriter.on(`.${className}`, {
                    element(e) {
                        const el: ExtractedElement = { tag: e.tagName, attrs: {}, innerText: "", innerHTML: "" };
                        for (const [name, value] of e.attributes) el.attrs[name] = value;
                        elements.push(el);
                    }
                });
            } else if (format === 'id' && idName) {
                rewriter.on(`#${idName}`, {
                    element(e) {
                        const el: ExtractedElement = { tag: e.tagName, attrs: {}, innerText: "", innerHTML: "" };
                        for (const [name, value] of e.attributes) el.attrs[name] = value;
                        elements.push(el);
                    }
                });
            }
            // We need the full text for some formats
            const body = await response.text();
            const transformed = await rewriter.transform(new Response(body)).text();
            result.title = title.trim();
            result.images = Array.from(images);
            result.links = Array.from(links);
            result.videos = Array.from(videos);
            result.extractedElements = elements;
            if (format === 'text') {
                result.text = body.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
            } else if (format === 'json') {
                result.contents = body;
            } else if (format === 'html' || format === 'default') {
                result.contents = body;
            }
            return c.json({ success: true, data: result as ProxyResponse } satisfies ApiResponse<ProxyResponse>);
        } catch (err) {
            return c.json({ success: false, error: err instanceof Error ? err.message : 'Proxy Error' }, 500);
        }
    });
    // Backward compatibility for /api/raw
    app.get('/api/raw', async (c) => {
        const urlParam = c.req.query('url');
        if (!urlParam) return c.text('URL required', 400);
        const targetUrl = new URL(decodeURIComponent(urlParam));
        const res = await fetch(targetUrl.toString(), { headers: { "User-Agent": USER_AGENT } });
        const h = new Headers(res.headers);
        Object.entries(CORS_HEADERS).forEach(([k, v]) => h.set(k, v));
        return new Response(res.body, { status: res.status, headers: h });
    });
}