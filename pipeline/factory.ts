import { Sum } from "./expressions/sum.ts";
import { Avg } from "./expressions/avg.ts";
import { Max } from "./expressions/max.ts";
import { Min } from "./expressions/min.ts";
import { FieldReference } from "./aggregation.ts";
import { CountDistinct } from "./expressions/count-distinct.ts";
import { Expression, ExpressionAggregation } from "./expressions/index.ts";

export const createExpression = (
  field: FieldReference,
  type: Expression
): ExpressionAggregation => {
  switch (Object.keys(type)[0]) {
    case "sum":
      return new Sum(field);
    case "max":
      return new Max(field);
    case "avg":
      return new Avg(field);
    case "min":
      return new Min(field);
    case "countDistinct":
      return new CountDistinct(field);
    default:
      throw new Error("Invalid expression type");
  }
};
