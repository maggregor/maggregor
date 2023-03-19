import { assertEquals } from "asserts";
import { Document } from "@core/utils/collection.ts";
import { Expression, Group } from "@core/index.ts";

Deno.test("Group / Max should correctly aggregate documents", () => {
  const aggregation = new Group("country", {
    type: "max",
    field: "score",
  } as Expression);
  const documents: Document[] = [
    { country: "France", score: 50 },
    { country: "France", score: 90 },
    { country: "France", score: 10 },
    { country: "Italy", score: 10 },
    { country: "Italy", score: 20 },
    { country: "Italy", score: 30 },
  ];
  aggregation.init(documents);
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 90],
      ["Italy", 30],
    ])
  );
  aggregation.onAddDocument({ country: "Italy", score: 40 });
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 90],
      ["Italy", 40],
    ])
  );

  aggregation.onDeleteDocument({ country: "Italy", score: 40 });
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 90],
      ["Italy", 30],
    ])
  );

  aggregation.onUpdateDocument(
    { country: "Italy", score: 30 },
    { country: "Italy", score: 40 }
  );
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 90],
      ["Italy", 40],
    ])
  );
});

Deno.test("Group / Sum should correctly aggregate documents", () => {
  const aggregation = new Group("country", {
    type: "sum",
    field: "score",
  } as Expression);
  const documents: Document[] = [
    { country: "France", score: 50 },
    { country: "France", score: 90 },
    { country: "France", score: 10 },
    { country: "Italy", score: 10 },
    { country: "Italy", score: 20 },
    { country: "Italy", score: 30 },
  ];
  aggregation.init(documents);
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 150],
      ["Italy", 60],
    ])
  );
  aggregation.onAddDocument({ country: "Italy", score: 40 });
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 150],
      ["Italy", 100],
    ])
  );

  aggregation.onDeleteDocument({ country: "Italy", score: 40 });
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 150],
      ["Italy", 60],
    ])
  );

  aggregation.onUpdateDocument(
    { country: "Italy", score: 30 },
    { country: "Italy", score: 40 }
  );
  assertEquals(
    aggregation.get(),
    new Map([
      ["France", 150],
      ["Italy", 70],
    ])
  );
});
