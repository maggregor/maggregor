import { Aggregation } from "@core/aggregation.ts";

export type AggregationStoreConfig = {
  aggregations?: Array<Aggregation> | undefined;
};

export type AggregationUID = string;

export class AggregationStore {
  private aggregations: Map<AggregationUID, Aggregation> = new Map();

  /**
   * Creates a new aggregation store.
   *
   * @param config
   */
  constructor(config?: AggregationStoreConfig) {
    config?.aggregations?.forEach((aggregation) => {
      this.aggregations.set(aggregation.getUniqIdentifier(), aggregation);
    });
    console.log(`Created new aggregation store.`);
    Array.from(this.aggregations.keys()).forEach((key) => {
      console.log(`Added: ${key}.`);
    });
    console.log(`Loaded ${this.aggregations.size} aggregations.`);
  }

  add(aggregation: Aggregation): void {
    if (this.aggregations.has(aggregation.getUniqIdentifier())) {
      throw new Error(
        `Aggregation with key ${aggregation.getUniqIdentifier()} already exists.`
      );
    }
    this.aggregations.set(aggregation.getUniqIdentifier(), aggregation);
  }

  get(key: AggregationUID): Aggregation | undefined {
    if (this.aggregations.has(key)) {
      return this.aggregations.get(key);
    }
    throw new Error(`Aggregation with key ${key} not found.`);
  }

  getAll(): Array<Aggregation> {
    return Array.from(this.aggregations.values());
  }
}
