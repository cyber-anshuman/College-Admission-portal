import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../redis/redis.service';
import { LoginDto } from './dto/login.dto';
import { RegisterApplicantDto } from './dto/register.dto';
import { SendOtpDto, VerifyOtpDto } from './dto/otp.dto';
import { Role, AuditAction } from '@admission/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

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
      tokens,
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
      tokens,
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
    const identifier = dto.identifier.toLowerCase().trim();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache in Redis for 5 minutes (300 seconds)
    const redisKey = `otp:${identifier}`;
    await this.redisService.setWithExpiry(redisKey, otp, 300);

    this.logger.log(`[SIMULATED OTP GATEWAY] Verification code for ${identifier}: ${otp}`);

    return {
      message: `Verification code sent successfully to ${identifier}`,
      expiresInSeconds: 300,
      simulatedOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, ipAddress?: string, userAgent?: string) {
    const identifier = dto.identifier.toLowerCase().trim();
    const redisKey = `otp:${identifier}`;
    const storedOtp = await this.redisService.get(redisKey);

    if (!storedOtp || storedOtp !== dto.otp) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    // Clear OTP after successful consumption
    await this.redisService.del(redisKey);

    // Find user by email or phone
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }],
      },
      include: { applicantProfile: true },
    });

    if (!user) {
      return {
        verified: true,
        isExistingUser: false,
        message: 'Identifier verified successfully. Please proceed with account registration.',
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
      isExistingUser: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
      tokens,
      applicantProfile: user.applicantProfile,
    };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
      secret: this.configService.get<string>('JWT_SECRET', 'super_secret_admission_jwt_key_2026_change_in_production'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
      secret: this.configService.get<string>('JWT_REFRESH_SECRET', 'super_secret_admission_refresh_key_2026_change_in_production'),
    });

    // Save refresh token in Redis
    await this.redisService.setWithExpiry(`refresh:${userId}`, refreshToken, 7 * 24 * 3600);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 mins
    };
  }
}
