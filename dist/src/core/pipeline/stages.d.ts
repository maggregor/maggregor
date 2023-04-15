import type { Accumulator } from './accumulators';
import type { Expression } from './expressions';
import type { Document } from '..';
export interface Stage {
    type: StageType;
    execute: (input: Document[], options?: Document) => Document[];
    next?: Stage;
}
export type GroupStageDefinition = {
    groupExpr: Expression;
    accumulators: Accumulator[];
};
export type StageType = 'match' | 'group' | 'sort' | 'limit' | 'skip';
export declare class GroupStage {
    type: StageType;
    groupExpr: Expression;
    accumulators: Accumulator[];
    next?: Stage | undefined;
    constructor(options: GroupStageDefinition);
    execute(data: Document[]): Document[];
}
export declare class MatchStage implements Stage {
    type: StageType;
    next?: Stage | undefined;
    conditions: Expression[];
    constructor(conditions: Expression[]);
    execute(docs: Document[]): Document[];
}
export type LimitStageOptions = {
    limit: number;
};
export declare class LimitStage implements Stage {
    type: StageType;
    next?: Stage | undefined;
    limit: number;
    constructor(options: LimitStageOptions);
    execute(docs: Document[]): Document[];
}
