export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
export interface StealthOptions {
  ua?: string;
  delay?: number;
}
export interface MinimalProxyResponse {
  url: string;
  title: string;
  contents: string;
  images: string[];
  links: string[];
  meta: Record<string, string>;
}