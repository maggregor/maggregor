import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { SumAggregation } from "../aggregations/sum.ts";
import { Document } from "./../collection.ts";

Deno.test("SumAggregation should correctly aggregate sum", () => {
  const aggregation = new SumAggregation("score");
  const documents: Document[] = [
    { id: 1, score: 10 },
    { id: 2, score: 5 },
    { id: 3, score: 7 },
  ];
  aggregation.init(documents);

  assertEquals(aggregation.get(), 22);

  aggregation.onAddDocument({ id: 4, score: 15 });
  assertEquals(aggregation.get(), 37);

  aggregation.onUpdateDocument({ id: 4, score: 15 }, { id: 4, score: 12 });
  assertEquals(aggregation.get(), 34);

  aggregation.onDeleteDocument({ id: 4, score: 12 });
  assertEquals(aggregation.get(), 22);
});
