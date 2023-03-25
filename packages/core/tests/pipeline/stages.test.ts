import { assertEquals } from "asserts";
import { GroupStage, LimitStage, MatchStage } from "@core/pipeline/stages.ts";

const sampleData = [
  { genre: "action", score: 10 },
  { genre: "action", score: 20 },
  { genre: "action", score: 30 },
  { genre: "drama", score: 40 },
  { genre: "drama", score: 50 },
  { genre: "drama", score: 60 },
];
Deno.test({
  name: "Simple group stage",
  fn() {
    const groupStage = new GroupStage({
      groupExpr: { field: "genre" },
      accumulators: {},
    });
    const result = groupStage.execute(sampleData);
    assertEquals(result, [{ _id: "action" }, { _id: "drama" }]);
  },
});

Deno.test({
  name: "Simple limit stage",
  fn() {
    const limitStage = new LimitStage({ limit: 2 });
    const result = limitStage.execute(sampleData);
    assertEquals(result, sampleData.slice(0, 2));
  },
});

Deno.test({
  name: "Simple match stage",
  fn() {
    const matchStage = new MatchStage({
      filterExprs: [
        { operator: "$eq", value: [{ field: "genre" }, { value: "action" }] },
      ],
    });
    const result = matchStage.execute(sampleData);
    assertEquals(result, [
      { genre: "action", score: 10 },
      { genre: "action", score: 20 },
      { genre: "action", score: 30 },
    ]);
  },
});
