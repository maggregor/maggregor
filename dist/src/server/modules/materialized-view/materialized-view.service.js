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
exports.MaterializedViewService = void 0;
const common_1 = require("@nestjs/common");
const materialized_view_schema_1 = require("./materialized-view.schema");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MaterializedViewService = class MaterializedViewService {
    constructor(materializedViewModel) {
        this.materializedViewModel = materializedViewModel;
    }
    async create(request) {
        return this.materializedViewModel.create(request);
    }
    async findAll() {
        return this.materializedViewModel.find();
    }
    async findOne(id) {
        return this.materializedViewModel.findOne({ _id: id });
    }
    async update(id, request) {
        await this.materializedViewModel.updateOne({ _id: id }, request);
        return this.findOne(id);
    }
    async delete(id) {
        return this.materializedViewModel.findByIdAndDelete(id);
    }
};
MaterializedViewService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(materialized_view_schema_1.MaterializedView.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], MaterializedViewService);
exports.MaterializedViewService = MaterializedViewService;
//# sourceMappingURL=materialized-view.service.js.map