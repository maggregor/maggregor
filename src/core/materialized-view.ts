import type { CollectionListener, Document } from '@core/index';
import type {
  AccumulatorDefinition,
  CachedAccumulator,
} from './pipeline/accumulators';
import { createCachedAccumulator } from './pipeline/accumulators';
import { evaluateExpression, toHashExpression } from './pipeline/expressions';
import type { Expression } from './pipeline/expressions';
export interface MaterializedViewDefinition {
  db?: string;
  collection?: string;
  groupBy: Expression;
  accumulatorDefs: AccumulatorDefinition[];
}

export class MaterializedView implements CollectionListener {
  private _db: string | undefined;
  private _collection: string | undefined;
  private groupBy: Expression;
  private definitions: AccumulatorDefinition[];
  private results = new Map<string, CachedAccumulator[]>();

  constructor(def: MaterializedViewDefinition) {
    this._db = def.db;
    this._collection = def.collection;
    this.groupBy = def.groupBy;
    this.definitions = def.accumulatorDefs;
  }

  addDocument(doc: Document): void {
    const groupByValue = evaluateExpression(this.groupBy, doc);
    const groupByValueString = JSON.stringify(groupByValue);
    if (!this.results.has(groupByValueString)) {
      this.results.set(
        groupByValueString,
        this.definitions.map((d) => createCachedAccumulator(d)),
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

  /**
   * _id is the groupBy expression
   * Each accumulator is a field in the document
   *
   * @returns
   */
  getView(): Document[] {
    const accumulatorHashes = this.getAccumulatorHashes();
    return Array.from(this.results.entries()).map(([key, value]) => {
      const obj: Document = {
        [toHashExpression(this.groupBy)]: JSON.parse(key),
      };
      value.forEach((a, i) => {
        obj[accumulatorHashes[i]] = a.getCachedValue();
      });
      return obj;
    });
  }

  getAccumulatorHashes(): string[] {
    return this.definitions.map((d) => createCachedAccumulator(d).getHash());
  }

  getGroupExpression(): Expression {
    return this.groupBy;
  }

  getAccumulatorDefinitions(): AccumulatorDefinition[] {
    return this.definitions;
  }

  get db(): string | undefined {
    return this._db;
  }

  get collection(): string | undefined {
    return this._collection;
  }
}
