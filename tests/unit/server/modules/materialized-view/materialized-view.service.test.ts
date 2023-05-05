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
    const mockPipeline = [] as any;
    spyEligbility.mockReturnValue(true);
    //
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    //
    service.register(MV_DEF);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(1);
    spyEligbility.mockReturnValue(false);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    expect(spyEligbility).toHaveBeenCalledTimes(2);
    //
    service.register({ ...MV_DEF, db: 'test2' });
    service.register({ ...MV_DEF, collection: 'test2' });
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(0);
    expect(spyEligbility).toHaveBeenCalledTimes(5);
    //
    spyEligbility.mockReturnValue(true);
    expect(await service.findEligibleMV(mockPipeline)).toHaveLength(3);
    expect(spyEligbility).toHaveBeenCalledTimes(8);
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
});
