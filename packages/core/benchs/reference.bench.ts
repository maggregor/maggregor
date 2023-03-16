import { Collection, Document } from "@core/utils/collection.ts";
import { Max, Sum, CountDistinct } from "@core/index.ts";

const COUNT_DOCUMENTS = 1000;
const COUNT_ITERATIONS = 10000;

Deno.bench(
  `Reference: Sum on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
      collection.values().reduce((acc, doc) => acc + (doc.score as number), 0);
    }
  }
);

Deno.bench(
  `Maggregor: Sum on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    const sumAggregation = new Sum("score");
    sumAggregation.watch(collection);

    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
    }
  }
);

Deno.bench(
  `Reference: Max on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
      collection
        .values()
        .reduce((acc, doc) => Math.max(acc, doc.score as number), 0);
    }
  }
);

Deno.bench(
  `Maggregor: Max on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    const maxAggregation = new Max("score");
    maxAggregation.watch(collection);
    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
    }
  }
);

Deno.bench(
  `Reference: Distinct Count on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
      const countries = new Set();
      collection.values().forEach((doc) => countries.add(doc.country));
    }
  }
);

Deno.bench(
  `Maggregor: Count Distinct on ${COUNT_DOCUMENTS} documents (${COUNT_ITERATIONS} iterations)`,
  () => {
    const documents: Document[] = [];
    for (let i = 0; i < COUNT_DOCUMENTS; i++) {
      documents.push({ country: "France", score: i });
    }
    const collection = new Collection();
    collection.addMany(documents);
    const aggregation = new CountDistinct("score");
    aggregation.watch(collection);
    for (let i = 0; i < COUNT_ITERATIONS; i++) {
      collection.add({ country: "France", score: i });
    }
  }
);
