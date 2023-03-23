import { Sum } from "@core/expressions/sum.ts";
import { Avg } from "@core/expressions/avg.ts";
import { Max } from "@core/expressions/max.ts";
import { Min } from "@core/expressions/min.ts";
import { CountDistinct } from "@core/expressions/count-distinct.ts";
import { Expression, ExpressionAggregation } from "@core/expressions/index.ts";

export const createExpression = (type: Expression): ExpressionAggregation => {
  switch (type.type) {
    case "sum":
      return new Sum(type.field);
    case "avg":
      return new Avg(type.field);
    case "max":
      return new Max(type.field);
    case "min":
      return new Min(type.field);
    case "countDistinct":
      return new CountDistinct(type.field);
  }
};
