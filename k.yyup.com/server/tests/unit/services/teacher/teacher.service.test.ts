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
const mockTeacher = {
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
  create: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockClass = {
  findAll: jest.fn()
};

const mockClassTeacher = {
  create: jest.fn(),
  destroy: jest.fn(),
  findAll: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/init', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../../src/services/teacher/teacher.service', () => ({
  TeacherService: jest.fn().mockImplementation(() => ({
    createTeacher: jest.fn(),
    getTeacherById: jest.fn(),
    getTeachers: jest.fn(),
    updateTeacher: jest.fn(),
    deleteTeacher: jest.fn(),
    assignToClass: jest.fn(),
    removeFromClass: jest.fn(),
    getTeacherClasses: jest.fn(),
    updateTeacherStatus: jest.fn(),
    getTeacherSchedule: jest.fn(),
    updateTeacherLevel: jest.fn(),
    addCertification: jest.fn(),
    removeCertification: jest.fn()
  }))
}));

jest.unstable_mockModule('../../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../../src/models/class-teacher.model', () => ({
  ClassTeacher: mockClassTeacher
}));

jest.unstable_mockModule('../../../../../../src/utils/apiError', () => ({
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

describe('Teacher Service', () => {
  let teacherService: any;
  let TeacherService: any;

  beforeAll(async () => {
    const { TeacherService: ImportedTeacherService } = await import('../../../../../../src/services/teacher/teacher.service');
    TeacherService = ImportedTeacherService;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    teacherService = new TeacherService();
  });

  describe('createTeacher', () => {
    it('应该成功创建教师', async () => {
      const teacherData = {
        userId: 1,
        kindergartenId: 1,
        name: '张老师',
        gender: 'female',
        birthDate: '1990-05-15',
        phone: '13800138000',
        email: 'zhang.teacher@example.com',
        address: '北京市朝阳区教师公寓123号',
        hireDate: '2024-01-15',
        education: '本科',
        major: '学前教育',
        salary: 8000.00,
        emergencyContact: '张三',
        emergencyPhone: '13900139000'
      };

      const mockCreatedTeacher = {
        id: 1,
        ...teacherData,
        employeeNumber: 'T2024001',
        status: 'active',
        level: 'junior',
        type: 'full_time',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, realName: '张老师' });
      mockKindergarten.findByPk.mockResolvedValue({ id: 1, name: '阳光幼儿园' });
      mockTeacher.findOne.mockResolvedValue(null); // 用户未关联教师
      mockTeacher.create.mockResolvedValue(mockCreatedTeacher);

      const result = await teacherService.createTeacher(teacherData);

      expect(result).toEqual(mockCreatedTeacher);
      expect(mockUser.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1, { transaction: mockTransaction });
      expect(mockTeacher.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...teacherData,
          employeeNumber: expect.any(String)
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理用户不存在的情况', async () => {
      const teacherData = {
        userId: 999,
        kindergartenId: 1,
        name: '测试老师'
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(teacherService.createTeacher(teacherData)).rejects.toThrow('用户不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理幼儿园不存在的情况', async () => {
      const teacherData = {
        userId: 1,
        kindergartenId: 999,
        name: '测试老师'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(teacherService.createTeacher(teacherData)).rejects.toThrow('幼儿园不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理用户已关联教师的情况', async () => {
      const teacherData = {
        userId: 1,
        kindergartenId: 1,
        name: '测试老师'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });
      mockTeacher.findOne.mockResolvedValue({ id: 1, userId: 1 });

      await expect(teacherService.createTeacher(teacherData)).rejects.toThrow('该用户已关联教师');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getTeacherById', () => {
    it('应该成功获取教师信息', async () => {
      const teacherId = 1;
      const mockTeacherData = {
        id: 1,
        name: '张老师',
        employeeNumber: 'T2024001',
        gender: 'female',
        status: 'active',
        level: 'intermediate',
        type: 'full_time',
        user: {
          id: 1,
          username: 'zhang.teacher',
          email: 'zhang.teacher@example.com'
        },
        kindergarten: {
          id: 1,
          name: '阳光幼儿园'
        },
        classes: [
          { id: 1, name: '小班A' },
          { id: 2, name: '小班B' }
        ]
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacherData);

      const result = await teacherService.getTeacherById(teacherId);

      expect(result).toEqual(mockTeacherData);
      expect(mockTeacher.findByPk).toHaveBeenCalledWith(teacherId, {
        include: expect.arrayContaining([
          expect.objectContaining({ model: expect.anything(), as: 'user' }),
          expect.objectContaining({ model: expect.anything(), as: 'kindergarten' }),
          expect.objectContaining({ model: expect.anything(), as: 'classes' })
        ])
      });
    });

    it('应该处理教师不存在的情况', async () => {
      const teacherId = 999;
      mockTeacher.findByPk.mockResolvedValue(null);

      await expect(teacherService.getTeacherById(teacherId)).rejects.toThrow('教师不存在');
    });
  });

  describe('getTeachers', () => {
    it('应该成功获取教师列表', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10,
        kindergartenId: 1,
        status: 'active',
        level: 'intermediate',
        search: '张'
      };

      const mockTeachers = [
        {
          id: 1,
          name: '张老师',
          employeeNumber: 'T2024001',
          status: 'active',
          level: 'intermediate'
        },
        {
          id: 2,
          name: '张教师',
          employeeNumber: 'T2024002',
          status: 'active',
          level: 'intermediate'
        }
      ];

      mockTeacher.findAll.mockResolvedValue(mockTeachers);
      mockTeacher.count.mockResolvedValue(2);

      const result = await teacherService.getTeachers(queryParams);

      expect(result).toEqual({
        teachers: mockTeachers,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });

      expect(mockTeacher.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          kindergartenId: 1,
          status: 'active',
          level: 'intermediate',
          [expect.any(Symbol)]: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({
                [expect.any(Symbol)]: '%张%'
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

    it('应该支持无筛选条件的查询', async () => {
      const queryParams = {
        page: 1,
        pageSize: 10
      };

      mockTeacher.findAll.mockResolvedValue([]);
      mockTeacher.count.mockResolvedValue(0);

      await teacherService.getTeachers(queryParams);

      expect(mockTeacher.findAll).toHaveBeenCalledWith({
        where: {},
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']],
        include: expect.any(Array)
      });
    });
  });

  describe('assignToClass', () => {
    it('应该成功分配教师到班级', async () => {
      const teacherId = 1;
      const classId = 1;

      const mockTeacher = {
        id: 1,
        name: '张老师',
        status: 'active'
      };

      const mockClass = {
        id: 1,
        name: '小班A',
        status: 'active'
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);
      mockClass.findByPk.mockResolvedValue(mockClass);
      mockClassTeacher.findAll.mockResolvedValue([]); // 没有现有关联
      mockClassTeacher.create.mockResolvedValue({ teacherId, classId });

      const result = await teacherService.assignToClass(teacherId, classId);

      expect(result).toBe(true);
      expect(mockTeacher.findByPk).toHaveBeenCalledWith(teacherId, { transaction: mockTransaction });
      expect(mockClass.findByPk).toHaveBeenCalledWith(classId, { transaction: mockTransaction });
      expect(mockClassTeacher.create).toHaveBeenCalledWith({
        teacherId,
        classId,
        assignedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理教师不存在的情况', async () => {
      const teacherId = 999;
      const classId = 1;

      mockTeacher.findByPk.mockResolvedValue(null);

      await expect(teacherService.assignToClass(teacherId, classId)).rejects.toThrow('教师不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理班级不存在的情况', async () => {
      const teacherId = 1;
      const classId = 999;

      mockTeacher.findByPk.mockResolvedValue({ id: 1 });
      mockClass.findByPk.mockResolvedValue(null);

      await expect(teacherService.assignToClass(teacherId, classId)).rejects.toThrow('班级不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理已分配的情况', async () => {
      const teacherId = 1;
      const classId = 1;

      mockTeacher.findByPk.mockResolvedValue({ id: 1 });
      mockClass.findByPk.mockResolvedValue({ id: 1 });
      mockClassTeacher.findAll.mockResolvedValue([{ teacherId, classId }]);

      await expect(teacherService.assignToClass(teacherId, classId)).rejects.toThrow('教师已分配到该班级');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('updateTeacherStatus', () => {
    it('应该成功更新教师状态', async () => {
      const teacherId = 1;
      const newStatus = 'on_leave';

      const mockTeacher = {
        id: 1,
        name: '张老师',
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      const result = await teacherService.updateTeacherStatus(teacherId, newStatus);

      expect(result).toBe(true);
      expect(mockTeacher.findByPk).toHaveBeenCalledWith(teacherId, { transaction: mockTransaction });
      expect(mockTeacher.update).toHaveBeenCalledWith({
        status: newStatus,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理无效状态的情况', async () => {
      const teacherId = 1;
      const invalidStatus = 'invalid_status';

      await expect(teacherService.updateTeacherStatus(teacherId, invalidStatus))
        .rejects.toThrow('无效的状态值');
    });
  });

  describe('updateTeacherLevel', () => {
    it('应该成功更新教师级别', async () => {
      const teacherId = 1;
      const newLevel = 'senior';

      const mockTeacher = {
        id: 1,
        name: '张老师',
        level: 'intermediate',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      const result = await teacherService.updateTeacherLevel(teacherId, newLevel);

      expect(result).toBe(true);
      expect(mockTeacher.findByPk).toHaveBeenCalledWith(teacherId, { transaction: mockTransaction });
      expect(mockTeacher.update).toHaveBeenCalledWith({
        level: newLevel,
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理无效级别的情况', async () => {
      const teacherId = 1;
      const invalidLevel = 'invalid_level';

      await expect(teacherService.updateTeacherLevel(teacherId, invalidLevel))
        .rejects.toThrow('无效的级别值');
    });
  });

  describe('addCertification', () => {
    it('应该成功添加资格证书', async () => {
      const teacherId = 1;
      const certification = '心理咨询师';

      const mockTeacher = {
        id: 1,
        name: '张老师',
        certifications: ['教师资格证', '普通话二级甲等'],
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      const result = await teacherService.addCertification(teacherId, certification);

      expect(result).toBe(true);
      expect(mockTeacher.update).toHaveBeenCalledWith({
        certifications: ['教师资格证', '普通话二级甲等', '心理咨询师'],
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理重复证书的情况', async () => {
      const teacherId = 1;
      const certification = '教师资格证';

      const mockTeacher = {
        id: 1,
        certifications: ['教师资格证', '普通话二级甲等']
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      await expect(teacherService.addCertification(teacherId, certification))
        .rejects.toThrow('该证书已存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('removeCertification', () => {
    it('应该成功移除资格证书', async () => {
      const teacherId = 1;
      const certification = '普通话二级甲等';

      const mockTeacher = {
        id: 1,
        name: '张老师',
        certifications: ['教师资格证', '普通话二级甲等', '心理咨询师'],
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      const result = await teacherService.removeCertification(teacherId, certification);

      expect(result).toBe(true);
      expect(mockTeacher.update).toHaveBeenCalledWith({
        certifications: ['教师资格证', '心理咨询师'],
        updatedAt: expect.any(Date)
      }, { transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理证书不存在的情况', async () => {
      const teacherId = 1;
      const certification = '不存在的证书';

      const mockTeacher = {
        id: 1,
        certifications: ['教师资格证', '普通话二级甲等']
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);

      await expect(teacherService.removeCertification(teacherId, certification))
        .rejects.toThrow('该证书不存在');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('deleteTeacher', () => {
    it('应该成功删除教师', async () => {
      const teacherId = 1;

      const mockTeacher = {
        id: 1,
        name: '测试老师',
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);
      mockClassTeacher.findAll.mockResolvedValue([]); // 没有班级关联

      const result = await teacherService.deleteTeacher(teacherId);

      expect(result).toBe(true);
      expect(mockTeacher.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理有班级关联时不能删除的情况', async () => {
      const teacherId = 1;

      const mockTeacher = {
        id: 1,
        name: '测试老师'
      };

      mockTeacher.findByPk.mockResolvedValue(mockTeacher);
      mockClassTeacher.findAll.mockResolvedValue([{ teacherId: 1, classId: 1 }]);

      await expect(teacherService.deleteTeacher(teacherId))
        .rejects.toThrow('教师还有班级关联，无法删除');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
