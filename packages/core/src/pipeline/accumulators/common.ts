import { equal } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import hash from "https://deno.land/x/object_hash@2.0.3.1/mod.ts";
import { Expression } from "@core/pipeline/expressions.ts";
import {
  Accumulator,
  AccumulatorOperator,
} from "@core/pipeline/accumulators/index.ts";

export abstract class BaseAccumulator implements Accumulator {
  public operator: AccumulatorOperator;
  public expression: Expression | undefined;
  public hash: string;

  protected constructor(
    operator: AccumulatorOperator,
    expression?: Expression
  ) {
    this.operator = operator;
    this.expression = expression;
    this.hash = hash({ expression: this.expression, operator: this.operator });
  }

  public equals(acc: Accumulator): boolean {
    return (
      equal(this.expression, acc.expression) && this.operator === acc.operator
    );
  }
}
