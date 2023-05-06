import { createBasicAccumulator } from '@core/pipeline/accumulators/index';
import { MaterializedView } from '@core/materialized-view';
import { createPipeline, executePipeline } from '@core/pipeline/pipeline';

const sampleData = [
  { genre: 'action', score: 10 },
  { genre: 'action', score: 20 },
  { genre: 'action', score: 30 },
  { genre: 'drama', score: 40 },
  { genre: 'drama', score: 50 },
  { genre: 'drama', score: 60 },
];

describe('Pipeline creation and execution', () => {
  it('returns the expected result', () => {
    const pipeline = createPipeline('mydb', 'mycol', [
      {
        type: 'group',
        groupExpr: { field: 'genre' },
        accumulators: [
          createBasicAccumulator({
            outputFieldName: 'avgScore',
            operator: 'avg',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'sumScore',
            operator: 'sum',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'minScore',
            operator: 'min',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'maxScore',
            operator: 'max',
            expression: { field: 'score' },
          }),
        ],
      },
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      {
        _id: 'action',
        avgScore: 20,
        sumScore: 60,
        minScore: 10,
        maxScore: 30,
      },
      {
        _id: 'drama',
        avgScore: 50,
        sumScore: 150,
        minScore: 40,
        maxScore: 60,
      },
    ]);
  });

  it('returns the expected result', () => {
    const pipeline = createPipeline('mydb', 'mycol', [
      {
        type: 'match',
        conditions: [
          { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
        ],
      },
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      { genre: 'action', score: 10 },
      { genre: 'action', score: 20 },
      { genre: 'action', score: 30 },
    ]);
  });
});

describe('Pipeline with limit stage', () => {
  it('returns the expected result', () => {
    const pipeline = createPipeline('mydb', 'mycol', [
      { type: 'limit', limit: 2 },
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      { genre: 'action', score: 10 },
      { genre: 'action', score: 20 },
    ]);
  });
});

describe('Pipeline with two stages: match and group', () => {
  it('returns the expected result', () => {
    const pipeline = createPipeline('mydb', 'mycol', [
      {
        type: 'match',
        conditions: [
          { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
        ],
      },
      {
        type: 'group',
        groupExpr: { field: 'genre' },

        accumulators: [
          createBasicAccumulator({
            outputFieldName: 'avgScore',
            operator: 'avg',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'sumScore',
            operator: 'sum',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'minScore',
            operator: 'min',
            expression: { field: 'score' },
          }),
          createBasicAccumulator({
            outputFieldName: 'maxScore',
            operator: 'max',
            expression: { field: 'score' },
          }),
        ],
      },
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      {
        _id: 'action',
        avgScore: 20,
        sumScore: 60,
        minScore: 10,
        maxScore: 30,
      },
    ]);
  });
});

it('group and match with two conditions', () => {
  const pipeline = createPipeline('mydb', 'mycol', [
    {
      type: 'match',
      conditions: [
        { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
        { operator: 'gt', value: [{ field: 'score' }, { value: 10 }] },
      ],
    },
    {
      type: 'group',
      groupExpr: { field: 'genre' },

      accumulators: [
        createBasicAccumulator({
          outputFieldName: 'avgScore',
          operator: 'avg',
          expression: { field: 'score' },
        }),
        createBasicAccumulator({
          outputFieldName: 'sumScore',
          operator: 'sum',
          expression: { field: 'score' },
        }),
        createBasicAccumulator({
          outputFieldName: 'minScore',
          operator: 'min',
          expression: { field: 'score' },
        }),
        createBasicAccumulator({
          outputFieldName: 'maxScore',
          operator: 'max',
          expression: { field: 'score' },
        }),
      ],
    },
  ]);
  const result = executePipeline(pipeline, sampleData);
  expect(result).toEqual([
    {
      _id: 'action',
      avgScore: 25,
      sumScore: 50,
      minScore: 20,
      maxScore: 30,
    },
  ]);
});

it('advanced group stage', () => {
  const pipeline = createPipeline('mydb', 'mycol', [
    {
      type: 'group',
      groupExpr: { field: 'genre' },
      accumulators: [
        createBasicAccumulator({
          outputFieldName: 'avgScore',
          operator: 'avg',
          expression: { field: 'score' },
        }),
        createBasicAccumulator({
          outputFieldName: 'avgScoreOnComplexExpression',
          operator: 'avg',
          expression: {
            operator: 'multiply',
            value: [{ field: 'score' }, { value: 5 }],
          },
        }),
      ],
    },
  ]);
  const result = executePipeline(pipeline, sampleData);
  expect(result).toEqual([
    {
      _id: 'action',
      avgScore: 20,
      avgScoreOnComplexExpression: 100,
    },
    {
      _id: 'drama',
      avgScore: 50,
      avgScoreOnComplexExpression: 250,
    },
  ]);
});

it('with match stage and MV', () => {
  const pipeline = createPipeline('mydb', 'mycol', [
    {
      type: 'match',
      conditions: [
        { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
      ],
    },
    {
      type: 'group',
      groupExpr: { field: 'genre' },

      accumulators: [
        createBasicAccumulator({
          outputFieldName: 'avgScore',
          operator: 'avg',
          expression: { field: 'score' },
        }),
      ],
    },
  ]);
  const mv = new MaterializedView({
    db: 'mydb',
    collection: 'mycol',
    groupBy: { field: 'genre' },
    accumulatorDefs: [
      {
        outputFieldName: 'avgScore',
        operator: 'avg',
        expression: { field: 'score' },
      },
    ],
  });
  mv.addDocument({ genre: 'action', score: 10 });
  mv.addDocument({ genre: 'action', score: 20 });
  mv.addDocument({ genre: 'action', score: 30 });
  mv.addDocument({ genre: 'drama', score: 40 });
  mv.addDocument({ genre: 'drama', score: 50 });
  mv.addDocument({ genre: 'drama', score: 60 });
  const result = executePipeline(pipeline, mv.getView());
  expect(result.length).toEqual(1);
  expect(result).toEqual([{ _id: 'action', avgScore: 20 }]);
});
