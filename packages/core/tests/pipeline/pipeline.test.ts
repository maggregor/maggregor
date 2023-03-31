import { MaterializedView } from "src/materialized-view";
import {
  AvgBasicAccumulator,
  SumBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
} from "src/pipeline/accumulators";
import { createPipeline, executePipeline } from "src/pipeline/pipeline";
import { GroupStage, MatchStage, LimitStage } from "src/pipeline/stages";
import { expect, describe, it } from "vitest";

const sampleData = [
  { genre: "action", score: 10 },
  { genre: "action", score: 20 },
  { genre: "action", score: 30 },
  { genre: "drama", score: 40 },
  { genre: "drama", score: 50 },
  { genre: "drama", score: 60 },
];

describe("Pipeline creation and execution", () => {
  it("returns the expected result", () => {
    const pipeline = createPipeline([
      new GroupStage({
        groupExpr: { field: "genre" },
        accumulators: {
          avgScore: new AvgBasicAccumulator({ field: "score" }),
          sumScore: new SumBasicAccumulator({ field: "score" }),
          minScore: new MinBasicAccumulator({ field: "score" }),
          maxScore: new MaxBasicAccumulator({ field: "score" }),
        },
      }),
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      {
        _id: "action",
        avgScore: 20,
        sumScore: 60,
        minScore: 10,
        maxScore: 30,
      },
      {
        _id: "drama",
        avgScore: 50,
        sumScore: 150,
        minScore: 40,
        maxScore: 60,
      },
    ]);
  });

  it("returns the expected result", () => {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        ],
      }),
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      { genre: "action", score: 10 },
      { genre: "action", score: 20 },
      { genre: "action", score: 30 },
    ]);
  });
});

describe("Pipeline with limit stage", () => {
  it("returns the expected result", () => {
    const pipeline = createPipeline([new LimitStage({ limit: 2 })]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      { genre: "action", score: 10 },
      { genre: "action", score: 20 },
    ]);
  });
});

describe("Pipeline with two stages: match and group", () => {
  it("returns the expected result", () => {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        ],
      }),
      new GroupStage({
        groupExpr: { field: "genre" },
        accumulators: {
          avgScore: new AvgBasicAccumulator({ field: "score" }),
          sumScore: new SumBasicAccumulator({ field: "score" }),
          minScore: new MinBasicAccumulator({ field: "score" }),
          maxScore: new MaxBasicAccumulator({ field: "score" }),
        },
      }),
    ]);
    const result = executePipeline(pipeline, sampleData);
    expect(result).toEqual([
      {
        _id: "action",
        avgScore: 20,
        sumScore: 60,
        minScore: 10,
        maxScore: 30,
      },
    ]);
  });
});

it("group and match with two conditions", () => {
  const pipeline = createPipeline([
    new MatchStage({
      filterExprs: [
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
      ],
    }),
    new GroupStage({
      groupExpr: { field: "genre" },
      accumulators: {
        avgScore: new AvgBasicAccumulator({ field: "score" }),
        sumScore: new SumBasicAccumulator({ field: "score" }),
        minScore: new MinBasicAccumulator({ field: "score" }),
        maxScore: new MaxBasicAccumulator({ field: "score" }),
      },
    }),
  ]);
  const result = executePipeline(pipeline, sampleData);
  expect(result).toEqual([
    {
      _id: "action",
      avgScore: 25,
      sumScore: 50,
      minScore: 20,
      maxScore: 30,
    },
  ]);
});

it("advanced group stage", () => {
  const pipeline = createPipeline([
    new GroupStage({
      groupExpr: { field: "genre" },
      accumulators: {
        avgScore: new AvgBasicAccumulator({ field: "score" }),
        avgScoreOnComplexExpression: new AvgBasicAccumulator({
          operator: "$add",
          value: [
            {
              operator: "$multiply",
              value: [{ field: "score" }, { value: 2 }],
            },
            {
              operator: "$multiply",
              value: [{ field: "score" }, { value: 3 }],
            },
          ],
        }),
      },
    }),
  ]);
  const result = executePipeline(pipeline, sampleData);
  expect(result).toEqual([
    {
      _id: "action",
      avgScore: 20,
      avgScoreOnComplexExpression: 100,
    },
    {
      _id: "drama",
      avgScore: 50,
      avgScoreOnComplexExpression: 250,
    },
  ]);
});

it("with match stage and MV", () => {
  const pipeline = createPipeline([
    new MatchStage({
      filterExprs: [
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
      ],
    }),
    new GroupStage({
      groupExpr: { field: "genre" },
      accumulators: {
        avgScore: new AvgBasicAccumulator({ field: "score" }),
      },
    }),
  ]);
  const mv = new MaterializedView({
    groupBy: { field: "genre" },
    accumulatorDefs: [
      {
        operator: "avg",
        expression: { field: "score" },
      },
    ],
  });
  mv.addDocument({ genre: "action", score: 10 });
  mv.addDocument({ genre: "action", score: 20 });
  mv.addDocument({ genre: "action", score: 30 });
  mv.addDocument({ genre: "drama", score: 40 });
  mv.addDocument({ genre: "drama", score: 50 });
  mv.addDocument({ genre: "drama", score: 60 });
  const result = executePipeline(pipeline, mv.getView());
  expect(result.length).toEqual(1);
  expect(result).toEqual([{ _id: "action", avgScore: 20 }]);
});
