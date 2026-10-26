import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '../../database/prisma.service';
import { Role } from '@admission/shared';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
      },
      auditLog: {
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findAll', () => {
    it('should query users with role filter when provided', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([{ id: 'u1', role: Role.ADMIN }]);

      const result = await service.findAll(Role.ADMIN);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { role: Role.ADMIN },
        }),
      );
      expect(result).toHaveLength(1);
    });

    it('should query all users when no role filter is provided', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      await service.findAll();

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: undefined,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return user details when user exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'user-123',
        email: 'test@example.com',
        role: Role.APPLICANT,
      });

      const result = await service.findById('user-123');

      expect(result.id).toBe('user-123');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValueOnce(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAuditLogs', () => {
    it('should return paginated audit logs and total count', async () => {
      mockPrisma.auditLog.findMany.mockResolvedValueOnce([{ id: 'log-1' }]);
      mockPrisma.auditLog.count.mockResolvedValueOnce(1);

      const result = await service.getAuditLogs(1, 10);

      expect(mockPrisma.auditLog.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
        },
      });
      expect(result).toEqual({
        items: [{ id: 'log-1' }],
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
  });
});
