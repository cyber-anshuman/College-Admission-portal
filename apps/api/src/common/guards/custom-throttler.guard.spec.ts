import { ExecutionContext } from '@nestjs/common';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import * as crypto from 'crypto';

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;

  beforeEach(() => {
    // Instantiate guard with minimal mock dependencies
    const mockOptions = { throttlers: [] };
    const mockStorage = { increment: jest.fn() };
    const mockReflector = { get: jest.fn(), getAllAndOverride: jest.fn() };
    guard = new CustomThrottlerGuard(mockOptions as any, mockStorage as any, mockReflector as any);
  });

  describe('handleRequest route-scoping', () => {
    it('should skip login_ip throttler on non-login routes (e.g. GET /programs)', async () => {
      const mockReq = { method: 'GET', path: '/api/programs' };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.handleRequest({
        context: mockContext,
        limit: 30,
        ttl: 60000,
        throttler: { name: 'login_ip', limit: 30, ttl: 60000 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      } as any);

      expect(result).toBe(true);
    });

    it('should skip login_ip_email throttler on non-login routes (e.g. POST /auth/otp/send)', async () => {
      const mockReq = { method: 'POST', path: '/api/auth/otp/send' };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      const result = await guard.handleRequest({
        context: mockContext,
        limit: 5,
        ttl: 60000,
        throttler: { name: 'login_ip_email', limit: 5, ttl: 60000 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      } as any);

      expect(result).toBe(true);
    });
  });

  describe('getTracker', () => {
    it('should return req.ips[0] when req.ips is populated by reverse proxy', async () => {
      const req = { ips: ['203.0.113.195', '10.0.0.1'], ip: '10.0.0.1' };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('203.0.113.195');
    });

    it('should fallback to req.ip when req.ips is empty or missing', async () => {
      const req = { ips: [], ip: '192.168.1.50' };
      const tracker = await (guard as any).getTracker(req);
      expect(tracker).toBe('192.168.1.50');
    });
  });

  describe('generateKey SHA-256 Hashing & Character Capping', () => {
    it('should hash IP + email with SHA-256 and cap email at 254 chars for login_ip_email', () => {
      const superGenerateKeySpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'generateKey')
        .mockReturnValue('generated_key');

      const clientIp = '198.51.100.5';
      const hugeEmail = 'a'.repeat(300) + '@example.com';
      const cappedEmail = hugeEmail.slice(0, 254).toLowerCase().trim();
      const expectedHash = crypto.createHash('sha256').update(`${clientIp}_${cappedEmail}`).digest('hex');

      const mockReq = { method: 'POST', path: '/api/auth/login', body: { email: hugeEmail } };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      (guard as any).generateKey(mockContext, clientIp, 'login_ip_email');

      expect(superGenerateKeySpy).toHaveBeenCalledWith(mockContext, expectedHash, 'login_ip_email');
    });

    it('should use "anonymous" if email is not provided in login_ip_email request body', () => {
      const superGenerateKeySpy = jest
        .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'generateKey')
        .mockReturnValue('generated_key');

      const clientIp = '198.51.100.5';
      const expectedHash = crypto.createHash('sha256').update(`${clientIp}_anonymous`).digest('hex');

      const mockReq = { method: 'POST', path: '/api/auth/login', body: {} };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockReq,
          getResponse: () => ({}),
        }),
      } as unknown as ExecutionContext;

      (guard as any).generateKey(mockContext, clientIp, 'login_ip_email');

      expect(superGenerateKeySpy).toHaveBeenCalledWith(mockContext, expectedHash, 'login_ip_email');
    });
  });
});
