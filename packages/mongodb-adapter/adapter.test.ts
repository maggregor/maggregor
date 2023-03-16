import { assertThrows } from "asserts";
import { findAvailableAggregation } from "./adapter.ts";
import { AggregationStore } from "@core/store.ts";
import { Group } from "../core/src/index.ts";

Deno.test("Should not find available aggregation", () => {
  const query = `[{$group:{_id:"$name", total: { $sum: "$score"}}}]`;
  const store = new AggregationStore({
    aggregations: [],
  });
  assertThrows(() => findAvailableAggregation(query, store));
  store.add(new Group("unknown", { sum: "$score" }));
  assertThrows(() => findAvailableAggregation(query, store));
  store.add(new Group("$name", { sum: "$score" }));
  findAvailableAggregation(query, store);
});
