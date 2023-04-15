"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const materialized_view_1 = require("../../../src/core/materialized-view");
const expressions_1 = require("../../../src/core/pipeline/expressions");
describe('MaterializedView', () => {
    it('should correctly calculate accumulators and group by expression', () => {
        const acc1 = {
            operator: 'sum',
            expression: { field: 'score' },
        };
        const acc2 = {
            operator: 'sum',
            expression: {
                operator: 'add',
                value: [{ field: 'score' }, { value: 10 }],
            },
        };
        const mv = new materialized_view_1.MaterializedView({
            groupBy: { field: 'genre' },
            accumulatorDefs: [acc1, acc2],
        });
        mv.addDocument({ genre: 'action', score: 10 });
        mv.addDocument({ genre: 'action', score: 20 });
        mv.addDocument({ genre: 'action', score: 30 });
        mv.addDocument({ genre: 'marvel', score: -100 });
        mv.addDocument({ genre: 'begaudeau', score: 999 });
        mv.addDocument({ genre: 'begaudeau', score: 999 });
        const accumulatorHashes = mv.getAccumulatorHashes();
        const fieldName1 = accumulatorHashes[0];
        const fieldName2 = accumulatorHashes[1];
        const groupByExprHash = (0, expressions_1.toHashExpression)(mv.getGroupExpression());
        expect(mv.getView()).toEqual([
            {
                [groupByExprHash]: 'action',
                [fieldName1]: 60,
                [fieldName2]: 90,
            },
            {
                [groupByExprHash]: 'marvel',
                [fieldName1]: -100,
                [fieldName2]: -90,
            },
            {
                [groupByExprHash]: 'begaudeau',
                [fieldName1]: 1998,
                [fieldName2]: 2018,
            },
        ]);
    });
});
//# sourceMappingURL=materialized-view.js.map