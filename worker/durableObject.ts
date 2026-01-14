import { DurableObject } from "cloudflare:workers";
import type { DemoItem, ProxyStats } from '@shared/types';
import { MOCK_ITEMS } from '@shared/mock-data';
export class GlobalDurableObject extends DurableObject {
    private startTime: number = Date.now();
    async incrementStats(): Promise<number> {
      let value: number = (await this.ctx.storage.get("total_requests")) || 0;
      value += 1;
      await this.ctx.storage.put("total_requests", value);
      return value;
    }
    async getStats(): Promise<ProxyStats> {
      const totalRequests = (await this.ctx.storage.get("total_requests")) || 0;
      return {
        totalRequests: totalRequests as number,
        uptime: new Date(this.startTime).toISOString()
      };
    }
    // Existing Template Methods (Kept for compatibility)
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
    async updateDemoItem(id: string, updates: Partial<Omit<DemoItem, 'id'>>): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updated = items.map(item => item.id === id ? { ...item, ...updates } : item);
      await this.ctx.storage.put("demo_items", updated);
      return updated;
    }
    async deleteDemoItem(id: string): Promise<DemoItem[]> {
      const items = await this.getDemoItems();
      const updated = items.filter(item => item.id !== id);
      await this.ctx.storage.put("demo_items", updated);
      return updated;
    }
}