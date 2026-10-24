import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { QuotaCategory, Role, AuditAction } from '@admission/shared';

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async getQuotasByProgram(programId: string) {
    const quotas = await this.prisma.seatQuota.findMany({
      where: { programId },
      include: {
        program: {
          select: { code: true, name: true },
        },
      },
      orderBy: { category: 'asc' },
    });

    return quotas.map((q) => ({
      id: q.id,
      programId: q.programId,
      programCode: q.program.code,
      programName: q.program.name,
      category: q.category,
      totalSeats: q.totalSeats,
      allottedSeats: q.allottedSeats,
      confirmedSeats: q.confirmedSeats,
      availableSeats: Math.max(0, q.totalSeats - q.allottedSeats),
      version: q.version,
    }));
  }

  async updateQuotaTotal(
    quotaId: string,
    newTotalSeats: number,
    actorId: string,
    actorRole: Role,
  ) {
    if (newTotalSeats < 0) {
      throw new BadRequestException('Total seats cannot be negative');
    }

    return this.prisma.$transaction(async (tx) => {
      const quota = await tx.seatQuota.findUnique({
        where: { id: quotaId },
      });

      if (!quota) {
        throw new NotFoundException(`Seat quota with ID ${quotaId} not found`);
      }

      if (newTotalSeats < quota.allottedSeats) {
        throw new BadRequestException(
          `Cannot reduce total seats to ${newTotalSeats} because ${quota.allottedSeats} seats are already allotted`,
        );
      }

      const updated = await tx.seatQuota.update({
        where: { id: quotaId },
        data: {
          totalSeats: newTotalSeats,
          version: { increment: 1 },
        },
      });

      await tx.auditLog.create({
        data: {
          actorId,
          actorRole,
          action: AuditAction.SEATS_UPDATED,
          entityType: 'SeatQuota',
          entityId: quotaId,
          oldState: { totalSeats: quota.totalSeats, category: quota.category },
          newState: { totalSeats: newTotalSeats, category: quota.category },
        },
      });

      return {
        ...updated,
        availableSeats: Math.max(0, updated.totalSeats - updated.allottedSeats),
      };
    });
  }

  /**
   * Concurrency-safe atomic seat reservation inside an interactive transaction.
   * Prevents race conditions and over-allotment under heavy concurrent load.
   */
  async reserveSeatAtomic(programId: string, category: QuotaCategory) {
    return this.prisma.$transaction(async (tx) => {
      // Fetch row with current state
      const quota = await tx.seatQuota.findUnique({
        where: {
          programId_category: {
            programId,
            category,
          },
        },
      });

      if (!quota) {
        throw new NotFoundException(`No quota found for program ${programId} and category ${category}`);
      }

      if (quota.allottedSeats >= quota.totalSeats) {
        throw new ConflictException(`All seats in quota ${category} are already allotted`);
      }

      // Atomic update with version check
      const updated = await tx.seatQuota.update({
        where: {
          id: quota.id,
          version: quota.version,
        },
        data: {
          allottedSeats: { increment: 1 },
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        quotaId: updated.id,
        category: updated.category,
        remainingSeats: updated.totalSeats - updated.allottedSeats,
      };
    });
  }

  /**
   * Concurrency-safe atomic seat release (e.g. if applicant declines offer or deadline expires)
   */
  async releaseSeatAtomic(programId: string, category: QuotaCategory) {
    return this.prisma.$transaction(async (tx) => {
      const quota = await tx.seatQuota.findUnique({
        where: {
          programId_category: {
            programId,
            category,
          },
        },
      });

      if (!quota) {
        throw new NotFoundException(`No quota found for program ${programId} and category ${category}`);
      }

      if (quota.allottedSeats <= 0) {
        throw new ConflictException('No allotted seats to release in this quota');
      }

      const updated = await tx.seatQuota.update({
        where: { id: quota.id },
        data: {
          allottedSeats: { decrement: 1 },
          version: { increment: 1 },
        },
      });

      return {
        success: true,
        quotaId: updated.id,
        category: updated.category,
        remainingSeats: updated.totalSeats - updated.allottedSeats,
      };
    });
  }
}
