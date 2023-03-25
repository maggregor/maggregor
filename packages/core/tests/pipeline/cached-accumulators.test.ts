import { assertEquals } from "asserts";
import {
  SumCachedAccumulator,
  MinCachedAccumulator,
  MaxCachedAccumulator,
  AvgCachedAccumulator,
  CountCachedAccumulator,
} from "@core/pipeline/accumulators/index.ts";

Deno.test({
  name: "SumCachedAccumulator",
  fn() {
    const sumAccumulator = new SumCachedAccumulator();
    assertEquals(sumAccumulator.getCachedValue(), undefined);
    sumAccumulator.add(1);
    assertEquals(sumAccumulator.getCachedValue(), 1);
    sumAccumulator.add(2);
    assertEquals(sumAccumulator.getCachedValue(), 3);
    sumAccumulator.add(3);
    assertEquals(sumAccumulator.getCachedValue(), 6);
    sumAccumulator.delete(2);
    assertEquals(sumAccumulator.getCachedValue(), 4);
    sumAccumulator.delete(1);
    assertEquals(sumAccumulator.getCachedValue(), 3);
    sumAccumulator.delete(3);
    assertEquals(sumAccumulator.getCachedValue(), 0);
  },
});

Deno.test({
  name: "MinCachedAccumulator",
  fn() {
    const minAccumulator = new MinCachedAccumulator();
    assertEquals(minAccumulator.getCachedValue(), undefined);
    minAccumulator.add(1);
    assertEquals(minAccumulator.getCachedValue(), 1);
    minAccumulator.add(2);
    assertEquals(minAccumulator.getCachedValue(), 1);
    minAccumulator.add(3);
    assertEquals(minAccumulator.getCachedValue(), 1);
    minAccumulator.delete(2);
    assertEquals(minAccumulator.getCachedValue(), 1);
    minAccumulator.delete(1);
    assertEquals(minAccumulator.getCachedValue(), 3);
    minAccumulator.delete(3);
    assertEquals(minAccumulator.getCachedValue(), undefined);
  },
});

Deno.test({
  name: "MaxCachedAccumulator",
  fn() {
    const maxAccumulator = new MaxCachedAccumulator();
    assertEquals(maxAccumulator.getCachedValue(), undefined);
    maxAccumulator.add(1);
    assertEquals(maxAccumulator.getCachedValue(), 1);
    maxAccumulator.add(2);
    assertEquals(maxAccumulator.getCachedValue(), 2);
    maxAccumulator.add(3);
    assertEquals(maxAccumulator.getCachedValue(), 3);
    maxAccumulator.delete(2);
    assertEquals(maxAccumulator.getCachedValue(), 3);
    maxAccumulator.delete(1);
    assertEquals(maxAccumulator.getCachedValue(), 3);
    maxAccumulator.delete(3);
    assertEquals(maxAccumulator.getCachedValue(), undefined);
  },
});

Deno.test({
  name: "AvgCachedAccumulator",
  fn() {
    const avgAccumulator = new AvgCachedAccumulator();
    assertEquals(avgAccumulator.getCachedValue(), undefined);
    avgAccumulator.add(1);
    assertEquals(avgAccumulator.getCachedValue(), 1);
    avgAccumulator.add(2);
    assertEquals(avgAccumulator.getCachedValue(), 1.5);
    avgAccumulator.add(3);
    assertEquals(avgAccumulator.getCachedValue(), 2);
    avgAccumulator.delete(2);
    assertEquals(avgAccumulator.getCachedValue(), 2);
    avgAccumulator.delete(1);
    assertEquals(avgAccumulator.getCachedValue(), 3);
    avgAccumulator.delete(3);
    assertEquals(avgAccumulator.getCachedValue(), 0);
  },
});

Deno.test({
  name: "CountCachedAccumulator",
  fn() {
    const countAccumulator = new CountCachedAccumulator();
    assertEquals(countAccumulator.getCachedValue(), 0);
    countAccumulator.add(true);
    assertEquals(countAccumulator.getCachedValue(), 1);
    countAccumulator.add(true);
    assertEquals(countAccumulator.getCachedValue(), 2);
    countAccumulator.add(true);
    assertEquals(countAccumulator.getCachedValue(), 3);
    countAccumulator.delete(true);
    assertEquals(countAccumulator.getCachedValue(), 2);
    countAccumulator.delete(false);
    assertEquals(countAccumulator.getCachedValue(), 2);
    countAccumulator.delete(true);
    assertEquals(countAccumulator.getCachedValue(), 1);
    countAccumulator.delete(false);
    assertEquals(countAccumulator.getCachedValue(), 1);
    countAccumulator.delete(true);
    assertEquals(countAccumulator.getCachedValue(), 0);
    countAccumulator.add(false);
    assertEquals(countAccumulator.getCachedValue(), 0);
    countAccumulator.add(false);
    assertEquals(countAccumulator.getCachedValue(), 0);
    countAccumulator.add(false);
    assertEquals(countAccumulator.getCachedValue(), 0);
  },
});
