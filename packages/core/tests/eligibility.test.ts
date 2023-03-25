import { CountBasicAccumulator } from "@core/pipeline/accumulators/basic.ts";
import { assertEquals } from "asserts";
import { MaterializedView } from "@core/materialized-view.ts";
import { GroupStage, MatchStage } from "@core/pipeline/stages.ts";
import { isEligible } from "@core/eligibility.ts";

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
