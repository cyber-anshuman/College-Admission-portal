import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', '');

    this.client = new Redis({
      host,
      port,
      password: password || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 5) {
          this.logger.warn('Redis reconnection attempt limit exceeded');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    this.client.connect().then(() => {
      this.logger.log(`Redis connected successfully at ${host}:${port}`);
    }).catch((err) => {
      this.logger.warn(`Redis connection failed: ${err.message}. Fallback cache mode active.`);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    try {
      if (this.client && this.client.status === 'ready') {
        await this.client.set(key, value, 'EX', ttlSeconds);
      }
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key ${key}: ${err.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      if (this.client && this.client.status === 'ready') {
        return await this.client.get(key);
      }
      return null;
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key ${key}: ${err.message}`);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      if (this.client && this.client.status === 'ready') {
        await this.client.del(key);
      }
    } catch (err: any) {
      this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
    }
  }
}
