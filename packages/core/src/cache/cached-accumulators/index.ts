import { AbstractAggregation } from "@core/aggregation.ts";
import { Document } from "@core/utils/collection.ts";

export type SumExpression = {
  type: "sum";
  field: FieldReference;
};

export type AvgExpression = {
  type: "avg";
  field: FieldReference;
};

export type MaxExpression = {
  type: "max";
  field: FieldReference;
};

export type MinExpression = {
  type: "min";
  field: FieldReference;
};

export type CountDistinctExpression = {
  type: "countDistinct";
  field: FieldReference;
};

export type Expression =
  | SumExpression
  | AvgExpression
  | MaxExpression
  | MinExpression
  | CountDistinctExpression;

/**
 * Interface for an aggregation.
 */
export interface Aggregation {
  /**
   * Initializes the aggregation with a collection of documents.
   * @param collection The collection of documents to be used for initialization.
   * @returns The initialized aggregation.
   */
  init(collection: Array<Document>): Aggregation;

  /**
   * Method called when a new document is added to the collection.
   * @param doc The document that was added.
   */
  onAddDocument(doc: Document): void;

  /**
   * Method called when an existing document is updated in the collection.
   * @param oldDoc The old version of the document.
   * @param newDoc The new version of the document.
   */
  onUpdateDocument(oldDoc: Document, newDoc: Document): void;

  /**
   * Method called when a document is deleted from the collection.
   * @param doc The document that was deleted.
   */
  onDeleteDocument(doc: Document): void;

  /**
   * Updates the cached value for the aggregation.
   * @param cachedValue The new cached value for the aggregation.
   */
  updateCachedValue(cachedValue: unknown): void;

  /**
   * Returns the cached value for the aggregation.
   * @returns The cached value for the aggregation.
   * @throws Throws an error if the aggregation has not been initialized.
   */
  get(): unknown;
}

/**
 * Type for a field reference, which is a string.
 */
export type FieldReference = string;

/**
 * Abstract class for an aggregation.
 */
export abstract class ExpressionAggregation extends AbstractAggregation {
  /**
   * The cached value for the aggregation.
   */
  protected _cachedValue: unknown;

  /**
   * Method called when a new document is added to the collection.
   * @param doc The document that was added.
   */
  abstract onAddDocument(doc: Document): void;

  /**
   * Method called when a document is deleted from the collection.
   * @param doc The document that was deleted.
   */
  abstract onDeleteDocument(doc: Document): void;

  /**
   * Method called when an existing document is updated in the collection.
   * @param oldDoc The old version of the document.
   * @param newDoc The new version of the document.
   */
  onUpdateDocument(oldDoc: Document, newDoc: Document): void {
    this.onDeleteDocument(oldDoc);
    this.onAddDocument(newDoc);
  }

  /**
   * Updates the cached value for the aggregation.
   * @param cachedValue The new cached value for the aggregation.
   */
  updateCachedValue(cachedValue: unknown): void {
    this._cachedValue = cachedValue;
  }

  /**
   * Returns the cached value for the aggregation.
   * @returns The cached value for the aggregation.
   * @throws Throws an error
   */
  get(): unknown {
    if (!this.initialized) {
      throw new Error("Aggregation not initialized");
    }
    return this._cachedValue;
  }
}
