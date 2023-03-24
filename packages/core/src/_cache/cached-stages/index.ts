import { AbstractAggregation, FieldReference } from "../aggregation.ts";
import { Expression } from "@core/index.ts";
import { createExpression } from "@core/factory.ts";

export abstract class StageAggregation extends AbstractAggregation {
  private uniqIdentifier: string;

  abstract get(): Map<string, unknown>;

  constructor(field: FieldReference, protected expression: Expression) {
    super(field.replace("$", "")); // Remove the $ from the field
    this.uniqIdentifier = `${this.field}.${createExpression(
      this.expression
    ).getUniqIdentifier()}`;
  }

  getUniqIdentifier(): string {
    return this.uniqIdentifier;
  }

  getExpression(): Expression {
    return this.expression;
  }
}
