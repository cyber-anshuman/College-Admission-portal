import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { HealthController } from './health.controller';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';

describe('HealthController', () => {
  let controller: HealthController;
  let mockPrisma: any;
  let mockRedisService: any;
  let mockResponse: any;

  beforeEach(async () => {
    mockPrisma = {
      $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    };

    mockRedisService = {
      getClient: jest.fn().mockReturnValue({ status: 'ready' }),
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: PrismaService, useValue: mockPrisma },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  describe('getLiveness', () => {
    it('should always return status "up" with 200', () => {
      const result = controller.getLiveness();
      expect(result).toEqual({ status: 'up' });
    });
  });

  describe('getReadiness', () => {
    it('should return status "up" when both database and Redis are operational', async () => {
      const result = await controller.getReadiness(mockResponse);
      expect(result).toEqual({
        status: 'up',
        services: {
          database: 'up',
          redis: 'up',
        },
      });
      expect(mockResponse.status).not.toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it('should return status "down" with 503 when database is unreachable', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('Connection refused'));

      const result = await controller.getReadiness(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(result).toEqual({
        status: 'down',
        services: {
          database: 'down',
          redis: 'up',
        },
      });
    });

    it('should return status "down" with 503 when Redis status is not "ready"', async () => {
      mockRedisService.getClient.mockReturnValueOnce({ status: 'connecting' });

      const result = await controller.getReadiness(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(result).toEqual({
        status: 'down',
        services: {
          database: 'up',
          redis: 'down',
        },
      });
    });

    it('should return status "down" with 503 when both database and Redis fail', async () => {
      mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('DB unreachable'));
      mockRedisService.getClient.mockReturnValueOnce(null);

      const result = await controller.getReadiness(mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
      expect(result).toEqual({
        status: 'down',
        services: {
          database: 'down',
          redis: 'down',
        },
      });
    });
  });

  describe('check (delegates to getReadiness)', () => {
    it('should delegate to getReadiness', async () => {
      const result = await controller.check(mockResponse);
      expect(result).toEqual({
        status: 'up',
        services: {
          database: 'up',
          redis: 'up',
        },
      });
    });
  });
});
