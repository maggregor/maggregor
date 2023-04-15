"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CountCachedAccumulator = exports.MaxCachedAccumulator = exports.MinCachedAccumulator = exports.AvgCachedAccumulator = exports.SumCachedAccumulator = void 0;
const expressions_1 = require("../expressions");
const common_1 = require("./common");
class AbstractCachedAccumulator extends common_1.BaseAccumulator {
    constructor() {
        super(...arguments);
        this.__cachedValue = undefined;
    }
    __init(value) {
        this.__cachedValue = value;
    }
    addDocument(doc) {
        this.expression && this.add((0, expressions_1.evaluateExpression)(this.expression, doc));
    }
    updateDocument(oldDoc, newDoc) {
        this.addDocument(newDoc);
        this.deleteDocument(oldDoc);
    }
    deleteDocument(doc) {
        this.expression && this.delete((0, expressions_1.evaluateExpression)(this.expression, doc));
    }
    getCachedValue() {
        return this.__cachedValue;
    }
}
class SumCachedAccumulator extends AbstractCachedAccumulator {
    constructor(definition) {
        super('sum', definition);
    }
    add(val) {
        this.__cachedValue
            ? (this.__cachedValue += val)
            : (this.__cachedValue = val);
    }
    delete(val) {
        this.__cachedValue && (this.__cachedValue -= val);
    }
}
exports.SumCachedAccumulator = SumCachedAccumulator;
class AvgCachedAccumulator extends AbstractCachedAccumulator {
    constructor(definition) {
        super('avg', definition);
        this.__count = 0;
    }
    add(val) {
        this.__cachedValue
            ? (this.__cachedValue += val)
            : (this.__cachedValue = val);
        this.__count++;
    }
    delete(val) {
        this.__cachedValue && (this.__cachedValue -= val);
        this.__count--;
    }
    getCachedValue() {
        return this.__cachedValue && this.__cachedValue / this.__count;
    }
}
exports.AvgCachedAccumulator = AvgCachedAccumulator;
class MinCachedAccumulator extends AbstractCachedAccumulator {
    constructor(definition) {
        super('min', definition);
        this.values = new Map();
    }
    add(val) {
        if (this.__cachedValue === undefined || val < this.__cachedValue) {
            this.__cachedValue = val;
        }
        this.values.set(val, (this.values.get(val) || 0) + 1);
    }
    delete(val) {
        if (this.__cachedValue === val) {
            this.__cachedValue = undefined;
            this.values.delete(val);
            for (const [value] of this.values) {
                if (this.__cachedValue === undefined || value < this.__cachedValue) {
                    this.__cachedValue = value;
                }
            }
        }
        else {
            const count = this.values.get(val);
            if (count && count > 1) {
                this.values.set(val, count - 1);
            }
            else {
                this.values.delete(val);
            }
        }
    }
}
exports.MinCachedAccumulator = MinCachedAccumulator;
class MaxCachedAccumulator extends AbstractCachedAccumulator {
    constructor(definition) {
        super('max', definition);
        this.values = new Map();
    }
    add(val) {
        if (this.__cachedValue === undefined || val > this.__cachedValue) {
            this.__cachedValue = val;
        }
        this.values.set(val, (this.values.get(val) || 0) + 1);
    }
    delete(val) {
        if (this.__cachedValue === val) {
            this.__cachedValue = undefined;
            this.values.delete(val);
            for (const [value] of this.values) {
                if (this.__cachedValue === undefined || value > this.__cachedValue) {
                    this.__cachedValue = value;
                }
            }
        }
        else {
            const count = this.values.get(val);
            if (count && count > 1) {
                this.values.set(val, count - 1);
            }
            else {
                this.values.delete(val);
            }
        }
    }
}
exports.MaxCachedAccumulator = MaxCachedAccumulator;
class CountCachedAccumulator extends AbstractCachedAccumulator {
    constructor(definition) {
        super('count', definition);
        this.__cachedValue = 0;
    }
    add(val) {
        val && this.__cachedValue++;
    }
    delete(val) {
        val && this.__cachedValue--;
    }
}
exports.CountCachedAccumulator = CountCachedAccumulator;
//# sourceMappingURL=cached.js.map