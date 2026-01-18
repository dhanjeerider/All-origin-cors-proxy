import { Hono } from "hono";
import { Env } from './core-utils';
import type { ApiResponse, ProxyResponse, ProxyFormat, ExtractedElement } from '@shared/types';
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (iPad; CPU OS 17_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:122.0) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_3_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 Edg/121.0.0.0",
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Android 14; Mobile; rv:122.0) Gecko/122.0 Firefox/122.0",
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Linux; Android 14; Samsung Galaxy S23) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/115.0"
];
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Expose-Headers": "X-Proxied-By, X-Proxy-Mode, X-Stealth-Active"
};
function getRandomIPv4() {
  return Array.from({ length: 4 }, () => Math.floor(Math.random() * 256)).join('.');
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
async function handleExtraction(url: string, format: ProxyFormat, className?: string, idName?: string, options: { ua?: string, delay?: number, referer?: string } = {}): Promise<ApiResponse<ProxyResponse>> {
  const startTime = Date.now();
  if (options.delay) {
    const delayAmount = Math.min(Math.max(options.delay, 0), 10000);
    const jitter = Math.random() * 500;
    await sleep(delayAmount + jitter);
  }
  let targetUrl: URL;
  try {
    const decodedUrl = decodeURIComponent(url);
    targetUrl = new URL(decodedUrl.includes('://') ? decodedUrl : `https://${decodedUrl}`);
  } catch (e) {
    return { success: false, error: 'Invalid Target URL. Ensure it is correctly encoded.' };
  }
  if ((format === 'class' && !className) || (format === 'id' && !idName)) {
    return { success: false, error: `Selector required for format: ${format}` };
  }
  const assignedUA = options.ua || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  const spoofedIP = getRandomIPv4();
  try {
    const response = await fetch(targetUrl.toString(), {
      headers: {
        "User-Agent": assignedUA,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Referer": options.referer || targetUrl.origin,
        "X-Forwarded-For": spoofedIP,
        "Cache-Control": "no-cache",
        "Upgrade-Insecure-Requests": "1"
      },
      redirect: 'follow'
    });
    if (!response.ok) {
      return { success: false, error: `Upstream returned status ${response.status}` };
    }
    const contentType = response.headers.get("content-type") || "";
    const rawBody = await response.text();
    const result: ProxyResponse = {
      url: targetUrl.toString(),
      format,
      status: {
        url: targetUrl.toString(),
        content_type: contentType,
        http_code: response.status,
        response_time_ms: Date.now() - startTime,
        stealth_active: true,
        assigned_ua: assignedUA
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
              const keys = ['description', 'keywords', 'og:title', 'og:description', 'og:image', 'twitter:card', 'viewport'];
              if (keys.includes(name)) meta[name] = content;
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
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
              try { links.add(new URL(href, targetUrl).href); } catch { /* ignore */ }
            }
          }
        })
        .on('video, source', {
          element(e) {
            const src = e.getAttribute('src') || e.getAttribute('data-src');
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
    } else if (format === 'json') {
      try {
        result.contents = JSON.parse(rawBody);
      } catch {
        result.contents = rawBody;
      }
    } else {
      result.contents = rawBody;
    }
    return { success: true, data: result };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : 'Upstream fetch failed' };
  }
}
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.use('/api/*', async (c, next) => {
    await next();
    c.res.headers.set("X-Proxied-By", "FluxGate/2.1");
    c.res.headers.set("X-Stealth-Active", "true");
    Object.entries(CORS_HEADERS).forEach(([k, v]) => c.res.headers.set(k, v));
  });
  app.get('/api/proxy', async (c) => {
    const url = c.req.query('url');
    const delay = parseInt(c.req.query('delay') || '0');
    const ua = c.req.query('ua');
    const referer = c.req.query('referer');
    if (!url) return c.json({ success: false, error: 'URL query parameter is required' }, 400);
    if (delay > 0) {
      await sleep(Math.min(delay, 10000));
    }
    try {
      const decodedUrl = decodeURIComponent(url);
      const target = decodedUrl.includes('://') ? decodedUrl : `https://${decodedUrl}`;
      const assignedUA = ua || USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const response = await fetch(target, {
        headers: { 
          "User-Agent": assignedUA,
          "Referer": referer || new URL(target).origin,
          "X-Forwarded-For": getRandomIPv4(),
          "Accept-Encoding": "identity"
        },
        redirect: 'follow'
      });
      const headers = new Headers();
      response.headers.forEach((v, k) => {
        const lowerK = k.toLowerCase();
        if (!lowerK.startsWith('cf-') && !['content-encoding', 'content-length', 'transfer-encoding', 'connection', 'x-real-ip'].includes(lowerK)) {
          headers.set(k, v);
        }
      });
      headers.set("X-Proxy-Mode", "Stealth-Streaming");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("X-Assigned-UA", assignedUA);
      return new Response(response.body, {
        status: response.status,
        headers
      });
    } catch (e) {
      return c.json({ success: false, error: 'Fetch failed', detail: e instanceof Error ? e.message : String(e) }, 502);
    }
  });
  const formats: ProxyFormat[] = ['json', 'html', 'text', 'images', 'links', 'videos', 'class', 'id'];
  formats.forEach(f => {
    app.get(`/api/${f}`, async (c) => {
      const url = c.req.query('url');
      if (!url) return c.json({ success: false, error: 'URL query parameter is required' }, 400);
      const options = {
        ua: c.req.query('ua'),
        delay: parseInt(c.req.query('delay') || '0'),
        referer: c.req.query('referer')
      };
      const result = await handleExtraction(url, f, c.req.query('class'), c.req.query('id'), options);
      if (!result.success) return c.json(result, 400);
      return c.json(result);
    });
  });
}