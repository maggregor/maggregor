import { AbstractAggregation, FieldReference } from "../aggregation.ts";
import { Expression } from "@core/index.ts";
import { createExpression } from "@core/factory.ts";

export abstract class StageAggregation extends AbstractAggregation {
  private uniqIdentifier: string;

  constructor(field: FieldReference, protected expression: Expression) {
    super(field);
    this.uniqIdentifier = `${this.field}.${createExpression(
      this.expression
    ).getUniqIdentifier()}`;
  }

  getUniqIdentifier(): string {
    return this.uniqIdentifier;
  }
}
