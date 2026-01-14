import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyStats } from '@shared/types';
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
    // Stats Endpoint
    app.get('/api/stats', async (c) => {
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        const data = await stub.getStats();
        return c.json({ success: true, data } satisfies ApiResponse<ProxyStats>);
    });
    // Core Proxy Logic: JSON Wrapped
    app.get('/api/proxy', async (c) => {
        const urlParam = c.req.query('url');
        if (!urlParam) return c.json({ success: false, error: 'URL parameter is required' }, 400);
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.incrementStats();
        const startTime = Date.now();
        try {
            const targetUrl = new URL(decodeURIComponent(urlParam));
            const response = await fetch(targetUrl.toString(), {
                headers: { "User-Agent": "FluxGate/1.0 (Cloudflare Worker)" }
            });
            const contents = await response.text();
            return c.json({
                success: true,
                data: {
                    contents,
                    status: {
                        url: targetUrl.toString(),
                        content_type: response.headers.get("content-type") || "text/plain",
                        http_code: response.status,
                        response_time_ms: Date.now() - startTime
                    }
                }
            } satisfies ApiResponse<ProxyResponse>);
        } catch (err) {
            return c.json({ success: false, error: err instanceof Error ? err.message : 'Failed to fetch target' }, 500);
        }
    });
    // Core Proxy Logic: Raw Stream
    app.get('/api/raw', async (c) => {
        const urlParam = c.req.query('url');
        if (!urlParam) return c.json({ success: false, error: 'URL parameter is required' }, 400);
        const stub = c.env.GlobalDurableObject.get(c.env.GlobalDurableObject.idFromName("global"));
        await stub.incrementStats();
        try {
            const targetUrl = new URL(decodeURIComponent(urlParam));
            const response = await fetch(targetUrl.toString(), {
                headers: { "User-Agent": "FluxGate/1.0 (Cloudflare Worker)" }
            });
            const newHeaders = new Headers(response.headers);
            Object.entries(CORS_HEADERS).forEach(([k, v]) => newHeaders.set(k, v));
            newHeaders.set("X-Proxied-By", "FluxGate");
            return new Response(response.body, {
                status: response.status,
                headers: newHeaders
            });
        } catch (err) {
            return c.text(`Proxy Error: ${err instanceof Error ? err.message : 'Unknown'}`, 500);
        }
    });
}