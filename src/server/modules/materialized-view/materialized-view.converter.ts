import { MaterializedViewDefinition } from '@/core/materialized-view';
import { Pipeline } from '@/core/pipeline/pipeline';
import { GroupStage } from '@/core/pipeline/stages';
import { Accumulator } from '@/core/pipeline/accumulators';

export const convertToMaterializedViewDefinition = (
  pipeline: Pipeline,
): MaterializedViewDefinition | null => {
  if (!pipeline || !pipeline.stages) {
    return null;
  }
  const groupStage = pipeline.stages.find(
    (stage) => stage.type === 'group',
  ) as GroupStage;
  if (groupStage) {
    const materializedViewDefinition: MaterializedViewDefinition = {
      db: pipeline.db,
      collection: pipeline.collection,
      groupBy: groupStage.groupExpr,
      accumulatorDefs: groupStage.accumulators.map((accumulator: Accumulator) =>
        accumulator.getDefinition(),
      ),
    };
    return materializedViewDefinition;
  }
  return null;
};
