import { assertEquals } from "asserts";
import { createPipeline, executePipeline } from "@core/pipeline/pipeline.ts";
import { GroupStage, MatchStage, LimitStage } from "@core/pipeline/stages.ts";
import { AvgAccumulator } from "@core/pipeline/accumulators.ts";
import {
  SumAccumulator,
  MinAccumulator,
  MaxAccumulator,
} from "@core/pipeline/accumulators.ts";

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
          avgScore: new AvgAccumulator({ field: "score" }),
          sumScore: new SumAccumulator({ field: "score" }),
          minScore: new MinAccumulator({ field: "score" }),
          maxScore: new MaxAccumulator({ field: "score" }),
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
      new MatchStage([
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
      ]),
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
      new MatchStage([
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
      ]),
      new GroupStage({
        groupExpr: { field: "genre" },
        accumulators: {
          avgScore: new AvgAccumulator({ field: "score" }),
          sumScore: new SumAccumulator({ field: "score" }),
          minScore: new MinAccumulator({ field: "score" }),
          maxScore: new MaxAccumulator({ field: "score" }),
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
      new MatchStage([
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
        { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
      ]),
      new GroupStage({
        groupExpr: { field: "genre" },
        accumulators: {
          avgScore: new AvgAccumulator({ field: "score" }),
          sumScore: new SumAccumulator({ field: "score" }),
          minScore: new MinAccumulator({ field: "score" }),
          maxScore: new MaxAccumulator({ field: "score" }),
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
          avgScore: new AvgAccumulator({ field: "score" }),
          avgScoreOnComplexExpression: new AvgAccumulator({
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
