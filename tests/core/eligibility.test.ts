import { isEligible } from '@core/eligibility';
import { MaterializedView } from '@core/materialized-view';
import {
  CountBasicAccumulator,
  AvgBasicAccumulator,
  AccumulatorDefinition,
} from '@core/pipeline/accumulators';
import { toHashExpression } from '@core/pipeline/expressions';
import { createPipeline } from '@core/pipeline/pipeline';
import { GroupStage, LimitStage, MatchStage } from '@core/pipeline/stages';

const sampleData = [
  { genre: 'action', score: 10 },
  { genre: 'action', score: 20 },
  { genre: 'action', score: 30 },
  { genre: 'drama', score: 40 },
  { genre: 'drama', score: 50 },
  { genre: 'drama', score: 60 },
];

describe('isEligible', () => {
  test('should return true if the pipeline is eligible', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new GroupStage({
          groupExpr: { field: 'name' },
          accumulators: [
            new CountBasicAccumulator({
              expression: { field: 'name' },
              outputFieldName: 'count',
            }),
          ],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(true);
  });

  test('should return false if the pipeline is not eligible', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'yes' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new GroupStage({
          groupExpr: { field: 'name' },
          accumulators: [
            new CountBasicAccumulator({
              expression: { field: 'name' },
              outputFieldName: 'count',
            }),
          ],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('should return false if there is no group stage', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [],
    };
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('should return true if there is a MatchStage', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new MatchStage({
          conditions: [{ field: 'name' }],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(true);
  });

  test('should return false if groupExpr is not equal to materialized view groupBy', () => {
    const pipeline = createPipeline([
      new MatchStage({
        conditions: [
          { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
        ],
      }),
      new GroupStage({
        groupExpr: { field: 'genre' },
        accumulators: [
          new CountBasicAccumulator({
            expression: { field: 'genre' },
            outputFieldName: 'count',
          }),
        ],
      }),
    ]);
    const mv = new MaterializedView({
      groupBy: { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
      accumulatorDefs: [
        {
          operator: 'avg',
          expression: { field: 'score' },
        },
      ],
    });
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('should be eligible', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new GroupStage({
          groupExpr: { field: 'name' },
          accumulators: [
            new CountBasicAccumulator({
              expression: { field: 'name' },
              outputFieldName: 'count',
            }),
          ],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(true);
  });

  test('should not be eligible', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'noname' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new GroupStage({
          groupExpr: { field: 'name' },
          accumulators: [
            new CountBasicAccumulator({
              expression: { field: 'name' },
              outputFieldName: 'count',
            }),
          ],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('should not be eligible - no group stage', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [],
    };
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('should be eligible - MatchStage', () => {
    const mv = new MaterializedView({
      groupBy: { field: 'name' },
      accumulatorDefs: [
        {
          operator: 'count',
          expression: { field: 'name' },
        },
      ],
    });
    const pipeline = {
      stages: [
        new MatchStage({
          conditions: [{ field: 'name' }],
        }),
      ],
    };
    expect(isEligible(pipeline, mv)).toEqual(true);
  });

  test('should not be eligible - groupExpr must be equal to materialized view groupBy', () => {
    const pipeline = createPipeline([
      new MatchStage({
        conditions: [
          { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
        ],
      }),
      new GroupStage({
        groupExpr: { field: 'genre' },
        accumulators: [
          new CountBasicAccumulator({
            expression: { field: 'genre' },
            outputFieldName: 'count',
          }),
        ],
      }),
    ]);
    const mv = new MaterializedView({
      groupBy: { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
      accumulatorDefs: [
        {
          operator: 'avg',
          expression: { field: 'score' },
        },
      ],
    });
    mv.addDocument({ genre: 'action', score: 10 });
    expect(isEligible(pipeline, mv)).toEqual(false);
  });

  test('MaterializedView', () => {
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

  describe('isEligible', () => {
    test('Simple group stage', () => {
      const groupStage = new GroupStage({
        groupExpr: { field: 'genre' },
        accumulators: [],
      });
      const result = groupStage.execute(sampleData);
      expect(result).toEqual([{ _id: 'action' }, { _id: 'drama' }]);
    });

    test('Simple limit stage', () => {
      const limitStage = new LimitStage({ limit: 2 });
      const result = limitStage.execute(sampleData);
      expect(result).toEqual(sampleData.slice(0, 2));
    });

    test('Simple match stage', () => {
      const matchStage = new MatchStage({
        conditions: [
          { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
        ],
      });
      const result = matchStage.execute(sampleData);
      expect(result).toEqual([
        { genre: 'action', score: 10 },
        { genre: 'action', score: 20 },
        { genre: 'action', score: 30 },
      ]);
    });

    test('notEligible: the groupExpr must be equals to materialized view groupBy', () => {
      const pipeline = createPipeline([
        new MatchStage({
          conditions: [
            { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
          ],
        }),
        new GroupStage({
          groupExpr: { field: 'genre' },
          accumulators: [
            new CountBasicAccumulator({
              expression: { field: 'genre' },
              outputFieldName: 'count',
            }),
          ],
        }),
      ]);
      const mv = new MaterializedView({
        groupBy: {
          operator: 'gt',
          value: [{ field: 'score' }, { value: 10 }],
        },
        accumulatorDefs: [
          {
            operator: 'avg',
            expression: { field: 'score' },
          },
        ],
      });
      expect(isEligible(pipeline, mv)).toEqual(false);
    });
  });
});
