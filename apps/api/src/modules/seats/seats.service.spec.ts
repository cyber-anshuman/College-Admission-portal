import { Test, TestingModule } from '@nestjs/testing';
import { SeatsService } from './seats.service';
import { PrismaService } from '../../database/prisma.service';
import { QuotaCategory, Role } from '@admission/shared';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('SeatsService', () => {
  let service: SeatsService;
  let prisma: PrismaService;

  const mockPrisma = {
    seatQuota: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeatsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SeatsService>(SeatsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('reserveSeatAtomic', () => {
    it('should successfully reserve a seat when quota has availability', async () => {
      mockPrisma.seatQuota.findUnique.mockResolvedValue({
        id: 'quota-1',
        programId: 'prog-1',
        category: QuotaCategory.GENERAL,
        totalSeats: 10,
        allottedSeats: 3,
        version: 1,
      });

      mockPrisma.seatQuota.update.mockResolvedValue({
        id: 'quota-1',
        category: QuotaCategory.GENERAL,
        totalSeats: 10,
        allottedSeats: 4,
        version: 2,
      });

      const result = await service.reserveSeatAtomic('prog-1', QuotaCategory.GENERAL);

      expect(result.success).toBe(true);
      expect(result.remainingSeats).toBe(6);
      expect(mockPrisma.seatQuota.update).toHaveBeenCalledWith({
        where: { id: 'quota-1', version: 1 },
        data: {
          allottedSeats: { increment: 1 },
          version: { increment: 1 },
        },
      });
    });

    it('should throw ConflictException if all seats in quota are already allotted', async () => {
      mockPrisma.seatQuota.findUnique.mockResolvedValue({
        id: 'quota-1',
        programId: 'prog-1',
        category: QuotaCategory.GENERAL,
        totalSeats: 10,
        allottedSeats: 10,
        version: 5,
      });

      await expect(
        service.reserveSeatAtomic('prog-1', QuotaCategory.GENERAL),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw NotFoundException if quota category does not exist for program', async () => {
      mockPrisma.seatQuota.findUnique.mockResolvedValue(null);

      await expect(
        service.reserveSeatAtomic('invalid-prog', QuotaCategory.GENERAL),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
