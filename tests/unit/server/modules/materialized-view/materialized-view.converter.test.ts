import { createPipeline } from '@/core/pipeline/pipeline';
import { CountBasicAccumulator } from '@/core/pipeline/accumulators';
import { StageDefinition } from '@/core/pipeline/stages';
import { convertToMaterializedViewDefinition } from '@/server/modules/materialized-view/materialized-view.converter';

describe('MaterializedViewConverter', () => {
  test('should convert pipeline to materialized view definition', () => {
    expect(convertToMaterializedViewDefinition(null)).toBeNull();
  });

  test('should convert pipeline to materialized view definition', () => {
    const stageDefinitions: StageDefinition[] = [
      {
        type: 'group',
        groupExpr: { field: 'name' },
        accumulators: [
          new CountBasicAccumulator({
            expression: { field: 'name' },
            outputFieldName: 'count',
          }),
        ],
      },
    ];
    const pipeline = createPipeline('db', 'collection', stageDefinitions);
    const def = convertToMaterializedViewDefinition(pipeline);
    expect(def).not.toBeNull();
    expect(def.collection).toBe('collection');
    expect(def.db).toBe('db');
    expect(def.groupBy).toEqual({ field: 'name' });
    expect(def.accumulatorDefs).toHaveLength(1);
    expect(def.accumulatorDefs[0].operator).toBe('count');
    expect(def.accumulatorDefs[0].expression).toEqual({ field: 'name' });
    expect(def.accumulatorDefs[0].outputFieldName).toBe('count');
  });
});
