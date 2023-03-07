import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { MinAggregation } from "../aggregations/min.ts";
import { Document } from "./../collection.ts";

Deno.test("MinAggregation should correctly aggregate minimum value", () => {
  const aggregation = new MinAggregation("score");
  const documents: Document[] = [
    { id: 1, score: 10 },
    { id: 2, score: 5 },
    { id: 3, score: 7 },
  ];
  aggregation.init(documents);

  assertEquals(aggregation.get(), 5);

  aggregation.onAddDocument({ id: 4, score: 15 });
  assertEquals(aggregation.get(), 5);

  aggregation.onUpdateDocument({ id: 4, score: 15 }, { id: 4, score: 12 });
  assertEquals(aggregation.get(), 5);

  aggregation.onDeleteDocument({ id: 4, score: 12 });
  assertEquals(aggregation.get(), 5);
});
