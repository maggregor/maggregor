import { assertEquals } from "asserts";
import { Expression, evaluateExpression } from "@core/pipeline/expressions.ts";
import { Document } from "@core/index.ts";

Deno.test({
  name: "Simple $add expression",
  fn() {
    const expression: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), 3);
  },
});

Deno.test({
  name: "Simple $subtract expression",
  fn() {
    const expression: Expression = {
      operator: "$subtract",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), -1);
  },
});

Deno.test({
  name: "Simple $multiply expression",
  fn() {
    const expression: Expression = {
      operator: "$multiply",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), 2);
  },
});

Deno.test({
  name: "Simple $divide expression",
  fn() {
    const expression: Expression = {
      operator: "$divide",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), 0.5);
  },
});

Deno.test({
  name: "Simple $mod expression",
  fn() {
    const expression: Expression = {
      operator: "$mod",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), 1);
  },
});

Deno.test({
  name: "Simple $eq expression",
  fn() {
    const expression: Expression = {
      operator: "$eq",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), false);
  },
});

Deno.test({
  name: "Simple $ne expression",
  fn() {
    const expression: Expression = {
      operator: "$ne",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), true);
  },
});

Deno.test({
  name: "Simple $gt expression",
  fn() {
    const expression: Expression = {
      operator: "$gt",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), false);
  },
});

Deno.test({
  name: "Simple $gte expression",
  fn() {
    const expression: Expression = {
      operator: "$gte",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), false);
  },
});

Deno.test({
  name: "Simple $lt expression",
  fn() {
    const expression: Expression = {
      operator: "$lt",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), true);
  },
});

Deno.test({
  name: "Simple $lte expression",
  fn() {
    const expression: Expression = {
      operator: "$lte",
      value: [{ value: 1 }, { value: 2 }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), true);
  },
});

Deno.test({
  name: "Simple $and expression",
  fn() {
    const expression: Expression = {
      operator: "$and",
      value: [{ value: true }, { value: false }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), false);
  },
});

Deno.test({
  name: "Simple $or expression",
  fn() {
    const expression: Expression = {
      operator: "$or",
      value: [{ value: true }, { value: false }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), true);
  },
});

Deno.test({
  name: "Simple $not expression",
  fn() {
    const expression: Expression = {
      operator: "$not",
      value: true,
    };
    assertEquals(evaluateExpression(expression, {} as Document), false);
  },
});

Deno.test({
  name: "Simple $concat expression",
  fn() {
    const expression: Expression = {
      operator: "$concat",
      value: [{ value: "Hello " }, { value: "World" }],
    };
    assertEquals(evaluateExpression(expression, {} as Document), "Hello World");
  },
});

Deno.test({
  name: "Simple $toUpper expression",
  fn() {
    const expression: Expression = {
      operator: "$toUpper",
      value: "Hello World",
    };
    assertEquals(evaluateExpression(expression, {} as Document), "HELLO WORLD");
  },
});

Deno.test({
  name: "Simple $toLower expression",
  fn() {
    const expression: Expression = {
      operator: "$toLower",
      value: "Hello World",
    };
    assertEquals(evaluateExpression(expression, {} as Document), "hello world");
  },
});

Deno.test({
  name: "Simple $concat expression with multiple values",
  fn() {
    const expression: Expression = {
      operator: "$concat",
      value: [{ value: "Hello " }, { value: "World" }, { value: "!" }],
    };
    assertEquals(
      evaluateExpression(expression, {} as Document),
      "Hello World!"
    );
  },
});

Deno.test({
  name: "Simple $concat expression with multiple values and a separator",
  fn() {
    const expression: Expression = {
      operator: "$concat",
      value: [
        { value: "Hello " },
        { value: "World" },
        { value: "!" },
        { value: " " },
        { value: "How are you?" },
      ],
    };
    assertEquals(
      evaluateExpression(expression, {} as Document),
      "Hello World! How are you?"
    );
  },
});
