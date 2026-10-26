import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

jest.mock('ioredis');

describe('RedisService Outage Recovery & Resilience', () => {
  let service: RedisService;
  let mockRedisInstance: any;

  beforeEach(async () => {
    mockRedisInstance = {
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
      status: 'ready',
      options: {},
    };

    (Redis as unknown as jest.Mock).mockImplementation((opts) => {
      mockRedisInstance.options = opts;
      return mockRedisInstance;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def?: any) => {
              if (key === 'REDIS_HOST') return 'localhost';
              if (key === 'REDIS_PORT') return 6379;
              return def;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
    jest.clearAllMocks();
  });

  describe('Reconnection Strategy (Indefinite Backoff)', () => {
    it('retryStrategy should retry indefinitely with capped backoff and NEVER return null', () => {
      const retryStrategy = mockRedisInstance.options.retryStrategy;
      expect(typeof retryStrategy).toBe('function');

      // Attempt 1: 200ms
      expect(retryStrategy(1)).toBe(200);
      // Attempt 5: 1000ms
      expect(retryStrategy(5)).toBe(1000);
      // Attempt 25: 5000ms (capped)
      expect(retryStrategy(25)).toBe(5000);
      // Attempt 100: still 5000ms, never null
      expect(retryStrategy(100)).toBe(5000);
      expect(retryStrategy(1000)).not.toBeNull();
    });
  });

  describe('Fail-Closed Readiness & Outage Recovery', () => {
    it('ensureReady should throw ServiceUnavailableException when status is not "ready"', () => {
      mockRedisInstance.status = 'connecting';
      expect(() => service.ensureReady()).toThrow(ServiceUnavailableException);

      mockRedisInstance.status = 'reconnecting';
      expect(() => service.ensureReady()).toThrow(ServiceUnavailableException);

      mockRedisInstance.status = 'end';
      expect(() => service.ensureReady()).toThrow(ServiceUnavailableException);
    });

    it('ensureReady should succeed once client recovers and status returns to "ready"', () => {
      // Simulate outage: disconnected
      mockRedisInstance.status = 'close';
      expect(() => service.ensureReady()).toThrow(ServiceUnavailableException);

      // Simulate recovery: back online without restarting the API
      mockRedisInstance.status = 'ready';
      expect(() => service.ensureReady()).not.toThrow();
    });
  });
});
