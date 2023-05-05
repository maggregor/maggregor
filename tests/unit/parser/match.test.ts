import { MatchStage } from '@/core/pipeline/stages';
import { parseStages } from '@/parser';
import { parse } from 'path';

test('Match with simple equality condition', () => {
  const pipeline = `[ { $match: { country: "France" } } ]`;
  expect(parseStages(pipeline)).toEqual([
    new MatchStage({
      conditions: [
        {
          operator: 'eq',
          value: [{ field: 'country' }, { value: 'France' }],
        },
      ],
    }),
  ]);
});

test('Match with single condition', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } } ] } } ]`;
  expect(parseStages(pipeline)).toBeDefined();
});

test('Match with multiple conditions', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { country: "USA" } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with complex conditions', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { $or: [ { country: "USA" }, { country: "Canada" } ] } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with nested field conditions', () => {
  const pipeline = `[ { $match: { $and: [ { "address.country": "USA" }, { "address.city": "New York" } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with no whitespace', () => {
  const pipeline = `[{ $match: { $and: [ { age: { $gte: 18 } }, { country: "USA" } ] } }]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with expression in condition', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { totalPrice: { $gte: { $multiply: ["$price", "$quantity"] } } } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with boolean values', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { isStudent: true } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with null values', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { middleName: null } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with $eq operator', () => {
  const pipeline = `[ { $match: { country: { $eq: "France" } } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with $ne operator', () => {
  const pipeline = `[ { $match: { country: { $ne: "France" } } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

// Not supported yet
// test("Match with $in operator", () => {
//   const pipeline = `[ { $match: { country: { $in: ["USA", "Canada", "France"] } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $nin operator", () => {
//   const pipeline = `[ { $match: { country: { $nin: ["USA", "Canada", "France"] } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $elemMatch operator", () => {
//   const pipeline = `[ { $match: { scores: { $elemMatch: { $gte: 80, $lt: 85 } } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $all operator", () => {
//   const pipeline = `[ { $match: { tags: { $all: ["tag1", "tag2"] } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $exists operator", () => {
//   const pipeline = `[ { $match: { "address.city": { $exists: true } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $type operator", () => {
//   const pipeline = `[ { $match: { age: { $type: "int" } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $size operator", () => {
//   const pipeline = `[ { $match: { tags: { $size: 3 } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// Not supported yet
// test("Match with $regex operator", () => {
//   const pipeline = `[ { $match: { name: { $regex: "Smith", $options: "i" } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

test('Match with $and operator', () => {
  const pipeline = `[ { $match: { $and: [ { age: { $gte: 18 } }, { country: "USA" } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

test('Match with $or operator', () => {
  const pipeline = `[ { $match: { $or: [ { age: { $lt: 18 } }, { country: "France" } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

// test("Match with $not operator", () => {
//   const pipeline = `[ { $match: { age: { $not: { $gte: 18 } } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

test('Match with nested $and and $or operators', () => {
  const pipeline = `[ { $match: { $and: [ { $or: [ { age: { $lt: 18 } }, { age: { $gt: 65 } } ] }, { country: "USA" } ] } } ]`;
  expect(parse(pipeline)).toBeDefined();
});

// test("Match with $and operator and multiple conditions", () => {
//   const pipeline = `[ { $match: { $and: [ { age: { $gte: 18, $lte: 65 } }, { country: "USA" } ] } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });
