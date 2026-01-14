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
        try {
            const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
            const data = await stub.getStats();
            return c.json({ success: true, data } satisfies ApiResponse<ProxyStats>);
        } catch (err) {
            return c.json({ success: false, error: 'Failed to fetch stats' }, 500);
        }
    });
    app.get('/api/proxy', async (c) => {
        const urlParam = c.req.query('url');
        const format = (c.req.query('format') || 'json') as ProxyFormat;
        const className = c.req.query('class');
        const idName = c.req.query('id');
        const delay = parseInt(c.req.query('delay') || '0');
        if (!urlParam) {
            return c.json({ success: false, error: 'URL parameter is required' }, 400);
        }
        let targetUrl: URL;
        try {
            targetUrl = new URL(decodeURIComponent(urlParam));
        } catch (e) {
            return c.json({ success: false, error: 'Invalid URL provided' }, 400);
        }
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.incrementStats(format);
        if (delay > 0) {
            const wait = Math.min(delay, 10) * 1000;
            await new Promise(resolve => setTimeout(resolve, wait));
        }
        const startTime = Date.now();
        try {
            const response = await fetch(targetUrl.toString(), {
                headers: { "User-Agent": USER_AGENT },
                redirect: 'follow'
            });
            if (!response.ok && response.status !== 304) {
                return c.json({ 
                    success: false, 
                    error: `Target server returned status ${response.status}`,
                    data: { http_code: response.status } 
                }, response.status === 404 ? 404 : 502);
            }
            const accept = c.req.header('Accept') || '';
            const contentType = response.headers.get("content-type") || "";
            if (format === 'html' && accept.includes('text/html')) {
                const newHeaders = new Headers(response.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
                newHeaders.set("X-Proxied-By", "FluxGate/2.0");
                return new Response(response.body, { status: response.status, headers: newHeaders });
            }
            const result: Partial<ProxyResponse> = {
                url: targetUrl.toString(),
                format,
                status: {
                    url: targetUrl.toString(),
                    content_type: contentType,
                    http_code: response.status,
                    response_time_ms: Date.now() - startTime
                }
            };
            if (!contentType.includes("text/html")) {
                const body = await response.text();
                result.contents = body;
                return c.json({ success: true, data: result as ProxyResponse });
            }
            const images = new Set<string>();
            const links = new Set<string>();
            const videos = new Set<string>();
            const elements: ExtractedElement[] = [];
            let title = "";
            const rewriter = new HTMLRewriter()
                .on('title', { text(t) { title += t.text; } })
                .on('img', {
                    element(e) {
                        const src = e.getAttribute('src');
                        if (src) {
                            try { images.add(new URL(src, targetUrl).href); } catch {}
                        }
                    }
                })
                .on('a', {
                    element(e) {
                        const href = e.getAttribute('href');
                        if (href && !href.startsWith('#')) {
                            try { links.add(new URL(href, targetUrl).href); } catch {}
                        }
                    }
                })
                .on('video, source', {
                    element(e) {
                        const src = e.getAttribute('src');
                        if (src) {
                            try { videos.add(new URL(src, targetUrl).href); } catch {}
                        }
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
            const rawBody = await response.text();
            const transformedResponse = await rewriter.transform(new Response(rawBody)).text();
            result.title = title.trim();
            result.images = Array.from(images);
            result.links = Array.from(links);
            result.videos = Array.from(videos);
            result.extractedElements = elements;
            if (format === 'text') {
                result.text = rawBody.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
                                    .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
                                    .replace(/<[^>]*>?/gm, ' ')
                                    .replace(/\s+/g, ' ')
                                    .trim();
            } else {
                result.contents = rawBody;
            }
            return c.json({ success: true, data: result as ProxyResponse } satisfies ApiResponse<ProxyResponse>);
        } catch (err) {
            console.error('Proxy Error:', err);
            return c.json({ success: false, error: err instanceof Error ? err.message : 'Upstream Request Failed' }, 502);
        }
    });
}