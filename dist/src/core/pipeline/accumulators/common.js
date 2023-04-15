"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepEqual = exports.hash = exports.BaseAccumulator = void 0;
const crypto_1 = __importDefault(require("crypto"));
class BaseAccumulator {
    constructor(operator, def) {
        this.operator = operator;
        this.expression = def === null || def === void 0 ? void 0 : def.expression;
        this.outputFieldName = def === null || def === void 0 ? void 0 : def.outputFieldName;
    }
    getHash() {
        if (!this.hash) {
            this.hash = hash({
                expression: this.expression,
                operator: this.operator,
            });
        }
        return this.hash;
    }
    equals(acc) {
        return (deepEqual(this.expression, acc.expression) &&
            this.operator === acc.operator);
    }
}
exports.BaseAccumulator = BaseAccumulator;
function hash(o) {
    const sorted = {};
    Object.keys(o)
        .sort()
        .forEach((key) => {
        sorted[key] = o[key];
    });
    const json = JSON.stringify(sorted);
    const hash = crypto_1.default.createHash('sha256');
    hash.update(json);
    return hash.digest('hex');
}
exports.hash = hash;
function deepEqual(objet1, objet2) {
    const keys1 = Object.keys(objet1).sort();
    const keys2 = Object.keys(objet2).sort();
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let i = 0; i < keys1.length; i++) {
        const key = keys1[i];
        if (typeof objet1[key] === 'object' && typeof objet2[key] === 'object') {
            if (!deepEqual(objet1[key], objet2[key])) {
                return false;
            }
        }
        else if (objet1[key] !== objet2[key]) {
            return false;
        }
    }
    return true;
}
exports.deepEqual = deepEqual;
//# sourceMappingURL=common.js.map