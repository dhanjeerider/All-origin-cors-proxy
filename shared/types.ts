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
export interface ProxyStats {
  totalRequests: number;
  uptime: string;
}
export interface ProxyResponse {
  contents: string;
  status: {
    url: string;
    content_type: string;
    http_code: number;
    response_time_ms: number;
  };
}