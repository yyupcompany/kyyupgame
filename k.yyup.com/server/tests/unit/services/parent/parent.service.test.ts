import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Sequelize
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn(),
  authenticate: jest.fn(),
  define: jest.fn(),
  sync: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn(),
  finished: 'pending'
};

// Mock models
const mockParent = {
  create: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  findOne: jest.fn()
};

const mockStudent = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockParentStudentRelation = {
  create: jest.fn(),
  findAll: jest.fn(),
  destroy: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/services/parent/parent.service', () => ({
  ParentService: jest.fn().mockImplementation(() => ({
    createParent: jest.fn(),
    getParentById: jest.fn(),
    getParents: jest.fn(),
    updateParent: jest.fn(),
    deleteParent: jest.fn(),
    addStudentRelation: jest.fn(),
    removeStudentRelation: jest.fn(),
    getParentStudents: jest.fn(),
    getParentProfile: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../src/models/parent.model', () => ({
  Parent: mockParent
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/parent-student-relation.model', () => ({
  ParentStudentRelation: mockParentStudentRelation
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
}));


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

describe('Parent Service', () => {
  let parentService: any;
  let ParentService: any;

  beforeAll(async () => {
    const { ParentService: ImportedParentService } = await import('../../../../../src/services/parent/parent.service');
    ParentService = ImportedParentService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    parentService = new ParentService();
  });

  describe('createParent', () => {
    it('应该成功创建家长', async () => {
      const parentData = {
        userId: 1,
        realName: '张三',
        phone: '13800138000',
        relationship: 'father',
        occupation: '工程师',
        workUnit: '科技公司'
      };

      const mockCreatedParent = {
        id: 1,
        ...parentData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '张三' });
      mockParent.create.mockResolvedValue(mockCreatedParent);

      const result = await parentService.createParent(parentData);

      expect(result).toEqual(mockCreatedParent);
      expect(mockUser.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockParent.create).toHaveBeenCalledWith(parentData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理用户不存在的情况', async () => {
      const parentData = {
        userId: 999,
        realName: '不存在的用户',
        phone: '13800138000',
        relationship: 'father'
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(parentService.createParent(parentData)).rejects.toThrow('用户不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理创建失败的情况', async () => {
      const parentData = {
        userId: 1,
        realName: '张三',
        phone: '13800138000',
        relationship: 'father'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockParent.create.mockRejectedValue(new Error('创建失败'));

      await expect(parentService.createParent(parentData)).rejects.toThrow('创建失败');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getParentById', () => {
    it('应该成功获取家长信息', async () => {
      const parentId = 1;
      const mockParentData = {
        id: 1,
        userId: 1,
        realName: '张三',
        phone: '13800138000',
        relationship: 'father',
        user: {
          id: 1,
          username: 'zhangsan',
          email: 'zhangsan@example.com'
        }
      };

      mockParent.findByPk.mockResolvedValue(mockParentData);

      const result = await parentService.getParentById(parentId);

      expect(result).toEqual(mockParentData);
      expect(mockParent.findByPk).toHaveBeenCalledWith(parentId, {
        include: expect.arrayContaining([
          expect.objectContaining({
            model: expect.anything(),
            attributes: expect.any(Array)
          })
        ])
      });
    });

    it('应该处理家长不存在的情况', async () => {
      const parentId = 999;
      mockParent.findByPk.mockResolvedValue(null);

      await expect(parentService.getParentById(parentId)).rejects.toThrow('家长不存在');
    });
  });

  describe('getParents', () => {
    it('应该成功获取家长列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        relationship: 'father'
      };

      const mockParents = [
        {
          id: 1,
          realName: '张三',
          relationship: 'father',
          phone: '13800138000'
        },
        {
          id: 2,
          realName: '李四',
          relationship: 'father',
          phone: '13800138001'
        }
      ];

      mockParent.findAll.mockResolvedValue(mockParents);
      mockParent.count.mockResolvedValue(2);

      const result = await parentService.getParents(queryParams);

      expect(result).toEqual({
        parents: mockParents,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockParent.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          relationship: 'father'
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });

    it('应该支持搜索功能', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        search: '张三'
      };

      mockParent.findAll.mockResolvedValue([]);
      mockParent.count.mockResolvedValue(0);

      await parentService.getParents(queryParams);

      expect(mockParent.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          [expect.any(Symbol)]: expect.arrayContaining([
            expect.objectContaining({
              realName: expect.objectContaining({
                [expect.any(Symbol)]: '%张三%'
              })
            })
          ])
        }),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('updateParent', () => {
    it('应该成功更新家长信息', async () => {
      const parentId = 1;
      const updateData = {
        phone: '13900139000',
        occupation: '医生',
        workUnit: '人民医院'
      };

      const mockExistingParent = {
        id: 1,
        realName: '张三',
        phone: '13800138000',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockParent.findByPk.mockResolvedValue(mockExistingParent);

      const result = await parentService.updateParent(parentId, updateData);

      expect(result).toBe(true);
      expect(mockParent.findByPk).toHaveBeenCalledWith(parentId, { transaction: mockTransaction });
      expect(mockExistingParent.update).toHaveBeenCalledWith(updateData, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理家长不存在的情况', async () => {
      const parentId = 999;
      const updateData = { phone: '13900139000' };

      mockParent.findByPk.mockResolvedValue(null);

      await expect(parentService.updateParent(parentId, updateData)).rejects.toThrow('家长不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteParent', () => {
    it('应该成功删除家长', async () => {
      const parentId = 1;
      const mockExistingParent = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockParent.findByPk.mockResolvedValue(mockExistingParent);
      mockParentStudentRelation.destroy.mockResolvedValue(2); // 删除了2个关联关系

      const result = await parentService.deleteParent(parentId);

      expect(result).toBe(true);
      expect(mockParentStudentRelation.destroy).toHaveBeenCalledWith({
        where: { parentId },
        transaction: mockTransaction
      });
      expect(mockExistingParent.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理家长不存在的情况', async () => {
      const parentId = 999;
      mockParent.findByPk.mockResolvedValue(null);

      await expect(parentService.deleteParent(parentId)).rejects.toThrow('家长不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('addStudentRelation', () => {
    it('应该成功添加家长学生关系', async () => {
      const parentId = 1;
      const studentId = 1;
      const relationship = 'father';

      const mockParentData = { id: 1, realName: '张三' };
      const mockStudentData = { id: 1, name: '张小明' };
      const mockRelation = {
        id: 1,
        parentId,
        studentId,
        relationship,
        createdAt: new Date()
      };

      mockParent.findByPk.mockResolvedValue(mockParentData);
      mockStudent.findByPk.mockResolvedValue(mockStudentData);
      mockParentStudentRelation.create.mockResolvedValue(mockRelation);

      const result = await parentService.addStudentRelation(parentId, studentId, relationship);

      expect(result).toEqual(mockRelation);
      expect(mockParent.findByPk).toHaveBeenCalledWith(parentId);
      expect(mockStudent.findByPk).toHaveBeenCalledWith(studentId);
      expect(mockParentStudentRelation.create).toHaveBeenCalledWith({
        parentId,
        studentId,
        relationship
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理家长不存在的情况', async () => {
      mockParent.findByPk.mockResolvedValue(null);

      await expect(parentService.addStudentRelation(999, 1, 'father')).rejects.toThrow('家长不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理学生不存在的情况', async () => {
      mockParent.findByPk.mockResolvedValue({ id: 1 });
      mockStudent.findByPk.mockResolvedValue(null);

      await expect(parentService.addStudentRelation(1, 999, 'father')).rejects.toThrow('学生不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
