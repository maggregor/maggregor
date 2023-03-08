import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { Document } from "../collection.ts";
import { Expression } from "../pipeline/expressions/index.ts";
import { Group } from "../pipeline/stages/group.ts";

Deno.test("Group should correctly aggregate documents", () => {
  const aggregation = new Group("id", { max: "score" } as Expression);
  const documents: Document[] = [
    { id: 1, score: 10 },
    { id: 2, score: 5 },
    { id: 3, score: 7 },
    { id: 4, score: 15 },
    { id: 5, score: 12 },
    { id: 6, score: 12 },
  ];
  aggregation.init(documents);

  assertEquals(aggregation.get(), null);
});
