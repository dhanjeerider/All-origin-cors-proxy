import { DurableObject } from "cloudflare:workers";
import type { DemoItem, ProxyStats } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    private startTime: number = Date.now();
    async incrementStats(format: string = 'default'): Promise<void> {
      // Global total
      let total: number = (await this.ctx.storage.get("total_requests")) || 0;
      await this.ctx.storage.put("total_requests", total + 1);
      // Per-format count
      const key = `format_${format}`;
      let formatCount: number = (await this.ctx.storage.get(key)) || 0;
      await this.ctx.storage.put(key, formatCount + 1);
    }
    async getStats(): Promise<ProxyStats> {
      const totalRequests = (await this.ctx.storage.get("total_requests")) || 0;
      const formats = ['default', 'html', 'json', 'text', 'images', 'videos', 'links', 'class', 'id'];
      const formatCounts: Record<string, number> = {};
      for (const f of formats) {
        formatCounts[f] = (await this.ctx.storage.get(`format_${f}`)) || 0;
      }
      return {
        totalRequests: totalRequests as number,
        uptime: new Date(this.startTime).toISOString(),
        formatCounts
      };
    }
    // Existing Template Methods
    async getCounterValue(): Promise<number> {
      return (await this.ctx.storage.get("counter_value")) || 0;
    }
    async increment(amount = 1): Promise<number> {
      let value: number = (await this.ctx.storage.get("counter_value")) || 0;
      value += amount;
      await this.ctx.storage.put("counter_value", value);
      return value;
    }
    async getDemoItems(): Promise<DemoItem[]> {
      const items = await this.ctx.storage.get("demo_items");
      return (items as DemoItem[]) || MOCK_ITEMS;
    }
    async addDemoItem(item: DemoItem): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updated = [...items, item];
      await this.ctx.storage.put("demo_items", updated);
      return updated;
    }
}