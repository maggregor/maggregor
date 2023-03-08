import { AbstractAggregation, FieldReference } from "../aggregation.ts";

export abstract class StageAggregation extends AbstractAggregation {
  constructor(field: FieldReference) {
    super(field);
  }
}
