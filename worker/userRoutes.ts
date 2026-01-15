import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyFormat, ExtractedElement } from '@shared/types';
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
const USER_AGENT = "FluxGate/2.1 (Cloudflare Worker; High-Performance Path-Based)";
async function handleExtraction(url: string, format: ProxyFormat, className?: string, idName?: string): Promise<ApiResponse<ProxyResponse>> {
  const startTime = Date.now();
  let targetUrl: URL;
  try {
    const decodedUrl = decodeURIComponent(url);
    targetUrl = new URL(decodedUrl.includes('://') ? decodedUrl : url);
  } catch (e) {
    return { success: false, error: 'Invalid Target URL' };
  }
  if ((format === 'class' && !className) || (format === 'id' && !idName)) {
    return { success: false, error: `Selector required for format: ${format}` };
  }
  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
      },
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
      extractedElements: [],
      meta: {}
    };
    if (contentType.includes("text/html")) {
      const images = new Set<string>();
      const links = new Set<string>();
      const videos = new Set<string>();
      const elements: ExtractedElement[] = [];
      let titleText = "";
      const meta: Record<string, string> = {};
      const rewriter = new HTMLRewriter()
        .on('title', { text(t) { titleText += t.text; } })
        .on('meta', {
          element(e) {
            const name = e.getAttribute('name') || e.getAttribute('property');
            const content = e.getAttribute('content');
            if (name && content) {
              if (['description', 'keywords', 'og:title', 'og:description', 'og:image', 'twitter:card', 'viewport'].includes(name)) {
                meta[name] = content;
              }
            }
          }
        })
        .on('img', {
          element(e) {
            const src = e.getAttribute('src');
            if (src) try { images.add(new URL(src, targetUrl).href); } catch { /* ignore */ }
          }
        })
        .on('a', {
          element(e) {
            const href = e.getAttribute('href');
            if (href && !href.startsWith('#')) try { links.add(new URL(href, targetUrl).href); } catch { /* ignore */ }
          }
        })
        .on('video, source', {
          element(e) {
            const src = e.getAttribute('src');
            if (src) try { videos.add(new URL(src, targetUrl).href); } catch { /* ignore */ }
          }
        });
      const selector = format === 'class' ? `.${className}` : format === 'id' ? `#${idName}` : null;
      if (selector) {
        let currentElement: ExtractedElement | null = null;
        rewriter.on(selector, {
          element(e) {
            currentElement = { tag: e.tagName, attrs: {}, innerText: "", innerHTML: "" };
            for (const [name, value] of e.attributes) {
              currentElement.attrs[name] = value;
            }
            elements.push(currentElement);
          },
          text(t) {
            if (currentElement) {
              currentElement.innerText += t.text;
            }
          }
        });
      }
      await rewriter.transform(new Response(rawBody)).text();
      result.title = titleText.replace(/\s+/g, ' ').trim();
      result.meta = meta;
      result.images = Array.from(images).slice(0, 50);
      result.links = Array.from(links).slice(0, 100);
      result.videos = Array.from(videos);
      result.extractedElements = elements.map(el => ({
        ...el,
        innerText: el.innerText.replace(/\s+/g, ' ').trim()
      }));
      if (format === 'text') {
        result.text = rawBody
          .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
          .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gim, "")
          .replace(/<code\b[^>]*>([\s\S]*?)<\/code>/gim, "")
          .replace(/<[^>]*>?/gm, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      }
    }
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Upstream fetch failed' };
  }
}
export function userRoutesHandler(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await next();
    c.res.headers.set("X-Proxied-By", "FluxGate/2.1");
    Object.entries(CORS_HEADERS).forEach(([k, v]) => c.res.headers.set(k, v));
  });
  app.get('/api/proxy', async (c) => {
    const url = c.req.query('url');
    if (!url) return c.json({ success: false, error: 'URL required' }, 400);
    try {
      const decodedUrl = decodeURIComponent(url);
      const response = await fetch(decodedUrl.includes('://') ? decodedUrl : url, {
        headers: { "User-Agent": USER_AGENT },
        redirect: 'follow'
      });
      const headers = new Headers(response.headers);
      headers.set("X-Proxy-Mode", "Streaming");
      headers.set("Access-Control-Allow-Origin", "*");
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
      const className = c.req.query('class');
      const idName = c.req.query('id');
      const result = await handleExtraction(url, f, className, idName);
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    });
  });
}