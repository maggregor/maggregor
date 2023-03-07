import { Collection, Document } from "./collection.ts";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";

Deno.test("Collection - add, delete, update and get", () => {
  const collection = new Collection<Document>("test");
  const document = { name: "test" };
  const addedDocument = collection.add(document);
  assertEquals(addedDocument._id, "1");
  assertEquals(collection.get("1"), addedDocument);
  const updatedDocument = { name: "test2" };
  assertEquals(collection.update("1", updatedDocument), true);
  assertEquals(collection.get("1"), { _id: "1", name: "test2" });
  assertEquals(collection.delete("1"), true);
  assertEquals(collection.get("1"), undefined);
});

Deno.test("Collection - name", () => {
  const collection = new Collection<Document>("test");
  assertEquals(collection.name(), "test");
});

Deno.test("Collection - addChangeListener, removeChangeListener", () => {
  const collection = new Collection<Document>("test");
  const document = { name: "test" };
  const called: boolean[] = [];
  const listener = () => called.push(true);
  collection.addChangeListener(listener);
  const addedDocument = collection.add(document);
  assertEquals(called.length, 1);
  collection.update(addedDocument._id!, { name: "test2" });
  assertEquals(called.length, 2);
  collection.delete(addedDocument._id!);
  assertEquals(called.length, 3);
  collection.removeChangeListener(listener);
  collection.add(document);
  assertEquals(called.length, 3);
});
