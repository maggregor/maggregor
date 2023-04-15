export interface ASTNode {
    type: string;
}
export declare class ASTStageList implements ASTNode {
    type: string;
    stages: ASTStage[];
    constructor(stages: ASTStage[]);
}
export type ASTStage = ASTStageGroup;
export declare class ASTStageGroup implements ASTNode {
    type: string;
    id: ASTReferenceField;
    properties: ASTProperty[];
    constructor(id: ASTReferenceField, properties: ASTProperty[]);
}
type AggregationOperator = 'sum' | 'avg' | 'min' | 'max';
export declare abstract class ASTAggregationExpression implements ASTNode {
    type: string;
    operator: AggregationOperator;
    field: ASTReferenceField;
    constructor(operator: AggregationOperator, field: ASTReferenceField);
}
export declare class ASTAggregationSum extends ASTAggregationExpression {
    constructor(field: ASTReferenceField);
}
export declare class ASTAggregationAvg extends ASTAggregationExpression {
    constructor(field: ASTReferenceField);
}
export declare class ASTAggregationMin extends ASTAggregationExpression {
    constructor(field: ASTReferenceField);
}
export declare class ASTAggregationMax extends ASTAggregationExpression {
    constructor(field: ASTReferenceField);
}
export type ASTOperation = ASTAggregationExpression;
export declare class ASTReferenceField implements ASTNode {
    type: string;
    name: string;
    constructor(name: string);
}
export declare class ASTOutputFieldName implements ASTNode {
    type: string;
    name: string;
    constructor(name: string);
}
export declare class ASTProperty implements ASTNode {
    type: string;
    field: ASTOutputFieldName;
    operation: ASTOperation;
    constructor(field: ASTOutputFieldName, operation: ASTOperation);
}
export {};
