import {
  AvgBasicAccumulator,
  AvgCachedAccumulator,
  SumBasicAccumulator,
  SumCachedAccumulator,
  MinBasicAccumulator,
  MinCachedAccumulator,
  MaxBasicAccumulator,
  MaxCachedAccumulator,
  CountBasicAccumulator,
  CountCachedAccumulator,
} from "src/pipeline/accumulators";
import { assert, describe, expect, it } from "vitest";

describe("Cached accumulators equals basic accumulators", () => {
  it("should be equal", () => {
    assert(
      new AvgBasicAccumulator({ field: "score" }).equals(
        new AvgCachedAccumulator({ field: "score" })
      )
    );
    assert(
      new SumBasicAccumulator({ field: "score" }).equals(
        new SumCachedAccumulator({ field: "score" })
      )
    );
    assert(
      new MinBasicAccumulator({ field: "score" }).equals(
        new MinCachedAccumulator({ field: "score" })
      )
    );
    assert(
      new MaxBasicAccumulator({ field: "score" }).equals(
        new MaxCachedAccumulator({ field: "score" })
      )
    );
    assert(
      new CountBasicAccumulator({ field: "score" }).equals(
        new CountCachedAccumulator({ field: "score" })
      )
    );
  });
});

describe("Cached accumulators do not equal basic accumulators", () => {
  it("should not be equal", () => {
    assert(
      !new AvgBasicAccumulator({ field: "score" }).equals(
        new AvgCachedAccumulator({ field: "score2" })
      )
    );
    assert(
      !new SumBasicAccumulator({ field: "score" }).equals(
        new SumCachedAccumulator({ field: "score2" })
      )
    );
    assert(
      !new MinBasicAccumulator({ field: "score" }).equals(
        new MinCachedAccumulator({ field: "score2" })
      )
    );
    assert(
      !new MaxBasicAccumulator({ field: "score" }).equals(
        new MaxCachedAccumulator({ field: "score2" })
      )
    );
    assert(
      !new CountBasicAccumulator({ field: "score" }).equals(
        new CountCachedAccumulator({ field: "score2" })
      )
    );
  });
});

describe("Cached accumulators same hash as basic accumulators", () => {
  it("should be equal", () => {
    expect(new AvgBasicAccumulator({ field: "score" }).hash).toBe(
      new AvgCachedAccumulator({ field: "score" }).hash
    );
    expect(new SumBasicAccumulator({ field: "score" }).hash).toBe(
      new SumCachedAccumulator({ field: "score" }).hash
    );
    expect(new MinBasicAccumulator({ field: "score" }).hash).toBe(
      new MinCachedAccumulator({ field: "score" }).hash
    );
    expect(new MaxBasicAccumulator({ field: "score" }).hash).toBe(
      new MaxCachedAccumulator({ field: "score" }).hash
    );
    expect(new CountBasicAccumulator({ field: "score" }).hash).toBe(
      new CountCachedAccumulator({ field: "score" }).hash
    );
  });
});

describe("Cached accumulators different hash as basic accumulators", () => {
  it("should not be equal", () => {
    expect(new AvgBasicAccumulator({ field: "score" }).hash).not.toBe(
      new AvgCachedAccumulator({ field: "score2" }).hash
    );
    expect(new SumBasicAccumulator({ field: "score" }).hash).not.toBe(
      new SumCachedAccumulator({ field: "score2" }).hash
    );
    expect(new MinBasicAccumulator({ field: "score" }).hash).not.toBe(
      new MinCachedAccumulator({ field: "score2" }).hash
    );
    expect(new MaxBasicAccumulator({ field: "score" }).hash).not.toBe(
      new MaxCachedAccumulator({ field: "score2" }).hash
    );
    expect(new CountBasicAccumulator({ field: "score" }).hash).not.toBe(
      new CountCachedAccumulator({ field: "score2" }).hash
    );
  });
});
