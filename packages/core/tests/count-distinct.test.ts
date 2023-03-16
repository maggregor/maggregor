import { CountDistinct } from "@core/index.ts";
import { assertEquals } from "asserts";
import { Document } from "@core/utils/collection.ts";

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

Deno.test(
  "CountDistinctAggregation should be correct after multiple deletes of the same document",
  () => {
    const aggregation = new CountDistinct("score");
    const documents: Document[] = [
      { id: 1, score: 10 },
      { id: 2, score: 5 },
      { id: 3, score: 7 },
    ];
    aggregation.init(documents);

    assertEquals(aggregation.get(), 3);

    aggregation.onDeleteDocument({ id: 1, score: 10 });
    assertEquals(aggregation.get(), 2);

    aggregation.onDeleteDocument({ id: 1, score: 10 });
    assertEquals(aggregation.get(), 2);

    aggregation.onAddDocument({ id: 997, score: 15 });
    aggregation.onAddDocument({ id: 998, score: 15 });
    aggregation.onAddDocument({ id: 999, score: 15 });
    assertEquals(aggregation.get(), 3);

    aggregation.onDeleteDocument({ id: 997, score: 15 });
    assertEquals(aggregation.get(), 3);
    aggregation.onDeleteDocument({ id: 998, score: 15 });
    assertEquals(aggregation.get(), 3);
    aggregation.onDeleteDocument({ id: 999, score: 15 });
    assertEquals(aggregation.get(), 2);
  }
);
