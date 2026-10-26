import { Controller, Get, Res, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health & Observability')
@SkipThrottle()
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  @Public()
  @Get('live')
  @ApiOperation({ summary: 'Liveness probe (always returns 200 if process is running)' })
  getLiveness() {
    return { status: 'up' };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (checks database and Redis connectivity)' })
  async getReadiness(@Res({ passthrough: true }) res: Response) {
    let dbUp = false;
    let redisUp = false;

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbUp = true;
    } catch (e: any) {
      this.logger.error(`Database readiness check failed: ${e.message}`, e.stack);
    }

    try {
      const client = this.redisService.getClient();
      if (client && client.status === 'ready') {
        redisUp = true;
      } else {
        this.logger.error(`Redis readiness check failed: status is ${client ? client.status : 'null'}`);
      }
    } catch (e: any) {
      this.logger.error(`Redis readiness check failed: ${e.message}`, e.stack);
    }

    const isReady = dbUp && redisUp;
    if (!isReady) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return {
        status: 'down',
        services: {
          database: dbUp ? 'up' : 'down',
          redis: redisUp ? 'up' : 'down',
        },
      };
    }

    return {
      status: 'up',
      services: {
        database: 'up',
        redis: 'up',
      },
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Overall health check (delegates to readiness)' })
  async check(@Res({ passthrough: true }) res: Response) {
    return this.getReadiness(res);
  }
}

