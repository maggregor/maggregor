import {
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
  CountBasicAccumulator,
} from "@core/pipeline/accumulators/index.ts";
import { assertEquals } from "asserts";

Deno.test({
  name: "SumBasicAccumulator",
  fn() {
    const sumAccumulator = new SumBasicAccumulator({ field: "score" });
    assertEquals(sumAccumulator.operator, "sum");
    assertEquals(sumAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 3);
  },
});

Deno.test({
  name: "AvgBasicAccumulator",
  fn() {
    const avgAccumulator = new AvgBasicAccumulator({ field: "score" });
    assertEquals(avgAccumulator.operator, "avg");
    assertEquals(avgAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 1.5);
  },
});

Deno.test({
  name: "MinBasicAccumulator",
  fn() {
    const minAccumulator = new MinBasicAccumulator({ field: "score" });
    assertEquals(minAccumulator.operator, "min");
    assertEquals(minAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 1);
  },
});

Deno.test({
  name: "MaxBasicAccumulator",
  fn() {
    const maxAccumulator = new MaxBasicAccumulator({ field: "score" });
    assertEquals(maxAccumulator.operator, "max");
    assertEquals(maxAccumulator.evaluate([{ score: 1 }, { score: 2 }]), 2);
  },
});

Deno.test({
  name: "CountBasicAccumulator",
  fn() {
    const countAccumulator = new CountBasicAccumulator({ field: "present" });
    assertEquals(countAccumulator.operator, "count");
    assertEquals(
      countAccumulator.evaluate([{ present: true }, { present: false }]),
      1
    );
  },
});
