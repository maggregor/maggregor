import { Document } from "@core/utils/collection.ts";
import { ExpressionAggregation } from "@core/expressions/index.ts";

export class Sum extends ExpressionAggregation {
  declare _cachedValue: number | undefined;
  public type = "sum";

  onAddDocument(d: Document): void {
    const value = d[this.field] as number;
    this._cachedValue =
      this._cachedValue === undefined ? value : this._cachedValue + value;
  }

  onDeleteDocument(d: Document): void {
    const value = d[this.field] as number;
    this._cachedValue =
      this._cachedValue === undefined ? undefined : this._cachedValue - value;
  }

  get(): number | undefined {
    return this._cachedValue;
  }
}
