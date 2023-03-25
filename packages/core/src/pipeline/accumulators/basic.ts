import { Document } from "@core/index.ts";
import { evaluateExpression, Expression } from "@core/pipeline/expressions.ts";
import { AccumulatorOperator } from "@core/pipeline/accumulators/index.ts";
import { BaseAccumulator } from "@core/pipeline/accumulators/common.ts";

export abstract class BasicAccumulator extends BaseAccumulator {
  abstract evaluate(docs: Document[]): number;
}

export class AvgBasicAccumulator extends BasicAccumulator {
  declare expression: Expression;
  constructor(expression: Expression) {
    super("avg" as AccumulatorOperator, expression);
  }

  public evaluate(docs: Document[]): number {
    return (
      docs.reduce((acc, doc) => {
        const value = evaluateExpression(this.expression, doc);
        return acc + value;
      }, 0) / docs.length
    );
  }
}

export class CountBasicAccumulator extends BasicAccumulator {
  declare expression: Expression;
  constructor(expression: Expression) {
    super("count" as AccumulatorOperator, expression);
  }

  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value ? acc + 1 : acc;
    }, 0);
  }
}

export class SumBasicAccumulator extends BasicAccumulator {
  declare expression: Expression;
  constructor(expression: Expression) {
    super("sum" as AccumulatorOperator, expression);
  }
  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return acc + value;
    }, 0);
  }
}

export class MinBasicAccumulator extends BasicAccumulator {
  declare expression: Expression;
  constructor(expression: Expression) {
    super("min" as AccumulatorOperator, expression);
  }
  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value < acc ? value : acc;
    }, Infinity);
  }
}

export class MaxBasicAccumulator extends BaseAccumulator {
  declare expression: Expression;
  constructor(expression: Expression) {
    super("max" as AccumulatorOperator, expression);
  }
  public evaluate(docs: Document[]): number {
    return docs.reduce((acc, doc) => {
      const value = evaluateExpression(this.expression, doc);
      return value > acc ? value : acc;
    }, -Infinity);
  }
}
