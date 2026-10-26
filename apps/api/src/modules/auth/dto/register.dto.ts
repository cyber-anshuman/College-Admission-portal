import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { QuotaCategory } from '@admission/shared';

export class RegisterApplicantDto {
  @ApiProperty({ example: 'rohit.verma@example.com' })
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @ApiProperty({ example: 'SecurePass@123' })
  @IsString()
  @MinLength(10, { message: 'Password must be at least 10 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password!: string;

  @ApiProperty({ example: '+919876501234' })
  @IsString()
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{9,14}$/, {
    message: 'Phone number must be a valid international format (e.g. +919876501234)',
  })
  phone!: string;

  @ApiProperty({ example: 'Rohit' })
  @IsString()
  @IsNotEmpty({ message: 'First name is required' })
  firstName!: string;

  @ApiProperty({ example: 'Verma' })
  @IsString()
  @IsNotEmpty({ message: 'Last name is required' })
  lastName!: string;

  @ApiProperty({ enum: QuotaCategory, example: QuotaCategory.GENERAL })
  @IsEnum(QuotaCategory, { message: 'A valid reservation quota category is required' })
  category!: QuotaCategory;

  @ApiProperty({ example: true, description: 'Explicit DPDP Act 2023 consent checkbox' })
  @IsBoolean()
  dpdpConsent!: boolean;
}
