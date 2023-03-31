import { expect, it, describe } from "vitest";
import {
  Expression,
  evaluateExpression,
  replaceExpressionByHash,
  resolveAllExpressionFields,
  toHashExpression,
} from "../../src/pipeline/expressions";
import { Document } from "../../src";

describe("Expressions", () => {
  it("Simple $add expression", () => {
    const expression: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(3);
  });

  it("Simple $subtract expression", () => {
    const expression: Expression = {
      operator: "$subtract",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(-1);
  });

  it("Simple $multiply expression", () => {
    const expression: Expression = {
      operator: "$multiply",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(2);
  });

  it("Simple $divide expression", () => {
    const expression: Expression = {
      operator: "$divide",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(0.5);
  });

  it("Simple $mod expression", () => {
    const expression: Expression = {
      operator: "$mod",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(1);
  });

  it("Simple $eq expression", () => {
    const expression: Expression = {
      operator: "$eq",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(false);
  });

  it("Simple $ne expression", () => {
    const expression: Expression = {
      operator: "$ne",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(true);
  });

  it("Simple $gt expression", () => {
    const expression: Expression = {
      operator: "$gt",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(false);
  });

  it("Simple $gte expression", () => {
    const expression: Expression = {
      operator: "$gte",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(false);
  });

  it("Simple $lt expression", () => {
    const expression: Expression = {
      operator: "$lt",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(true);
  });

  it("Simple $lte expression", () => {
    const expression: Expression = {
      operator: "$lte",
      value: [{ value: 1 }, { value: 2 }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(true);
  });

  it("Simple $and expression", () => {
    const expression: Expression = {
      operator: "$and",
      value: [{ value: true }, { value: false }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(false);
  });

  it("Simple $or expression", () => {
    const expression: Expression = {
      operator: "$or",
      value: [{ value: true }, { value: false }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(true);
  });

  it("Simple $not expression", () => {
    expect(
      evaluateExpression(
        {
          operator: "$not",
          value: true,
        },
        {} as Document
      )
    ).toEqual(false);
    expect(
      evaluateExpression(
        {
          operator: "$not",
          value: false,
        },
        {} as Document
      )
    ).toEqual(true);
  });

  it("Simple $concat expression", () => {
    const expression: Expression = {
      operator: "$concat",
      value: [{ value: "Hello" }, { value: "World" }],
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(
      "HelloWorld"
    );
  });

  it("Simple $toLower expression", () => {
    const expression: Expression = {
      operator: "$toLower",
      value: "HelloWorld",
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(
      "helloworld"
    );
  });

  it("Simple $toLower expression on field", () => {
    const expression: Expression = {
      operator: "$toLower",
      value: {
        field: "foo",
      },
    };
    expect(evaluateExpression(expression, { foo: "BaR" } as Document)).toEqual(
      "bar"
    );
  });

  it("Simple $toUpper expression", () => {
    const expression: Expression = {
      operator: "$toUpper",
      value: "HelloWorld",
    };
    expect(evaluateExpression(expression, {} as Document)).toEqual(
      "HELLOWORLD"
    );
  });

  it("Simple $toUpper expression on field", () => {
    const expression: Expression = {
      operator: "$toUpper",
      value: {
        field: "foo",
      },
    };
    expect(evaluateExpression(expression, { foo: "BaR" } as Document)).toEqual(
      "BAR"
    );
  });
});

describe("toHashExpression", () => {
  it("returns the same hash for equivalent expressions", () => {
    const expression1: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    const expression2: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    // expr1 = expr1
    expect(toHashExpression(expression1)).toEqual(
      toHashExpression(expression1)
    );
    // expr1 = expr2
    expect(toHashExpression(expression1)).toEqual(
      toHashExpression(expression2)
    );
    // expr2 = expr2
    expect(toHashExpression(expression2)).toEqual(
      toHashExpression(expression2)
    );
  });

  it("returns different hashes for different expressions", () => {
    const expression1: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 2 }],
    };
    const expression2: Expression = {
      operator: "$add",
      value: [{ value: 1 }, { value: 3 }],
    };
    // expr1 != expr2
    expect(toHashExpression(expression1)).not.toEqual(
      toHashExpression(expression2)
    );
  });
});

describe("replaceExpressionByHash", () => {
  it("replaces expression with hash", () => {
    const hash = toHashExpression({
      field: "action",
    });
    const expression1: Expression = {
      operator: "$add",
      value: [{ field: "action" }, { value: 2 }],
    };
    const newExpr = replaceExpressionByHash(expression1, hash);
    // { field: "action" } is replaced by { field: hash }
    expect(newExpr).toEqual({
      operator: "$add",
      value: [{ field: hash }, { value: 2 }],
    });
  });

  it("replaces nested expressions with hash", () => {
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
    expect(newExpr).toEqual({
      operator: "$add",
      value: [
        { field: hash },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
      ],
    });
  });
});

describe("replaceExpressionByHash with in two nested expression", () => {
  it("should replace expression by hash", () => {
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
    expect(newExpr).toEqual({
      operator: "$add",
      value: [
        { field: hash },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
        { operator: "$add", value: [{ field: hash }, { value: 2 }] },
      ],
    });
  });
});

describe("replaceExpressionByHash hash of operation expression", () => {
  it("should replace operation expression by hash", () => {
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
    expect(newExpr).toEqual({
      field: hash,
    });
  });
});

describe("replaceExpressionByHash hash of operation expression with nested expression", () => {
  it("should replace nested operation expression by hash", () => {
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
    expect(newExpr).toEqual({
      field: hash,
    });
  });
});

describe("resolveAllExpressionFields", () => {
  it("should resolve all expression fields", () => {
    const exp1: Expression = { field: "action" };
    const exp2: Expression = {
      operator: "$concat",
      value: [{ field: "action" }, { value: "!!!" }],
    };
    const hash1 = toHashExpression(exp1);
    const hash2 = toHashExpression(exp2);
    const documents = [
      { [hash1]: "action1", [hash2]: "action1!!!" },
      {
        [hash1]: "action2",
        [hash2]: "action2!!!",
      },
    ];
    const newExpr = resolveAllExpressionFields([exp1, exp2], documents);

    expect(newExpr).toEqual([{ field: hash1 }, { field: hash2 }]);
  });
});
