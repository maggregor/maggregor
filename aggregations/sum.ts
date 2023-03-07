import { Document } from "./../collection.ts";
import { AbstractAggregation } from "./../smart.aggregation.ts";

export class SumAggregation extends AbstractAggregation {
  declare _cachedValue: number | undefined;

  onAddDocument(d: Document): void {
    const value = d[this.field] as number;
    this._cachedValue =
      this._cachedValue === undefined ? value : this._cachedValue + value;
  }

  onUpdateDocument(oldDoc: Document, newDoc: Document): void {
    this.onDeleteDocument(oldDoc);
    this.onAddDocument(newDoc);
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
