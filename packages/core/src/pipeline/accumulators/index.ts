import { CollectionListener } from "src";
import { Expression } from "../expressions";
import {
  BasicAccumulator,
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
  CountBasicAccumulator,
} from "./basic";
import {
  SumCachedAccumulator,
  AvgCachedAccumulator,
  MinCachedAccumulator,
  MaxCachedAccumulator,
  CountCachedAccumulator,
} from "./cached";

/**
 * Accumulator operators
 * @see https://docs.mongodb.com/manual/reference/operator/aggregation/#accumulators
 */
export type AccumulatorOperator = "sum" | "avg" | "min" | "max" | "count";
export type AccumulatorFunction = (doc: Document[]) => Value;
export type Value = number | string | boolean | undefined;

export * from "./basic";
export * from "./cached";

export interface Accumulator {
  operator: AccumulatorOperator;
  expression: Expression | undefined;
  hash: string;
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
  expression?: Expression;
};

export function createBasicAccumulator(
  definition: AccumulatorDefinition
): BasicAccumulator {
  if (definition.expression === undefined) {
    throw new Error("Expression is required");
  }
  switch (definition.operator) {
    case "sum":
      return new SumBasicAccumulator(definition.expression);
    case "avg":
      return new AvgBasicAccumulator(definition.expression);
    case "min":
      return new MinBasicAccumulator(definition.expression);
    case "max":
      return new MaxBasicAccumulator(definition.expression);
    case "count":
      return new CountBasicAccumulator(definition.expression);
    default:
      throw new Error(`Unknown operator ${definition.operator}`);
  }
}

export function createCachedAccumulator(
  definition: AccumulatorDefinition
): CachedAccumulator {
  switch (definition.operator) {
    case "sum":
      return new SumCachedAccumulator(definition.expression);
    case "avg":
      return new AvgCachedAccumulator(definition.expression);
    case "min":
      return new MinCachedAccumulator(definition.expression);
    case "max":
      return new MaxCachedAccumulator(definition.expression);
    case "count":
      return new CountCachedAccumulator(definition.expression);
    default:
      throw new Error(`Unknown operator ${definition.operator}`);
  }
}
