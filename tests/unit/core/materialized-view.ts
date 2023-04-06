import { MaterializedView } from '@core/materialized-view';
import { AccumulatorDefinition } from '@core/pipeline/accumulators';
import { toHashExpression } from '@core/pipeline/expressions';

describe('MaterializedView', () => {
  it('should correctly calculate accumulators and group by expression', () => {
    const acc1: AccumulatorDefinition = {
      operator: 'sum',
      expression: { field: 'score' },
    };
    const acc2: AccumulatorDefinition = {
      operator: 'sum',
      expression: {
        operator: 'add',
        value: [{ field: 'score' }, { value: 10 }],
      },
    };
    const mv = new MaterializedView({
      groupBy: { field: 'genre' },
      accumulatorDefs: [acc1, acc2],
    });
    mv.addDocument({ genre: 'action', score: 10 });
    mv.addDocument({ genre: 'action', score: 20 });
    mv.addDocument({ genre: 'action', score: 30 });
    mv.addDocument({ genre: 'marvel', score: -100 });
    mv.addDocument({ genre: 'begaudeau', score: 999 });
    mv.addDocument({ genre: 'begaudeau', score: 999 });

    const accumulatorHashes = mv.getAccumulatorHashes();
    const fieldName1 = accumulatorHashes[0];
    const fieldName2 = accumulatorHashes[1];

    const groupByExprHash = toHashExpression(mv.getGroupExpression());

    expect(mv.getView()).toEqual([
      {
        [groupByExprHash]: 'action',
        [fieldName1]: 60,
        [fieldName2]: 90,
      },
      {
        [groupByExprHash]: 'marvel',
        [fieldName1]: -100,
        [fieldName2]: -90,
      },
      {
        [groupByExprHash]: 'begaudeau',
        [fieldName1]: 1998,
        [fieldName2]: 2018,
      },
    ]);
  });
});
