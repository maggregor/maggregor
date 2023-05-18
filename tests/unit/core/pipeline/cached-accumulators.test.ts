import {
  SumCachedAccumulator,
  MinCachedAccumulator,
  MaxCachedAccumulator,
  AvgCachedAccumulator,
  CountCachedAccumulator,
} from '@core/pipeline/accumulators';

// The definition is not used in the tests, so we can just pass in a dummy value
const BASE_DEF = {
  outputFieldName: 'test',
  expression: null,
};

describe('SumCachedAccumulator', () => {
  it('should update the cached value correctly', () => {
    const sumAccumulator = new SumCachedAccumulator(BASE_DEF);
    expect(sumAccumulator.getCachedValue()).toBe(0);
    sumAccumulator.add(1);
    expect(sumAccumulator.getCachedValue()).toEqual(1);
    sumAccumulator.add(2);
    expect(sumAccumulator.getCachedValue()).toEqual(3);
    sumAccumulator.add(3);
    expect(sumAccumulator.getCachedValue()).toEqual(6);
    sumAccumulator.delete(2);
    expect(sumAccumulator.getCachedValue()).toEqual(4);
    sumAccumulator.delete(1);
    expect(sumAccumulator.getCachedValue()).toEqual(3);
    sumAccumulator.delete(3);
    expect(sumAccumulator.getCachedValue()).toEqual(0);
  });
});

describe('MinCachedAccumulator', () => {
  it('should update the cached value correctly', () => {
    const minAccumulator = new MinCachedAccumulator(BASE_DEF);
    expect(minAccumulator.getCachedValue()).toBeUndefined();
    minAccumulator.add(3);
    expect(minAccumulator.getCachedValue()).toEqual(3);
    minAccumulator.add(2);
    expect(minAccumulator.getCachedValue()).toEqual(2);
    minAccumulator.add(3);
    expect(minAccumulator.getCachedValue()).toEqual(2);
    minAccumulator.delete(3);
    expect(minAccumulator.getCachedValue()).toEqual(2);
    minAccumulator.delete(4);
    expect(minAccumulator.getCachedValue()).toEqual(2);
    minAccumulator.delete(2);
    expect(minAccumulator.isFaulty()).toBe(true);
    expect(minAccumulator.getCachedValue()).toBeNull();
  });
});

describe('MaxCachedAccumulator', () => {
  it('should update the cached value correctly', () => {
    const maxAccumulator = new MaxCachedAccumulator(BASE_DEF);
    expect(maxAccumulator.getCachedValue()).toBeUndefined();
    maxAccumulator.add(1);
    expect(maxAccumulator.getCachedValue()).toEqual(1);
    maxAccumulator.add(2);
    expect(maxAccumulator.getCachedValue()).toEqual(2);
    maxAccumulator.add(3);
    expect(maxAccumulator.getCachedValue()).toEqual(3);
    maxAccumulator.delete(2);
    expect(maxAccumulator.getCachedValue()).toEqual(3);
    maxAccumulator.delete(1);
    expect(maxAccumulator.getCachedValue()).toEqual(3);
    maxAccumulator.delete(3);
    expect(maxAccumulator.isFaulty()).toBe(true);
    expect(maxAccumulator.getCachedValue()).toBeNull();
  });
});

describe('AvgCachedAccumulator', () => {
  it('should update the cached value correctly', () => {
    const avgAccumulator = new AvgCachedAccumulator(BASE_DEF);
    expect(avgAccumulator.getCachedValue()).toBeUndefined();
    avgAccumulator.add(1);
    expect(avgAccumulator.getCachedValue()).toEqual(1);
    avgAccumulator.add(2);
    expect(avgAccumulator.getCachedValue()).toEqual(1.5);
    avgAccumulator.add(3);
    expect(avgAccumulator.getCachedValue()).toEqual(2);
    avgAccumulator.delete(2);
    expect(avgAccumulator.getCachedValue()).toEqual(2);
    avgAccumulator.delete(1);
    expect(avgAccumulator.getCachedValue()).toEqual(3);
    avgAccumulator.delete(3);
    expect(avgAccumulator.getCachedValue()).toEqual(0);
  });
});

describe('CountCachedAccumulator', () => {
  it('should update the cached value correctly', () => {
    const countAccumulator = new CountCachedAccumulator(BASE_DEF);
    expect(countAccumulator.getCachedValue()).toEqual(0);
    countAccumulator.add(true);
    expect(countAccumulator.getCachedValue()).toEqual(1);
    countAccumulator.add(true);
    expect(countAccumulator.getCachedValue()).toEqual(2);
    countAccumulator.add(false);
    expect(countAccumulator.getCachedValue()).toEqual(2);
    countAccumulator.add(true);
    expect(countAccumulator.getCachedValue()).toEqual(3);
    countAccumulator.delete(true);
    expect(countAccumulator.getCachedValue()).toEqual(2);
    countAccumulator.delete(false);
    expect(countAccumulator.getCachedValue()).toEqual(2);
    countAccumulator.delete(true);
    expect(countAccumulator.getCachedValue()).toEqual(1);
    countAccumulator.delete(true);
    expect(countAccumulator.getCachedValue()).toEqual(0);
  });
});
