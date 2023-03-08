import { Document } from "./../../collection.ts";
import { ExpressionAggregation } from "./index.ts";

export class CountDistinct extends ExpressionAggregation {
  declare _cachedValue: number | undefined;
  private values: Map<number, number> = new Map();

  onAddDocument(doc: Document): void {
    const value = doc[this.field] as number;
    const valueCount = this.values.get(value) || 0;
    this.values.set(value, valueCount + 1);
    this._cachedValue = this.values.size;
  }

  onDeleteDocument(doc: Document): void {
    const value = doc[this.field] as number;
    const valueCount = this.values.get(value) || 0;
    if (valueCount === 1) {
      this.values.delete(value);
    } else {
      this.values.set(value, valueCount - 1);
    }
    this._cachedValue = this.values.size;
  }
}
