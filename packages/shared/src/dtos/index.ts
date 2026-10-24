import { Role, QuotaCategory, DegreeLevel } from '../enums/index.js';

export interface UserSummaryDto {
  id: string;
  email: string;
  phone?: string | null;
  role: Role;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string | null;
}

export interface AuthTokensDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponseDto {
  user: UserSummaryDto;
  tokens: AuthTokensDto;
  applicantProfile?: ApplicantProfileDto | null;
}

export interface ApplicantProfileDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  category: QuotaCategory;
  guardianName?: string | null;
  guardianPhone?: string | null;
  addressLine1?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  aadharMasked?: string | null;
  dpdpConsentGivenAt: string;
}

export interface SeatQuotaDto {
  id: string;
  category: QuotaCategory;
  totalSeats: number;
  allottedSeats: number;
  confirmedSeats: number;
  availableSeats: number;
}

export interface ProgramDto {
  id: string;
  code: string;
  name: string;
  degreeLevel: DegreeLevel;
  department: string;
  durationYears: number;
  baseFee: number;
  applicationFee: number;
  eligibilityCriteria: {
    minScorePercentage?: number;
    requiredSubjects?: string[];
    allowedCategories?: string[];
  };
  isActive: boolean;
  quotas: SeatQuotaDto[];
  totalSeats: number;
  availableSeats: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}
