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
 * ProxyFormat maps to dedicated API endpoints:
 * 'json' -> /api/json
 * 'text' -> /api/text
 * 'images' -> /api/images
 * 'links' -> /api/links
 * 'class' -> /api/class
 * 'id' -> /api/id
 */
export type ProxyFormat = 'default' | 'html' | 'json' | 'text' | 'images' | 'videos' | 'links' | 'class' | 'id';
export interface ExtractedElement {
  tag: string;
  attrs: Record<string, string>;
  innerText: string;
  innerHTML: string;
}
export interface ProxyResponse {
  contents?: string;
  url: string;
  format: ProxyFormat;
  status: {
    url: string;
    content_type: string;
    http_code: number;
    response_time_ms: number;
  };
  title?: string;
  text?: string;
  images?: string[];
  videos?: string[];
  links?: string[];
  extractedElements?: ExtractedElement[];
  meta?: Record<string, string>;
}