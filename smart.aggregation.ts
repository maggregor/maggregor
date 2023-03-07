import { ChangeEvent, Collection, Document } from "./collection.ts";

export interface Aggregation {
  init(collection: Array<Document>): Aggregation;
  onAddDocument(d: Document): void;
  onUpdateDocument(oldDoc: Document, newDoc: Document): void;
  onDeleteDocument(d: Document): void;
  updateCachedValue(cachedValue: unknown): void;
  get(): unknown;
}

export type FieldReference = string;

export abstract class AbstractAggregation implements Aggregation {
  protected _cachedValue: unknown;
  protected field: FieldReference;
  private initialized = false;

  constructor(field: FieldReference) {
    this.field = field;
  }

  init(collection: Array<Document>): Aggregation {
    collection.forEach((doc) => this.onAddDocument(doc));
    this.initialized = true;
    return this;
  }

  abstract onAddDocument(d: Document): void;
  abstract onDeleteDocument(d: Document): void;

  onUpdateDocument(oldDoc: Document, newDoc: Document): void {
    this.onDeleteDocument(oldDoc);
    this.onAddDocument(newDoc);
  }

  updateCachedValue(cachedValue: unknown): void {
    this._cachedValue = cachedValue;
  }

  get(): unknown {
    if (!this.initialized) {
      throw new Error("Aggregation not initialized");
    }
    return this._cachedValue;
  }
}

export class SmartAggregation {
  private aggregation: Aggregation;

  constructor(collection: Collection<Document>, aggregation: Aggregation) {
    this.aggregation = aggregation;
    this.aggregation.init(collection.values());
    collection.addChangeListener((event) => this.onChange(event));
  }

  onChange(event: ChangeEvent) {
    switch (event.type) {
      case "add":
        this.aggregation.onAddDocument(event.document);
        break;
      case "update":
        this.aggregation.onUpdateDocument(event.oldDocument, event.newDocument);
        break;
      case "delete":
        this.aggregation.onDeleteDocument(event.document);
        break;
    }
  }
}
