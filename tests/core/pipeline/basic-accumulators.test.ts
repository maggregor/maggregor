import {
  SumBasicAccumulator,
  AvgBasicAccumulator,
  MinBasicAccumulator,
  MaxBasicAccumulator,
  CountBasicAccumulator,
} from '@core/pipeline/accumulators/basic';

describe('SumBasicAccumulator', () => {
  it('should have the operator "sum"', () => {
    const sumAccumulator = new SumBasicAccumulator({ field: 'score' });
    expect(sumAccumulator.operator).toBe('sum');
  });

  it('should return the sum of "score" elements in an array', () => {
    const sumAccumulator = new SumBasicAccumulator({ field: 'score' });
    expect(sumAccumulator.evaluate([{ score: 1 }, { score: 2 }])).toBe(3);
  });
});

describe('AvgBasicAccumulator', () => {
  it('should have the operator "avg"', () => {
    const avgAccumulator = new AvgBasicAccumulator({ field: 'score' });
    expect(avgAccumulator.operator).toBe('avg');
  });

  it('should return the average of "score" elements in an array', () => {
    const avgAccumulator = new AvgBasicAccumulator({ field: 'score' });
    expect(avgAccumulator.evaluate([{ score: 1 }, { score: 2 }])).toBe(1.5);
  });
});

describe('MinBasicAccumulator', () => {
  it('should have the operator "min"', () => {
    const minAccumulator = new MinBasicAccumulator({ field: 'score' });
    expect(minAccumulator.operator).toBe('min');
  });

  it('should return the minimum value of "score" elements in an array', () => {
    const minAccumulator = new MinBasicAccumulator({ field: 'score' });
    expect(minAccumulator.evaluate([{ score: 1 }, { score: 2 }])).toBe(1);
  });
});

describe('MaxBasicAccumulator', () => {
  it('should have the operator "max"', () => {
    const maxAccumulator = new MaxBasicAccumulator({ field: 'score' });
    expect(maxAccumulator.operator).toBe('max');
  });

  it('should return the maximum value of "score" elements in an array', () => {
    const maxAccumulator = new MaxBasicAccumulator({ field: 'score' });
    expect(maxAccumulator.evaluate([{ score: 1 }, { score: 2 }])).toBe(2);
  });
});

describe('CountBasicAccumulator', () => {
  it('should have the operator "count"', () => {
    const countAccumulator = new CountBasicAccumulator({ field: 'present' });
    expect(countAccumulator.operator).toBe('count');
  });

  it('should return the count of elements with a "present" property set to true in an array', () => {
    const countAccumulator = new CountBasicAccumulator({ field: 'present' });
    expect(
      countAccumulator.evaluate([{ present: true }, { present: false }]),
    ).toBe(1);
  });
});
