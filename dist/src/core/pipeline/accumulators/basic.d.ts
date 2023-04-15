import { BaseAccumulator } from './common';
import type { AccumulatorDefinition } from '.';
import type { Document } from '@core/index';
export declare abstract class BasicAccumulator extends BaseAccumulator {
    abstract evaluate(docs: Document[]): number;
}
export declare class AvgBasicAccumulator extends BasicAccumulator {
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    evaluate(docs: Document[]): number;
}
export declare class CountBasicAccumulator extends BasicAccumulator {
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    evaluate(docs: Document[]): number;
}
export declare class SumBasicAccumulator extends BasicAccumulator {
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    evaluate(docs: Document[]): number;
}
export declare class MinBasicAccumulator extends BasicAccumulator {
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    evaluate(docs: Document[]): number;
}
export declare class MaxBasicAccumulator extends BaseAccumulator {
    constructor(definition: Omit<AccumulatorDefinition, 'operator'>);
    evaluate(docs: Document[]): number;
}
