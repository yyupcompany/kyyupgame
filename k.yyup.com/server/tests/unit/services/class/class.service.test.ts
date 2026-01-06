import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockClass = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockStudent = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn()
};

const mockTeacher = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockClassStudent = {
  create: jest.fn(),
  destroy: jest.fn(),
  findOne: jest.fn()
};

const mockClassTeacher = {
  create: jest.fn(),
  destroy: jest.fn(),
  findOne: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    like: Symbol('like'),
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    in: Symbol('in'),
    or: Symbol('or'),
    and: Symbol('and')
  }
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/class.model', () => ({
  Class: mockClass
}));

jest.unstable_mockModule('../../../../../src/models/student.model', () => ({
  Student: mockStudent
}));

jest.unstable_mockModule('../../../../../src/models/teacher.model', () => ({
  Teacher: mockTeacher
}));

jest.unstable_mockModule('../../../../../src/models/kindergarten.model', () => ({
  Kindergarten: mockKindergarten
}));

jest.unstable_mockModule('../../../../../src/models/class-student.model', () => ({
  ClassStudent: mockClassStudent
}));

jest.unstable_mockModule('../../../../../src/models/class-teacher.model', () => ({
  ClassTeacher: mockClassTeacher
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
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

describe('Class Service', () => {
  let ClassService: any;
  let classService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/class/class.service');
    ClassService = imported.ClassService;
    classService = new ClassService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createClass', () => {
    it('应该成功创建班级', async () => {
      const classData = {
        name: '小班A',
        level: 'small',
        ageGroup: '3-4岁',
        capacity: 25,
        kindergartenId: 1,
        classroom: 'A101',
        description: '活泼好动的小班'
      };

      const mockCreatedClass = {
        id: 1,
        name: '小班A',
        level: 'small',
        ageGroup: '3-4岁',
        capacity: 25,
        kindergartenId: 1,
        classroom: 'A101',
        description: '活泼好动的小班',
        status: 'active',
        currentStudents: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1, name: '阳光幼儿园' });
      mockClass.create.mockResolvedValue(mockCreatedClass);

      const result = await classService.createClass(classData);

      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1);
      expect(mockClass.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '小班A',
          level: 'small',
          ageGroup: '3-4岁',
          capacity: 25,
          kindergartenId: 1,
          classroom: 'A101',
          description: '活泼好动的小班',
          status: 'active',
          currentStudents: 0
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedClass);
    });

    it('应该在幼儿园不存在时抛出错误', async () => {
      const classData = {
        name: '测试班级',
        level: 'small',
        capacity: 25,
        kindergartenId: 999
      };

      mockKindergarten.findByPk.mockResolvedValue(null);

      await expect(classService.createClass(classData))
        .rejects
        .toThrow('幼儿园不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该验证班级容量', async () => {
      const classData = {
        name: '测试班级',
        level: 'small',
        capacity: 0, // 无效容量
        kindergartenId: 1
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });

      await expect(classService.createClass(classData))
        .rejects
        .toThrow('班级容量必须大于0');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      const classData = {
        name: '测试班级',
        level: 'small',
        capacity: 25,
        kindergartenId: 1
      };

      mockKindergarten.findByPk.mockResolvedValue({ id: 1 });
      mockClass.create.mockRejectedValue(new Error('数据库错误'));

      await expect(classService.createClass(classData))
        .rejects
        .toThrow('数据库错误');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getClassById', () => {
    it('应该成功获取班级详情', async () => {
      const classId = 1;
      const mockClass = {
        id: 1,
        name: '小班A',
        level: 'small',
        capacity: 25,
        currentStudents: 22,
        status: 'active',
        kindergarten: { id: 1, name: '阳光幼儿园' },
        students: [
          { id: 1, name: '小明', age: 4 },
          { id: 2, name: '小红', age: 3 }
        ],
        teachers: [
          { id: 1, name: '张老师', role: 'main' },
          { id: 2, name: '李老师', role: 'assistant' }
        ]
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      const result = await classService.getClassById(classId);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId, {
        include: [
          {
            model: mockKindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name']
          },
          {
            model: mockStudent,
            as: 'students',
            through: { attributes: ['enrollmentDate', 'status'] }
          },
          {
            model: mockTeacher,
            as: 'teachers',
            through: { attributes: ['role', 'subject', 'assignedDate'] }
          }
        ]
      });
      expect(result).toEqual(mockClass);
    });

    it('应该在班级不存在时抛出错误', async () => {
      const classId = 999;

      mockClass.findByPk.mockResolvedValue(null);

      await expect(classService.getClassById(classId))
        .rejects
        .toThrow('班级不存在');
    });
  });

  describe('getClasses', () => {
    it('应该成功获取班级列表', async () => {
      const options = {
        page: 1,
        pageSize: 10,
        level: 'small',
        status: 'active',
        kindergartenId: 1
      };

      const mockClasses = [
        {
          id: 1,
          name: '小班A',
          level: 'small',
          capacity: 25,
          currentStudents: 22,
          status: 'active'
        },
        {
          id: 2,
          name: '小班B',
          level: 'small',
          capacity: 25,
          currentStudents: 20,
          status: 'active'
        }
      ];

      mockClass.findAll.mockResolvedValue(mockClasses);
      mockClass.count.mockResolvedValue(2);

      const result = await classService.getClasses(options);

      expect(mockClass.findAll).toHaveBeenCalledWith({
        where: {
          level: 'small',
          status: 'active',
          kindergartenId: 1
        },
        include: [
          {
            model: mockKindergarten,
            as: 'kindergarten',
            attributes: ['id', 'name']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        classes: mockClasses,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该支持搜索功能', async () => {
      const options = {
        search: '小班'
      };

      await classService.getClasses(options);

      expect(mockClass.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [mockSequelize.Op.or]: [
              { name: { [mockSequelize.Op.like]: '%小班%' } },
              { description: { [mockSequelize.Op.like]: '%小班%' } }
            ]
          })
        })
      );
    });

    it('应该支持分页查询', async () => {
      const options = {
        page: 2,
        pageSize: 5
      };

      mockClass.findAll.mockResolvedValue([]);
      mockClass.count.mockResolvedValue(12);

      const result = await classService.getClasses(options);

      expect(mockClass.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5
        })
      );

      expect(result).toEqual({
        classes: [],
        total: 12,
        page: 2,
        pageSize: 5,
        totalPages: 3
      });
    });
  });

  describe('updateClass', () => {
    it('应该成功更新班级信息', async () => {
      const classId = 1;
      const updateData = {
        name: '小班A（更新）',
        capacity: 26,
        description: '更新后的班级描述',
        classroom: 'A102'
      };

      const mockClass = {
        id: 1,
        name: '小班A',
        capacity: 25,
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      const result = await classService.updateClass(classId, updateData);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockClass.update).toHaveBeenCalledWith(updateData);
      expect(result).toBe(true);
    });

    it('应该在班级不存在时抛出错误', async () => {
      const classId = 999;
      const updateData = { name: '新名称' };

      mockClass.findByPk.mockResolvedValue(null);

      await expect(classService.updateClass(classId, updateData))
        .rejects
        .toThrow('班级不存在');
    });

    it('应该验证容量更新', async () => {
      const classId = 1;
      const updateData = { capacity: 15 }; // 小于当前学生数

      const mockClass = {
        id: 1,
        capacity: 25,
        currentStudents: 20,
        update: jest.fn()
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      await expect(classService.updateClass(classId, updateData))
        .rejects
        .toThrow('新容量不能小于当前学生数量');
    });
  });

  describe('deleteClass', () => {
    it('应该成功删除班级', async () => {
      const classId = 1;

      const mockClass = {
        id: 1,
        currentStudents: 0,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      const result = await classService.deleteClass(classId);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockClass.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在班级不存在时抛出错误', async () => {
      const classId = 999;

      mockClass.findByPk.mockResolvedValue(null);

      await expect(classService.deleteClass(classId))
        .rejects
        .toThrow('班级不存在');
    });

    it('应该在班级有学生时拒绝删除', async () => {
      const classId = 1;

      const mockClass = {
        id: 1,
        currentStudents: 5,
        destroy: jest.fn()
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      await expect(classService.deleteClass(classId))
        .rejects
        .toThrow('班级中还有学生，无法删除');

      expect(mockClass.destroy).not.toHaveBeenCalled();
    });
  });

  describe('addStudentToClass', () => {
    it('应该成功添加学生到班级', async () => {
      const classId = 1;
      const studentId = 2;
      const enrollmentData = {
        enrollmentDate: '2024-10-01',
        notes: '转班学生'
      };

      const mockClass = {
        id: 1,
        capacity: 25,
        currentStudents: 20,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockStudent = {
        id: 2,
        name: '小明',
        status: 'active'
      };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockClassStudent.findOne.mockResolvedValue(null); // 不存在重复关系
      mockClassStudent.create.mockResolvedValue({
        classId: 1,
        studentId: 2,
        enrollmentDate: '2024-10-01',
        notes: '转班学生'
      });

      const result = await classService.addStudentToClass(classId, studentId, enrollmentData);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockStudent.findByPk).toHaveBeenCalledWith(studentId);
      expect(mockClassStudent.findOne).toHaveBeenCalledWith({
        where: { classId: 1, studentId: 2 }
      });
      expect(mockClassStudent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          classId: 1,
          studentId: 2,
          enrollmentDate: '2024-10-01',
          notes: '转班学生'
        }),
        { transaction: mockTransaction }
      );
      expect(mockClass.update).toHaveBeenCalledWith(
        { currentStudents: 21 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该在班级已满时拒绝添加学生', async () => {
      const classId = 1;
      const studentId = 2;

      const mockClass = {
        id: 1,
        capacity: 25,
        currentStudents: 25 // 已满
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      await expect(classService.addStudentToClass(classId, studentId))
        .rejects
        .toThrow('班级已满，无法添加更多学生');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在学生已在班级中时抛出错误', async () => {
      const classId = 1;
      const studentId = 2;

      const mockClass = {
        id: 1,
        capacity: 25,
        currentStudents: 20
      };

      const mockStudent = { id: 2, status: 'active' };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockStudent.findByPk.mockResolvedValue(mockStudent);
      mockClassStudent.findOne.mockResolvedValue({ classId: 1, studentId: 2 }); // 已存在

      await expect(classService.addStudentToClass(classId, studentId))
        .rejects
        .toThrow('学生已在该班级中');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('removeStudentFromClass', () => {
    it('应该成功从班级移除学生', async () => {
      const classId = 1;
      const studentId = 2;

      const mockClass = {
        id: 1,
        currentStudents: 21,
        update: jest.fn().mockResolvedValue(undefined)
      };

      const mockClassStudent = {
        classId: 1,
        studentId: 2,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockClassStudent.findOne.mockResolvedValue(mockClassStudent);

      const result = await classService.removeStudentFromClass(classId, studentId);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockClassStudent.findOne).toHaveBeenCalledWith({
        where: { classId: 1, studentId: 2 }
      });
      expect(mockClassStudent.destroy).toHaveBeenCalledWith({ transaction: mockTransaction });
      expect(mockClass.update).toHaveBeenCalledWith(
        { currentStudents: 20 },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在学生不在班级中时抛出错误', async () => {
      const classId = 1;
      const studentId = 2;

      const mockClass = { id: 1, currentStudents: 21 };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockClassStudent.findOne.mockResolvedValue(null); // 不存在关系

      await expect(classService.removeStudentFromClass(classId, studentId))
        .rejects
        .toThrow('学生不在该班级中');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('assignTeacherToClass', () => {
    it('应该成功分配教师到班级', async () => {
      const classId = 1;
      const teacherId = 3;
      const assignmentData = {
        role: 'assistant',
        subject: '音乐',
        assignedDate: '2024-10-01'
      };

      const mockClass = { id: 1, name: '小班A' };
      const mockTeacher = { id: 3, name: '王老师', status: 'active' };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockTeacher.findByPk.mockResolvedValue(mockTeacher);
      mockClassTeacher.findOne.mockResolvedValue(null); // 不存在重复关系
      mockClassTeacher.create.mockResolvedValue({
        classId: 1,
        teacherId: 3,
        role: 'assistant',
        subject: '音乐',
        assignedDate: '2024-10-01'
      });

      const result = await classService.assignTeacherToClass(classId, teacherId, assignmentData);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockTeacher.findByPk).toHaveBeenCalledWith(teacherId);
      expect(mockClassTeacher.findOne).toHaveBeenCalledWith({
        where: { classId: 1, teacherId: 3 }
      });
      expect(mockClassTeacher.create).toHaveBeenCalledWith(
        expect.objectContaining({
          classId: 1,
          teacherId: 3,
          role: 'assistant',
          subject: '音乐',
          assignedDate: '2024-10-01'
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该在教师已分配到班级时抛出错误', async () => {
      const classId = 1;
      const teacherId = 3;

      const mockClass = { id: 1 };
      const mockTeacher = { id: 3, status: 'active' };

      mockClass.findByPk.mockResolvedValue(mockClass);
      mockTeacher.findByPk.mockResolvedValue(mockTeacher);
      mockClassTeacher.findOne.mockResolvedValue({ classId: 1, teacherId: 3 }); // 已存在

      await expect(classService.assignTeacherToClass(classId, teacherId))
        .rejects
        .toThrow('教师已分配到该班级');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getClassStatistics', () => {
    it('应该成功获取班级统计信息', async () => {
      const classId = 1;

      const mockClass = {
        id: 1,
        name: '小班A',
        capacity: 25,
        currentStudents: 22,
        students: [
          { gender: 'male', birthDate: '2020-01-01' },
          { gender: 'female', birthDate: '2020-06-01' },
          { gender: 'male', birthDate: '2019-12-01' }
        ],
        teachers: [
          { id: 1, name: '张老师' },
          { id: 2, name: '李老师' }
        ]
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      const result = await classService.getClassStatistics(classId);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId, {
        include: [
          {
            model: mockStudent,
            as: 'students',
            attributes: ['gender', 'birthDate', 'status']
          },
          {
            model: mockTeacher,
            as: 'teachers',
            attributes: ['id', 'name']
          }
        ]
      });

      expect(result).toEqual({
        totalStudents: 22,
        capacity: 25,
        occupancyRate: 88,
        genderDistribution: expect.any(Object),
        ageDistribution: expect.any(Object),
        teacherCount: 2
      });
    });

    it('应该在班级不存在时抛出错误', async () => {
      const classId = 999;

      mockClass.findByPk.mockResolvedValue(null);

      await expect(classService.getClassStatistics(classId))
        .rejects
        .toThrow('班级不存在');
    });
  });

  describe('updateClassStatus', () => {
    it('应该成功更新班级状态', async () => {
      const classId = 1;
      const status = 'inactive';

      const mockClass = {
        id: 1,
        status: 'active',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      const result = await classService.updateClassStatus(classId, status);

      expect(mockClass.findByPk).toHaveBeenCalledWith(classId);
      expect(mockClass.update).toHaveBeenCalledWith({ status: 'inactive' });
      expect(result).toBe(true);
    });

    it('应该在班级不存在时抛出错误', async () => {
      const classId = 999;
      const status = 'inactive';

      mockClass.findByPk.mockResolvedValue(null);

      await expect(classService.updateClassStatus(classId, status))
        .rejects
        .toThrow('班级不存在');
    });
  });
});
