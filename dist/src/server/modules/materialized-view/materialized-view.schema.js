"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterializedViewSchema = exports.MaterializedView = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let MaterializedView = class MaterializedView {
};
MaterializedView = __decorate([
    (0, mongoose_1.Schema)()
], MaterializedView);
exports.MaterializedView = MaterializedView;
exports.MaterializedViewSchema = mongoose_1.SchemaFactory.createForClass(MaterializedView);
//# sourceMappingURL=materialized-view.schema.js.map