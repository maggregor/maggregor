import { MaterializedView } from './materialized-view';
import { toHashExpression } from './pipeline/expressions';
import { Pipeline } from './pipeline/pipeline';
import { Stage, GroupStage, MatchStage } from './pipeline/stages';
import { deepEqual } from './pipeline/accumulators/common';

/**
 * Check if a pipeline is eligible for a materialized view.
 * A pipeline is eligible if it's fields are a subset of the materialized view's fields.
 *
 * @param p The pipeline to check
 * @param mv The materialized view to check
 * @returns True if the pipeline is eligible, false otherwise
 */
export function isEligible(p: Pipeline, mv: MaterializedView): boolean {
  // The pipeline must have the same db and collection as the materialized view
  if (p.db !== mv.db || p.collection !== mv.collection) return false;
  // The pipeline must have at least one stage
  if (p.stages.length === 0) return false;
  let currentStage: Stage | undefined = p.stages[0];
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
  if (stage.type === 'group') {
    const { groupExpr, accumulators } = stage as GroupStage;
    // LIMITATION: For the moment we only support field references in the group expression
    // A small change is needed to support expressions (e.g. $group: { _id: { $toUpperCase: 'country' } } )
    // DISABLED => const resolved = resolveAllExpressionFields([groupExpr], mv.getView())[0];
    const resolvedHash = toHashExpression(groupExpr);
    const mvGroupExprHash = toHashExpression(mv.getGroupExpression());
    // The group expression must be equal to the materialized view's group expression
    if (resolvedHash !== mvGroupExprHash) return false;
    // All accumulators must be present in the materialized view
    for (const accumulator of Object.values(accumulators)) {
      if (!mv.getAccumulatorHashes().includes(accumulator.getHash()))
        return false;
    }
  } else if (stage.type === 'match') {
    const conditions = (stage as MatchStage).conditions;
    // No filter expression means that all documents are eligible
    if (conditions.length === 0) return true;
    else if (conditions.length > 1) return false;
    // Limitation: we currently only check the first filter expression.
    // The check is done on the _id field and not on the other fields.
    const filterExpr = conditions[0];
    // The filter expression must be equal to the materialized view's group expression
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore -  Change by good deepEqual
    if (!deepEqual(filterExpr, mv.getGroupExpression())) return false;
  } else {
    // The stage is not supported
    return false;
  }

  return true;
}
