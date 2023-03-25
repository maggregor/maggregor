import { Stage } from "@core/pipeline/stages.ts";
import { Document } from "../index.ts";

export interface Pipeline {
  stages: Stage[];
}

export function executePipeline(
  pipeline: Pipeline,
  data: Document[]
): Document[] {
  let result = [...data];
  let currentStage: Stage | undefined = pipeline.stages[0];
  do {
    result = currentStage.execute(result);
    currentStage = currentStage.next;
  } while (currentStage);
  return result;
}

export function createPipeline(stages: Stage[]): Pipeline {
  stages.forEach((stage, index) => {
    if (index < stages.length - 1) {
      stage.next = stages[index + 1];
    }
  });
  return { stages };
}
