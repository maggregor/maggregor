import {
  AvgAccumulator,
  MaxAccumulator,
  MinAccumulator,
  SumAccumulator,
} from "@core/pipeline/accumulators.ts";
import { assertEquals } from "asserts";

Deno.test({
  name: "SumAccumulator",
  fn() {
    const sumAccumulator = new SumAccumulator({ field: "score" });
    assertEquals(sumAccumulator.operator, "$sum");
    assertEquals(sumAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 3);
  },
});

Deno.test({
  name: "AvgAccumulator",
  fn() {
    const avgAccumulator = new AvgAccumulator({ field: "score" });
    assertEquals(avgAccumulator.operator, "$avg");
    assertEquals(avgAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 1.5);
  },
});

Deno.test({
  name: "MinAccumulator",
  fn() {
    const minAccumulator = new MinAccumulator({ field: "score" });
    assertEquals(minAccumulator.operator, "$min");
    assertEquals(minAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 1);
  },
});

Deno.test({
  name: "MaxAccumulator",
  fn() {
    const maxAccumulator = new MaxAccumulator({ field: "score" });
    assertEquals(maxAccumulator.operator, "$max");
    assertEquals(maxAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 2);
  },
});
