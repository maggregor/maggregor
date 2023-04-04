import { parse } from '@/parser/mongo-aggregation-parser';

/**
 * https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/
 *
 * { $limit: <positive 64-bit integer> }
 */

test('Limit with positive number', () => {
  expect(parse(`[ { $limit: 5 } ]`)).toEqual([{ type: 'limit', limit: 5 }]);
  expect(parse(`[ { $limit: 999 } ]`)).toEqual([{ type: 'limit', limit: 999 }]);
  expect(parse(`[ { $limit: 999999 } ]`)).toEqual([
    { type: 'limit', limit: 999999 },
  ]);
});

test('Limit with zero', () => {
  expect(parse(`[ { $limit: 0 } ]`)).toEqual([{ type: 'limit', limit: 0 }]);
});

test('Limit with float value', () => {
  const pipeline = `[ { $limit: 3.5 } ]`;
  expect(() => parse(pipeline), 'Must not accept a float').toThrowError();
});

test('Limit with negative number', () => {
  const pipeline = `[ { $limit: -5 } ]`;
  expect(
    () => parse(pipeline),
    'Must not accept a negative number',
  ).toThrowError();
});

test('Limit with string number', () => {
  const pipeline = `[ { $limit: "5" } ]`;
  expect(() => parse(pipeline), 'Must not accept a string').toThrowError();
});

test('Limit with string number and whitespace', () => {
  const pipeline = `[ { $limit : "10" } ]`;
  expect(() => parse(pipeline), 'Must not accept a string').toThrowError();
});
