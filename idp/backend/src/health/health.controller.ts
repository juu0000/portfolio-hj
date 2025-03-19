import { Controller, Get } from '@nestjs/common';
import { HealthCheck } from '@nestjs/terminus';
import { HealthService } from './health.service';
import { timestamp } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  healthCheck(){
    return {
      status: 'ok',
      timestamp: new Date().toISOString()
    };
  }

}
