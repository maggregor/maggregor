import {
  AvgBasicAccumulator,
  AvgCachedAccumulator,
  SumBasicAccumulator,
  SumCachedAccumulator,
  MinBasicAccumulator,
  MinCachedAccumulator,
  MaxBasicAccumulator,
  MaxCachedAccumulator,
  CountBasicAccumulator,
  CountCachedAccumulator,
} from '@core/pipeline/accumulators';

describe('Cached accumulators equals basic accumulators', () => {
  it('should be equal', () => {
    assert(
      new AvgBasicAccumulator({ expression: { field: 'score' } }).equals(
        new AvgCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
    assert(
      new SumBasicAccumulator({ expression: { field: 'score' } }).equals(
        new SumCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
    assert(
      new MinBasicAccumulator({ expression: { field: 'score' } }).equals(
        new MinCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
    assert(
      new MaxBasicAccumulator({ expression: { field: 'score' } }).equals(
        new MaxCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
    assert(
      new CountBasicAccumulator({ expression: { field: 'score' } }).equals(
        new CountCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
  });
});

describe('Cached accumulators do not equal basic accumulators', () => {
  it('should not be equal', () => {
    assert(
      !new AvgBasicAccumulator({ expression: { field: 'score' } }).equals(
        new AvgCachedAccumulator({ expression: { field: 'score2' } }),
      ),
    );
    assert(
      !new SumBasicAccumulator({ expression: { field: 'score' } }).equals(
        new SumCachedAccumulator({ expression: { field: 'score2' } }),
      ),
    );
    assert(
      !new MinBasicAccumulator({ expression: { field: 'score' } }).equals(
        new MinCachedAccumulator({ expression: { field: 'score3' } }),
      ),
    );
    assert(
      !new MaxBasicAccumulator({ expression: { field: 'score4' } }).equals(
        new MaxCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
    assert(
      !new CountBasicAccumulator({ expression: { field: 'score1' } }).equals(
        new CountCachedAccumulator({ expression: { field: 'score' } }),
      ),
    );
  });
});

describe('Cached accumulators same hash as basic accumulators', () => {
  it('should be equal', () => {
    expect(
      new AvgBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).toBe(new AvgCachedAccumulator({ expression: { field: 'score' } }).hash);
    expect(
      new SumBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).toBe(new SumCachedAccumulator({ expression: { field: 'score' } }).hash);
    expect(
      new MinBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).toBe(new MinCachedAccumulator({ expression: { field: 'score' } }).hash);
    expect(
      new MaxBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).toBe(new MaxCachedAccumulator({ expression: { field: 'score' } }).hash);
    expect(
      new CountBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).toBe(new CountCachedAccumulator({ expression: { field: 'score' } }).hash);
  });
});

describe('Cached accumulators different hash as basic accumulators', () => {
  it('should not be equal', () => {
    expect(
      new AvgBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).not.toBe(
      new AvgCachedAccumulator({ expression: { field: 'score2' } }).hash,
    );
    expect(
      new SumBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).not.toBe(
      new SumCachedAccumulator({ expression: { field: 'score2' } }).hash,
    );
    expect(
      new MinBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).not.toBe(
      new MinCachedAccumulator({ expression: { field: 'score2' } }).hash,
    );
    expect(
      new MaxBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).not.toBe(
      new MaxCachedAccumulator({ expression: { field: 'score2' } }).hash,
    );
    expect(
      new CountBasicAccumulator({ expression: { field: 'score' } }).hash,
    ).not.toBe(
      new CountCachedAccumulator({ expression: { field: 'score2' } }).hash,
    );
  });
});
