import { MaterializedViewService } from '@/server/modules/materialized-view/materialized-view.service';
import { createMaterializedViewService } from '../../utils';
import * as eligibility from '@/core/eligibility';
import * as pipelineModule from '@/core/pipeline/pipeline';
import {
  MaterializedView,
  MaterializedViewDefinition,
} from '@/core/materialized-view';
import { Pipeline } from '@/core/pipeline/pipeline';
import { IRequest } from '@/server/modules/request/request.interface';
import { Expression } from 'mongoose';

const MV_DEF: MaterializedViewDefinition = {
  db: 'test',
  collection: 'test',
  groupBy: { field: 'country' },
  accumulatorDefs: [],
};

describe('MaterializedViewService', () => {
  let service: MaterializedViewService;

  beforeEach(async () => {
    service = await createMaterializedViewService();
  });

  test('findEligibleMV', async () => {
    const spyEligbility = vitest.spyOn(eligibility, 'isEligible');
    vitest
      .spyOn(service, 'loadMaterializedView')
      .mockImplementation(() => null);
    const mockPipeline = [] as any;
    spyEligbility.mockReturnValue(true);
    //
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    //
    await service.register(MV_DEF);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(1);
    spyEligbility.mockReturnValue(false);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    expect(spyEligbility).toHaveBeenCalledTimes(2);
    //
    await service.register({ ...MV_DEF, db: 'test2' });
    await service.register({ ...MV_DEF, collection: 'test2' });
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    expect(spyEligbility).toHaveBeenCalledTimes(5);
    //
    spyEligbility.mockReturnValue(true);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(3);
    expect(spyEligbility).toHaveBeenCalledTimes(8);
    // Ensure when an error is thrown, the MV is not considered eligible
    await service.register({ ...MV_DEF, db: 'test3' });
    vitest.spyOn(service, 'loadMaterializedView').mockImplementation(() => {
      throw new Error();
    });
    await service.register({ ...MV_DEF, db: 'test4' });
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(4);
  });

  test('canExecute', async () => {
    const findEligibleMVMock = vitest
      .spyOn(service, 'findEligibleMV')
      .mockResolvedValue([{} as MaterializedView]);
    const pipelineMock = {} as Pipeline;
    const createPipelineFromRequestMock = vitest
      .spyOn(service, 'createPipelineFromRequest')
      .mockResolvedValue(pipelineMock);
    const request: IRequest = {
      type: 'aggregate',
      pipeline: [],
    } as any;

    const result = await service.canExecute(request);

    expect(createPipelineFromRequestMock).toHaveBeenCalledWith(request);
    expect(findEligibleMVMock).toHaveBeenCalledWith(pipelineMock);
    expect(result).toBe(true);

    findEligibleMVMock.mockResolvedValue([]);

    const result2 = await service.canExecute(request);

    expect(result2).toBe(false);
  });

  test('execute', async () => {
    const findEligibleMVMock = vitest
      .spyOn(service, 'findEligibleMV')
      .mockResolvedValue([
        {
          getView: () => [{ country: 'France' } as any],
        } as MaterializedView,
      ]);
    const pipelineMock = {
      // Add any necessary mock implementation for the Pipeline class here
    } as unknown as Pipeline;
    const createPipelineFromRequestMock = vitest
      .spyOn(service, 'createPipelineFromRequest')
      .mockResolvedValue(pipelineMock);
    const request: IRequest = {
      type: 'aggregate',
      pipeline: [],
    } as any;
    const expectedResult = { someData: 'test' };

    vitest
      .spyOn(pipelineModule, 'executePipeline')
      .mockResolvedValue(expectedResult as any);

    const result = await service.execute(request);

    expect(createPipelineFromRequestMock).toHaveBeenCalledWith(request);
    expect(findEligibleMVMock).toHaveBeenCalledWith(pipelineMock);
    expect(result).toEqual(expectedResult);
  });

  test('createMaterializedView', async () => {
    const mv = await service.createMaterializedView(MV_DEF);
    expect(mv).toBeInstanceOf(MaterializedView);
    expect(mv.db).toBe(MV_DEF.db);
    expect(mv.collection).toBe(MV_DEF.collection);
  });
  test('createPipelineFromRequest', async () => {
    // Test with empty pipeline
    expect(
      await service.createPipelineFromRequest({
        type: 'aggregate',
        pipeline: [],
      } as any),
    ).toBe(null);

    const request: IRequest = {
      type: 'aggregate',
      pipeline: [{ $match: { country: 'France' } }],
    } as any;

    const pipeline = await service.createPipelineFromRequest(request);
    expect(pipeline.stages.length).toBe(1);

    expect(
      await service.createPipelineFromRequest([{ wrong: {} }] as any),
    ).toBe(null);
  });

  describe('buildMongoAggregatePipeline', async () => {
    it('should return a pipeline - 1', async () => {
      const mv = new MaterializedView(MV_DEF);
      const pipeline = mv.buildAsMongoAggregatePipeline();
      expect(pipeline).toEqual([{ $group: { _id: '$country' } }]);
    });
    it('should return a pipeline - 2', async () => {
      const mv = new MaterializedView({
        db: 'test',
        collection: 'test',
        groupBy: { field: 'country' },
        accumulatorDefs: [
          {
            operator: 'sum',
            outputFieldName: 'mySum',
            expression: { field: 'age' },
          },
        ],
      });
      const pipeline = mv.buildAsMongoAggregatePipeline();
      expect(pipeline).toEqual([
        {
          $group: {
            _id: '$country',

            mySum: {
              $sum: '$age',
            },
          },
        },
      ]);
    });
    describe('buildExpression', () => {
      test('should build with a field reference', () => {
        const mv = new MaterializedView(MV_DEF);
        const e: Expression = { field: 'age' };
        expect(mv.buildAsMongoExpression(e)).toBe('$age');
      });
      test('should build with a add and multiply functions and two field references', () => {
        const mv = new MaterializedView(MV_DEF);
        const e: Expression = {
          operator: 'add',
          value: [{ field: 'age' }, { field: 'income' }],
        };
        expect(mv.buildAsMongoExpression(e)).toEqual({
          $add: ['$age', '$income'],
        });
        const e2: Expression = {
          operator: 'multiply',
          value: {
            operator: 'add',
            value: [{ field: 'age' }, { field: 'income' }],
          },
        };
        expect(mv.buildAsMongoExpression(e2)).toEqual({
          $multiply: [{ $add: ['$age', '$income'] }],
        });
      });
      test('should return undefined if the expression is not correct', () => {
        const mv = new MaterializedView(MV_DEF);
        expect(mv.buildAsMongoExpression({} as any)).toBeUndefined();
      });
      test('should return a add expression with a field reference and a value', () => {
        const mv = new MaterializedView(MV_DEF);
        expect(
          mv.buildAsMongoExpression({
            operator: 'add',
            value: [
              {
                field: 'age',
              },
              { value: 1 },
            ],
          }),
        ).toEqual({
          $add: ['$age', 1],
        });
      });
    });
  });
});
