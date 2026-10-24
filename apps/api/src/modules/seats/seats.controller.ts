import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { SeatsService } from './seats.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@admission/shared';
import { IsInt, Min } from 'class-validator';

export class UpdateQuotaDto {
  @ApiProperty({ example: 50, description: 'New total seat count for this quota' })
  @IsInt()
  @Min(0)
  totalSeats!: number;
}

@ApiTags('Seats & Quotas')
@Controller('seats')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Get('program/:programId')
  @Roles(Role.ADMIN, Role.ADMISSION_OFFICER, Role.REVIEWER_HOD, Role.AUDITOR)
  @ApiOperation({ summary: 'Get quota breakdown and seat availability for a program' })
  async getQuotasByProgram(@Param('programId') programId: string) {
    return this.seatsService.getQuotasByProgram(programId);
  }

  @Put('quota/:quotaId')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update seat quota total (Admin only, logged to audit)' })
  async updateQuotaTotal(
    @Param('quotaId') quotaId: string,
    @Body() dto: UpdateQuotaDto,
    @CurrentUser() user: any,
  ) {
    return this.seatsService.updateQuotaTotal(
      quotaId,
      dto.totalSeats,
      user.id,
      user.role,
    );
  }
}
