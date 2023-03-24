import { SumCachedAccumulator } from "@core/cache/cached-accumulator.ts";
import { assertEquals } from "asserts";
import { MaterializedView } from "@core/cache/materialized-view.ts";

Deno.test({
  name: "MaterializedView",
  fn() {
    const acc1 = new SumCachedAccumulator({ field: "score" });
    const acc2 = new SumCachedAccumulator({
      operator: "$add",
      value: [{ field: "score" }, { value: 10 }],
    });
    const mv = new MaterializedView({
      groupBy: { field: "genre" },
      accumulators: [acc1, acc2],
    });
    mv.addDocument({ genre: "action", score: 10 });
    mv.addDocument({ genre: "action", score: 20 });
    mv.addDocument({ genre: "action", score: 30 });
    mv.addDocument({ genre: "marvel", score: -100 });
    mv.addDocument({ genre: "begaudeau", score: 999 });
    mv.addDocument({ genre: "begaudeau", score: 999 });

    const acc1Id = acc1.getId();
    const acc2Id = acc2.getId();

    assertEquals(mv.getView(), [
      {
        _id: "action",
        [acc1Id]: 60,
        [acc2Id]: 90,
      },

      {
        _id: "marvel",
        [acc1Id]: -100,
        [acc2Id]: -90,
      },

      {
        _id: "begaudeau",
        [acc1Id]: 1998,
        [acc2Id]: 2018,
      },
    ]);
  },
});
