"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAllExpressionFields = exports.replaceExpressionByHash = exports.toHashExpression = exports.evaluateExpression = void 0;
const crypto_1 = __importDefault(require("crypto"));
function evaluateExpression(expression, doc) {
    if (!expression) {
        return undefined;
    }
    if (expression.field) {
        return getFieldValue(doc, expression.field);
    }
    if (typeof expression !== 'object') {
        return expression;
    }
    if (expression.operator === undefined &&
        expression.value !== undefined &&
        typeof expression.value !== 'object') {
        return expression.value;
    }
    if (expression.operator === undefined && expression.value === undefined) {
        throw new Error(`Invalid expression: ${JSON.stringify(expression)}`);
    }
    if (expression.operator === 'add') {
        const args = expression.value.map((arg) => evaluateExpression(arg, doc));
        return args.reduce((acc, val) => acc + val, 0);
    }
    if (expression.operator === 'multiply') {
        const args = expression.value.map((arg) => evaluateExpression(arg, doc));
        return args.reduce((acc, val) => acc * val, 1);
    }
    if (expression.operator === 'divide') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue / rightValue;
    }
    if (expression.operator === 'toUpper') {
        const value = evaluateExpression(expression.value, doc);
        return typeof value === 'string' ? value.toUpperCase() : value;
    }
    if (expression.operator === 'eq') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue === rightValue;
    }
    if (expression.operator === 'ne') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue !== rightValue;
    }
    if (expression.operator === 'gt') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue > rightValue;
    }
    if (expression.operator === 'gte') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue >= rightValue;
    }
    if (expression.operator === 'lt') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue < rightValue;
    }
    if (expression.operator === 'lte') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue <= rightValue;
    }
    if (expression.operator === 'concat') {
        const args = expression.value.map((arg) => evaluateExpression(arg, doc));
        return args.reduce((acc, val) => acc + val, '');
    }
    if (expression.operator === 'mod') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue % rightValue;
    }
    if (expression.operator === 'and') {
        const args = expression.value.map((arg) => evaluateExpression(arg, doc));
        return args.reduce((acc, val) => acc && val, true);
    }
    if (expression.operator === 'or') {
        const args = expression.value.map((arg) => evaluateExpression(arg, doc));
        return args.reduce((acc, val) => acc || val, false);
    }
    if (expression.operator === 'not') {
        return !evaluateExpression(expression.value, doc);
    }
    if (expression.operator === 'toLower') {
        const value = evaluateExpression(expression.value, doc);
        return typeof value === 'string' ? value.toLowerCase() : value;
    }
    if (expression.operator === 'subtract') {
        const [leftValue, rightValue] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return leftValue - rightValue;
    }
    if (expression.operator === 'cond') {
        const [condition, ifTrue, ifFalse] = expression.value.map((arg) => evaluateExpression(arg, doc));
        return condition ? ifTrue : ifFalse;
    }
    throw new Error(`Unknown expression operator: ${expression.operator}`);
}
exports.evaluateExpression = evaluateExpression;
function getFieldValue(doc, fieldName) {
    const path = fieldName.split('.');
    let value = doc;
    for (let i = 0; i < path.length; i++) {
        value = value[path[i]];
        if (value === undefined) {
            return undefined;
        }
    }
    return value;
}
function toHashExpression(expression) {
    return crypto_1.default
        .createHash('sha256')
        .update(JSON.stringify(expression))
        .digest('hex');
}
exports.toHashExpression = toHashExpression;
function replaceExpressionByHash(expression, hash) {
    const hashExpression = toHashExpression(expression);
    if (hashExpression === hash) {
        return {
            field: hash,
        };
    }
    if (expression.value === undefined) {
        return expression;
    }
    if (Array.isArray(expression.value)) {
        const args = expression.value.map((arg) => replaceExpressionByHash(arg, hash));
        return Object.assign(Object.assign({}, expression), { value: args });
    }
    return expression;
}
exports.replaceExpressionByHash = replaceExpressionByHash;
function resolveAllExpressionFields(expressions, doc) {
    const allDocKeys = [...new Set(doc.flatMap((d) => Object.keys(d)))];
    const exprs = expressions;
    for (let i = 0; i < exprs.length; i++) {
        let expr = exprs[i];
        let smallestExpression = Infinity;
        allDocKeys.forEach((docKey) => {
            const potentialHash = docKey;
            const replaced = replaceExpressionByHash(exprs[i], potentialHash);
            if (countExpressionInTree(replaced) < smallestExpression) {
                smallestExpression = countExpressionInTree(replaced);
                expr = replaced;
            }
        });
        exprs[i] = expr;
    }
    return exprs;
}
exports.resolveAllExpressionFields = resolveAllExpressionFields;
function countExpressionInTree(e) {
    if (e.value === undefined) {
        return 0;
    }
    if (Array.isArray(e.value)) {
        return e.value.reduce((acc, val) => acc + countExpressionInTree(val), 1);
    }
    return 1;
}
//# sourceMappingURL=expressions.js.map