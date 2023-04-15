"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPipeline = exports.executePipeline = void 0;
function executePipeline(pipeline, data) {
    let result = [...data];
    let currentStage = pipeline.stages[0];
    do {
        result = currentStage.execute(result);
        currentStage = currentStage.next;
    } while (currentStage);
    return result;
}
exports.executePipeline = executePipeline;
function createPipeline(stages) {
    stages.forEach((stage, index) => {
        if (index < stages.length - 1) {
            stage.next = stages[index + 1];
        }
    });
    return { stages };
}
exports.createPipeline = createPipeline;
//# sourceMappingURL=pipeline.js.map