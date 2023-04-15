"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterializedView = void 0;
const accumulators_1 = require("./pipeline/accumulators");
const expressions_1 = require("./pipeline/expressions");
class MaterializedView {
    constructor(options) {
        this.results = new Map();
        this.groupBy = options.groupBy;
        this.definitions = options.accumulatorDefs;
    }
    addDocument(doc) {
        const groupByValue = (0, expressions_1.evaluateExpression)(this.groupBy, doc);
        const groupByValueString = JSON.stringify(groupByValue);
        if (!this.results.has(groupByValueString)) {
            this.results.set(groupByValueString, this.definitions.map((d) => (0, accumulators_1.createCachedAccumulator)(d)));
        }
        const accumulators = this.results.get(groupByValueString);
        accumulators === null || accumulators === void 0 ? void 0 : accumulators.forEach((a) => a.addDocument(doc));
    }
    deleteDocument(doc) {
        const groupByValue = (0, expressions_1.evaluateExpression)(this.groupBy, doc);
        const groupByValueString = JSON.stringify(groupByValue);
        if (!this.results.has(groupByValueString)) {
            return;
        }
        const accumulators = this.results.get(groupByValueString);
        accumulators === null || accumulators === void 0 ? void 0 : accumulators.forEach((a) => a.deleteDocument(doc));
    }
    updateDocument(oldDoc, newDoc) {
        this.updateDocument(oldDoc, newDoc);
    }
    getView() {
        const accumulatorHashes = this.getAccumulatorHashes();
        return Array.from(this.results.entries()).map(([key, value]) => {
            const obj = {
                [(0, expressions_1.toHashExpression)(this.groupBy)]: JSON.parse(key),
            };
            value.forEach((a, i) => {
                obj[accumulatorHashes[i]] = a.getCachedValue();
            });
            return obj;
        });
    }
    getAccumulatorHashes() {
        return this.definitions.map((d) => (0, accumulators_1.createCachedAccumulator)(d).getHash());
    }
    getGroupExpression() {
        return this.groupBy;
    }
    getAccumulatorDefinitions() {
        return this.definitions;
    }
}
exports.MaterializedView = MaterializedView;
//# sourceMappingURL=materialized-view.js.map