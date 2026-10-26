import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
const cookieParser = require('cookie-parser');
import { AppModule } from '../src/app.module';

describe('Auth & Security Endpoints (e2e)', () => {
  let app: INestApplication;
  jest.setTimeout(30000);

  beforeAll(async () => {
    process.env.JWT_SECRET = 'valid_test_secret_for_e2e_testing_32_characters_long_1';
    process.env.JWT_REFRESH_SECRET = 'valid_refresh_secret_for_e2e_testing_32_characters_long_2';
    process.env.TRUST_PROXY = '1';
    process.env.OTP_PROVIDER = 'log';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Configure matching main.ts setup
    (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
    const server = app.getHttpServer();
    if (server && typeof server.setMaxListeners === 'function') {
      server.setMaxListeners(50);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Probes', () => {
    it('/api/health/live should respond 200 without requiring JWT authentication', async () => {
      const res = await request(app.getHttpServer()).get('/api/health/live');
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toMatchObject({ status: 'up' });
    });

    it('/api/health/ready should respond without token and leak no internal error strings', async () => {
      const res = await request(app.getHttpServer()).get('/api/health/ready');
      expect([200, 503]).toContain(res.status);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('status');
      expect(data).toHaveProperty('services');
      expect(['up', 'down']).toContain(data.status);
      expect(['up', 'down']).toContain(data.services.database);
      expect(['up', 'down']).toContain(data.services.redis);
    });

    it('/api/health should respond without token', async () => {
      const res = await request(app.getHttpServer()).get('/api/health');
      expect([200, 503]).toContain(res.status);
      const data = res.body.data || res.body;
      expect(['up', 'down']).toContain(data.status);
    });
  });

  describe('Route-Scoped Throttling', () => {
    it('should allow 40 requests to GET /api/programs from one IP without hitting login throttlers', async () => {
      for (let i = 0; i < 40; i++) {
        const res = await request(app.getHttpServer())
          .get('/api/programs')
          .set('X-Forwarded-For', '10.0.0.1');
        expect(res.status).not.toBe(429);
      }
    });

    it('should enforce 5 req/min limit on POST /api/auth/otp/send and return 429 on 6th', async () => {
      const clientIp = '192.168.1.100';
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/otp/send')
          .set('X-Forwarded-For', clientIp)
          .send({ identifier: `user_${i}@example.com` });
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/otp/send')
        .set('X-Forwarded-For', clientIp)
        .send({ identifier: 'user_sixth@example.com' });

      expect(res.status).toBe(429);
    });

    it('should enforce 5 req/min limit on POST /api/auth/otp/verify and return 429 on 6th', async () => {
      const clientIp = '192.168.1.101';
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/otp/verify')
          .set('X-Forwarded-For', clientIp)
          .send({ identifier: `user_v_${i}@example.com`, otp: '123456' });
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/otp/verify')
        .set('X-Forwarded-For', clientIp)
        .send({ identifier: 'user_v_sixth@example.com', otp: '123456' });

      expect(res.status).toBe(429);
    });

    it('should enforce 5 req/min limit on POST /api/auth/register and return 429 on 6th', async () => {
      const clientIp = '192.168.1.102';
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .set('X-Forwarded-For', clientIp)
          .send({
            email: `throttle_reg_${i}@example.com`,
            phone: `+91987654320${i}`,
            firstName: 'Throttled',
            lastName: 'User',
            category: 'GENERAL',
            dpdpConsent: true,
            password: 'SecurePassword123',
          });
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .set('X-Forwarded-For', clientIp)
        .send({
          email: 'throttle_reg_6@example.com',
          phone: '+919876543299',
          firstName: 'Throttled',
          lastName: 'User',
          category: 'GENERAL',
          dpdpConsent: true,
          password: 'SecurePassword123',
        });

      expect(res.status).toBe(429);
    });
  });

  describe('Forwarded-IP Anti-Spoofing', () => {
    it('should place spoofed client IPs from the same upstream proxy into the same bucket', async () => {
      const realClient = '203.0.113.50';

      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/otp/send')
          .set('X-Forwarded-For', `10.${i}.0.1, ${realClient}`)
          .send({ identifier: `spoof_${i}@example.com` });
      }

      const res = await request(app.getHttpServer())
        .post('/api/auth/otp/send')
        .set('X-Forwarded-For', `8.8.8.8, ${realClient}`)
        .send({ identifier: 'spoof_6@example.com' });

      expect(res.status).toBe(429);
    });

    it('should grant separate buckets to two distinct trusted client IPs', async () => {
      const clientA = '198.51.100.10';
      const clientB = '198.51.100.20';

      const resA = await request(app.getHttpServer())
        .post('/api/auth/otp/send')
        .set('X-Forwarded-For', clientA)
        .send({ identifier: 'client_a@example.com' });

      const resB = await request(app.getHttpServer())
        .post('/api/auth/otp/send')
        .set('X-Forwarded-For', clientB)
        .send({ identifier: 'client_b@example.com' });

      expect(resA.status).not.toBe(429);
      expect(resB.status).not.toBe(429);
    });
  });

  describe('Response Body Token Cleansing & Cookie Handling', () => {
    it('login response body must NOT include refreshToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'applicant.rahul@example.com', password: 'Applicant@123' });

      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.tokens).toHaveProperty('accessToken');
      expect(data).toHaveProperty('user');
      expect(data.tokens.refreshToken).toBeUndefined();
      expect(data.refreshToken).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('refreshToken');

      // Verify cookie is set
      const rawCookies = res.headers['set-cookie'];
      expect(rawCookies).toBeDefined();
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies as string];
      const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();
      expect(refreshCookie).toContain('HttpOnly');
    });

    it('register response body must NOT include refreshToken', async () => {
      const uniqueSuffix = Date.now();
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: `new_applicant_${uniqueSuffix}@example.com`,
          phone: `+9198${String(uniqueSuffix).slice(-8)}`,
          firstName: 'New',
          lastName: 'Applicant',
          category: 'GENERAL',
          dpdpConsent: true,
          password: 'SecurePass@123',
        });

      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.tokens).toHaveProperty('accessToken');
      expect(data.tokens.refreshToken).toBeUndefined();
      expect(data.refreshToken).toBeUndefined();
      expect(JSON.stringify(res.body)).not.toContain('refreshToken');
    });

    it('POST /api/auth/refresh without cookie should return 401 and Set-Cookie clearing refreshToken', async () => {
      const res = await request(app.getHttpServer()).post('/api/auth/refresh');

      expect(res.status).toBe(401);
      const rawCookies = res.headers['set-cookie'];
      expect(rawCookies).toBeDefined();
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies as string];
      const clearCookieHeader = cookies.find((c: string) => c && c.startsWith('refreshToken='));
      expect(clearCookieHeader).toBeDefined();
      expect(clearCookieHeader).toMatch(/Expires=Thu, 01 Jan 1970/);
    });
  });

  describe('Lua Concurrency Test & Multi-Session Isolation', () => {
    it('10 concurrent refresh requests should all succeed within the grace window', async () => {
      // 1. Log in to get refresh cookie
      const loginRes = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'applicant.rahul@example.com', password: 'Applicant@123' });

      expect(loginRes.status).toBe(200);
      const rawCookies = loginRes.headers['set-cookie'];
      const cookies = Array.isArray(rawCookies) ? rawCookies : [rawCookies as string];
      const refreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
      expect(refreshCookie).toBeDefined();

      const cookieVal = refreshCookie.split(';')[0];

      // 2. Fire 10 parallel refresh requests simultaneously with the same cookie
      const refreshPromises = Array.from({ length: 10 }).map(() =>
        request(app.getHttpServer())
          .post('/api/auth/refresh')
          .set('Cookie', [cookieVal]),
      );

      const results = await Promise.all(refreshPromises);

      // 3. All 10 must succeed (200 OK) with valid access tokens
      for (const res of results) {
        expect(res.status).toBe(200);
        const data = res.body.data || res.body;
        expect(data).toHaveProperty('accessToken');
        expect(data.refreshToken).toBeUndefined();
      }
    });

    it('logout must revoke only its own session and preserve other active sessions', async () => {
      // 1. Create Session 1
      const login1 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'applicant.rahul@example.com', password: 'Applicant@123' });
      const cookies1 = Array.isArray(login1.headers['set-cookie'])
        ? login1.headers['set-cookie']
        : [login1.headers['set-cookie']];
      const cookieVal1 = cookies1.find((c: string) => c.startsWith('refreshToken=')).split(';')[0];

      // 2. Create Session 2 (e.g. from second device/browser)
      const login2 = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'applicant.rahul@example.com', password: 'Applicant@123' });
      const cookies2 = Array.isArray(login2.headers['set-cookie'])
        ? login2.headers['set-cookie']
        : [login2.headers['set-cookie']];
      const cookieVal2 = cookies2.find((c: string) => c.startsWith('refreshToken=')).split(';')[0];

      expect(cookieVal1).not.toEqual(cookieVal2);

      // 3. Logout Session 1
      const logoutRes = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', [cookieVal1]);
      expect(logoutRes.status).toBe(200);

      // 4. Session 1 refresh must now fail with 401
      const refresh1 = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', [cookieVal1]);
      expect(refresh1.status).toBe(401);

      // 5. Session 2 refresh must STILL succeed with 200
      const refresh2 = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', [cookieVal2]);
      expect(refresh2.status).toBe(200);
      const data2 = refresh2.body.data || refresh2.body;
      expect(data2).toHaveProperty('accessToken');
    });
  });
});
