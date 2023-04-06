import {
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
} from '@core/pipeline/accumulators/basic';
import { GroupStage } from '@core/pipeline/stages';
import { parsePipeline } from '@/parser';

test('Group test with blank spaces', () => {
  const pipeline = `[ { $group: { _id: "$name" } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'name' },
      accumulators: [],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with simple sum accumulator', () => {
  const pipeline = `[ { $group: { _id: "$name", mySum: { $sum: "$age" } } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'name' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'mySum',
          expression: { field: 'age' },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with multiple accumulators', () => {
  const pipeline = `[ { $group: { _id: "$country", totalPopulation: { $sum: 1 }, averageAge: { $avg: "$age" } } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'country' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'totalPopulation',
          expression: { value: 1 },
        }),
        new AvgBasicAccumulator({
          outputFieldName: 'averageAge',
          expression: { field: 'age' },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with complex accumulator', () => {
  const pipeline = `[ { $group: { _id: "$gender", totalSalary: { $sum: { $cond: [ { $gte: [ "$salary", 0 ] }, "$salary", 0 ] } } } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'gender' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'totalSalary',
          expression: {
            operator: 'cond',
            value: [
              {
                operator: 'gte',
                value: [{ field: 'salary' }, { value: 0 }],
              },
              { field: 'salary' },
              { value: 0 },
            ],
          },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with different field reference formats', () => {
  const pipeline = `[ { $group: { _id: "$name", total: { $sum: "$age" }, min: { $min: "$nested.field" } } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'name' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'total',
          expression: { field: 'age' },
        }),
        new MinBasicAccumulator({
          outputFieldName: 'min',
          expression: { field: 'nested.field' },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with expression in accumulator', () => {
  const pipeline = `[ { $group: { _id: "$country", salarySum: { $sum: { $multiply: ["$salary", "$exchangeRate"] } } } } ]`;
  const actualPipeline = parsePipeline(pipeline);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'country' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'salarySum',
          expression: {
            operator: 'multiply',
            value: [{ field: 'salary' }, { field: 'exchangeRate' }],
          },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with multiple accumulators and nested expressions', () => {
  const input = `[ { $group: { _id: "$country", totalAge: { $sum: "$age" }, averageSalary: { $avg: { $add: ["$salary", "$bonus"] } } } } ]`;
  const actualPipeline = parsePipeline(input);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'country' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'totalAge',
          expression: { field: 'age' },
        }),
        new AvgBasicAccumulator({
          outputFieldName: 'averageSalary',
          expression: {
            operator: 'add',
            value: [{ field: 'salary' }, { field: 'bonus' }],
          },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with no whitespace', () => {
  const input = `[{ $group: { _id: "$name", mySum: { $sum: "$age" } } }]`;
  const actualPipeline = parsePipeline(input);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'name' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'mySum',
          expression: { field: 'age' },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

test('Group with nested expressions in accumulator', () => {
  const input = `[ { $group: { _id: "$category", weightedAverage: { $sum: { $multiply: ["$price", "$quantity"] } } } } ]`;
  const actualPipeline = parsePipeline(input);
  const expectedPipeline = [
    new GroupStage({
      groupExpr: { field: 'category' },
      accumulators: [
        new SumBasicAccumulator({
          outputFieldName: 'weightedAverage',
          expression: {
            operator: 'multiply',
            value: [{ field: 'price' }, { field: 'quantity' }],
          },
        }),
      ],
    }),
  ];
  expect(actualPipeline).toEqual(expectedPipeline);
});

// Not supported yet
// test("Group with nested fields in _id field", () => {
//   const pipeline = `[ { $group: { _id: { year: "$year", month: "$month" }, total: { $sum: 1 } } } ]`;
//   expect(parse(pipeline)).toBeDefined();
// });
