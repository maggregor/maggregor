import { Document } from "./../../collection.ts";
import { ExpressionAggregation } from "./index.ts";

export class Max extends ExpressionAggregation {
  private values: Map<number, number> = new Map();
  declare _cachedValue: number | undefined;
  public type = "max";

  onAddDocument(doc: Document): void {
    const value = doc[this.field] as number;
    const valueCount = this.values.get(value) || 0;
    this.values.set(value, valueCount + 1);
    if (this._cachedValue === undefined || value > this._cachedValue) {
      this._cachedValue = value;
    }
  }

  onDeleteDocument(doc: Document): void {
    const value = doc[this.field] as number;
    const valueCount = this.values.get(value) || 0;
    if (valueCount === 1) {
      this.values.delete(value);
    } else {
      this.values.set(value, valueCount - 1);
    }
    this._cachedValue = this.findMax();
  }

  private findMax(): number | undefined {
    let max: number | undefined;
    for (const [value, count] of this.values) {
      if (count > 0 && (max === undefined || value > max)) {
        max = value;
      }
    }
    return max;
  }
}
