import {
  GroupStageOptions,
  GroupStage,
  Stage,
  MatchStageOptions,
  MatchStage,
} from "@core/pipeline/stages.ts";
import { MaterializedView } from "@core/materialized-view.ts";
import { Pipeline } from "@core/pipeline/pipeline.ts";
import { equal } from "asserts";

/**
 * Check if a pipeline is eligible for a materialized view.
 * A pipeline is eligible if it's fields are a subset of the materialized view's fields.
 *
 * @param pipeline The pipeline to check
 * @param mv The materialized view to check
 * @returns True if the pipeline is eligible, false otherwise
 */
export function isEligible(pipeline: Pipeline, mv: MaterializedView): boolean {
  if (pipeline.stages.length === 0) return false;
  let currentStage: Stage | undefined = pipeline.stages[0];
  do {
    if (!canBeExecuted(currentStage, mv)) {
      return false;
    }
    if (currentStage instanceof GroupStage) {
      // Stop after the first group stage
      currentStage = undefined;
    } else {
      // Move to the next stage
      currentStage = currentStage.next;
    }
  } while (currentStage);
  return true;
}

function canBeExecuted(stage: Stage, mv: MaterializedView): boolean {
  if (stage instanceof GroupStage) {
    const options: GroupStageOptions = stage.options;
    const { accumulators } = options;
    // All accumulators must be present in the materialized view
    for (const accumulator of Object.values(accumulators)) {
      if (!mv.getAccumulatorHashes().includes(accumulator.hash)) return false;
    }
  } else if (stage instanceof MatchStage) {
    const options: MatchStageOptions = stage.options;
    const { filterExprs } = options;
    // No filter expression means that all documents are eligible
    if (filterExprs.length === 0) return true;
    // Limitation: we currently only check the first filter expression.
    // The check is done on the _id field and not on the other fields.
    const filterExpr = filterExprs[0];
    // The filter expression must be equal to the materialized view's group expression
    if (equal(filterExpr, mv.getGroupExpression())) return true;
  }

  return true;
}
