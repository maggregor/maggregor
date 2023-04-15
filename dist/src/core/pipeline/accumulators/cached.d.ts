import type { CachedAccumulator, Value, AccumulatorDefinition } from '.';
import { BaseAccumulator } from './common';
import type { Document } from '@core/index';
declare abstract class AbstractCachedAccumulator extends BaseAccumulator implements CachedAccumulator {
    protected __cachedValue: Value;
    abstract add(val: Value): void;
    abstract delete(val: Value): void;
    __init(value: Value): void;
    addDocument(doc: Document): void;
    updateDocument(oldDoc: Document, newDoc: Document): void;
    deleteDocument(doc: Document): void;
    getCachedValue(): Value;
}
export declare class SumCachedAccumulator extends AbstractCachedAccumulator {
    __cachedValue: number | undefined;
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    add(val: number): void;
    delete(val: number): void;
}
export declare class AvgCachedAccumulator extends AbstractCachedAccumulator {
    __cachedValue: number | undefined;
    private __count;
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    add(val: number): void;
    delete(val: number): void;
    getCachedValue(): number | undefined;
}
export declare class MinCachedAccumulator extends AbstractCachedAccumulator {
    __cachedValue: number | undefined;
    private values;
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    add(val: number): void;
    delete(val: number): void;
}
export declare class MaxCachedAccumulator extends AbstractCachedAccumulator {
    __cachedValue: number | undefined;
    private values;
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    add(val: number): void;
    delete(val: number): void;
}
export declare class CountCachedAccumulator extends AbstractCachedAccumulator {
    protected __cachedValue: number;
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    add(val: boolean): void;
    delete(val: boolean): void;
}
export {};
