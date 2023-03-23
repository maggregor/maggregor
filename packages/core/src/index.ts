export type Document = { [key: string]: DocumentFieldValue };
export type DocumentFieldValue = number | string | boolean | Document;
