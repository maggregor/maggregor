"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEligible = void 0;
const expressions_1 = require("./pipeline/expressions");
const stages_1 = require("./pipeline/stages");
const common_1 = require("./pipeline/accumulators/common");
function isEligible(pipeline, mv) {
    if (pipeline.stages.length === 0)
        return false;
    let currentStage = pipeline.stages[0];
    do {
        if (!canBeExecuted(currentStage, mv)) {
            return false;
        }
        if (currentStage instanceof stages_1.GroupStage) {
            currentStage = undefined;
        }
        else {
            currentStage = currentStage.next;
        }
    } while (currentStage);
    return true;
}
exports.isEligible = isEligible;
function canBeExecuted(stage, mv) {
    if (stage.type === 'group') {
        const { groupExpr, accumulators } = stage;
        const resolved = (0, expressions_1.resolveAllExpressionFields)([groupExpr], mv.getView())[0];
        const resolvedHash = (0, expressions_1.toHashExpression)(resolved);
        const mvGroupExprHash = (0, expressions_1.toHashExpression)(mv.getGroupExpression());
        if (resolvedHash !== mvGroupExprHash)
            return false;
        for (const accumulator of Object.values(accumulators)) {
            if (!mv.getAccumulatorHashes().includes(accumulator.getHash()))
                return false;
        }
    }
    else if (stage.type === 'match') {
        const conditions = stage.conditions;
        if (conditions.length === 0)
            return true;
        else if (conditions.length > 1)
            return false;
        const filterExpr = conditions[0];
        if (!(0, common_1.deepEqual)(filterExpr, mv.getGroupExpression()))
            return false;
    }
    return true;
}
//# sourceMappingURL=eligibility.js.map