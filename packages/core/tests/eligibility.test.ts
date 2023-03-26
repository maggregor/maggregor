import {
  AvgBasicAccumulator,
  CountBasicAccumulator,
} from "@core/pipeline/accumulators/basic.ts";
import { assertEquals } from "asserts";
import { MaterializedView } from "@core/materialized-view.ts";
import { GroupStage, MatchStage } from "@core/pipeline/stages.ts";
import { isEligible } from "@core/eligibility.ts";
import { createPipeline } from "../src/pipeline/pipeline.ts";

Deno.test("isEligible", () => {
  const mv = new MaterializedView({
    groupBy: { field: "name" },
    accumulatorDefs: [
      {
        operator: "count",
        expression: { field: "name" },
      },
    ],
  });
  const pipeline = {
    stages: [
      new GroupStage({
        groupExpr: { field: "name" },
        accumulators: {
          count: new CountBasicAccumulator({ field: "name" }),
        },
      }),
    ],
  };
  assertEquals(isEligible(pipeline, mv), true);
});

Deno.test("isEligible - not eligible", () => {
  const mv = new MaterializedView({
    groupBy: { field: "name" },
    accumulatorDefs: [
      {
        operator: "count",
        expression: { field: "name" },
      },
    ],
  });
  const pipeline = {
    stages: [
      new GroupStage({
        groupExpr: { field: "name" },
        accumulators: {
          count: new CountBasicAccumulator({ field: "age" }),
        },
      }),
    ],
  };
  assertEquals(isEligible(pipeline, mv), false);
});

Deno.test("isEligible - not eligible - no group stage", () => {
  const mv = new MaterializedView({
    groupBy: { field: "name" },
    accumulatorDefs: [
      {
        operator: "count",
        expression: { field: "name" },
      },
    ],
  });
  const pipeline = {
    stages: [],
  };
  assertEquals(isEligible(pipeline, mv), false);
});

Deno.test("isEligible - MatchStage", () => {
  const mv = new MaterializedView({
    groupBy: { field: "name" },
    accumulatorDefs: [
      {
        operator: "count",
        expression: { field: "name" },
      },
    ],
  });
  const pipeline = {
    stages: [
      new MatchStage({
        filterExprs: [{ field: "name" }],
      }),
    ],
  };
  assertEquals(isEligible(pipeline, mv), true);
});

Deno.test(
  "notEligible: the groupExpr must be equals to materialized view groupBy",
  () => {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
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
      groupBy: { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
      accumulatorDefs: [
        {
          operator: "avg",
          expression: { field: "score" },
        },
      ],
    });
    mv.addDocument({ genre: "action", score: 10 });
    assertEquals(isEligible(pipeline, mv), false);
  }
);

Deno.test(
  "notEligible: the filterExprs must be equals to materialized view groupBy",
  () => {
    const pipeline = createPipeline([
      new MatchStage({
        filterExprs: [
          { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
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
    assertEquals(isEligible(pipeline, mv), false);
  }
);

Deno.test("notEligible: more than one condition in the match stage", () => {
  const pipeline = createPipeline([
    new MatchStage({
      filterExprs: [
        { operator: "$gt", value: [{ field: "score" }, { value: 10 }] },
        { operator: "$lt", value: [{ field: "score" }, { value: 20 }] },
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
  assertEquals(isEligible(pipeline, mv), false);
});
