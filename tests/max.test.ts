import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { MaxAggregation } from "../aggregations/max.ts";
import { Document } from "./../collection.ts";

Deno.test("MaxAggregation should correctly aggregate maximum value", () => {
  const aggregation = new MaxAggregation("score");
  const documents: Document[] = [
    { id: 1, score: 10 },
    { id: 2, score: 5 },
    { id: 3, score: 7 },
  ];
  aggregation.init(documents);

  assertEquals(aggregation.get(), 10);

  aggregation.onAddDocument({ id: 4, score: 15 });
  assertEquals(aggregation.get(), 15);

  aggregation.onUpdateDocument({ id: 4, score: 15 }, { id: 4, score: 12 });
  assertEquals(aggregation.get(), 12);

  aggregation.onDeleteDocument({ id: 4, score: 12 });
  assertEquals(aggregation.get(), 10);
});
