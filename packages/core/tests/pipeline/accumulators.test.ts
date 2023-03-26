import {
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
  CountBasicAccumulator,
} from "@core/pipeline/accumulators/index.ts";
import { assert, assertEquals } from "asserts";
import {
  SumCachedAccumulator,
  MinCachedAccumulator,
  MaxCachedAccumulator,
  AvgCachedAccumulator,
  CountCachedAccumulator,
} from "@core/pipeline/accumulators/index.ts";

Deno.test({
  name: "Cached accumulators equals basic accumulators",
  fn() {
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
  },
});

Deno.test({
  name: "Cached accumulators do not equal basic accumulators",
  fn() {
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
  },
});

Deno.test({
  name: "Cached accumulators same hash as basic accumulators",
  fn() {
    assertEquals(
      new AvgBasicAccumulator({ field: "score" }).hash,
      new AvgCachedAccumulator({ field: "score" }).hash
    );
    assertEquals(
      new SumBasicAccumulator({ field: "score" }).hash,
      new SumCachedAccumulator({ field: "score" }).hash
    );
    assertEquals(
      new MinBasicAccumulator({ field: "score" }).hash,
      new MinCachedAccumulator({ field: "score" }).hash
    );
    assertEquals(
      new MaxBasicAccumulator({ field: "score" }).hash,
      new MaxCachedAccumulator({ field: "score" }).hash
    );
    assertEquals(
      new CountBasicAccumulator({ field: "score" }).hash,
      new CountCachedAccumulator({ field: "score" }).hash
    );
  },
});

Deno.test({
  name: "Cached accumulators different hash as basic accumulators",
  fn() {
    assert(
      new AvgBasicAccumulator({ field: "score" }).hash !==
        new AvgCachedAccumulator({ field: "score2" }).hash
    );
    assert(
      new SumBasicAccumulator({ field: "score" }).hash !==
        new SumCachedAccumulator({ field: "score2" }).hash
    );
    assert(
      new MinBasicAccumulator({ field: "score" }).hash !==
        new MinCachedAccumulator({ field: "score2" }).hash
    );
    assert(
      new MaxBasicAccumulator({ field: "score" }).hash !==
        new MaxCachedAccumulator({ field: "score2" }).hash
    );
    assert(
      new CountBasicAccumulator({ field: "score" }).hash !==
        new CountCachedAccumulator({ field: "score2" }).hash
    );
  },
});
