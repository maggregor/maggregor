import { parseStages } from '@/parser';

describe('Pipeline', () => {
  it('should parse multiple stages', () => {
    const pipeline = [
      {
        $group: {
          _id: 'country',
        },
      },
      {
        $match: {
          _id: 'France',
        },
      },
    ];
    const actual = parseStages(pipeline);
    expect(actual).toBeDefined();
    expect(actual).toHaveLength(2);
    expect(actual[0].type).toEqual('group');
    expect(actual[1].type).toEqual('match');
  });
  it('convert pipeline array in string', () => {
    const pipeline = [
      {
        $group: {
          _id: 'country',
        },
      },
    ];
    const actual = parseStages(pipeline);
    expect(actual).toBeDefined();
    expect(actual).toHaveLength(1);
    expect(actual[0].type).toEqual('group');
  });
});
