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
exports.MaterializedViewController = void 0;
const common_1 = require("@nestjs/common");
const materialized_view_schema_1 = require("./materialized-view.schema");
const materialized_view_service_1 = require("./materialized-view.service");
let MaterializedViewController = class MaterializedViewController {
    constructor(requestService) {
        this.requestService = requestService;
    }
    async create(request) {
        return this.requestService.create(request);
    }
    async findAll() {
        return this.requestService.findAll();
    }
    async findOne(id) {
        return this.requestService.findOne(id);
    }
    async update(id, request) {
        return this.requestService.update(id, request);
    }
    async delete(id) {
        return this.requestService.delete(id);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [materialized_view_schema_1.MaterializedView]),
    __metadata("design:returntype", Promise)
], MaterializedViewController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MaterializedViewController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterializedViewController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, materialized_view_schema_1.MaterializedView]),
    __metadata("design:returntype", Promise)
], MaterializedViewController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MaterializedViewController.prototype, "delete", null);
MaterializedViewController = __decorate([
    (0, common_1.Controller)('request'),
    __metadata("design:paramtypes", [materialized_view_service_1.MaterializedViewService])
], MaterializedViewController);
exports.MaterializedViewController = MaterializedViewController;
//# sourceMappingURL=materialized-view.controller.js.map