export interface Expression {
  field?: string;
  operator?: string;
  value?: ExpressionValue | ExpressionValue[];
}

type ExpressionValue = number | string | boolean | Expression;

export function evaluateExpression(expression: Expression, data: any): any {
  if (!expression) {
    return undefined;
  }

  if (expression.field) {
    return getFieldValue(data, expression.field);
  }

  if (expression.operator === "+") {
    const leftValue = evaluateExpression(expression.value as Expression, data);
    const rightValue = evaluateExpression(expression.field as Expression, data);
    return leftValue + rightValue;
  }

  if (expression.operator === "-") {
    const leftValue = evaluateExpression(expression.value as Expression, data);
    const rightValue = evaluateExpression(expression.field as Expression, data);
    return leftValue - rightValue;
  }

  if (expression.operator === "*") {
    const leftValue = evaluateExpression(expression.value as Expression, data);
    const rightValue = evaluateExpression(expression.field as Expression, data);
    return leftValue * rightValue;
  }

  if (expression.operator === "/") {
    const leftValue = evaluateExpression(expression.value as Expression, data);
    const rightValue = evaluateExpression(expression.field as Expression, data);
    return leftValue / rightValue;
  }

  if (expression.operator === "%") {
    const leftValue = evaluateExpression(expression.value as Expression, data);
    const rightValue = evaluateExpression(expression.field as Expression, data);
    return leftValue % rightValue;
  }

  if (expression.operator === "$add") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce((acc, val) => acc + val, 0);
  }

  if (expression.operator === "$subtract") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return leftValue - rightValue;
  }

  if (expression.operator === "$multiply") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce((acc, val) => acc * val, 1);
  }

  if (expression.operator === "$divide") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return leftValue / rightValue;
  }

  if (expression.operator === "$mod") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return leftValue % rightValue;
  }

  if (expression.operator === "$concat") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.join("");
  }

  if (expression.operator === "$strcasecmp") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return leftValue.localeCompare(rightValue, undefined, {
      sensitivity: "base",
    });
  }

  if (expression.operator === "$toLower") {
    const value = evaluateExpression(expression.value as Expression, data);
    return typeof value === "string" ? value.toLowerCase() : value;
  }

  if (expression.operator === "$toUpper") {
    const value = evaluateExpression(expression.value as Expression, data);
    return typeof value === "string" ? value.toUpperCase() : value;
  }

  if (expression.operator === "$substr") {
    const [value, start, length] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return typeof value === "string" ? value.substr(start, length) : value;
  }
  if (expression.operator === "$trim") {
    const value = evaluateExpression(expression.value as Expression, data);
    return typeof value === "string" ? value.trim() : value;
  }

  if (expression.operator === "$arrayElemAt") {
    const [array, index] = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return Array.isArray(array) ? array[index] : undefined;
  }

  if (expression.operator === "$concatArrays") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce(
      (acc, arr) => (Array.isArray(arr) ? acc.concat(arr) : acc),
      []
    );
  }

  if (expression.operator === "$size") {
    const value = evaluateExpression(expression.value as Expression, data);
    return Array.isArray(value) ? value.length : 0;
  }

  if (expression.operator === "$slice") {
    const [array, start, end] = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return Array.isArray(array) ? array.slice(start, end) : [];
  }

  if (expression.operator === "$filter") {
    const [input, cond] = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return Array.isArray(input) && typeof cond === "object"
      ? input.filter((item) => evaluateExpression(cond, { curr: item }))
      : [];
  }

  if (expression.operator === "$map") {
    const [input, as, inExpr] = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    if (
      Array.isArray(input) &&
      typeof as === "string" &&
      typeof inExpr === "object"
    ) {
      return input.map((item) =>
        evaluateExpression(inExpr, { ...data, [as]: item })
      );
    } else {
      return [];
    }
  }

  if (expression.operator === "$reduce") {
    const [input, initialValue, inExpr] = (
      expression.value as Expression[]
    ).map((arg) => evaluateExpression(arg, data));
    if (Array.isArray(input) && typeof inExpr === "object") {
      return input.reduce(
        (acc, item) => evaluateExpression(inExpr, { ...data, curr: item, acc }),
        initialValue
      );
    } else {
      return initialValue;
    }
  }

  if (expression.operator === "$cond") {
    const [ifExpr, thenExpr, elseExpr] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    return evaluateExpression(ifExpr, data) ? thenExpr : elseExpr;
  }

  if (expression.operator === "$ifNull") {
    const [expr1, expr2] = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return expr1 !== null && expr1 !== undefined ? expr1 : expr2;
  }

  if (expression.operator === "$switch") {
    const [branches, defaultExpr] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, data)
    );
    for (const { case: caseExpr, then: thenExpr } of branches) {
      if (evaluateExpression(caseExpr, data)) {
        return evaluateExpression(thenExpr, data);
      }
    }
    return defaultExpr;
  }

  if (expression.operator === "$sum") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce((acc, value) => acc + value, 0);
  }

  if (expression.operator === "$avg") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );

    return args.reduce((acc, value) => acc + value, 0) / args.length;
  }

  if (expression.operator === "$min") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce((acc, value) => Math.min(acc, value), Infinity);
  }

  if (expression.operator === "$max") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, data)
    );
    return args.reduce((acc, value) => Math.max(acc, value), -Infinity);
  }
}

function getFieldValue(data: any, fieldName: string): any {
  const fields = fieldName.split(".");
  let value = data;
  for (const field of fields) {
    value = value ? value[field] : undefined;
    if (value === undefined) {
      break;
    }
  }
  return value;
}

const data = { prix: 10, quantite: 5 };
const expression: Expression = {
  operator: "$multiply",
  value: [
    { field: "prix" },
    { field: "quantite" },
    {
      operator: "$multiply",
      value: [{ field: "prix" }, { field: "quantite" }],
    },
  ],
};

if (import.meta.main) {
  const result = evaluateExpression(expression, data);
  console.log(result);
}
