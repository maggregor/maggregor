import { assertEquals, assertNotEquals } from "asserts";
import {
  Expression,
  evaluateExpression,
  replaceExpressionByHash,
  resolveAllExpressionFields,
  toHashExpression,
} from "@core/pipeline/expressions.ts";
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

Deno.test({
  name: "toHashExpression equals",
  fn() {
    const expression1: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    const expression2: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    // expr1 = expr1
    assertEquals(toHashExpression(expression1), toHashExpression(expression1));
    // expr1 = expr2
    assertEquals(toHashExpression(expression1), toHashExpression(expression2));
    // expr2 = expr2
    assertEquals(toHashExpression(expression2), toHashExpression(expression2));
  },
});

Deno.test({
  name: "toHashExpression not equals",
  fn() {
    const expression1: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    const expression2: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 3 }],
    };
    // expr1 != expr2
    assertNotEquals(
      toHashExpression(expression1),
      toHashExpression(expression2)
    );
  },
});

Deno.test({
  name: "replaceExpressionByHash",
  fn() {
    const hash = toHashExpression({
      field: "action",
    });
    const expression1: Expression = {
      operator: "$add",
      value: [{ field: "action" }, { value: 2 }],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { field: "action" } is replaced by { field: hash }
    assertEquals(newExpr, {
      operator: "$add",
      value: [{ field: hash }, { value: 2 }],
    });
  },
});

Deno.test({
  name: "replaceExpressionByHash with nested expression",
  fn() {
    const hash = toHashExpression({
      field: "action",
    });
    const expression1: Expression = {
      operator: "$add",
      value: [
        { field: "action" },
        { operator: "$add", value: [{ field: "action" }, { value: 2 }] },
      ],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { field: "action" } is replaced by { field: hash }
    assertEquals(newExpr, {
      operator: "$add",
      value: [
        { field: hash },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
      ],
    });
  },
});

Deno.test({
  name: "replaceExpressionByHash with in two nested expression",
  fn() {
    const hash = toHashExpression({
      field: "action",
    });
    const expression1: Expression = {
      operator: "$add",
      value: [
        { field: "action" },
        { operator: "$add", value: [{ field: "action" }, { value: 2 }] },
        { operator: "$add", value: [{ field: "action" }, { value: 2 }] },
      ],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { field: "action" } is replaced by { field: hash }
    assertEquals(newExpr, {
      operator: "$add",
      value: [
        { field: hash },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
      ],
    });
  },
});

Deno.test({
  name: "replaceExpressionByHash hash of operation expression",
  fn() {
    const hash = toHashExpression({
      operator: "$add",
      value: [{ field: "action" }, { value: 2 }],
    });
    const expression1: Expression = {
      operator: "$add",
      value: [{ field: "action" }, { value: 2 }],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { operator: "$add", value: [{ field: "action" }, { value: 2 }] } is replaced by { field: hash }
    assertEquals(newExpr, {
      field: hash,
    });
  },
});

Deno.test({
  name: "replaceExpressionByHash hash of operation expression with nested expression",
  fn() {
    const hash = toHashExpression({
      operator: "$add",
      value: [
        { field: "action" },
        { operator: "$add", value: [{ field: "action" }, { value: 2 }] },
      ],
    });
    const expression1: Expression = {
      operator: "$add",
      value: [
        { field: "action" },
        { operator: "$add", value: [{ field: "action" }, { value: 2 }] },
      ],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { operator: "$add", value: [{ field: "action" }, { value: 2 }] } is replaced by { field: hash }
    assertEquals(newExpr, {
      field: hash,
    });
  },
});

Deno.test({
  name: "resolveAllExpressionFields",
  fn() {
    const exp1: Expression = { field: "action" };
    const exp2: Expression = {
      operator: "$concat",
      value: [{ field: "action" }, { value: "!!!" }],
    };
    const hash1 = toHashExpression(exp1);
    const hash2 = toHashExpression(exp2);
    const documents = [
      {
        [hash1]: "action1",
        [hash2]: "action1!!!",
      },
      {
        [hash1]: "action2",
        [hash2]: "action2!!!",
      },
    ];
    const newExpr = resolveAllExpressionFields([exp1, exp2], documents);
    console.log(newExpr);
    assertEquals(newExpr, [{ field: hash1 }, { field: hash2 }]);
  },
});
