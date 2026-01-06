/**
 * ParentService 单元测试
 * 测试家长服务的核心功能
 */

import { ParentService } from '../../../src/services/parent.service';
import { vi } from 'vitest'
import { Parent, Student, User } from '../../../src/models/index';
import { CreateParentDto, UpdateParentDto } from '../../../src/types/parent';
import { Op } from 'sequelize';

// Mock dependencies
jest.mock('../../../src/models/index');
jest.mock('sequelize');

const mockedParent = Parent as jest.MockedClass<typeof Parent>;
const mockedStudent = Student as jest.MockedClass<typeof Student>;
const mockedUser = User as jest.MockedClass<typeof User>;


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('ParentService', () => {
  let service: ParentService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ParentService();
  });

  describe('createParent', () => {
    const mockParentData: CreateParentDto = {
      name: '张父',
      phone: '13800138000',
      email: 'zhangfu@example.com',
      relationship: 'father',
      studentId: 1,
      creatorId: 1
    };

    it('should create parent with existing user', async () => {
      const mockExistingUser = {
        id: 1,
        username: 'parent_13800138000',
        email: 'zhangfu@example.com',
        realName: '张父',
        phone: '13800138000'
      };

      const mockStudent = { id: 1, name: '张三' };
      const mockCreatedParent = {
        id: 1,
        userId: 1,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: 0,
        isLegalGuardian: 0
      };

      // Mock existing user check
      mockedUser.findOne.mockResolvedValue(mockExistingUser);
      mockedStudent.findByPk.mockResolvedValue(mockStudent);
      mockedParent.findOne.mockResolvedValue(null);
      mockedParent.create.mockResolvedValue(mockCreatedParent);
      (service as any).findParentById = jest.fn().mockResolvedValue({
        ...mockCreatedParent,
        user: mockExistingUser
      });

      const result = await service.createParent(mockParentData);

      expect(mockedUser.findOne).toHaveBeenCalledWith({
        where: { phone: mockParentData.phone }
      });
      expect(mockedStudent.findByPk).toHaveBeenCalledWith(mockParentData.studentId);
      expect(mockedParent.findOne).toHaveBeenCalledWith({
        where: {
          userId: mockExistingUser.id,
          studentId: mockParentData.studentId
        }
      });
      expect(mockedParent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: mockExistingUser.id,
          studentId: mockParentData.studentId,
          relationship: mockParentData.relationship,
          isPrimaryContact: 0,
          isLegalGuardian: 0
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          user: mockExistingUser
        })
      );
    });

    it('should create parent with new user when no existing user found', async () => {
      const mockNewUser = {
        id: 2,
        username: 'parent_13800138000',
        email: 'parent_13800138000_1234567890@kindergarten.com',
        realName: '张父',
        phone: '13800138000'
      };

      const mockStudent = { id: 1, name: '张三' };
      const mockCreatedParent = {
        id: 1,
        userId: 2,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: 0,
        isLegalGuardian: 0
      };

      // Mock no existing user
      mockedUser.findOne.mockResolvedValue(null);
      mockedUser.findOne.mockResolvedValueOnce(null); // For email check
      mockedUser.findOne.mockResolvedValueOnce(null); // For username check
      mockedUser.create.mockResolvedValue(mockNewUser);
      mockedStudent.findByPk.mockResolvedValue(mockStudent);
      mockedParent.findOne.mockResolvedValue(null);
      mockedParent.create.mockResolvedValue(mockCreatedParent);
      (service as any).findParentById = jest.fn().mockResolvedValue({
        ...mockCreatedParent,
        user: mockNewUser
      });

      const result = await service.createParent(mockParentData);

      expect(mockedUser.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: expect.stringContaining('parent_13800138000'),
          email: expect.stringContaining('@kindergarten.com'),
          realName: mockParentData.name,
          phone: mockParentData.phone,
          role: 'USER',
          status: 'ACTIVE',
          password: null
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          user: mockNewUser
        })
      );
    });

    it('should throw error when student does not exist', async () => {
      mockedUser.findOne.mockResolvedValue(null);
      mockedStudent.findByPk.mockResolvedValue(null);

      await expect(service.createParent(mockParentData))
        .rejects.toThrow('学生ID 1 不存在');
    });

    it('should throw error when parent-student relationship already exists', async () => {
      const mockExistingUser = { id: 1 };
      const mockStudent = { id: 1 };
      const mockExistingParent = { id: 1 };

      mockedUser.findOne.mockResolvedValue(mockExistingUser);
      mockedStudent.findByPk.mockResolvedValue(mockStudent);
      mockedParent.findOne.mockResolvedValue(mockExistingParent);

      await expect(service.createParent(mockParentData))
        .rejects.toThrow('该用户已经是学生ID 1 的家长');
    });

    it('should handle database errors gracefully', async () => {
      const error = new Error('Database error');
      mockedUser.findOne.mockRejectedValue(error);

      await expect(service.createParent(mockParentData))
        .rejects.toThrow(error);
    });
  });

  describe('findAllParent', () => {
    it('should return all parents with user information', async () => {
      const mockQueryResult = [
        {
          id: 1,
          user_id: 1,
          username: 'parent1',
          email: 'parent1@example.com',
          real_name: '张父',
          user_phone: '13800138000',
          role: 'USER',
          user_status: 'ACTIVE',
          relationship: 'father',
          studentId: 1
        }
      ];

      const mockSequelize = {
        query: jest.fn().mockResolvedValue(mockQueryResult)
      };

      mockedParent.sequelize = mockSequelize as any;

      const result = await service.findAllParent();

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT p.*, u.id as user_id'),
        { type: 'SELECT' }
      );
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          user: expect.objectContaining({
            id: 1,
            username: 'parent1',
            email: 'parent1@example.com',
            realName: '张父',
            phone: '13800138000'
          })
        })
      ]);
    });

    it('should handle database connection unavailable', async () => {
      mockedParent.sequelize = null;

      await expect(service.findAllParent())
        .rejects.toThrow('数据库连接不可用');
    });

    it('should handle empty result set', async () => {
      const mockSequelize = {
        query: jest.fn().mockResolvedValue([])
      };

      mockedParent.sequelize = mockSequelize as any;

      const result = await service.findAllParent();

      expect(result).toEqual([]);
    });
  });

  describe('findParentById', () => {
    it('should return parent by id with user information', async () => {
      const mockQueryResult = [
        {
          id: 1,
          user_id: 1,
          username: 'parent1',
          email: 'parent1@example.com',
          real_name: '张父',
          user_phone: '13800138000',
          role: 'USER',
          user_status: 'ACTIVE',
          relationship: 'father',
          studentId: 1
        }
      ];

      const mockSequelize = {
        query: jest.fn().mockResolvedValue(mockQueryResult)
      };

      mockedParent.sequelize = mockSequelize as any;

      const result = await service.findParentById(1);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.id = :parentId'),
        { replacements: { parentId: 1 }, type: 'SELECT' }
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: 1,
          user: expect.objectContaining({
            id: 1,
            username: 'parent1'
          })
        })
      );
    });

    it('should throw error when parent not found', async () => {
      const mockSequelize = {
        query: jest.fn().mockResolvedValue([])
      };

      mockedParent.sequelize = mockSequelize as any;

      await expect(service.findParentById(999))
        .rejects.toThrow('ID为999的家长不存在');
    });
  });

  describe('findParentByCondition', () => {
    it('should return parents matching conditions', async () => {
      const mockQueryResult = [
        {
          id: 1,
          user_id: 1,
          username: 'parent1',
          real_name: '张父',
          user_phone: '13800138000',
          relationship: 'father'
        }
      ];

      const mockSequelize = {
        query: jest.fn().mockResolvedValue(mockQueryResult)
      };

      mockedParent.sequelize = mockSequelize as any;

      const condition = { userId: 1, relationship: 'father' };
      const result = await service.findParentByCondition(condition);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.user_id = :userId'),
        {
          replacements: { userId: 1, relationship: 'father' },
          type: 'SELECT'
        }
      );
      expect(result).toEqual([
        expect.objectContaining({
          id: 1,
          user: expect.objectContaining({
            id: 1,
            username: 'parent1'
          })
        })
      ]);
    });

    it('should handle empty conditions', async () => {
      const mockQueryResult = [
        {
          id: 1,
          user_id: 1,
          username: 'parent1',
          real_name: '张父'
        }
      ];

      const mockSequelize = {
        query: jest.fn().mockResolvedValue(mockQueryResult)
      };

      mockedParent.sequelize = mockSequelize as any;

      const result = await service.findParentByCondition({});

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.deleted_at IS NULL'),
        { replacements: {}, type: 'SELECT' }
      );
      expect(result).toHaveLength(1);
    });
  });

  describe('updateParent', () => {
    const mockUpdateData: UpdateParentDto = {
      name: '张父更新',
      phone: '13800138001',
      email: 'updated@example.com',
      relationship: 'mother',
      occupation: '工程师'
    };

    it('should update parent information successfully', async () => {
      const mockExistingParent = {
        id: 1,
        userId: 1,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: 0,
        isLegalGuardian: 0,
        user: {
          id: 1,
          username: 'parent1',
          email: 'parent1@example.com',
          realName: '张父',
          phone: '13800138000'
        }
      };

      const mockUpdatedParent = {
        ...mockExistingParent,
        relationship: 'mother',
        occupation: '工程师'
      };

      (service as any).findParentById = jest.fn().mockResolvedValue(mockExistingParent);
      mockedParent.update = jest.fn().mockResolvedValue([1]);
      mockedUser.update = jest.fn().mockResolvedValue([1]);
      (service as any).findParentById = jest.fn().mockResolvedValue(mockUpdatedParent);

      const result = await service.updateParent(1, mockUpdateData, 1);

      expect(mockedParent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          relationship: 'mother',
          isLegalGuardian: undefined,
          occupation: '工程师'
        }),
        { where: { id: 1 } }
      );
      expect(mockedUser.update).toHaveBeenCalledWith(
        expect.objectContaining({
          realName: '张父更新',
          phone: '13800138001',
          email: 'updated@example.com'
        }),
        { where: { id: 1 } }
      );
      expect(result).toEqual(mockUpdatedParent);
    });

    it('should throw error when parent not found', async () => {
      (service as any).findParentById = jest.fn().mockResolvedValue(null);

      await expect(service.updateParent(999, mockUpdateData, 1))
        .rejects.toThrow('ID为999的家长不存在');
    });

    it('should handle partial updates', async () => {
      const mockExistingParent = {
        id: 1,
        userId: 1,
        user: { id: 1 }
      };

      const partialUpdate: UpdateParentDto = {
        relationship: 'guardian'
      };

      (service as any).findParentById = jest.fn().mockResolvedValue(mockExistingParent);
      mockedParent.update = jest.fn().mockResolvedValue([1]);
      (service as any).findParentById = jest.fn().mockResolvedValue(mockExistingParent);

      await service.updateParent(1, partialUpdate, 1);

      expect(mockedParent.update).toHaveBeenCalledWith(
        { relationship: 'guardian' },
        { where: { id: 1 } }
      );
    });
  });

  describe('deleteParent', () => {
    it('should delete parent successfully', async () => {
      const mockExistingParent = {
        id: 1,
        name: '张父',
        relationship: 'father'
      };

      (service as any).findParentById = jest.fn().mockResolvedValue(mockExistingParent);
      mockedParent.destroy = jest.fn().mockResolvedValue(1);

      const result = await service.deleteParent(1);

      expect((service as any).findParentById).toHaveBeenCalledWith(1);
      expect(mockedParent.destroy).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(result).toEqual(mockExistingParent);
    });

    it('should throw error when parent not found', async () => {
      (service as any).findParentById = jest.fn().mockResolvedValue(null);

      await expect(service.deleteParent(999))
        .rejects.toThrow('ID为999的家长不存在');
    });
  });

  describe('findParentByPhone', () => {
    it('should return parent by phone number', async () => {
      const mockParent = {
        id: 1,
        name: '张父',
        phone: '13800138000',
        user: { id: 1, phone: '13800138000' }
      };

      mockedParent.findOne.mockResolvedValue(mockParent);

      const result = await service.findParentByPhone('13800138000');

      expect(mockedParent.findOne).toHaveBeenCalledWith({
        include: [
          {
            model: User,
            as: 'user',
            where: { phone: '13800138000' }
          }
        ]
      });
      expect(result).toEqual(mockParent);
    });

    it('should return null when parent not found', async () => {
      mockedParent.findOne.mockResolvedValue(null);

      const result = await service.findParentByPhone('99999999999');

      expect(result).toBeNull();
    });
  });
});