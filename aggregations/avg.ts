import { Document } from "./../collection.ts";
import { AbstractAggregation } from "./../smart.aggregation.ts";

export class AvgAggregation extends AbstractAggregation {
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
