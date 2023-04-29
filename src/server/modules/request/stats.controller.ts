// stats.controller.ts
import { Controller, Get } from '@nestjs/common';
import { RequestService } from './request.service';

@Controller('requests/stats')
export class StatsController {
  constructor(private readonly requestService: RequestService) {}

  @Get('total')
  async count(): Promise<number> {
    return this.requestService.count();
  }
}
