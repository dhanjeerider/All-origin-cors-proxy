export interface DemoItem {
  id: string;
  name: string;
  value: number;
}
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
/**
 * ProxyFormat maps to dedicated API endpoints.
 */
export type ProxyFormat = 'default' | 'html' | 'json' | 'text' | 'images' | 'videos' | 'links' | 'class' | 'id';
/**
 * Stealth options supported by the proxy engine.
 */
export interface StealthOptions {
  ua?: string;
  delay?: number;
  referer?: string;
  spoofIp?: boolean;
}
export interface ExtractedElement {
  tag: string;
  attrs: Record<string, string>;
  innerText: string;
  innerHTML: string;
}
export interface ProxyResponse {
  url: string;
  format: ProxyFormat;
  status: {
    url: string;
    content_type: string;
    http_code: number;
    response_time_ms: number;
    proxy_latency_ms?: number;
    stealth_active?: boolean;
    assigned_ua?: string;
  };
  contents?: string;
  title?: string;
  text?: string;
  images?: string[];
  videos?: string[];
  links?: string[];
  extractedElements?: ExtractedElement[];
  meta?: Record<string, string>;
}