import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyFormat, ExtractedElement } from '@shared/types';
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const USER_AGENT = "FluxGate/2.0 (Cloudflare Worker; High-Performance Streaming)";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Stats endpoint removed for performance
    app.get('/api/proxy', async (c) => {
        const urlParam = c.req.query('url');
        const format = c.req.query('format') as ProxyFormat | undefined;
        const className = c.req.query('class');
        const idName = c.req.query('id');
        if (!urlParam) {
            return c.json({ success: false, error: 'URL parameter is required' }, 400);
        }
        let targetUrl: URL;
        try {
            targetUrl = new URL(urlParam);
        } catch (e) {
            return c.json({ success: false, error: 'Invalid URL provided' }, 400);
        }
        const startTime = Date.now();
        try {
            const response = await fetch(targetUrl.toString(), {
                headers: { "User-Agent": USER_AGENT },
                redirect: 'follow'
            });
            // If format is not specified or set to html, provide a transparent streaming response
            if (!format || format === 'html') {
                const newHeaders = new Headers(response.headers);
                Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
                newHeaders.set("X-Proxied-By", "FluxGate/2.0-Streaming");
                return new Response(response.body, { 
                    status: response.status, 
                    headers: newHeaders 
                });
            }
            // Otherwise, read body and perform extraction logic
            const contentType = response.headers.get("content-type") || "";
            const result: ProxyResponse = {
                url: targetUrl.toString(),
                format,
                status: {
                    url: targetUrl.toString(),
                    content_type: contentType,
                    http_code: response.status,
                    response_time_ms: Date.now() - startTime
                },
                images: [],
                links: [],
                videos: [],
                extractedElements: []
            };
            const rawBody = await response.text();
            result.contents = rawBody;
            // Simple extraction only for text/html
            if (contentType.includes("text/html")) {
                const images = new Set<string>();
                const links = new Set<string>();
                const videos = new Set<string>();
                const elements: ExtractedElement[] = [];
                let titleText = "";
                const rewriter = new HTMLRewriter()
                    .on('title', { text(t) { titleText += t.text; } })
                    .on('img', {
                        element(e) {
                            const src = e.getAttribute('src');
                            if (src) try { images.add(new URL(src, targetUrl).href); } catch {}
                        }
                    })
                    .on('a', {
                        element(e) {
                            const href = e.getAttribute('href');
                            if (href && !href.startsWith('#')) try { links.add(new URL(href, targetUrl).href); } catch {}
                        }
                    })
                    .on('video, source', {
                        element(e) {
                            const src = e.getAttribute('src');
                            if (src) try { videos.add(new URL(src, targetUrl).href); } catch {}
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
                await rewriter.transform(new Response(rawBody)).text();
                result.title = titleText.replace(/\s+/g, ' ').trim();
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
                }
            }
            return c.json({ success: true, data: result } satisfies ApiResponse<ProxyResponse>);
        } catch (err) {
            console.error('Proxy Error:', err);
            return c.json({ success: false, error: err instanceof Error ? err.message : 'Upstream Request Failed' }, 502);
        }
    });
}