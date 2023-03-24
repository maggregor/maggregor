import { Expression, evaluateExpression } from "@core/pipeline/expressions.ts";
import { CollectionListener, Document } from "@core/index.ts";
import { CachedAccumulator } from "./cached-accumulator.ts";

export interface MaterializedViewOptions {
  groupBy: Expression;
  accumulators: CachedAccumulator[];
}

export class MaterializedView implements CollectionListener {
  private groupBy: Expression;
  private accumulators: CachedAccumulator[];
  private results = new Map<string, CachedAccumulator[]>();

  constructor(options: MaterializedViewOptions) {
    this.groupBy = options.groupBy;
    this.accumulators = options.accumulators;
  }

  addDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);
    if (!this.results.has(groupByValueString)) {
      this.results.set(
        groupByValueString,
        this.accumulators.map((a) => a.clone())
      );
    }
    const accumulators = this.results.get(groupByValueString);
    accumulators?.forEach((a) => a.addDocument(doc));
  }

  deleteDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);
    if (!this.results.has(groupByValueString)) {
      return;
    }
    const accumulators = this.results.get(groupByValueString);
    accumulators?.forEach((a) => a.deleteDocument(doc));
  }

  updateDocument(oldDoc: Document, newDoc: Document): void {
    this.updateDocument(oldDoc, newDoc);
  }

  // deno-lint-ignore no-explicit-any
  getView(): any {
    const results = [];
    for (const [key, value] of this.results) {
      const result = { _id: JSON.parse(key) };
      for (let i = 0; i < this.accumulators.length; i++) {
        // @ts-ignore - TODO: fix this
        result[this.accumulators[i].getId()] = value[i].getCachedValue();
      }
      results.push(result);
    }
    return results;
  }
}
