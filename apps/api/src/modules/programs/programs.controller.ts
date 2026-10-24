import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProgramsService } from './programs.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Academic Programs')
@Controller('programs')
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all academic programs with quota matrices and availability (Public)' })
  @ApiQuery({ name: 'activeOnly', type: Boolean, required: false })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const onlyActive = activeOnly !== 'false';
    return this.programsService.findAll(onlyActive);
  }

  @Public()
  @Get(':code')
  @ApiOperation({ summary: 'Get program details and eligibility requirements by program code (Public)' })
  async findByCode(@Param('code') code: string) {
    return this.programsService.findByCode(code);
  }
}
