import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyFormat, ExtractedElement } from '@shared/types';
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const USER_AGENT = "FluxGate/2.1 (Cloudflare Worker; High-Performance Path-Based)";
async function handleExtraction(url: string, format: ProxyFormat, className?: string, idName?: string) {
  const startTime = Date.now();
  const targetUrl = new URL(url);
  const response = await fetch(targetUrl.toString(), {
    headers: { "User-Agent": USER_AGENT },
    redirect: 'follow'
  });
  const contentType = response.headers.get("content-type") || "";
  const rawBody = await response.text();
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
          // If src is invalid or absolute path resolution fails, we ignore it to prevent crawler crashes
          if (src) try { images.add(new URL(src, targetUrl).href); } catch { /* ignore invalid urls */ }
        }
      })
      .on('a', {
        element(e) {
          const href = e.getAttribute('href');
          // Link resolution can fail for complex or non-standard protocol strings
          if (href && !href.startsWith('#')) try { links.add(new URL(href, targetUrl).href); } catch { /* ignore invalid links */ }
        }
      })
      .on('video, source', {
        element(e) {
          const src = e.getAttribute('src');
          // Multimedia sources are often relative or dynamically generated, skipping failures
          if (src) try { videos.add(new URL(src, targetUrl).href); } catch { /* ignore invalid sources */ }
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
  // Optimize response based on format
  if (format === 'images') return { success: true, data: { images: result.images, status: result.status } };
  if (format === 'links') return { success: true, data: { links: result.links, status: result.status } };
  if (format === 'videos') return { success: true, data: { videos: result.videos, status: result.status } };
  if (format === 'text') return { success: true, data: { text: result.text, status: result.status } };
  const { contents, ...rest } = result;
  return { success: true, data: format === 'json' ? result : rest };
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
	app.get('/api/proxy', async (c) => {
    const url = c.req.query('url');
    if (!url) return c.json({ success: false, error: 'URL required' }, 400);
    try {
      const response = await fetch(url, { headers: { "User-Agent": USER_AGENT }, redirect: 'follow' });
      const headers = new Headers(response.headers);
      Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
      headers.set("X-Proxied-By", "FluxGate/2.1");
      headers.set("X-Proxy-Mode", "Streaming");
      return new Response(response.body, { status: response.status, headers });
    } catch (e) {
      return c.json({ success: false, error: 'Fetch failed' }, 502);
    }
  });
  const formats: ProxyFormat[] = ['json', 'text', 'images', 'links', 'videos', 'class', 'id'];
  formats.forEach(f => {
    app.get(`/api/${f}`, async (c) => {
      const url = c.req.query('url');
      if (!url) return c.json({ success: false, error: 'URL required' }, 400);
      try {
        const className = c.req.query('class');
        const idName = c.req.query('id');
        const result = await handleExtraction(url, f, className, idName);
        return c.json(result as ApiResponse<ProxyResponse>);
      } catch (e) {
        return c.json({ success: false, error: e instanceof Error ? e.message : 'Extraction failed' }, 502);
      }
    });
  });
}