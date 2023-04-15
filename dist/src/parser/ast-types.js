"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASTProperty = exports.ASTOutputFieldName = exports.ASTReferenceField = exports.ASTAggregationMax = exports.ASTAggregationMin = exports.ASTAggregationAvg = exports.ASTAggregationSum = exports.ASTAggregationExpression = exports.ASTStageGroup = exports.ASTStageList = void 0;
class ASTStageList {
    constructor(stages) {
        this.type = 'stage-list';
        this.stages = [];
        this.stages = stages;
    }
}
exports.ASTStageList = ASTStageList;
class ASTStageGroup {
    constructor(id, properties) {
        this.type = 'stage-group';
        this.id = id;
        this.properties = properties;
    }
}
exports.ASTStageGroup = ASTStageGroup;
class ASTAggregationExpression {
    constructor(operator, field) {
        this.type = 'aggregation-expression';
        this.operator = operator;
        this.field = field;
    }
}
exports.ASTAggregationExpression = ASTAggregationExpression;
class ASTAggregationSum extends ASTAggregationExpression {
    constructor(field) {
        super('sum', field);
    }
}
exports.ASTAggregationSum = ASTAggregationSum;
class ASTAggregationAvg extends ASTAggregationExpression {
    constructor(field) {
        super('avg', field);
    }
}
exports.ASTAggregationAvg = ASTAggregationAvg;
class ASTAggregationMin extends ASTAggregationExpression {
    constructor(field) {
        super('min', field);
    }
}
exports.ASTAggregationMin = ASTAggregationMin;
class ASTAggregationMax extends ASTAggregationExpression {
    constructor(field) {
        super('max', field);
    }
}
exports.ASTAggregationMax = ASTAggregationMax;
class ASTReferenceField {
    constructor(name) {
        this.type = 'reference-field';
        this.name = name;
    }
}
exports.ASTReferenceField = ASTReferenceField;
class ASTOutputFieldName {
    constructor(name) {
        this.type = 'output-field-name';
        this.name = name;
    }
}
exports.ASTOutputFieldName = ASTOutputFieldName;
class ASTProperty {
    constructor(field, operation) {
        this.type = 'property';
        this.field = field;
        this.operation = operation;
    }
}
exports.ASTProperty = ASTProperty;
//# sourceMappingURL=ast-types.js.map