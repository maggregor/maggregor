import type { CachedAccumulator, Value, AccumulatorDefinition } from '.';
import { evaluateExpression } from '../expressions';
import { BaseAccumulator } from './common';
import type { Document } from '@core/index';

abstract class AbstractCachedAccumulator
  extends BaseAccumulator
  implements CachedAccumulator
{
  protected __cachedValue: Value = undefined;

  abstract add(val: Value): void;
  abstract delete(val: Value): void;

  __init(value: Value): void {
    this.__cachedValue = value;
  }

  addDocument(doc: Document): void {
    this.expression && this.add(evaluateExpression(this.expression, doc));
  }

  updateDocument(oldDoc: Document, newDoc: Document): void {
    this.addDocument(newDoc);
    this.deleteDocument(oldDoc);
  }

  deleteDocument(doc: Document): void {
    this.expression && this.delete(evaluateExpression(this.expression, doc));
  }

  getCachedValue(): Value {
    return this.__cachedValue;
  }
}

export class SumCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('sum', definition);
  }

  add(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue += val)
      : (this.__cachedValue = val);
  }

  delete(val: number): void {
    this.__cachedValue && (this.__cachedValue -= val);
  }
}

export class AvgCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private __count = 0;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('avg', definition);
  }

  add(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue += val)
      : (this.__cachedValue = val);
    this.__count++;
  }

  delete(val: number): void {
    this.__cachedValue && (this.__cachedValue -= val);
    this.__count--;
  }

  getCachedValue(): number | undefined {
    return this.__cachedValue && this.__cachedValue / this.__count;
  }
}

export class MinCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private values: Map<number, number> = new Map();

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('min', definition);
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
}

export class MaxCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private values: Map<number, number> = new Map();

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('max', definition);
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
}

export class CountCachedAccumulator extends AbstractCachedAccumulator {
  protected __cachedValue = 0;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('count', definition);
  }

  add(val: boolean): void {
    val && this.__cachedValue++;
  }

  delete(val: boolean): void {
    val && this.__cachedValue--;
  }
}
