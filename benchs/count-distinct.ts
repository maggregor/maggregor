import { Document } from "../collection.ts";
import { Collection } from "../collection.ts";
import { CountDistinct } from "../pipeline/expressions/count-distinct.ts";

const COUNT_DOCUMENTS = 1000000;
const COUNT_ITERATIONS = 1000000;

Deno.bench({
  name: "countd-1",
  fn: () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    const countDistinctAggregation = new CountDistinct("score");
    countDistinctAggregation.watch(collection);

    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
    }
  },
});
