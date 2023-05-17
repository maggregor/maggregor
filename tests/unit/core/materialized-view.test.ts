import { MaterializedView } from '@core/materialized-view';
import type { AccumulatorDefinition } from '@core/pipeline/accumulators';
import { toHashExpression } from '@core/pipeline/expressions';

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
  it('should correctly calculate accumulators after initialization', () => {
    const acc1: AccumulatorDefinition = {
      outputFieldName: 'sumScore',
      operator: 'sum',
      expression: { field: 'score' },
    };
    const acc2: AccumulatorDefinition = {
      outputFieldName: 'sumScorePlusTen',
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

    mv.initialize([
      {
        _id: 'action',
        sumScore: 10000,
        sumScorePlusTen: 42,
      },
      {
        _id: 'drama',
        sumScore: 5000,
        sumScorePlusTen: 24,
      },
    ]);

    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'action',
        sumScore: 10000,
        sumScorePlusTen: 42,
      },
      {
        _id: 'drama',
        sumScore: 5000,
        sumScorePlusTen: 24,
      },
    ]);
  });
  it('should correctly calculate avg accumulator after initialization', () => {
    const acc1: AccumulatorDefinition = {
      outputFieldName: 'avgScore',
      operator: 'avg',
      expression: { field: 'score' },
    };
    const mv = new MaterializedView({
      db: 'db',
      collection: 'collection',
      groupBy: { field: 'genre' },
      accumulatorDefs: [acc1],
    });

    mv.initialize([
      {
        _id: 'action',
        avgScore_count: 10,
        avgScore_sum: 10000,
      },
      {
        _id: 'drama',
        avgScore_count: 1,
        avgScore_sum: 5000,
      },
    ]);

    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'action',
        avgScore: 1000,
      },
      {
        _id: 'drama',
        avgScore: 5000,
      },
    ]);
    mv.addDocument({ genre: 'action', score: 10 });
    mv.addDocument({ genre: 'drama', score: 100 });
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'action',
        avgScore: 910,
      },
      {
        _id: 'drama',
        avgScore: 2550,
      },
    ]);
    mv.deleteDocument({ genre: 'action', score: 1000 });
    mv.deleteDocument({ genre: 'drama', score: 5000 });
    expect(mv.getView({ useFieldHashes: false })).toEqual([
      {
        _id: 'action',
        avgScore: 901,
      },
      {
        _id: 'drama',
        avgScore: 100,
      },
    ]);
  });
});
