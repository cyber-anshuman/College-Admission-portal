import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { PrismaService } from '../../database/prisma.service';

describe('ProgramsService', () => {
  let service: ProgramsService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      program: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ProgramsService>(ProgramsService);
  });

  describe('findAll', () => {
    it('should calculate seat aggregates correctly for each program and quota', async () => {
      mockPrisma.program.findMany.mockResolvedValueOnce([
        {
          id: 'prog-1',
          code: 'BTECH-CSE',
          name: 'Computer Science',
          isActive: true,
          quotas: [
            { id: 'q-1', category: 'GENERAL', totalSeats: 60, allottedSeats: 10, confirmedSeats: 8 },
            { id: 'q-2', category: 'OBC_NCL', totalSeats: 40, allottedSeats: 5, confirmedSeats: 4 },
          ],
        },
      ]);

      const result = await service.findAll(true);

      expect(mockPrisma.program.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        include: { quotas: { orderBy: { category: 'asc' } } },
        orderBy: { name: 'asc' },
      });

      expect(result).toHaveLength(1);
      const prog = result[0];
      expect(prog.totalSeats).toBe(100);
      expect(prog.allottedSeats).toBe(15);
      expect(prog.confirmedSeats).toBe(12);
      expect(prog.availableSeats).toBe(85);
      expect(prog.quotas[0].availableSeats).toBe(50);
      expect(prog.quotas[1].availableSeats).toBe(35);
    });

    it('should query all programs when onlyActive is false', async () => {
      mockPrisma.program.findMany.mockResolvedValueOnce([]);

      await service.findAll(false);

      expect(mockPrisma.program.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { quotas: { orderBy: { category: 'asc' } } },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findByCode', () => {
    it('should return program details when found by uppercase code', async () => {
      mockPrisma.program.findUnique.mockResolvedValueOnce({
        id: 'prog-1',
        code: 'BTECH-CSE',
        name: 'Computer Science',
        quotas: [],
      });

      const result = await service.findByCode('btech-cse');

      expect(mockPrisma.program.findUnique).toHaveBeenCalledWith({
        where: { code: 'BTECH-CSE' },
        include: { quotas: { orderBy: { category: 'asc' } } },
      });
      expect(result.code).toBe('BTECH-CSE');
    });

    it('should throw NotFoundException when program code does not exist', async () => {
      mockPrisma.program.findUnique.mockResolvedValueOnce(null);

      await expect(service.findByCode('INVALID')).rejects.toThrow(NotFoundException);
    });
  });
});
