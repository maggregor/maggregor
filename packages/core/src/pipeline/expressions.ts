import { Document, DocumentFieldValue } from "@core/index.ts";

/**
 * An expression
 */
export interface Expression {
  field?: string;
  operator?: ExpressionOperator;
  value?: ExpressionValue | ExpressionValue[];
}
export type ExpressionResult = any;
export type ExpressionValue = number | string | boolean | Expression;
export type ExpressionOperator =
  | "$add"
  | "$subtract"
  | "$multiply"
  | "$divide"
  | "$toUpper"
  | "$toLower"
  | "$eq"
  | "$ne"
  | "$gt"
  | "$gte"
  | "$lt"
  | "$lte"
  | "$and"
  | "$or"
  | "$not"
  | "$concat"
  | "$mod";

/**
 * Evaluate an expression on a document
 * @param expression
 * @param doc
 */
export function evaluateExpression(
  expression: Expression,
  doc: Document
): ExpressionResult | undefined {
  if (!expression) {
    return undefined;
  }

  // Check if the expression is a field
  // Example: { field: "field_name" } or { field: "field_name.nested_field" }
  if (expression.field) {
    return getFieldValue(doc, expression.field);
  }

  // Check if the expression is a literal value
  // Example: "literal value" or 123 or true
  if (typeof expression !== "object") {
    // This is an expression as a literal value
    return expression;
  }

  // Check if the value of the expression is a literal value
  // Example: { value: "literal value" } or { value: 123 } or { value: true }
  if (
    expression.operator === undefined &&
    expression.value !== undefined &&
    typeof expression.value !== "object"
  ) {
    return expression.value;
  }

  // Reject the expression if it is not a valid function call
  if (expression.operator === undefined && expression.value === undefined) {
    throw new Error(`Invalid expression: ${JSON.stringify(expression)}`);
  }

  if (expression.operator === "$add") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, doc)
    );
    return args.reduce((acc, val) => acc + val, 0);
  }

  if (expression.operator === "$multiply") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, doc)
    );
    return args.reduce((acc, val) => acc * val, 1);
  }

  if (expression.operator === "$divide") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue / rightValue;
  }

  if (expression.operator === "$toUpper") {
    const value = evaluateExpression(expression.value as Expression, doc);
    return typeof value === "string" ? value.toUpperCase() : value;
  }

  if (expression.operator === "$eq") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue === rightValue;
  }

  if (expression.operator === "$ne") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue !== rightValue;
  }

  if (expression.operator === "$gt") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue > rightValue;
  }

  if (expression.operator === "$gte") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue >= rightValue;
  }

  if (expression.operator === "$lt") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue < rightValue;
  }

  if (expression.operator === "$lte") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue <= rightValue;
  }

  if (expression.operator === "$concat") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, doc)
    );
    return args.reduce((acc, val) => acc + val, "");
  }

  if (expression.operator === "$mod") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue % rightValue;
  }

  if (expression.operator === "$and") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, doc)
    );
    return args.reduce((acc, val) => acc && val, true);
  }

  if (expression.operator === "$or") {
    const args = (expression.value as Expression[]).map((arg) =>
      evaluateExpression(arg, doc)
    );
    return args.reduce((acc, val) => acc || val, false);
  }

  if (expression.operator === "$not") {
    return !evaluateExpression(expression.value as Expression, doc);
  }

  if (expression.operator === "$toLower") {
    const value = evaluateExpression(expression.value as Expression, doc);
    return typeof value === "string" ? value.toLowerCase() : value;
  }

  if (expression.operator === "$subtract") {
    const [leftValue, rightValue] = (expression.value as Expression[]).map(
      (arg) => evaluateExpression(arg, doc)
    );
    return leftValue - rightValue;
  }

  if (expression.operator === "$toUpper") {
    const value = evaluateExpression(expression.value as Expression, doc);
    return typeof value === "string" ? value.toUpperCase() : value;
  }

  throw new Error(`Unknown expression operator: ${expression.operator}`);
}

/**
 * Get the value of a field in a document
 * @param doc
 * @param fieldName
 * @returns
 */
function getFieldValue(
  doc: Document,
  fieldName: string
): DocumentFieldValue | undefined {
  const path = fieldName.split(".");
  let value: Document = doc;
  for (let i = 0; i < path.length; i++) {
    value = value[path[i]] as Document;
    if (value === undefined) {
      return undefined;
    }
  }
  return value as DocumentFieldValue;
}
