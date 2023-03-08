import type { Document } from "./../../collection.ts";
import { ExpressionAggregation } from "./index.ts";

export class Avg extends ExpressionAggregation {
  declare _cachedValue: number | undefined;
  private sum = 0;
  private count = 0;

  onAddDocument(d: Document): void {
    const value = d[this.field] as number;
    this.sum += value;
    this.count++;
    this._cachedValue = this.sum / this.count;
  }

  onDeleteDocument(d: Document): void {
    const value = d[this.field] as number;
    this.sum -= value;
    this.count--;
    this._cachedValue = this.sum / this.count;
  }

  get(): number | undefined {
    return this._cachedValue;
  }
}
