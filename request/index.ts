import { parse } from "../parser/group-pegjs.ts";
import { Sum, Max, Min, Avg } from "../pipeline/index.ts";

const aggregations = [
  new Sum("score"),
  new Max("score"),
  new Min("score"),
  new Avg("score"),
];

const findAggregation = (
  field: string,
  aggregationType: string
): Sum | Max | Min | Avg | undefined => {
  return aggregations.find(
    (agg) => agg.getReference() === field && agg.type === aggregationType
  );
};

if (import.meta.main) {
  const parsed = parse(
    `{ $group: { _id: "$name", score: { $sum: "$score" } } }`
  );
  console.log(parsed);
  const aggregation = findAggregation(
    parsed.aggregation.field,
    parsed.aggregation.expression.type
  );
  if (aggregation) {
    console.log("Found");
  }
}
