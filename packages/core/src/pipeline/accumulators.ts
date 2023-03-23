import { Expression, evaluateExpression } from "./expressions.ts";
import { Document } from "@core/index.ts";

export type AccumulatorOperator = "$sum" | "$avg" | "$min" | "$max";
export type AccumulatorFunction = (doc: Document[]) => number;

/**
 * Accumulator functions
 * @see https://docs.mongodb.com/manual/reference/operator/aggregation/#accumulators
 */

export interface Accumulator {
  operator: AccumulatorOperator;
  evaluate: AccumulatorFunction;
}

export abstract class BaseAccumulator implements Accumulator {
  public expression: Expression;
  abstract operator: AccumulatorOperator;

  constructor(expression: Expression) {
    this.expression = expression;
  }

  public abstract evaluate(docs: Document[]): number;
}

export class SumAccumulator extends BaseAccumulator {
  public operator: AccumulatorOperator = "$sum";

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc + value;
    }, 0);
  }
}

export class AvgAccumulator extends BaseAccumulator {
  public operator: AccumulatorOperator = "$avg";

  public evaluate(docs: Document[]): number {
    return (
      docs.reduce((acc, doc) => {
        const value = evaluateExpression(this.expression, doc);
        return acc + value;
      }, 0) / docs.length
    );
  }
}

export class MinAccumulator extends BaseAccumulator {
  public operator: AccumulatorOperator = "$min";

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc < value ? acc : value;
    }, Infinity);
  }
}

export class MaxAccumulator extends BaseAccumulator {
  public operator: AccumulatorOperator = "$max";

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc > value ? acc : value;
    }, -Infinity);
  }
}
