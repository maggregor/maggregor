import { Document } from "@core/utils/collection.ts";
import { ExpressionAggregation } from "@core/index.ts";

export class Min extends ExpressionAggregation {
  private values: Map<number, number> = new Map();
  declare _cachedValue: number | undefined;
  public type = "min";

  onAddDocument(doc: Document): void {
    const value = doc[this.field] as number;
    const valueCount = this.values.get(value) || 0;
    this.values.set(value, valueCount + 1);
    if (this._cachedValue === undefined || value < this._cachedValue) {
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
    this._cachedValue = this.findMin();
  }

  private findMin(): number | undefined {
    let min: number | undefined;
    for (const [value, count] of this.values) {
      if (count > 0 && (min === undefined || value < min)) {
        min = value;
      }
    }
    return min;
  }
}
