import { parse } from "./group-pegjs.ts";

const result = parse(
  `{ $group: { _id: "$name", totalQuantity: { $sum: "$quantity" } } }`
);

console.log(result.filter(o => o !== null));
