import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { Document } from "../collection.ts";
import { Expression } from "../pipeline/expressions/index.ts";
import { Group } from "../pipeline/stages/group.ts";

Deno.test("Group should correctly aggregate documents", () => {
  const aggregation = new Group("country", { max: "score" } as Expression);
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
