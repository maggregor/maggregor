import type { Accumulator, AccumulatorDefinition, AccumulatorOperator } from '.';
import type { Expression } from '../expressions';
export declare abstract class BaseAccumulator implements Accumulator {
    operator: AccumulatorOperator;
    expression: Expression;
    outputFieldName: string | undefined;
    hash: string;
    constructor(operator: AccumulatorOperator, def?: Omit<AccumulatorDefinition, 'operator'>);
    getHash(): string;
    equals(acc: Accumulator): boolean;
}
export declare function hash(o: Object): string;
export declare function deepEqual(objet1: Record<string, unknown>, objet2: Record<string, unknown>): boolean;
