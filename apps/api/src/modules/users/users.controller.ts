import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@admission/shared';

@ApiTags('Users & Audit')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.ADMIN, Role.ADMISSION_OFFICER, Role.AUDITOR)
  @ApiOperation({ summary: 'List all users filtered by role (Staff/Admin/Auditor only)' })
  @ApiQuery({ name: 'role', enum: Role, required: false })
  async findAll(@Query('role') role?: Role) {
    return this.usersService.findAll(role);
  }

  @Get('audit-logs')
  @Roles(Role.ADMIN, Role.AUDITOR)
  @ApiOperation({ summary: 'Retrieve system audit logs (Admin and Auditor only)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async getAuditLogs(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getAuditLogs(page, limit);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.ADMISSION_OFFICER, Role.REVIEWER_HOD)
  @ApiOperation({ summary: 'Get user details by ID' })
  async findById(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
