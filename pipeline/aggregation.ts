import { Document } from "../collection.ts";

/**
 * Type for a field reference, which is a string.
 */
export type FieldReference = string;

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
   * Returns the cached value for the aggregation.
   * @returns The cached value for the aggregation.
   * @throws Throws an error if the aggregation has not been initialized.
   */
  get(): unknown;
}

/**
 * Abstract class for an aggregation.
 */
export abstract class AbstractAggregation implements Aggregation {
  /**
   * The reference to the field being aggregated.
   */
  protected field: FieldReference;

  /**
   * Indicates whether the aggregation has been initialized.
   */
  protected initialized = false;

  /**
   * Constructor for the AbstractAggregation class.
   * @param field The reference to the field being aggregated.
   */
  constructor(field: FieldReference) {
    this.field = field;
  }

  /**
   * Initializes the aggregation with a collection of documents.
   * @param collection The collection of documents to be used for initialization.
   * @returns The initialized aggregation.
   */
  init(collection: Array<Document>): Aggregation {
    collection.forEach((doc) => this.onAddDocument(doc));
    this.initialized = true;
    return this;
  }

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
  abstract onUpdateDocument(oldDoc: Document, newDoc: Document): void;

  /**
   * Returns the cached value for the aggregation.
   * @returns The cached value for the aggregation.
   * @throws Throws an error
   */
  abstract get(): unknown;

  /**
   * Returns the reference to the field being aggregated.
   * @returns The reference to the field being aggregated.
   */
  getReference(): FieldReference {
    return this.field;
  }
}
