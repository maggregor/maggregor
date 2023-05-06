import { GroupStage, LimitStage, MatchStage } from '@core/pipeline/stages';

const sampleData = [
  { genre: 'action', score: 10 },
  { genre: 'action', score: 20 },
  { genre: 'action', score: 30 },
  { genre: 'drama', score: 40 },
  { genre: 'drama', score: 50 },
  { genre: 'drama', score: 60 },
];

describe('GroupStage', () => {
  it('should group data by genre', () => {
    const groupStage = new GroupStage({
      groupExpr: { field: 'genre' },
      accumulators: [],
    });
    const result = groupStage.execute(sampleData);
    expect(result).toEqual([{ _id: 'action' }, { _id: 'drama' }]);
  });
});

describe('LimitStage', () => {
  it('should limit data to two items', () => {
    const limitStage = new LimitStage({ limit: 2 });
    const result = limitStage.execute(sampleData);
    expect(result).toEqual(sampleData.slice(0, 2));
  });
});

describe('MatchStage', () => {
  it("should filter data by genre 'action'", async () => {
    const matchStage = new MatchStage({
      conditions: [
        { operator: 'eq', value: [{ field: 'genre' }, { value: 'action' }] },
      ],
    });
    const result = matchStage.execute(sampleData);
    expect(result).toEqual([
      { genre: 'action', score: 10 },
      { genre: 'action', score: 20 },
      { genre: 'action', score: 30 },
    ]);
  });
});
