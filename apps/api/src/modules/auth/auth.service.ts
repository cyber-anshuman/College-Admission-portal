import {
  Injectable,
  Inject,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { OtpSender } from './providers/otp-sender.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterApplicantDto } from './dto/register.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { Role, AuditAction } from '@admission/shared';

function parseExpiryToSeconds(expiry: string, defaultSec: number): number {
  if (!expiry) return defaultSec;
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return defaultSec;
  const num = parseInt(match[1], 10);
  switch (match[2]) {
    case 's':
      return num;
    case 'm':
      return num * 60;
    case 'h':
      return num * 3600;
    case 'd':
      return num * 86400;
    default:
      return defaultSec;
  }
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
    @Inject('OTP_SENDER') private otpSender: OtpSender,
  ) {}

  getConfig() {
    const isProd = process.env.NODE_ENV === 'production';
    const provider = this.configService.get<string>('OTP_PROVIDER', 'log');
    const otpEnabled = !(isProd && provider === 'log');
    return { otpEnabled };
  }

  async login(loginDto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email.toLowerCase().trim() },
      include: { applicantProfile: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated. Please contact admissions.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update lastLoginAt
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Record audit log
    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: AuditAction.USER_LOGIN,
        entityType: 'User',
        entityId: user.id,
        newState: { email: user.email, role: user.role, timestamp: new Date().toISOString() },
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      rawRefreshToken: tokens.refreshToken,
      applicantProfile: user.applicantProfile
        ? {
            id: user.applicantProfile.id,
            userId: user.applicantProfile.userId,
            firstName: user.applicantProfile.firstName,
            lastName: user.applicantProfile.lastName,
            dateOfBirth: user.applicantProfile.dateOfBirth?.toISOString() || null,
            gender: user.applicantProfile.gender,
            category: user.applicantProfile.category,
            guardianName: user.applicantProfile.guardianName,
            guardianPhone: user.applicantProfile.guardianPhone,
            addressLine1: user.applicantProfile.addressLine1,
            city: user.applicantProfile.city,
            state: user.applicantProfile.state,
            pincode: user.applicantProfile.pincode,
            aadharMasked: user.applicantProfile.aadharMasked,
            dpdpConsentGivenAt: user.applicantProfile.dpdpConsentGivenAt.toISOString(),
          }
        : null,
    };
  }

  async registerApplicant(registerDto: RegisterApplicantDto, ipAddress?: string, userAgent?: string) {
    if (!registerDto.dpdpConsent) {
      throw new BadRequestException('Explicit consent under DPDP Act 2023 is required to proceed with registration');
    }

    const normalizedEmail = registerDto.email.toLowerCase().trim();

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (existingEmail) {
      throw new ConflictException('An account with this email address already exists');
    }

    const existingPhone = await this.prisma.user.findUnique({
      where: { phone: registerDto.phone.trim() },
    });
    if (existingPhone) {
      throw new ConflictException('An account with this phone number already exists');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          phone: registerDto.phone.trim(),
          passwordHash,
          role: Role.APPLICANT,
          isActive: true,
          isEmailVerified: false,
          isPhoneVerified: false,
          applicantProfile: {
            create: {
              firstName: registerDto.firstName.trim(),
              lastName: registerDto.lastName.trim(),
              category: registerDto.category,
              dpdpConsentGivenAt: new Date(),
            },
          },
        },
        include: { applicantProfile: true },
      });

      await tx.auditLog.create({
        data: {
          actorId: user.id,
          actorRole: Role.APPLICANT,
          action: AuditAction.USER_REGISTER,
          entityType: 'User',
          entityId: user.id,
          newState: {
            email: user.email,
            phone: user.phone,
            role: user.role,
            category: registerDto.category,
            dpdpConsent: true,
          },
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || 'unknown',
        },
      });

      return user;
    });

    const tokens = await this.generateTokens(newUser.id, newUser.email, newUser.role);

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        isActive: newUser.isActive,
        createdAt: newUser.createdAt.toISOString(),
      },
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      rawRefreshToken: tokens.refreshToken,
      applicantProfile: newUser.applicantProfile
        ? {
            id: newUser.applicantProfile.id,
            userId: newUser.applicantProfile.userId,
            firstName: newUser.applicantProfile.firstName,
            lastName: newUser.applicantProfile.lastName,
            category: newUser.applicantProfile.category,
            dpdpConsentGivenAt: newUser.applicantProfile.dpdpConsentGivenAt.toISOString(),
          }
        : null,
    };
  }

  async sendOtp(dto: SendOtpDto) {
    if (process.env.NODE_ENV === 'production' && this.configService.get<string>('OTP_PROVIDER', 'log') === 'log') {
      throw new ServiceUnavailableException('OTP login is disabled in this environment');
    }

    const identifier = dto.identifier.toLowerCase().trim();

    // Per-identifier send rate limit: max 3 requests per 5 minutes (300s)
    const sendCount = await this.redisService.incrWithExpiry(`otp_send:${identifier}`, 300);
    if (sendCount > 3) {
      throw new HttpException(
        'Too many verification codes requested. Please wait before requesting another.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Cache OTP in Redis for 5 minutes
    await this.redisService.setWithExpiry(`otp:${identifier}`, otp, 300);

    // Send through designated provider
    await this.otpSender.send(identifier, otp);

    return {
      message: `Verification code sent successfully to ${identifier}`,
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress?: string, userAgent?: string) {
    if (process.env.NODE_ENV === 'production' && this.configService.get<string>('OTP_PROVIDER', 'log') === 'log') {
      throw new ServiceUnavailableException('OTP login is disabled in this environment');
    }

    const identifier = dto.identifier.toLowerCase().trim();
    const redisKey = `otp:${identifier}`;
    const failKey = `otp_fail:${identifier}`;

    const storedOtp = await this.redisService.get(redisKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      const failCount = await this.redisService.incrWithExpiry(failKey, 300);
      if (failCount >= 5) {
        await this.redisService.del(redisKey);
        await this.redisService.del(failKey);
        throw new BadRequestException(
          'Too many invalid attempts. Verification code has been invalidated. Please request a new one.',
        );
      }
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Clear OTP and fail counter after successful consumption
    await this.redisService.del(redisKey);
    await this.redisService.del(failKey);

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: { applicantProfile: true },
    });

    // If user does not exist or is not an APPLICANT, return clean response without tokens or enumeration details
    if (!user || user.role !== Role.APPLICANT || !user.isActive) {
      return {
        verified: true,
        message: 'Verification code verified successfully',
      };
    }

    // Update verified flag
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: user.email === identifier ? true : user.isEmailVerified,
        isPhoneVerified: user.phone === identifier ? true : user.isPhoneVerified,
        lastLoginAt: new Date(),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.id,
        actorRole: user.role,
        action: AuditAction.OTP_VERIFIED,
        entityType: 'User',
        entityId: user.id,
        newState: { identifier, timestamp: new Date().toISOString() },
        ipAddress: ipAddress || 'unknown',
        userAgent: userAgent || 'unknown',
      },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      verified: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      tokens: {
        accessToken: tokens.accessToken,
        expiresIn: tokens.expiresIn,
      },
      rawRefreshToken: tokens.refreshToken,
      applicantProfile: user.applicantProfile,
    };
  }

  async refreshSession(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const jwtRefreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtRefreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (!payload.sub || !payload.sessionId) {
      throw new UnauthorizedException('Invalid refresh session payload');
    }

    const userId = payload.sub;
    const sessionId = payload.sessionId;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { applicantProfile: true },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account not found or inactive');
    }

    const incomingHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const refreshTtlSeconds = parseExpiryToSeconds(refreshExpiresIn, 7 * 86400);

    // Generate rotated refresh token candidate with distinct jti
    const newJti = crypto.randomUUID();
    const newRefreshToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role, sessionId, jti: newJti },
      { expiresIn: refreshExpiresIn, secret: jwtRefreshSecret },
    );
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

    // 10-second concurrency grace window via atomic Lua script
    const result = await this.redisService.rotateSession(
      `refresh:${userId}:${sessionId}`,
      incomingHash,
      newHash,
      10000,
      refreshTtlSeconds,
    );

    if (
      result.status === 'NOT_FOUND' ||
      result.status === 'REUSE_REVOKED' ||
      result.status === 'MISMATCH_REVOKED'
    ) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email, role: user.role, sessionId },
      {
        expiresIn: accessTokenExpiresIn,
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      },
    );

    const isGraceAccepted = result.status === 'GRACE_ACCEPTED';

    return {
      accessToken,
      expiresIn: parseExpiryToSeconds(accessTokenExpiresIn, 900),
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        applicantProfile: user.applicantProfile,
      },
      rawRefreshToken: isGraceAccepted ? undefined : newRefreshToken,
    };
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      try {
        const jwtRefreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
        const payload = await this.jwtService.verifyAsync(refreshToken, {
          secret: jwtRefreshSecret,
        });
        if (payload.sub && payload.sessionId) {
          await this.redisService.del(`refresh:${payload.sub}:${payload.sessionId}`);
        }
      } catch {
        // Safe to ignore parsing failures on logout
      }
    }
    return { success: true, message: 'Logged out successfully' };
  }

  private async generateTokens(userId: string, email: string, role: string, existingSessionId?: string) {
    const sessionId = existingSessionId || crypto.randomUUID();
    const jti = crypto.randomUUID();

    const jwtSecret = this.configService.getOrThrow<string>('JWT_SECRET');
    const jwtRefreshSecret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessTokenExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '15m');
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');

    const accessToken = await this.jwtService.signAsync(
      { sub: userId, email, role, sessionId },
      {
        expiresIn: accessTokenExpiresIn,
        secret: jwtSecret,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, email, role, sessionId, jti },
      {
        expiresIn: refreshExpiresIn,
        secret: jwtRefreshSecret,
      },
    );

    // Save hashed refresh token in Redis
    const refreshTtlSeconds = parseExpiryToSeconds(refreshExpiresIn, 7 * 86400);
    const hash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const initialSession = JSON.stringify({ currentHash: hash });

    await this.redisService.setWithExpiry(`refresh:${userId}:${sessionId}`, initialSession, refreshTtlSeconds);

    return {
      accessToken,
      refreshToken,
      expiresIn: parseExpiryToSeconds(accessTokenExpiresIn, 900),
      sessionId,
    };
  }
}
