export type ExpectedSpeedPercentage = {
  [nbOfDocs: number]: number;
};

// Used when Maggregor doesn't improve the speed
// We can't expect 100% speed because of the overhead of Maggregor
export const SAME_AS_MONGODB = 0.9; // 90% of MongoDB speed is acceptable

export const INCACHE_EXPECTED_SPEED: ExpectedSpeedPercentage = {
  0: SAME_AS_MONGODB,
  10: SAME_AS_MONGODB,
  100: SAME_AS_MONGODB,
  1000: 1.5,
  10000: 3,
  100000: 10,
  1000000: 20,
};
