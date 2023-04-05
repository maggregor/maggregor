import { createBasicAccumulator } from '@core/pipeline/accumulators/index';
import { parse } from '@/parser/mongo-aggregation-parser';

// test('Group test with blank spaces', () => {
//   const pipeline = `[ { $group: { _id: "$name" } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with simple sum accumulator', () => {
//   const pipeline = `[ { $group: { _id: "$name", mySum: { $sum: "$age" } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with multiple accumulators', () => {
//   const pipeline = `[ { $group: { _id: "$country", totalPopulation: { $sum: 1 }, averageAge: { $avg: "$age" } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with complex accumulator', () => {
//   const pipeline = `[ { $group: { _id: "$gender", totalSalary: { $sum: { $cond: [ { $gte: [ "$salary", 0 ] }, "$salary", 0 ] } } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with different field reference formats', () => {
//   const pipeline = `[ { $group: { _id: "$name", total: { $sum: "$age" }, min: { $min: "$nested.field" } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with expression in accumulator', () => {
//   const pipeline = `[ { $group: { _id: "$country", salarySum: { $sum: { $multiply: ["$salary", "$exchangeRate"] } } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with multiple accumulators and nested expressions', () => {
//   const pipeline = `[ { $group: { _id: "$country", totalAge: { $sum: "$age" }, averageSalary: { $avg: { $add: ["$salary", "$bonus"] } } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });

// test('Group with no whitespace', () => {
//   const pipeline = `[{ $group: { _id: "$name", mySum: { $sum: "$age" } } }]`;
//   expect(parse(pipeline)).toBeDefined();
// });

test('Group with nested expressions in accumulator', () => {
  const pipeline = `[ { $group: { _id: "$category", weightedAverage: { $sum: { $multiply: ["$price", "$quantity"] } } } } ]`;
  expect(parse(pipeline)).toHaveLength(1);
  expect(parse(pipeline)[0]);
  console.log(parse(pipeline)[0]);
  console.log(createBasicAccumulator(parse(pipeline)[0].options));
});

// Not supported yet
// test("Group with nested fields in _id field", () => {
//   const pipeline = `[ { $group: { _id: { year: "$year", month: "$month" }, total: { $sum: 1 } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });
