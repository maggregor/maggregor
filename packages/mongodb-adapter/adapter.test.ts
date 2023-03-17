import { assertThrows, assert } from "asserts";
import { findAvailableAggregation } from "./adapter.ts";
import { AggregationStore } from "@core/store.ts";
import { Group } from "../core/src/index.ts";

const simpleStore = new AggregationStore({
  aggregations: [new Group("$name", { type: "sum", field: "score" })],
});

Deno.test("Unsupported feature: Multiple group stages", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}, {$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  assertThrows(
    () => findAvailableAggregation(query, simpleStore),
    Error,
    "Unsupported feature: Multiple group stages"
  );
});

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
  assert(aggregationFound.getField() === "$name");
  assert(aggregationFound.getExpression().type === "sum");
});
