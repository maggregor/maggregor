import { Sum } from "./expressions/sum.ts";
import { Avg } from "./expressions/avg.ts";
import { Max } from "./expressions/max.ts";
import { Min } from "./expressions/min.ts";
import { CountDistinct } from "./expressions/count-distinct.ts";
import {
  AvgExpression,
  CountDistinctExpression,
  Expression,
  ExpressionAggregation,
  MaxExpression,
  MinExpression,
  SumExpression,
} from "./expressions/index.ts";

export const createExpression = (type: Expression): ExpressionAggregation => {
  switch (Object.keys(type)[0]) {
    case "sum":
      return new Sum((type as SumExpression).sum);
    case "max":
      return new Max((type as MaxExpression).max);
    case "avg":
      return new Avg((type as AvgExpression).avg);
    case "min":
      return new Min((type as MinExpression).min);
    case "countDistinct":
      return new CountDistinct((type as CountDistinctExpression).countDistinct);
    default:
      throw new Error("Invalid expression type");
  }
};
