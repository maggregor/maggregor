import { assertThrows } from "asserts";
import { findAvailableAggregation } from "./adapter.ts";
import { AggregationStore } from "@core/store.ts";
import { Group } from "../core/src/index.ts";

const simpleStore = new AggregationStore({
  aggregations: [new Group("$name", { sum: "$score" })],
});

Deno.test("Multiple group stages", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}, {$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  assertThrows(
    () => findAvailableAggregation(query, simpleStore),
    Error,
    "Unsupported feature: Multiple group stages"
  );
});

Deno.test("No group aggregation on the query group field", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  const store = new AggregationStore({
    aggregations: [new Group("unknown", { sum: "$score" })],
  });
  assertThrows(() => findAvailableAggregation(query, store));
});

Deno.test("No group aggregation found", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  const store = new AggregationStore(); // Empty store
  assertThrows(() => findAvailableAggregation(query, store));
});
