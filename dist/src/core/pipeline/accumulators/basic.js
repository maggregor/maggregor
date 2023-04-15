"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxBasicAccumulator = exports.MinBasicAccumulator = exports.SumBasicAccumulator = exports.CountBasicAccumulator = exports.AvgBasicAccumulator = exports.BasicAccumulator = void 0;
const expressions_1 = require("../expressions");
const common_1 = require("./common");
class BasicAccumulator extends common_1.BaseAccumulator {
}
exports.BasicAccumulator = BasicAccumulator;
class AvgBasicAccumulator extends BasicAccumulator {
    constructor(definition) {
        super('avg', definition);
    }
    evaluate(docs) {
        return (docs.reduce((acc, doc) => {
            const value = (0, expressions_1.evaluateExpression)(this.expression, doc);
            return acc + value;
        }, 0) / docs.length);
    }
}
exports.AvgBasicAccumulator = AvgBasicAccumulator;
class CountBasicAccumulator extends BasicAccumulator {
    constructor(definition) {
        super('count', definition);
    }
    evaluate(docs) {
        return docs.reduce((acc, doc) => {
            const value = (0, expressions_1.evaluateExpression)(this.expression, doc);
            return value ? acc + 1 : acc;
        }, 0);
    }
}
exports.CountBasicAccumulator = CountBasicAccumulator;
class SumBasicAccumulator extends BasicAccumulator {
    constructor(definition) {
        super('sum', definition);
    }
    evaluate(docs) {
        return docs.reduce((acc, doc) => {
            const value = (0, expressions_1.evaluateExpression)(this.expression, doc);
            return acc + value;
        }, 0);
    }
}
exports.SumBasicAccumulator = SumBasicAccumulator;
class MinBasicAccumulator extends BasicAccumulator {
    constructor(definition) {
        super('min', definition);
    }
    evaluate(docs) {
        return docs.reduce((acc, doc) => {
            const value = (0, expressions_1.evaluateExpression)(this.expression, doc);
            return value < acc ? value : acc;
        }, Infinity);
    }
}
exports.MinBasicAccumulator = MinBasicAccumulator;
class MaxBasicAccumulator extends common_1.BaseAccumulator {
    constructor(definition) {
        super('max', definition);
    }
    evaluate(docs) {
        return docs.reduce((acc, doc) => {
            const value = (0, expressions_1.evaluateExpression)(this.expression, doc);
            return value > acc ? value : acc;
        }, -Infinity);
    }
}
exports.MaxBasicAccumulator = MaxBasicAccumulator;
//# sourceMappingURL=basic.js.map