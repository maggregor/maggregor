import type { CollectionListener } from '@core/index';
import type { Expression } from '../expressions';
import { BasicAccumulator } from './basic';
export type AccumulatorOperator = 'sum' | 'avg' | 'min' | 'max' | 'count';
export type AccumulatorFunction = (doc: Document[]) => Value;
export type Value = number | string | boolean | undefined;
export * from './basic';
export * from './cached';
export interface Accumulator {
    operator: AccumulatorOperator;
    expression: Expression | undefined;
    outputFieldName: string;
    getHash(): string;
    equals(acc: Accumulator): boolean;
}
export interface CachedAccumulator extends Accumulator, CollectionListener {
    add(val: Value): void;
    delete(val: Value): void;
    __init(value: Value): void;
    getCachedValue(): Value;
}
export type AccumulatorDefinition = {
    operator: AccumulatorOperator;
    outputFieldName?: string;
    expression?: Expression;
};
export declare function createBasicAccumulator(def: AccumulatorDefinition): BasicAccumulator;
export declare function createCachedAccumulator(def: AccumulatorDefinition): CachedAccumulator;
