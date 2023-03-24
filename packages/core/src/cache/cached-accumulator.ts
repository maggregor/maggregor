import { CollectionListener, Document } from "@core/index.ts";
import {
  evaluateExpression,
  Expression,
  toHashExpression,
} from "@core/pipeline/expressions.ts";

export type CachedValue = Value;
export type Value = number | string | boolean | undefined;

/**
 * Accumulator that will perform an accumulation on add / remove operations
 * @param expr - Expression to evaluate
 * @param val - Value to add to the accumulator
 */
export interface CachedAccumulator extends CollectionListener {
  add(val: Value): void;
  delete(val: Value): void;
  getCachedValue(): CachedValue;
  clone(): CachedAccumulator;
  getId(): string;
}

abstract class AbstractCachedAccumulator implements CachedAccumulator {
  protected expr: Expression | undefined;
  protected __cachedValue: CachedValue = undefined;
  protected abstract type: string;

  constructor(expr?: Expression) {
    this.expr = expr;
  }

  abstract add(val: Value): void;
  abstract delete(val: Value): void;

  abstract clone(): CachedAccumulator;

  __setCachedValue(value: CachedValue): void {
    this.__cachedValue = value;
  }

  addDocument(doc: Document): void {
    this.expr && this.add(evaluateExpression(this.expr, doc));
  }

  updateDocument(oldDoc: Document, newDoc: Document): void {
    this.addDocument(newDoc);
    this.deleteDocument(oldDoc);
  }

  deleteDocument(doc: Document): void {
    this.expr && this.delete(evaluateExpression(this.expr, doc));
  }

  getCachedValue(): CachedValue {
    return this.__cachedValue;
  }

  getId(): string {
    return `${this.type}${this.expr ? `_${toHashExpression(this.expr)}` : ""}`;
  }
}

export class SumCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  protected type = "sum";

  __setCachedValue(value: number | undefined): void {
    this.__cachedValue = value;
  }

  add(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue += val)
      : (this.__cachedValue = val);
  }

  delete(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue -= val)
      : (this.__cachedValue = -val);
  }

  clone(): CachedAccumulator {
    const clone = new SumCachedAccumulator(this.expr);
    clone.__setCachedValue(this.__cachedValue || undefined);
    return clone;
  }
}

/**
 * Count the number of added values
 * Check if the value is truthy before incrementing or decrementing the counter
 */
export class CountCachedAccumulator extends AbstractCachedAccumulator {
  protected __cachedValue = 0;
  protected type = "count";

  __setCachedValue(value: number): void {
    this.__cachedValue = value;
  }

  add(val: Value): void {
    val && this.__cachedValue++;
  }

  delete(val: Value): void {
    val && this.__cachedValue--;
  }

  clone(): CachedAccumulator {
    const clone = new CountCachedAccumulator(this.expr);
    clone.__setCachedValue(this.__cachedValue);
    return clone;
  }
}

export class AvgCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number;
  protected type = "avg";
  private count = 0;

  __setCachedValue(value: number): void {
    this.__cachedValue = value;
  }

  add(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue += val)
      : (this.__cachedValue = val);
    this.count++;
  }

  delete(val: number): void {
    this.__cachedValue ? (this.__cachedValue -= val) : (this.__cachedValue = 0);
    this.count--;
  }

  clone(): CachedAccumulator {
    const clone = new AvgCachedAccumulator(this.expr);
    clone.__setCachedValue(this.__cachedValue);
    clone.count = this.count;
    return clone;
  }

  getCachedValue(): number | undefined {
    return this.count > 0 ? this.__cachedValue / this.count : undefined;
  }
}

/**
 * Count the number of added values
 * Store the number of times a value has been added in a map
 */
export class MinCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private values: Map<number, number> = new Map();
  protected type = "min";

  __setCachedValue(value: number | undefined): void {
    this.__cachedValue = value;
  }

  add(val: number): void {
    if (this.__cachedValue === undefined || val < this.__cachedValue) {
      this.__cachedValue = val;
    }
    this.values.set(val, (this.values.get(val) || 0) + 1);
  }

  delete(val: number): void {
    if (this.__cachedValue === val) {
      this.__cachedValue = undefined;
      this.values.delete(val);
      for (const [value] of this.values) {
        if (this.__cachedValue === undefined || value < this.__cachedValue) {
          this.__cachedValue = value;
        }
      }
    } else {
      const count = this.values.get(val);
      if (count && count > 1) {
        this.values.set(val, count - 1);
      } else {
        this.values.delete(val);
      }
    }
  }

  clone(): CachedAccumulator {
    const clone = new MinCachedAccumulator(this.expr);
    clone.__setCachedValue(this.__cachedValue);
    clone.values = new Map(this.values);
    return clone;
  }

  getCachedValue(): number | undefined {
    return this.__cachedValue;
  }
}

export class MaxCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private values: Map<number, number> = new Map();
  protected type = "max";

  __setCachedValue(value: number | undefined): void {
    this.__cachedValue = value;
  }

  add(val: number): void {
    if (this.__cachedValue === undefined || val > this.__cachedValue) {
      this.__cachedValue = val;
    }
    this.values.set(val, (this.values.get(val) || 0) + 1);
  }

  delete(val: number): void {
    if (this.__cachedValue === val) {
      this.__cachedValue = undefined;
      this.values.delete(val);
      for (const [value] of this.values) {
        if (this.__cachedValue === undefined || value > this.__cachedValue) {
          this.__cachedValue = value;
        }
      }
    } else {
      const count = this.values.get(val);
      if (count && count > 1) {
        this.values.set(val, count - 1);
      } else {
        this.values.delete(val);
      }
    }
  }

  clone(): CachedAccumulator {
    const clone = new MaxCachedAccumulator(this.expr);
    clone.__setCachedValue(this.__cachedValue);
    clone.values = new Map(this.values);
    return clone;
  }

  getCachedValue(): number | undefined {
    return this.__cachedValue;
  }
}
