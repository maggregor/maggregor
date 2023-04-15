import type { Document } from '@core/index';
export interface Expression {
    field?: string;
    operator?: ExpressionOperator;
    value?: ExpressionValue | ExpressionValue[];
}
export type ExpressionResult = any;
export type ExpressionValue = number | string | boolean | Expression;
export type ExpressionOperator = 'add' | 'subtract' | 'multiply' | 'divide' | 'toUpper' | 'toLower' | 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'and' | 'or' | 'not' | 'concat' | 'mod' | 'cond';
export declare function evaluateExpression(expression: Expression, doc: Document): ExpressionResult | undefined;
export declare function toHashExpression(expression: Expression): string;
export declare function replaceExpressionByHash(expression: Expression, hash: string): Expression;
export declare function resolveAllExpressionFields(expressions: Expression[], doc: Document[]): Expression[];
