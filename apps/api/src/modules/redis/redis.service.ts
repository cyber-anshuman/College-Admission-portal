import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
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
  private readonly memoryStore = new Map<string, { value: string; expiresAt: number }>();

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
        const delay = Math.min(times * 200, 5000);
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
        // Log quietly once, avoiding console flooding
      });
    }

    const targetDesc = redisUrl ? 'via REDIS_URL' : `at ${host}:${port}`;
    this.client
      .connect()
      .then(() => {
        this.logger.log(`Redis connected successfully ${targetDesc}`);
      })
      .catch((err) => {
        this.logger.warn(`Redis connection unavailable (${err.message}). Using in-memory fallback cache.`);
      });
  }

  async onModuleDestroy() {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }

  getClient(): Redis {
    return this.client;
  }

  isReady(): boolean {
    return Boolean(this.client && this.client.status === 'ready');
  }

  ensureReady(): void {
    // Graceful in-memory fallback enabled
  }

  async setWithExpiry(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (this.isReady()) {
      try {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      } catch (err: any) {
        this.logger.warn(`Redis set failed for key ${key}: ${err.message}. Using in-memory cache.`);
      }
    }
    this.memoryStore.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async get(key: string): Promise<string | null> {
    if (this.isReady()) {
      try {
        return await this.client.get(key);
      } catch (err: any) {
        this.logger.warn(`Redis get failed for key ${key}: ${err.message}. Using in-memory cache.`);
      }
    }
    const item = this.memoryStore.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.memoryStore.delete(key);
      return null;
    }
    return item.value;
  }

  async del(key: string): Promise<void> {
    if (this.isReady()) {
      try {
        await this.client.del(key);
      } catch (err: any) {
        this.logger.warn(`Redis del failed for key ${key}: ${err.message}.`);
      }
    }
    this.memoryStore.delete(key);
  }

  async incrWithExpiry(key: string, ttlSeconds: number): Promise<number> {
    if (this.isReady()) {
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
        this.logger.warn(`Redis incrWithExpiry failed for key ${key}: ${err.message}. Using in-memory cache.`);
      }
    }
    const now = Date.now();
    const item = this.memoryStore.get(key);
    let val = 1;
    if (item && now <= item.expiresAt) {
      val = (parseInt(item.value, 10) || 0) + 1;
    }
    this.memoryStore.set(key, { value: String(val), expiresAt: now + ttlSeconds * 1000 });
    return val;
  }

  async rotateSession(
    key: string,
    incomingHash: string,
    newHash: string,
    graceMs: number,
    ttlSeconds: number,
  ): Promise<RotateSessionResult> {
    if (this.isReady()) {
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
        this.logger.warn(`Redis rotateSession failed for key ${key}: ${err.message}. Using in-memory cache.`);
      }
    }
    const now = Date.now();
    const raw = await this.get(key);
    if (!raw) return { status: 'NOT_FOUND' };
    try {
      const session = JSON.parse(raw);
      if (session.currentHash === incomingHash) {
        session.previousHash = session.currentHash;
        session.previousHashExpiresAt = now + graceMs;
        session.currentHash = newHash;
        await this.setWithExpiry(key, JSON.stringify(session), ttlSeconds);
        return { status: 'ROTATED' };
      } else if (session.previousHash && session.previousHash === incomingHash) {
        const expiresAt = Number(session.previousHashExpiresAt || 0);
        if (now <= expiresAt) {
          return { status: 'GRACE_ACCEPTED', currentHash: session.currentHash };
        } else {
          await this.del(key);
          return { status: 'REUSE_REVOKED' };
        }
      } else {
        await this.del(key);
        return { status: 'MISMATCH_REVOKED' };
      }
    } catch {
      return { status: 'NOT_FOUND' };
    }
  }
}
