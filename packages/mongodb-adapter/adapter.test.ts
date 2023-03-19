import { assertThrows, assert, assertEquals } from "asserts";
import { findAvailableAggregation, findResults } from "./adapter.ts";
import { AggregationStore } from "@core/store.ts";
import { Group } from "../core/src/index.ts";

Deno.test("No relevant aggregations", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  const store = new AggregationStore({
    aggregations: [new Group("unknown", { type: "sum", field: "score" })],
  });
  assertThrows(
    () => findAvailableAggregation(query, store),
    Error,
    "No group aggregation found"
  );
});

Deno.test("Empty aggregation store", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  const store = new AggregationStore(); // Empty store
  assertThrows(
    () => findAvailableAggregation(query, store),
    Error,
    "No group aggregation found"
  );
});

Deno.test("Find the good aggregation group stage", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "score"}}}]`;
  const store = new AggregationStore({
    aggregations: [new Group("$name", { type: "sum", field: "score" })],
  });
  const aggregationFound = findAvailableAggregation(query, store);
  assert(aggregationFound !== undefined, "Aggregation should be found");
  assert(aggregationFound instanceof Group, "Aggregation should be a group");
  assert(aggregationFound.getField() === "name");
  assert(aggregationFound.getExpression().type === "sum");
});

Deno.test("Return results for a simple query", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "score"}}}]`;
  const group = new Group("$name", { type: "sum", field: "score" });
  group.init([
    { name: "John", score: 10 },
    { name: "John", score: 20 },
    { name: "Jane", score: 30 },
  ]);
  const store = new AggregationStore({
    aggregations: [group],
  });
  // deno-lint-ignore no-explicit-any
  const results = findResults(query, store) as any[];
  assertEquals(results.length, 2);
  assertEquals(results[0]["_id"], "John");
  assertEquals(results[0]["total"], 30);
  assertEquals(results[1]["_id"], "Jane");
  assertEquals(results[1]["total"], 30);
});
