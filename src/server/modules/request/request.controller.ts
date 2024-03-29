import { Controller, Delete, Get, Param } from '@nestjs/common';
import { RequestService } from './request.service';
import { Request } from './request.schema';

/**
 * Controller for the request module.
 * Used by the e2e tests to clean the database.
 * Requests are internally created by the request service when a new request is received.
 *
 * @category Controllers
 * @class RequestController
 * @param requestService the request service
 * @method create register a new incoming request
 * @method findAll get all requests
 * @method findOneByRequestId get a request by its requestID
 * @method deleteAll delete all requests
 * @method updateOne update a request
 * @method deleteByRequestID delete a request by its requestID
 * @returns the request controller
 * @since 1.0.0
 */
@Controller('requests')
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  /**
   * Get all requests
   * @returns all requests
   */
  @Get()
  async findAll(): Promise<Request[]> {
    return this.requestService.findAll();
  }

  /**
   * Get a request by its id
   * @param requestID the id of the request to get
   * @returns the request with the given id
   */
  @Get(':id')
  async findOneByRequestId(@Param('id') id: string): Promise<Request> {
    return this.requestService.findOne(id);
  }

  /**
   * Delete all requests
   * @returns the number of deleted requests
   */
  @Delete()
  async deleteAll(): Promise<{ deletedCount: number }> {
    return this.requestService.deleteAll();
  }

  /**
   * Delete a request by its unique id
   * @param id the id of the request to delete
   * @returns the deleted request
   */
  @Delete(':id')
  async deleteById(@Param('id') id: string): Promise<Request> {
    return this.requestService.deleteById(id);
  }
}
