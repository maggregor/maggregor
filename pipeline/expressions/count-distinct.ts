import { Document } from "./../../collection.ts";
import { ExpressionAggregation } from "./index.ts";
import { calculateHash } from "./../../utils/hash.ts";

export class CountDistinct extends ExpressionAggregation {
  __valueHashes: Map<string, number> = new Map();
  public type = "countDistinct";

  onAddDocument(doc: Document): void {
    const input = doc[this.field] as Record<string, unknown> | string | number;
    const hash = calculateHash(input);
    const count = this.__valueHashes.get(hash) || 0;
    this.__valueHashes.set(hash, count + 1);
  }

  onDeleteDocument(doc: Document): void {
    const input = doc[this.field] as Record<string, unknown> | string | number;
    const hash = calculateHash(input);
    const count = this.__valueHashes.get(hash) || 0;
    if (count > 1) {
      this.__valueHashes.set(hash, count - 1);
    } else {
      this.__valueHashes.delete(hash);
    }
  }

  public get(): number {
    return this.__valueHashes.size;
  }
}
