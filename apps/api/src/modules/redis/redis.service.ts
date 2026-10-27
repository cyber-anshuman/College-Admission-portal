import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface RotateSessionResult {
  status: 'ROTATED' | 'GRACE_ACCEPTED' | 'NOT_FOUND' | 'REUSE_REVOKED' | 'MISMATCH_REVOKED';
  currentHash?: string;
}

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const redisUrl = this.configService.get<string>('REDIS_URL');
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD', '');
    const enableTls = this.configService.get<string>('REDIS_TLS') === 'true';

    const commonOptions = {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        // Retry forever with capped backoff, NEVER return null
        const delay = Math.min(times * 200, 5000);
        this.logger.warn(`Redis disconnected. Reconnecting in ${delay}ms (attempt ${times})...`);
        return delay;
      },
    };

    if (redisUrl) {
      this.client = new Redis(redisUrl, {
        ...commonOptions,
        ...(enableTls || redisUrl.startsWith('rediss://') ? { tls: {} } : {}),
      });
    } else {
      this.client = new Redis({
        host,
        port,
        password: password || undefined,
        ...(enableTls ? { tls: {} } : {}),
        ...commonOptions,
      });
    }

    if (typeof this.client?.on === 'function') {
      this.client.on('error', (err) => {
        this.logger.warn(`Redis client error: ${err.message}`);
      });
    }

    const targetDesc = redisUrl ? 'via REDIS_URL' : `at ${host}:${port}`;
    this.client
      .connect()
      .then(() => {
        this.logger.log(`Redis connected successfully ${targetDesc}`);
      })
      .catch((err) => {
        this.logger.warn(`Redis initial connection failed: ${err.message}. Reconnection active.`);
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

  ensureReady(): void {
    if (!this.client || this.client.status !== 'ready') {
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }

  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.ensureReady();
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch (err: any) {
      this.logger.error(`Redis set failed for key ${key}: ${err.message}`);
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }

  async get(key: string): Promise<string | null> {
    this.ensureReady();
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.error(`Redis get failed for key ${key}: ${err.message}`);
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }

  async del(key: string): Promise<void> {
    this.ensureReady();
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.error(`Redis del failed for key ${key}: ${err.message}`);
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }

  async incrWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    this.ensureReady();
    const lua = `
      local val = redis.call('INCR', KEYS[1])
      if val == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return val
    `;
    try {
      const res = await this.client.eval(lua, 1, key, ttlSeconds);
      return Number(res);
    } catch (err: any) {
      this.logger.error(`Redis incrWithExpiry failed for key ${key}: ${err.message}`);
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }

  async rotateSession(
    key: string,
    incomingHash: string,
    newHash: string,
    graceMs: number,
    ttlSeconds: number,
  ): Promise<RotateSessionResult> {
    this.ensureReady();
    const lua = `
      local timeTable = redis.call('TIME')
      local nowMs = tonumber(timeTable[1]) * 1000 + math.floor(tonumber(timeTable[2]) / 1000)

      local data = redis.call('GET', KEYS[1])
      if not data then
        return cjson.encode({ status = 'NOT_FOUND' })
      end

      local session = cjson.decode(data)
      local incomingHash = ARGV[1]
      local newHash = ARGV[2]
      local graceMs = tonumber(ARGV[3])
      local ttlSec = tonumber(ARGV[4])

      if session.currentHash == incomingHash then
        session.previousHash = session.currentHash
        session.previousHashExpiresAt = nowMs + graceMs
        session.currentHash = newHash
        redis.call('SET', KEYS[1], cjson.encode(session), 'EX', ttlSec)
        return cjson.encode({ status = 'ROTATED' })
      elseif session.previousHash and session.previousHash == incomingHash then
        local expiresAt = tonumber(session.previousHashExpiresAt or 0)
        if nowMs <= expiresAt then
          return cjson.encode({ status = 'GRACE_ACCEPTED', currentHash = session.currentHash })
        else
          redis.call('DEL', KEYS[1])
          return cjson.encode({ status = 'REUSE_REVOKED' })
        end
      else
        redis.call('DEL', KEYS[1])
        return cjson.encode({ status = 'MISMATCH_REVOKED' })
      end
    `;
    try {
      const result = await this.client.eval(lua, 1, key, incomingHash, newHash, graceMs, ttlSeconds);
      return JSON.parse(result as string) as RotateSessionResult;
    } catch (err: any) {
      this.logger.error(`Redis rotateSession failed for key ${key}: ${err.message}`);
      throw new ServiceUnavailableException('Cache service unavailable');
    }
  }
}
