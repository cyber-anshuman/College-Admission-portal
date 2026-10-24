import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async findAll(onlyActive = true) {
    const programs = await this.prisma.program.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      include: {
        quotas: {
          orderBy: { category: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    return programs.map((p) => {
      const totalSeats = p.quotas.reduce((acc, q) => acc + q.totalSeats, 0);
      const allottedSeats = p.quotas.reduce((acc, q) => acc + q.allottedSeats, 0);
      const confirmedSeats = p.quotas.reduce((acc, q) => acc + q.confirmedSeats, 0);
      const availableSeats = Math.max(0, totalSeats - allottedSeats);

      return {
        id: p.id,
        code: p.code,
        name: p.name,
        degreeLevel: p.degreeLevel,
        department: p.department,
        durationYears: p.durationYears,
        baseFee: p.baseFee,
        applicationFee: p.applicationFee,
        eligibilityCriteria: p.eligibilityCriteria,
        isActive: p.isActive,
        quotas: p.quotas.map((q) => ({
          id: q.id,
          category: q.category,
          totalSeats: q.totalSeats,
          allottedSeats: q.allottedSeats,
          confirmedSeats: q.confirmedSeats,
          availableSeats: Math.max(0, q.totalSeats - q.allottedSeats),
        })),
        totalSeats,
        allottedSeats,
        confirmedSeats,
        availableSeats,
      };
    });
  }

  async findByCode(code: string) {
    const program = await this.prisma.program.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        quotas: {
          orderBy: { category: 'asc' },
        },
      },
    });

    if (!program) {
      throw new NotFoundException(`Program with code ${code} not found`);
    }

    const totalSeats = program.quotas.reduce((acc, q) => acc + q.totalSeats, 0);
    const allottedSeats = program.quotas.reduce((acc, q) => acc + q.allottedSeats, 0);
    const confirmedSeats = program.quotas.reduce((acc, q) => acc + q.confirmedSeats, 0);
    const availableSeats = Math.max(0, totalSeats - allottedSeats);

    return {
      ...program,
      quotas: program.quotas.map((q) => ({
        ...q,
        availableSeats: Math.max(0, q.totalSeats - q.allottedSeats),
      })),
      totalSeats,
      allottedSeats,
      confirmedSeats,
      availableSeats,
    };
  }
}
