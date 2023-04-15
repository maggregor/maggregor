"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCachedAccumulator = exports.createBasicAccumulator = void 0;
const basic_1 = require("./basic");
const cached_1 = require("./cached");
__exportStar(require("./basic"), exports);
__exportStar(require("./cached"), exports);
function createBasicAccumulator(def) {
    if (def.expression === undefined) {
        throw new Error('Expression is required');
    }
    switch (def.operator) {
        case 'sum':
            return new basic_1.SumBasicAccumulator(def);
        case 'avg':
            return new basic_1.AvgBasicAccumulator(def);
        case 'min':
            return new basic_1.MinBasicAccumulator(def);
        case 'max':
            return new basic_1.MaxBasicAccumulator(def);
        case 'count':
            return new basic_1.CountBasicAccumulator(def);
        default:
            throw new Error(`Unknown operator ${def.operator}`);
    }
}
exports.createBasicAccumulator = createBasicAccumulator;
function createCachedAccumulator(def) {
    switch (def.operator) {
        case 'sum':
            return new cached_1.SumCachedAccumulator(def);
        case 'avg':
            return new cached_1.AvgCachedAccumulator(def);
        case 'min':
            return new cached_1.MinCachedAccumulator(def);
        case 'max':
            return new cached_1.MaxCachedAccumulator(def);
        case 'count':
            return new cached_1.CountCachedAccumulator(def);
        default:
            throw new Error(`Unknown operator ${def.operator}`);
    }
}
exports.createCachedAccumulator = createCachedAccumulator;
//# sourceMappingURL=index.js.map