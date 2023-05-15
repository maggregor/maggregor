import type { CollectionListener } from '@core/index';
import type { Expression } from '../expressions';
import {
  BasicAccumulator,
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
  CountBasicAccumulator,
} from './basic';
import {
  SumCachedAccumulator,
  AvgCachedAccumulator,
  MinCachedAccumulator,
  MaxCachedAccumulator,
  CountCachedAccumulator,
} from './cached';

/**
 * Accumulator operators
 * @see https://docs.mongodb.com/manual/reference/operator/aggregation/#accumulators
 */
export type AccumulatorOperator = 'sum' | 'avg' | 'min' | 'max' | 'count';
export type AccumulatorFunction = (doc: Document[]) => Value;
export type Value = number | string | boolean | undefined;

export * from './basic';
export * from './cached';

export interface Accumulator {
  operator: AccumulatorOperator;
  expression: Expression | undefined;
  outputFieldName: string;
  getHash(): string;
  equals(acc: Accumulator): boolean;
}

export interface CachedAccumulator extends Accumulator, CollectionListener {
  add(val: Value): void;
  delete(val: Value): void;
  __init(value: Value): void;
  getCachedValue(): Value;
}

export type AccumulatorDefinition = {
  operator: AccumulatorOperator;
  outputFieldName: string;
  expression: Expression;
};

export function createBasicAccumulator(
  def: AccumulatorDefinition,
): BasicAccumulator {
  if (def.expression === undefined) {
    throw new Error('Expression is required');
  }
  switch (def.operator) {
    case 'sum':
      return new SumBasicAccumulator(def);
    case 'avg':
      return new AvgBasicAccumulator(def);
    case 'min':
      return new MinBasicAccumulator(def);
    case 'max':
      return new MaxBasicAccumulator(def);
    case 'count':
      return new CountBasicAccumulator(def);
    default:
      throw new Error(`Unknown operator ${def.operator}`);
  }
}

export function createCachedAccumulator(
  def: AccumulatorDefinition,
): CachedAccumulator {
  switch (def.operator) {
    case 'sum':
      return new SumCachedAccumulator(def);
    case 'avg':
      return new AvgCachedAccumulator(def);
    case 'min':
      return new MinCachedAccumulator(def);
    case 'max':
      return new MaxCachedAccumulator(def);
    case 'count':
      return new CountCachedAccumulator(def);
    default:
      throw new Error(`Unknown operator ${def.operator}`);
  }
}
