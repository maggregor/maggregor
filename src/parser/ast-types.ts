import { ASTVisitor } from './ast-visitor';

export interface ASTNode {
  type: string;
  accept(visitor: ASTVisitor): void;
}

export class ASTStageList implements ASTNode {
  type = 'stage-list';
  stages: ASTStage[] = [];

  constructor(stages: ASTStage[]) {
    this.stages = stages;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitStageList(this);
  }
}

export type ASTStage = ASTStageGroup;

export class ASTStageGroup implements ASTNode {
  type = 'stage-group';
  id: ASTReferenceField;
  properties: ASTProperty[];

  constructor(id: ASTReferenceField, properties: ASTProperty[]) {
    this.id = id;
    this.properties = properties;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitStageGroup(this);
  }
}

type AggregationOperator = 'sum' | 'avg' | 'min' | 'max';

export abstract class ASTAggregationExpression implements ASTNode {
  type = 'aggregation-expression';
  operator: AggregationOperator;
  field: ASTReferenceField;

  constructor(operator: AggregationOperator, field: ASTReferenceField) {
    this.operator = operator;
    this.field = field;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitAggregationExpression(this);
  }
}

export class ASTAggregationSum extends ASTAggregationExpression {
  constructor(field: ASTReferenceField) {
    super('sum', field);
  }
}

export class ASTAggregationAvg extends ASTAggregationExpression {
  constructor(field: ASTReferenceField) {
    super('avg', field);
  }
}

export class ASTAggregationMin extends ASTAggregationExpression {
  constructor(field: ASTReferenceField) {
    super('min', field);
  }
}

export class ASTAggregationMax extends ASTAggregationExpression {
  constructor(field: ASTReferenceField) {
    super('max', field);
  }
}

export type ASTOperation = ASTAggregationExpression;

export class ASTReferenceField implements ASTNode {
  type = 'reference-field';
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitReferenceField(this);
  }
}

export class ASTOutputFieldName implements ASTNode {
  type = 'output-field-name';
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitOutputFieldName(this);
  }
}
export class ASTProperty implements ASTNode {
  type = 'property';
  field: ASTOutputFieldName;
  operation: ASTOperation;

  constructor(field: ASTOutputFieldName, operation: ASTOperation) {
    this.field = field;
    this.operation = operation;
  }

  accept(visitor: ASTVisitor): void {
    return visitor.visitProperty(this);
  }
}
