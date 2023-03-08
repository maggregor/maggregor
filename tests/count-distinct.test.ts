import { CountDistinct } from "./../pipeline/expressions/count-distinct.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { Document } from "./../collection.ts";

Deno.test(
  "CountDistinctAggregation should correctly aggregate distinct values",
  () => {
    const aggregation = new CountDistinct("score");
    const documents: Document[] = [
      { id: 1, score: 10 },
      { id: 2, score: 5 },
      { id: 3, score: 7 },
    ];
    aggregation.init(documents);

    assertEquals(aggregation.get(), 3);

    aggregation.onAddDocument({ id: 4, score: 15 });
    assertEquals(aggregation.get(), 4);

    aggregation.onUpdateDocument({ id: 4, score: 15 }, { id: 4, score: 12 });
    assertEquals(aggregation.get(), 4);

    aggregation.onDeleteDocument({ id: 4, score: 12 });
    assertEquals(aggregation.get(), 3);
  }
);

Deno.test(
  "CountDistinctAggregation should correctly aggregate distinct values with null",
  () => {
    const aggregation = new CountDistinct("score");
    const documents: Document[] = [
      { id: 1, score: 10 },
      { id: 2, score: 5 },
      { id: 3, score: 7 },
    ];
    aggregation.init(documents);

    assertEquals(aggregation.get(), 3);

    aggregation.onAddDocument({ id: 4, score: null });
    assertEquals(aggregation.get(), 4);

    aggregation.onUpdateDocument({ id: 4, score: null }, { id: 4, score: 12 });
    assertEquals(aggregation.get(), 4);

    aggregation.onDeleteDocument({ id: 4, score: 12 });
    assertEquals(aggregation.get(), 3);
  }
);

Deno.test(
  "DistinctAggregation should correctly aggregate distinct string",
  () => {
    const aggregation = new CountDistinct("score");
    const documents: Document[] = [
      { id: 1, score: "10" },
      { id: 2, score: "5" },
      { id: 3, score: "7" },
    ];
    aggregation.init(documents);

    assertEquals(aggregation.get(), 3);

    aggregation.onAddDocument({ id: 4, score: "15" });
    assertEquals(aggregation.get(), 4);

    aggregation.onUpdateDocument(
      { id: 4, score: "15" },
      { id: 4, score: "12" }
    );
    assertEquals(aggregation.get(), 4);

    aggregation.onDeleteDocument({ id: 4, score: "12" });
    assertEquals(aggregation.get(), 3);
  }
);
