"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePipeline = void 0;
const mongo_aggregation_parser_1 = require("./mongo-aggregation-parser");
function parsePipeline(input) {
    return (0, mongo_aggregation_parser_1.parse)(input);
}
exports.parsePipeline = parsePipeline;
//# sourceMappingURL=index.js.map