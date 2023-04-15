"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestService = void 0;
const cache_1 = require("../../../core/cache");
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const mongo_aggregation_parser_1 = require("../../../parser/mongo-aggregation-parser");
const request_schema_1 = require("./request.schema");
let RequestService = class RequestService {
    constructor(requestModel) {
        this.requestModel = requestModel;
        this.cache = new cache_1.InMemoryCache(512);
    }
    async create(request) {
        return this.requestModel.create(request);
    }
    async findAll() {
        return this.requestModel.find();
    }
    async findOneByRequestId(requestID) {
        return this.requestModel.findOne({ requestID });
    }
    async updateOne(request) {
        await this.requestModel.updateOne({ _id: request._id }, request);
        return this.requestModel.findOne(request._id);
    }
    async deleteByRequestID(requestID) {
        return this.requestModel.findOneAndDelete({ requestID });
    }
    async onAggregateQueryFromClient(msg) {
        const req = await this.create({
            request: msg.pipeline,
            requestID: msg.requestID,
            collectionName: msg.collectionName,
            dbName: msg.dbName,
            startAt: new Date(),
        });
        if (this.hasCachedResults(req)) {
            req.endAt = new Date();
            req.source = 'cache';
            await this.updateOne(req);
            common_1.Logger.log(`Request ${req.requestID}: Answered from cache ⚡`);
            return {
                db: msg.dbName,
                collection: msg.collectionName,
                results: this.getCachedResults(req),
                responseTo: msg.requestID,
            };
        }
        const parsedPipeline = parsePipeline(msg.pipeline);
        const stageCount = parsedPipeline.length;
        common_1.Logger.log(`Request ${req.requestID}: Pipeline (${stageCount} stage(s))`);
        req.source = 'delegate';
        await this.updateOne(req);
        return null;
    }
    async onResultFromServer(msg) {
        const requestID = msg.responseTo;
        const req = await this.findOneByRequestId(requestID);
        req.endAt = new Date();
        await this.updateOne(req);
        this.cacheResults(req, msg.data);
        return;
    }
    hasCachedResults(req) {
        return this.cache.has(JSON.stringify(req.request), req.collectionName, req.dbName);
    }
    getCachedResults(req) {
        return this.cache.get(JSON.stringify(req.request), req.collectionName, req.dbName);
    }
    cacheResults(req, results) {
        this.cache.set(JSON.stringify(req.request), req.collectionName, req.dbName, results);
    }
};
RequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(request_schema_1.Request.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RequestService);
exports.RequestService = RequestService;
function parsePipeline(pipeline) {
    try {
        return (0, mongo_aggregation_parser_1.parse)('[' + objectToString(pipeline[0]) + ']');
    }
    catch (e) {
        console.log('Parsing error on pipeline');
        return [];
    }
}
function objectToString(obj) {
    const entries = Object.entries(obj);
    const keyValuePairs = entries.map(([key, value]) => {
        const formattedValue = typeof value === 'object' && value !== null
            ? objectToString(value)
            : JSON.stringify(value);
        return `${key}: ${formattedValue}`;
    });
    return `{ ${keyValuePairs.join(', ')} }`;
}
//# sourceMappingURL=request.service.js.map