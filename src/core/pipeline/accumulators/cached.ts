import type {
  CachedAccumulator,
  Value,
  AccumulatorDefinition,
  InitConfig,
  AvgInitConfig,
} from '.';
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
  abstract initialize(config: InitConfig): void;

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
    if (this.isFaulty()) {
      return null;
    }
    return this.__cachedValue;
  }

  isFaulty(): boolean {
    // By default, cached accumulators are faulty if they have not been initialized
    return this.__cachedValue === undefined;
  }
}

export class SumCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('sum', definition);
    this.__cachedValue = 0;
  }

  add(val: number): void {
    this.__cachedValue
      ? (this.__cachedValue += val)
      : (this.__cachedValue = val);
  }

  delete(val: number): void {
    this.__cachedValue && (this.__cachedValue -= val);
  }

  initialize(n: number): void {
    this.__cachedValue = n;
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

  initialize(config: AvgInitConfig): void {
    this.__cachedValue = config.sum;
    this.__count = config.count;
  }
}

export class MinCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private faulty = false;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('min', definition);
  }

  add(val: number): void {
    if (this.__cachedValue === undefined || val <= this.__cachedValue) {
      this.__cachedValue = val;
      this.faulty = false;
    }
  }

  delete(val: number): void {
    if (!this.faulty && this.__cachedValue === val) {
      this.faulty = true;
    }
  }

  initialize(n: number): void {
    this.__cachedValue = n;
    this.faulty = false;
  }

  isFaulty(): boolean {
    return this.faulty;
  }
}

export class MaxCachedAccumulator extends AbstractCachedAccumulator {
  declare __cachedValue: number | undefined;
  private faulty = false;

  constructor(definition: Omit<AccumulatorDefinition, 'operator'>) {
    super('max', definition);
  }

  add(val: number): void {
    if (this.__cachedValue === undefined || val >= this.__cachedValue) {
      this.__cachedValue = val;
      this.faulty = false;
    }
  }

  delete(val: number): void {
    if (!this.faulty && this.__cachedValue === val) {
      this.faulty = true;
    }
  }

  initialize(n: number): void {
    this.__cachedValue = n;
    this.faulty = false;
  }

  isFaulty(): boolean {
    return this.faulty;
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

  initialize(n: number): void {
    this.__cachedValue = n;
  }

  getCachedValue(): number {
    return this.__cachedValue;
  }
}
