import { Logger } from '@nestjs/common';
import { OtpSender } from './otp-sender.interface';

export class LogOtpSender implements OtpSender {
  private readonly logger = new Logger(LogOtpSender.name);

  async send(identifier: string, otp: string): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      this.logger.log(`[OTP] Verification code for ${identifier}: ${otp}`);
    }
  }
}
