import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LogOtpSender } from './providers/log-otp.sender';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRES_IN', '15m'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: 'OTP_SENDER',
      useFactory: (config: ConfigService) => {
        const provider = config.get<string>('OTP_PROVIDER', 'log');
        if (provider === 'sms') {
          throw new Error('OTP provider "sms" is not implemented yet');
        }
        if (provider === 'email') {
          throw new Error('OTP provider "email" is not implemented yet');
        }
        if (provider === 'log') {
          return new LogOtpSender();
        }
        throw new Error(`Unknown OTP provider: ${provider}`);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}

