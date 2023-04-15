"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LimitStage = exports.MatchStage = exports.GroupStage = void 0;
const expressions_1 = require("./expressions");
class GroupStage {
    constructor(options) {
        this.type = 'group';
        this.groupExpr = options.groupExpr;
        this.accumulators = options.accumulators;
    }
    execute(data) {
        const { groupExpr, accumulators } = this;
        const groups = data.reduce((acc, doc) => {
            const resolved = (0, expressions_1.resolveAllExpressionFields)([groupExpr], [doc]);
            const key = (0, expressions_1.evaluateExpression)(resolved[0], doc);
            if (acc[key]) {
                acc[key].push(doc);
            }
            else {
                acc[key] = [doc];
            }
            return acc;
        }, {});
        return Object.entries(groups).map(([key, docs]) => {
            const group = { _id: key };
            accumulators.forEach((acc) => {
                const allDocKeys = [...new Set(docs.flatMap((d) => Object.keys(d)))];
                if (allDocKeys.includes(acc.getHash())) {
                    group[acc.outputFieldName] = docs[0][acc.getHash()];
                }
                else {
                    group[acc.outputFieldName] = acc.evaluate(docs);
                }
            });
            return group;
        });
    }
}
exports.GroupStage = GroupStage;
class MatchStage {
    constructor(conditions) {
        this.type = 'match';
        this.conditions = conditions;
    }
    execute(docs) {
        const filters = (0, expressions_1.resolveAllExpressionFields)(this.conditions, docs);
        return docs.filter((i) => filters.every((e) => (0, expressions_1.evaluateExpression)(e, i)));
    }
}
exports.MatchStage = MatchStage;
class LimitStage {
    constructor(options) {
        this.type = 'limit';
        this.limit = options.limit;
    }
    execute(docs) {
        return docs.slice(0, this.limit);
    }
}
exports.LimitStage = LimitStage;
//# sourceMappingURL=stages.js.map