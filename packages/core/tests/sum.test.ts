import { assertEquals } from "asserts";
import { Sum } from "@core/index.ts";
import { Document } from "@core/utils/collection.ts";

Deno.test("SumAggregation should correctly aggregate sum", () => {
  const aggregation = new Sum("score");
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
