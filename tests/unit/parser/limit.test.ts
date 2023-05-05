import { parseStages } from '@/parser';

/**
 * https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/
 *
 * { $limit: <positive 64-bit integer> }
 */

test('Limit with positive number', () => {
  const p1 = parseStages(`[ { $limit: 5 } ]`);
  const p2 = parseStages(`[ { $limit: 999 } ]`);
  const p3 = parseStages(`[ { $limit: 999999 } ]`);
  expect(p1).toEqual([{ type: 'limit', limit: 5 }]);
  expect(p2).toEqual([{ type: 'limit', limit: 999 }]);
  expect(p3).toEqual([{ type: 'limit', limit: 999999 }]);
});

test('Limit with zero', () => {
  const p = parseStages(`[ { $limit: 0 } ]`);
  expect(p).toEqual([{ type: 'limit', limit: 0 }]);
});

test('Limit with float value', () => {
  const pipeline = `[ { $limit: 3.5 } ]`;
  expect(() => parseStages(pipeline), 'Must not accept a float').toThrowError();
});

test('Limit with negative number', () => {
  const pipeline = `[ { $limit: -5 } ]`;
  expect(
    () => parseStages(pipeline),
    'Must not accept a negative number',
  ).toThrowError();
});

test('Limit with string number', () => {
  const pipeline = `[ { $limit: "5" } ]`;
  expect(
    () => parseStages(pipeline),
    'Must not accept a string',
  ).toThrowError();
});

test('Limit with string number and whitespace', () => {
  const pipeline = `[ { $limit : "10" } ]`;
  expect(
    () => parseStages(pipeline),
    'Must not accept a string',
  ).toThrowError();
});
