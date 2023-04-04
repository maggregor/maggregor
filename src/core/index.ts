export type Document = { [key: string]: DocumentFieldValue };
export type DocumentFieldValue = number | string | boolean | Document;

/**
 * Listener for collection events
 */
export interface CollectionListener {
  addDocument(doc: Document): void;
  updateDocument(oldDoc: Document, newDoc: Document): void;
  deleteDocument(doc: Document): void;
}
