"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryCache = void 0;
const object_sizeof_1 = __importDefault(require("object-sizeof"));
class InMemoryCache {
    constructor(max_size_mb) {
        this.max_size = max_size_mb * 1024 * 1024;
        this.cache = {};
    }
    has(query, collection, db) {
        const key = `${query}-${collection}-${db}`;
        return key in this.cache;
    }
    get(query, collection, db) {
        const key = `${query}-${collection}-${db}`;
        if (key in this.cache) {
            this.cache[key].frequency++;
            return this.cache[key].result;
        }
        else {
            return null;
        }
    }
    set(query, collection, db, result) {
        const key = `${query}-${collection}-${db}`;
        const item_size = (0, object_sizeof_1.default)(result);
        const now = Date.now();
        if (this.currentSize() + item_size > this.max_size) {
            const items = Object.keys(this.cache).map((key) => this.cache[key]);
            items.sort((a, b) => a.frequency - b.frequency);
            delete this.cache[`${items[0].query}-${items[0].collection}-${items[0].db}`];
        }
        this.cache[key] = {
            result,
            frequency: 1,
            query,
            collection,
            db,
            timestamp: now,
        };
        const ten_minutes_ago = now - 10 * 60 * 1000;
        for (const key in this.cache) {
            if (this.cache.hasOwnProperty(key) &&
                this.cache[key].timestamp < ten_minutes_ago) {
                delete this.cache[key];
            }
        }
    }
    currentSize() {
        let size = 0;
        for (const key in this.cache) {
            if (this.cache.hasOwnProperty(key)) {
                size += (0, object_sizeof_1.default)(this.cache[key].result);
            }
        }
        return size;
    }
    invalidateAll() {
        this.cache = {};
    }
    invalidateCollection(collection, db) {
        for (const key in this.cache) {
            if (this.cache.hasOwnProperty(key) &&
                this.cache[key].collection === collection &&
                this.cache[key].db === db) {
                delete this.cache[key];
            }
        }
    }
}
exports.InMemoryCache = InMemoryCache;
//# sourceMappingURL=cache.js.map