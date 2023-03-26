import { assertEquals } from "asserts";
import { createPipeline, executePipeline } from "@core/pipeline/pipeline.ts";
import { GroupStage, MatchStage, LimitStage } from "@core/pipeline/stages.ts";
import { AvgBasicAccumulator } from "@core/pipeline/accumulators/index.ts";
import {
  SumBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
} from "@core/pipeline/accumulators/index.ts";
import { MaterializedView } from "../../src/materialized-view.ts";

const sampleData = [
  { genre: "action", score: 10 },
  { genre: "action", score: 20 },
  { genre: "action", score: 30 },
  { genre: "drama", score: 40 },
  { genre: "drama", score: 50 },
  { genre: "drama", score: 60 },
];

Deno.test({
  name: "Pipeline with group stage",
  fn() {
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
    assertEquals(result, [
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
  },
});

Deno.test({
  name: "Pipeline with match stage",
  fn() {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        ],
      }),
    ]);
    const result = executePipeline(pipeline, sampleData);
    assertEquals(result, [
      { genre: "action", score: 10 },
      { genre: "action", score: 20 },
      { genre: "action", score: 30 },
    ]);
  },
});

Deno.test({
  name: "Pipeline with limit stage",
  fn() {
    const pipeline = createPipeline([new LimitStage({ limit: 2 })]);
    const result = executePipeline(pipeline, sampleData);
    assertEquals(result, [
      { genre: "action", score: 10 },
      { genre: "action", score: 20 },
    ]);
  },
});

Deno.test({
  name: "Pipeline with two stages: match and group",
  fn() {
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
    assertEquals(result, [
      {
        _id: "action",
        avgScore: 20,
        sumScore: 60,
        minScore: 10,
        maxScore: 30,
      },
    ]);
  },
});

Deno.test({
  name: "Pipeline with two stages: group and match with two conditions",
  fn() {
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
    assertEquals(result, [
      {
        _id: "action",
        avgScore: 25,
        sumScore: 50,
        minScore: 20,
        maxScore: 30,
      },
    ]);
  },
});

Deno.test({
  name: "Advanced group stage",
  fn() {
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
    assertEquals(result, [
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
  },
});

Deno.test({
  name: "Pipeline with match stage and MV",
  fn() {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        ],
      }),
      // new GroupStage({
      //   groupExpr: { field: "genre" },
      //   accumulators: {
      //     avgScore: new AvgBasicAccumulator({ field: "score" }),
      //     sumScore: new SumBasicAccumulator({ field: "score" }),
      //     minScore: new MinBasicAccumulator({ field: "score" }),
      //     maxScore: new MaxBasicAccumulator({ field: "score" }),
      //   },
      // }),
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
    console.log(result);
    assertEquals(result.length, 1);
    // assertEquals(result, [
    //   { genre: "action", score: 10 },
    //   { genre: "action", score: 20 },
    //   { genre: "action", score: 30 },
    // ]);
  },
});
