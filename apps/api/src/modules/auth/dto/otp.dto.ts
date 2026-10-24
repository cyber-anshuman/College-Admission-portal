import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'applicant.rahul@example.com', description: 'Registered email or phone number' })
  @IsString()
  @IsNotEmpty({ message: 'Email or phone identifier is required' })
  identifier!: string;
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'applicant.rahul@example.com' })
  @IsString()
  @IsNotEmpty({ message: 'Email or phone identifier is required' })
  identifier!: string;

  @ApiProperty({ example: '123456', description: '6-digit OTP' })
  @IsString()
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  otp!: string;
}
