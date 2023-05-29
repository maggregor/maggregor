import { MaterializedView } from '@/core/materialized-view';
import { AccumulatorDefinition } from '@/core/pipeline/accumulators';
import { toHashExpression } from '@/core/pipeline/expressions';

describe('MaterializedView', () => {
  it('should correctly calculate accumulators after many add documents', () => {
    const acc1: AccumulatorDefinition = {
      outputFieldName: 'sum',
      operator: 'sum',
      expression: { field: 'score' },
    };
    const acc2: AccumulatorDefinition = {
      outputFieldName: 'sumPlus10',
      operator: 'sum',
      expression: {
        operator: 'add',
        value: [{ field: 'score' }, { value: 10 }],
      },
    };
    const mv = new MaterializedView({
      db: 'db',
      collection: 'collection',
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

  it('should correctly handle faulty accumulators', () => {
    const acc1: AccumulatorDefinition = {
      outputFieldName: 'sumScore',
      operator: 'sum',
      expression: { field: 'score' },
    };
    const acc2: AccumulatorDefinition = {
      outputFieldName: 'minScore',
      operator: 'min',
      expression: { field: 'score' },
    };
    const mv = new MaterializedView({
      db: 'db',
      collection: 'collection',
      groupBy: { field: 'genre' },
      accumulatorDefs: [acc1, acc2],
    });
    expect(mv.isFaulty()).toBe(false);
    mv.addDocument({ genre: 'action', score: 10 });
    expect(mv.isFaulty()).toBe(false);
    mv.deleteDocument({ genre: 'action', score: 10 });
    expect(mv.isFaulty()).toBe(true);
    mv.addDocument({ genre: 'action', score: 15 });
    expect(mv.isFaulty()).toBe(true);
    mv.addDocument({ genre: 'action', score: 8 });
    expect(mv.isFaulty()).toBe(false);
  });

  it('should correctly delete documents', () => {
    const mv = new MaterializedView({
      db: 'db',
      collection: 'collection',
      groupBy: { field: 'country' },
      accumulatorDefs: [],
    });
    mv.addDocument({ country: 'France' });
    mv.addDocument({ country: 'Switzerland' });
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      { _id: 'France' },
      { _id: 'Switzerland' },
    ]);
    mv.deleteDocument({ country: 'France' });
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      { _id: 'Switzerland' },
    ]);
  });
});
