import type { CollectionListener, Document } from '@core/index';
import type { AccumulatorDefinition } from './pipeline/accumulators';
import type { Expression } from './pipeline/expressions';
export interface MaterializedViewDefinition {
    groupBy: Expression;
    accumulatorDefs: AccumulatorDefinition[];
}
export declare class MaterializedView implements CollectionListener {
    private groupBy;
    private definitions;
    private results;
    constructor(options: MaterializedViewDefinition);
    addDocument(doc: Document): void;
    deleteDocument(doc: Document): void;
    updateDocument(oldDoc: Document, newDoc: Document): void;
    getView(): Document[];
    getAccumulatorHashes(): string[];
    getGroupExpression(): Expression;
    getAccumulatorDefinitions(): AccumulatorDefinition[];
}
