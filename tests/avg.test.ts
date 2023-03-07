import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { AvgAggregation } from "../aggregation/avg.ts";
import { Document } from "./../collection.ts";

Deno.test("AvgAggregation should correctly aggregate average value", () => {
  const aggregation = new AvgAggregation("score");
  const documents: Document[] = [
    { id: 1, score: 10 },
    { id: 2, score: 5 },
    { id: 3, score: 7 },
  ];
  aggregation.init(documents);

  assertEquals(aggregation.get(), 7.333333333333333);

  aggregation.onAddDocument({ id: 4, score: 15 });
  assertEquals(aggregation.get(), 9.25);

  aggregation.onUpdateDocument({ id: 4, score: 15 }, { id: 4, score: 12 });
  assertEquals(aggregation.get(), 8.5);

  aggregation.onDeleteDocument({ id: 4, score: 12 });
  assertEquals(aggregation.get(), 7.333333333333333);
});
