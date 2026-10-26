import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { RegisterApplicantDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role, QuotaCategory, AuditAction } from '@admission/shared';
import { validateConfig } from '../../main';

describe('AuthService & Security Validation', () => {
  let service: AuthService;
  let redisService: RedisService;
  let jwtService: JwtService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  const mockRedis = {
    setWithExpiry: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(undefined),
    incrWithExpiry: jest.fn().mockResolvedValue(1),
    rotateSession: jest.fn().mockResolvedValue({ status: 'ROTATED' }),
  };

  const mockJwtService = {
    signAsync: jest.fn().mockImplementation((payload) => Promise.resolve(`signed_token_${payload.sub}`)),
    verifyAsync: jest.fn().mockImplementation((token) =>
      Promise.resolve({
        sub: 'user-1',
        email: 'applicant@example.com',
        role: Role.APPLICANT,
        sessionId: 'session-123',
        jti: 'jti-123',
      }),
    ),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultVal?: any) => {
      if (key === 'JWT_SECRET') return 'valid_jwt_secret_with_more_than_32_characters_long_key_1';
      if (key === 'JWT_REFRESH_SECRET') return 'valid_refresh_secret_with_more_than_32_characters_long_key_2';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      if (key === 'JWT_REFRESH_EXPIRES_IN') return '7d';
      if (key === 'OTP_PROVIDER') return 'log';
      return defaultVal;
    }),
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'valid_jwt_secret_with_more_than_32_characters_long_key_1';
      if (key === 'JWT_REFRESH_SECRET') return 'valid_refresh_secret_with_more_than_32_characters_long_key_2';
      throw new Error(`Missing ${key}`);
    }),
  };

  const mockOtpSender = {
    send: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: RedisService, useValue: mockRedis },
        { provide: 'OTP_SENDER', useValue: mockOtpSender },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    redisService = module.get<RedisService>(RedisService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Pre-Listen Configuration & Secret Validation', () => {
    const originalEnv = { ...process.env };

    afterEach(() => {
      process.env = { ...originalEnv };
    });

    it('should throw if JWT_SECRET is less than 32 characters', () => {
      process.env.JWT_SECRET = 'short_secret';
      process.env.JWT_REFRESH_SECRET = 'valid_refresh_secret_with_more_than_32_characters_long_key_2';
      expect(() => validateConfig()).toThrow(/at least 32 characters/);
    });

    it('should throw if JWT_SECRET equals JWT_REFRESH_SECRET', () => {
      const sameSecret = 'identical_secret_with_more_than_32_characters_long_key_1';
      process.env.JWT_SECRET = sameSecret;
      process.env.JWT_REFRESH_SECRET = sameSecret;
      expect(() => validateConfig()).toThrow(/distinct, separate secrets/);
    });

    it('should throw in production if secrets equal .env.example placeholders', () => {
      process.env.NODE_ENV = 'production';
      process.env.TRUST_PROXY = '1';
      process.env.JWT_SECRET = 'super_secret_admission_jwt_key_2026_change_in_production';
      process.env.JWT_REFRESH_SECRET = 'valid_refresh_secret_with_more_than_32_characters_long_key_2';
      expect(() => validateConfig()).toThrow(/Cannot use .env.example placeholder/);
    });

    it('should throw in production if TRUST_PROXY is missing or set to "true"', () => {
      process.env.NODE_ENV = 'production';
      process.env.JWT_SECRET = 'valid_jwt_secret_with_more_than_32_characters_long_key_1';
      process.env.JWT_REFRESH_SECRET = 'valid_refresh_secret_with_more_than_32_characters_long_key_2';

      delete process.env.TRUST_PROXY;
      expect(() => validateConfig()).toThrow(/TRUST_PROXY environment variable is required/);

      process.env.TRUST_PROXY = 'true';
      expect(() => validateConfig()).toThrow(/TRUST_PROXY cannot be "true"/);
    });

    it('should pass validation with valid secrets and hop count', () => {
      process.env.JWT_SECRET = 'valid_jwt_secret_with_more_than_32_characters_long_key_1';
      process.env.JWT_REFRESH_SECRET = 'valid_refresh_secret_with_more_than_32_characters_long_key_2';
      process.env.TRUST_PROXY = '1';
      expect(() => validateConfig()).not.toThrow();
    });
  });

  describe('Password Policy Validation', () => {
    it('should reject passwords in RegisterApplicantDto under 10 characters', async () => {
      const dto = plainToInstance(RegisterApplicantDto, {
        email: 'test@example.com',
        phone: '+919876501234',
        firstName: 'Test',
        lastName: 'User',
        category: QuotaCategory.GENERAL,
        dpdpConsent: true,
        password: 'Pass1', // 5 chars
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should reject passwords in RegisterApplicantDto missing uppercase or digit', async () => {
      const dtoNoUpper = plainToInstance(RegisterApplicantDto, {
        email: 'test@example.com',
        phone: '+919876501234',
        firstName: 'Test',
        lastName: 'User',
        category: QuotaCategory.GENERAL,
        dpdpConsent: true,
        password: 'password123', // no uppercase
      });

      const errors = await validate(dtoNoUpper);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should accept passwords in RegisterApplicantDto meeting 10+ char policy', async () => {
      const dto = plainToInstance(RegisterApplicantDto, {
        email: 'test@example.com',
        phone: '+919876501234',
        firstName: 'Test',
        lastName: 'User',
        category: QuotaCategory.GENERAL,
        dpdpConsent: true,
        password: 'SecurePass@123',
      });

      const errors = await validate(dto);
      const passwordErrors = errors.filter((e) => e.property === 'password');
      expect(passwordErrors.length).toBe(0);
    });

    it('should leave LoginDto untouched (accepts min 6 characters)', async () => {
      const dto = plainToInstance(LoginDto, {
        email: 'test@example.com',
        password: 'secret', // 6 chars
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('OTP Security & Enumeration Defense', () => {
    it('should generate secure OTP, call OtpSender, and exclude simulatedOtp from response', async () => {
      const result = await service.sendOtp({ identifier: 'applicant@example.com' });

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('expiresInSeconds', 300);
      expect(result).not.toHaveProperty('simulatedOtp');
      expect(mockOtpSender.send).toHaveBeenCalledWith('applicant@example.com', expect.any(String));
    });

    it('should enforce send rate limit (reject 4th request in 5 minutes with 429)', async () => {
      mockRedis.incrWithExpiry.mockResolvedValueOnce(4);

      await expect(service.sendOtp({ identifier: 'spammer@example.com' })).rejects.toThrow(
        HttpException,
      );
    });

    it('should invalidate OTP after 5 wrong attempts', async () => {
      mockRedis.get.mockResolvedValueOnce('123456');
      mockRedis.incrWithExpiry.mockResolvedValueOnce(5); // 5th failure

      await expect(
        service.verifyOtp({ identifier: 'applicant@example.com', otp: '999999' }),
      ).rejects.toThrow(/invalidated/);

      expect(mockRedis.del).toHaveBeenCalledWith('otp:applicant@example.com');
      expect(mockRedis.del).toHaveBeenCalledWith('otp_fail:applicant@example.com');
    });

    it('should NOT return tokens or reveal existence for staff role (admin@college.edu)', async () => {
      mockRedis.get.mockResolvedValueOnce('123456');
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'admin-1',
        email: 'admin@college.edu',
        role: Role.ADMIN,
        isActive: true,
      });

      const result = await service.verifyOtp({
        identifier: 'admin@college.edu',
        otp: '123456',
      });

      expect(result).toEqual({
        verified: true,
        message: 'Verification code verified successfully',
      });
      expect((result as any).tokens).toBeUndefined();
      expect((result as any).isExistingUser).toBeUndefined();
    });

    it('should NOT reveal whether an account exists for unverified non-existing user', async () => {
      mockRedis.get.mockResolvedValueOnce('123456');
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const result = await service.verifyOtp({
        identifier: 'unknown@example.com',
        otp: '123456',
      });

      expect(result).toEqual({
        verified: true,
        message: 'Verification code verified successfully',
      });
      expect((result as any).tokens).toBeUndefined();
      expect((result as any).isExistingUser).toBeUndefined();
    });

    it('should return session tokens only for APPLICANT role', async () => {
      mockRedis.get.mockResolvedValueOnce('123456');
      mockPrisma.user.findFirst.mockResolvedValueOnce({
        id: 'applicant-1',
        email: 'rahul@example.com',
        role: Role.APPLICANT,
        isActive: true,
        applicantProfile: { firstName: 'Rahul', lastName: 'Sharma' },
      });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});

      const result = await service.verifyOtp({
        identifier: 'rahul@example.com',
        otp: '123456',
      });

      expect(result.verified).toBe(true);
      expect(result.tokens).toBeDefined();
      expect(result.tokens?.accessToken).toBeDefined();
      expect((result as any).rawRefreshToken).toBeDefined();
      expect((result as any).isExistingUser).toBeUndefined();
    });
  });

  describe('Session Storage & Refresh Token Rotation', () => {
    it('should rotate session and return new access token', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'applicant@example.com',
        role: Role.APPLICANT,
        isActive: true,
      });
      mockRedis.rotateSession.mockResolvedValueOnce({ status: 'ROTATED' });

      const result = await service.refreshSession('valid.refresh.token');

      expect(result.accessToken).toBeDefined();
      expect(result.rawRefreshToken).toBeDefined();
      expect(mockRedis.rotateSession).toHaveBeenCalled();
    });

    it('should accept concurrent request within grace window without rotating', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'applicant@example.com',
        role: Role.APPLICANT,
        isActive: true,
      });
      mockRedis.rotateSession.mockResolvedValueOnce({ status: 'GRACE_ACCEPTED' });

      const result = await service.refreshSession('valid.concurrent.token');

      expect(result.accessToken).toBeDefined();
      expect(result.rawRefreshToken).toBeUndefined(); // Does not update cookie
    });

    it('should throw 401 when token is expired or revoked (REUSE_REVOKED or MISMATCH_REVOKED)', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'applicant@example.com',
        role: Role.APPLICANT,
        isActive: true,
      });
      mockRedis.rotateSession.mockResolvedValueOnce({ status: 'REUSE_REVOKED' });

      await expect(service.refreshSession('reused.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should revoke only its own session on logout', async () => {
      await service.logout('valid.refresh.token');

      expect(mockRedis.del).toHaveBeenCalledWith('refresh:user-1:session-123');
    });
  });

  describe('Fail-Closed Redis Operations', () => {
    it('should fail closed with ServiceUnavailableException when Redis is down during login', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'applicant@example.com',
        passwordHash: await bcrypt.hash('Password@123', 10),
        role: Role.APPLICANT,
        isActive: true,
      });
      mockPrisma.user.update.mockResolvedValueOnce({});
      mockPrisma.auditLog.create.mockResolvedValueOnce({});
      mockRedis.setWithExpiry.mockRejectedValueOnce(new ServiceUnavailableException('Cache service unavailable'));

      await expect(
        service.login({ email: 'applicant@example.com', password: 'Password@123' }),
      ).rejects.toThrow(ServiceUnavailableException);
    });

    it('should fail closed when Redis is down during OTP send', async () => {
      mockRedis.incrWithExpiry.mockRejectedValueOnce(
        new ServiceUnavailableException('Cache service unavailable'),
      );

      await expect(service.sendOtp({ identifier: 'test@example.com' })).rejects.toThrow(
        ServiceUnavailableException,
      );
    });

    it('should fail closed when Redis is down during session refresh', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-1',
        email: 'applicant@example.com',
        role: Role.APPLICANT,
        isActive: true,
      });
      mockRedis.rotateSession.mockRejectedValueOnce(
        new ServiceUnavailableException('Cache service unavailable'),
      );

      await expect(service.refreshSession('any.token')).rejects.toThrow(
        ServiceUnavailableException,
      );
    });
  });
});
