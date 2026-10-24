import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Health & Observability')
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check probe for database, cache, and API' })
  async check() {
    let dbStatus = 'healthy';
    let redisStatus = 'healthy';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e: any) {
      dbStatus = `unhealthy: ${e.message}`;
    }

    try {
      const client = this.redisService.getClient();
      if (!client || client.status !== 'ready') {
        redisStatus = 'disconnected';
      }
    } catch (e: any) {
      redisStatus = `unhealthy: ${e.message}`;
    }

    return {
      status: dbStatus === 'healthy' && redisStatus === 'healthy' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }
}
