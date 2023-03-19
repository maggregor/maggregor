import { assertEquals } from "asserts";
import { createExpression } from "@core/factory.ts";
import {
  AvgExpression,
  CountDistinctExpression,
  Expression,
  MaxExpression,
  MinExpression,
  SumExpression,
} from "@core/expressions/index.ts";

Deno.test("Create all expressions", () => {
  const expressions: Expression[] = [
    { type: "sum", field: "score" } as SumExpression,
    { type: "avg", field: "score" } as AvgExpression,
    { type: "max", field: "score" } as MaxExpression,
    { type: "min", field: "score" } as MinExpression,
    { type: "countDistinct", field: "score" } as CountDistinctExpression,
  ];

  for (const expression of expressions) {
    const expr = createExpression(expression);
    assertEquals(expr.type, expression.type);
  }
});
