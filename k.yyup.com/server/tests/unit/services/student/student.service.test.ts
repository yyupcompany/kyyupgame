import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock dependencies
jest.mock('../../../../../src/init');
jest.mock('../../../../../src/models/student.model');
jest.mock('../../../../../src/models/kindergarten.model');
jest.mock('../../../../../src/models/class.model');
jest.mock('../../../../../src/models/parent-student-relation.model');
jest.mock('../../../../../src/models/user.model');
jest.mock('../../../../../src/utils/apiError');
jest.mock('../../../../../src/utils/search-helper');

import { StudentService } from '../../../../../src/services/student/student.service';
import { Student } from '../../../../../src/models/student.model';
import { Kindergarten } from '../../../../../src/models/kindergarten.model';
import { Class } from '../../../../../src/models/class.model';
import { ParentStudentRelation } from '../../../../../src/models/parent-student-relation.model';
import { User } from '../../../../../src/models/user.model';
import { ApiError } from '../../../../../src/utils/apiError';
import { sequelize } from '../../../../../src/init';
import { SearchHelper } from '../../../../../src/utils/search-helper';

// Mock instances
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

// Mock model instances
const mockStudentModel = {
  create: jest.fn(),
  findOne: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  sequelize: mockSequelize
};

const mockKindergartenModel = {
  findByPk: jest.fn()
};

const mockClassModel = {
  findByPk: jest.fn()
};

const mockParentStudentRelationModel = {
  findAll: jest.fn()
};

const mockUserModel = {
  findAll: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(Student as any) = mockStudentModel;
(Kindergarten as any) = mockKindergartenModel;
(Class as any) = mockClassModel;
(ParentStudentRelation as any) = mockParentStudentRelationModel;
(User as any) = mockUserModel;

// Mock SearchHelper
const mockSearchHelper = {
  buildSearchQuery: jest.fn(),
  configs: {
    student: {
      searchableFields: ['name', 'studentNo'],
      filterableFields: ['status', 'gender', 'kindergartenId', 'classId'],
      sortableFields: ['createdAt', 'name', 'studentNo']
    }
  }
};

(SearchHelper as any) = mockSearchHelper;


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

describe('StudentService', () => {
  let studentService: StudentService;

  beforeEach(() => {
    jest.clearAllMocks();
    studentService = new StudentService();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('createStudent', () => {
    it('should create student successfully', async () => {
      const dto = {
        name: '张小明',
        studentNo: 'STU001',
        gender: 1,
        birthDate: '2018-05-15',
        kindergartenId: 1,
        classId: 1,
        enrollmentDate: '2024-01-15',
        status: 1,
        interests: ['画画', '音乐'],
        tags: ['聪明', '活泼']
      };

      const mockKindergarten = { id: 1, name: '阳光幼儿园' };
      const mockClass = { id: 1, name: '大班A' };
      const mockCreatedStudent = { id: 1, ...dto };

      mockStudentModel.findOne.mockResolvedValue(null);
      mockKindergartenModel.findByPk.mockResolvedValue(mockKindergarten);
      mockClassModel.findByPk.mockResolvedValue(mockClass);
      mockStudentModel.create.mockResolvedValue(mockCreatedStudent);

      // Mock getStudentById to return the created student
      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockCreatedStudent);

      const result = await studentService.createStudent(dto, 1);

      expect(result).toEqual(mockCreatedStudent);
      expect(mockStudentModel.findOne).toHaveBeenCalledWith({
        where: { studentNo: dto.studentNo },
        transaction: mockTransaction
      });
      expect(mockStudentModel.create).toHaveBeenCalledWith({
        ...dto,
        status: 1,
        birthDate: new Date(dto.birthDate),
        enrollmentDate: new Date(dto.enrollmentDate),
        interests: '画画,音乐',
        tags: '聪明,活泼',
        creatorId: 1,
        updaterId: 1
      }, { transaction: mockTransaction });
    });

    it('should throw error if student number already exists', async () => {
      const dto = {
        name: '张小明',
        studentNo: 'STU001',
        kindergartenId: 1
      };

      mockStudentModel.findOne.mockResolvedValue({ id: 1, studentNo: 'STU001' });

      await expect(studentService.createStudent(dto, 1)).rejects.toThrow('学号已存在');
    });

    it('should throw error if kindergarten does not exist', async () => {
      const dto = {
        name: '张小明',
        studentNo: 'STU001',
        kindergartenId: 999
      };

      mockStudentModel.findOne.mockResolvedValue(null);
      mockKindergartenModel.findByPk.mockResolvedValue(null);

      await expect(studentService.createStudent(dto, 1)).rejects.toThrow('指定的幼儿园不存在');
    });

    it('should throw error if class does not exist', async () => {
      const dto = {
        name: '张小明',
        studentNo: 'STU001',
        kindergartenId: 1,
        classId: 999
      };

      mockStudentModel.findOne.mockResolvedValue(null);
      mockKindergartenModel.findByPk.mockResolvedValue({ id: 1, name: 'Test' });
      mockClassModel.findByPk.mockResolvedValue(null);

      await expect(studentService.createStudent(dto, 1)).rejects.toThrow('指定的班级不存在');
    });
  });

  describe('getStudents', () => {
    it('should return students with filters', async () => {
      const filters = {
        page: 1,
        pageSize: 10,
        keyword: '张',
        kindergartenId: 1,
        classId: 1,
        status: 1,
        gender: 1,
        sortBy: 'name',
        sortOrder: 'ASC' as const
      };

      const mockCountResult = [{ total: 2 }];
      const mockDataResult = [
        { id: 1, name: '张小明', kindergarten_id: 1, kindergarten_name: '阳光幼儿园', class_id: 1, class_name: '大班A' },
        { id: 2, name: '张小红', kindergarten_id: 1, kindergarten_name: '阳光幼儿园', class_id: 1, class_name: '大班A' }
      ];

      mockSearchHelper.buildSearchQuery.mockReturnValue({
        whereClause: 's.name LIKE :keyword AND s.kindergarten_id = :kindergartenId',
        orderBy: 'ORDER BY s.name ASC',
        limit: 10,
        offset: 0,
        replacements: { keyword: '%张%', kindergartenId: 1 }
      });

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      const result = await studentService.getStudents(filters);

      expect(result).toEqual({
        rows: [
          {
            id: 1,
            name: '张小明',
            kindergarten_id: 1,
            kindergarten_name: '阳光幼儿园',
            class_id: 1,
            class_name: '大班A',
            kindergarten: { id: 1, name: '阳光幼儿园' },
            class: { id: 1, name: '大班A' }
          },
          {
            id: 2,
            name: '张小红',
            kindergarten_id: 1,
            kindergarten_name: '阳光幼儿园',
            class_id: 1,
            class_name: '大班A',
            kindergarten: { id: 1, name: '阳光幼儿园' },
            class: { id: 1, name: '大班A' }
          }
        ],
        count: 2
      });
    });

    it('should handle database connection error', async () => {
      mockStudentModel.sequelize = null;

      await expect(studentService.getStudents({})).rejects.toThrow('数据库连接不可用');
    });
  });

  describe('searchStudents', () => {
    it('should call getStudents with status=1 filter', async () => {
      const filters = { keyword: '张', page: 1, pageSize: 10 };
      const mockResult = { rows: [], count: 0 };

      jest.spyOn(studentService, 'getStudents').mockResolvedValue(mockResult);

      const result = await studentService.searchStudents(filters);

      expect(result).toEqual(mockResult);
      expect(studentService.getStudents).toHaveBeenCalledWith({ ...filters, status: 1 });
    });
  });

  describe('getAvailableStudents', () => {
    it('should call getStudents with status=1 and classId=null filters', async () => {
      const filters = { keyword: '张', page: 1, pageSize: 10 };
      const mockResult = { rows: [], count: 0 };

      jest.spyOn(studentService, 'getStudents').mockResolvedValue(mockResult);

      const result = await studentService.getAvailableStudents(filters);

      expect(result).toEqual(mockResult);
      expect(studentService.getStudents).toHaveBeenCalledWith({ ...filters, status: 1, classId: null });
    });
  });

  describe('getStudentById', () => {
    it('should return student by id', async () => {
      const studentId = 1;
      const mockStudentData = [{
        id: 1,
        name: '张小明',
        kindergarten_id: 1,
        kindergarten_name: '阳光幼儿园',
        class_id: 1,
        class_name: '大班A'
      }];

      mockSequelize.query.mockResolvedValue(mockStudentData);

      const result = await studentService.getStudentById(studentId);

      expect(result).toEqual({
        id: 1,
        name: '张小明',
        kindergarten_id: 1,
        kindergarten_name: '阳光幼儿园',
        class_id: 1,
        class_name: '大班A',
        kindergarten: { id: 1, name: '阳光幼儿园' },
        class: { id: 1, name: '大班A' }
      });
    });

    it('should throw error if student not found', async () => {
      mockSequelize.query.mockResolvedValue([]);

      await expect(studentService.getStudentById(999)).rejects.toThrow('学生不存在');
    });

    it('should handle database connection error', async () => {
      mockStudentModel.sequelize = null;

      await expect(studentService.getStudentById(1)).rejects.toThrow('数据库连接不可用');
    });
  });

  describe('getStudentParents', () => {
    it('should return student parents', async () => {
      const studentId = 1;
      const mockParentsData = [{
        id: 1,
        user_id: 1,
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        real_name: '张三'
      }];

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue({ id: 1 });
      mockSequelize.query.mockResolvedValue(mockParentsData);

      const result = await studentService.getStudentParents(studentId);

      expect(result).toEqual([{
        id: 1,
        user_id: 1,
        username: 'zhangsan',
        email: 'zhangsan@example.com',
        real_name: '张三',
        user: { id: 1, username: 'zhangsan', email: 'zhangsan@example.com', realName: '张三' }
      }]);
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(studentService, 'getStudentById' as any).mockRejectedValue(new ApiError('学生不存在', 404));

      await expect(studentService.getStudentParents(999)).rejects.toThrow('学生不存在');
    });
  });

  describe('updateStudent', () => {
    it('should update student successfully', async () => {
      const studentId = 1;
      const dto = {
        name: '张小明明',
        interests: ['画画', '运动'],
        tags: ['聪明']
      };

      const mockExistingStudent = { id: 1, name: '张小明' };
      const mockUpdatedStudent = { id: 1, name: '张小明明' };

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockExistingStudent);
      mockStudentModel.update.mockResolvedValue([1]);
      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockUpdatedStudent);

      const result = await studentService.updateStudent(studentId, dto, 1);

      expect(result).toEqual(mockUpdatedStudent);
      expect(mockStudentModel.update).toHaveBeenCalledWith({
        name: '张小明明',
        interests: '画画,运动',
        tags: '聪明',
        updaterId: 1
      }, { where: { id: studentId } });
    });

    it('should throw error if student not found', async () => {
      jest.spyOn(studentService, 'getStudentById' as any).mockRejectedValue(new ApiError('学生不存在', 404));

      await expect(studentService.updateStudent(999, {}, 1)).rejects.toThrow('学生不存在');
    });
  });

  describe('deleteStudent', () => {
    it('should delete student successfully', async () => {
      const studentId = 1;
      const mockStudent = { id: 1, name: '张小明' };

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockStudent);
      mockStudentModel.update.mockResolvedValue([1]);
      mockStudentModel.destroy.mockResolvedValue(1);

      await expect(studentService.deleteStudent(studentId, 1)).resolves.not.toThrow();
      expect(mockStudentModel.update).toHaveBeenCalledWith({ updaterId: 1 }, { where: { id: studentId } });
      expect(mockStudentModel.destroy).toHaveBeenCalledWith({ where: { id: studentId } });
    });

    it('should handle student not found gracefully', async () => {
      jest.spyOn(studentService, 'getStudentById' as any).mockRejectedValue(new ApiError('学生不存在', 404));

      await expect(studentService.deleteStudent(999, 1)).resolves.not.toThrow();
    });
  });

  describe('assignStudentToClass', () => {
    it('should assign student to class successfully', async () => {
      const dto = { studentId: 1, classId: 2 };
      const mockStudent = { id: 1, name: '张小明' };
      const mockClass = { id: 2, name: '中班B' };
      const mockUpdatedStudent = { id: 1, name: '张小明', classId: 2 };

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockStudent);
      mockClassModel.findByPk.mockResolvedValue(mockClass);
      mockStudentModel.update.mockResolvedValue([1]);
      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockUpdatedStudent);

      const result = await studentService.assignStudentToClass(dto, 1);

      expect(result).toEqual(mockUpdatedStudent);
      expect(mockStudentModel.update).toHaveBeenCalledWith({ classId: 2, updaterId: 1 }, { where: { id: 1 } });
    });

    it('should throw error if student not found', async () => {
      const dto = { studentId: 999, classId: 2 };

      jest.spyOn(studentService, 'getStudentById' as any).mockRejectedValue(new ApiError('学生不存在', 404));

      await expect(studentService.assignStudentToClass(dto, 1)).rejects.toThrow('学生不存在');
    });

    it('should throw error if class not found', async () => {
      const dto = { studentId: 1, classId: 999 };
      const mockStudent = { id: 1, name: '张小明' };

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockStudent);
      mockClassModel.findByPk.mockResolvedValue(null);

      await expect(studentService.assignStudentToClass(dto, 1)).rejects.toThrow('班级不存在');
    });
  });

  describe('batchAssignStudentsToClass', () => {
    it('should batch assign students to class successfully', async () => {
      const dto = { studentIds: [1, 2, 3], classId: 2 };
      const mockClass = { id: 2, name: '中班B' };

      mockClassModel.findByPk.mockResolvedValue(mockClass);
      mockStudentModel.update.mockResolvedValue([3]);

      const result = await studentService.batchAssignStudentsToClass(dto, 1);

      expect(result).toEqual({ updatedCount: 3 });
      expect(mockStudentModel.update).toHaveBeenCalledWith(
        { classId: 2, updaterId: 1 },
        { where: { id: { [Symbol.for('Op.in')]: [1, 2, 3] } } }
      );
    });

    it('should throw error if class not found', async () => {
      const dto = { studentIds: [1, 2, 3], classId: 999 };

      mockClassModel.findByPk.mockResolvedValue(null);

      await expect(studentService.batchAssignStudentsToClass(dto, 1)).rejects.toThrow('班级不存在');
    });
  });

  describe('updateStudentStatus', () => {
    it('should update student status successfully', async () => {
      const dto = { studentId: 1, status: 0 };
      const mockStudent = { id: 1, name: '张小明' };

      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockStudent);
      mockStudentModel.update.mockResolvedValue([1]);

      const result = await studentService.updateStudentStatus(dto, 1);

      expect(result).toEqual({ success: true });
      expect(mockStudentModel.update).toHaveBeenCalledWith({ status: 0, updaterId: 1 }, { where: { id: 1 } });
    });

    it('should throw error if student not found', async () => {
      const dto = { studentId: 999, status: 0 };

      jest.spyOn(studentService, 'getStudentById' as any).mockRejectedValue(new ApiError('学生不存在', 404));

      await expect(studentService.updateStudentStatus(dto, 1)).rejects.toThrow('学生不存在');
    });
  });

  describe('getStudentStats', () => {
    it('should return student statistics', async () => {
      const mockBasicStats = [{
        total: 100,
        active: 80,
        inactive: 20,
        male: 55,
        female: 45,
        assigned: 75,
        unassigned: 25
      }];

      const mockAgeStats = [
        { ageGroup: '3-4岁', count: 30 },
        { ageGroup: '4-5岁', count: 40 },
        { ageGroup: '5-6岁', count: 30 }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockBasicStats)
        .mockResolvedValueOnce(mockAgeStats);

      const result = await studentService.getStudentStats();

      expect(result).toEqual({
        success: true,
        message: '获取学生统计成功',
        data: {
          total: 100,
          active: 80,
          inactive: 20,
          male: 55,
          female: 45,
          assigned: 75,
          unassigned: 25,
          ageDistribution: mockAgeStats
        }
      });
    });

    it('should handle database connection error', async () => {
      mockStudentModel.sequelize = null;

      await expect(studentService.getStudentStats()).rejects.toThrow('数据库连接不可用');
    });

    it('should handle query errors', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await expect(studentService.getStudentStats()).rejects.toThrow('获取学生统计失败');
    });
  });

  describe('getStudentsByClass', () => {
    it('should return students by class', async () => {
      const params = {
        classId: '1',
        page: 1,
        pageSize: 10,
        keyword: '张'
      };

      const mockCountResult = [{ total: 2 }];
      const mockDataResult = [
        { id: 1, name: '张小明', gender: 1, className: '大班A' },
        { id: 2, name: '张小红', gender: 0, className: '大班A' }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockDataResult);

      const result = await studentService.getStudentsByClass(params);

      expect(result).toEqual({
        list: [
          { id: 1, name: '张小明', gender: '男', className: '大班A' },
          { id: 2, name: '张小红', gender: '女', className: '大班A' }
        ],
        total: 2,
        page: 1,
        pageSize: 10
      });
    });

    it('should handle database connection error', async () => {
      mockStudentModel.sequelize = null;

      await expect(studentService.getStudentsByClass({ classId: '1', page: 1, pageSize: 10 }))
        .rejects.toThrow('数据库连接不可用');
    });
  });

  describe('addToClass', () => {
    it('should add student to class successfully', async () => {
      const studentData = {
        name: '张小明',
        studentId: 'STU001',
        classId: '1',
        birthDate: '2018-05-15',
        enrollDate: '2024-01-15',
        gender: '男',
        healthStatus: ['healthy'],
        remarks: '备注',
        address: '地址'
      };

      const mockClass = { id: 1, name: '大班A' };
      const mockCreatedStudent = { id: 1, name: '张小明' };

      mockClassModel.findByPk.mockResolvedValue(mockClass);
      mockStudentModel.findOne.mockResolvedValue(null);
      mockStudentModel.create.mockResolvedValue(mockCreatedStudent);
      jest.spyOn(studentService, 'getStudentById' as any).mockResolvedValue(mockCreatedStudent);

      const result = await studentService.addToClass(studentData, 1);

      expect(result).toEqual(mockCreatedStudent);
      expect(mockStudentModel.create).toHaveBeenCalledWith({
        name: '张小明',
        studentNo: 'STU001',
        classId: 1,
        kindergartenId: 1,
        status: 1,
        birthDate: new Date('2018-05-15'),
        enrollmentDate: new Date('2024-01-15'),
        gender: 1,
        allergyHistory: 'healthy',
        remark: '备注',
        householdAddress: '地址',
        creatorId: 1,
        updaterId: 1
      }, { transaction: mockTransaction });
    });

    it('should throw error if class does not exist', async () => {
      const studentData = { name: '张小明', studentId: 'STU001', classId: '999' };

      mockClassModel.findByPk.mockResolvedValue(null);

      await expect(studentService.addToClass(studentData, 1)).rejects.toThrow('班级不存在');
    });

    it('should throw error if student number already exists', async () => {
      const studentData = { name: '张小明', studentId: 'STU001', classId: '1' };

      mockClassModel.findByPk.mockResolvedValue({ id: 1, name: '大班A' });
      mockStudentModel.findOne.mockResolvedValue({ id: 1, studentNo: 'STU001' });

      await expect(studentService.addToClass(studentData, 1)).rejects.toThrow('学号已存在');
    });
  });

  describe('removeClass', () => {
    it('should remove student from class successfully', async () => {
      const studentId = 1;
      const classId = '1';
      const mockStudent = { id: 1, classId: 1 };

      mockStudentModel.findByPk.mockResolvedValue(mockStudent);
      mockStudentModel.update.mockResolvedValue([1]);

      const result = await studentService.removeFromClass(studentId, classId, 1);

      expect(result).toBe(true);
      expect(mockStudentModel.update).toHaveBeenCalledWith(
        { classId: null, updaterId: 1 },
        { where: { id: studentId }, transaction: mockTransaction }
      );
    });

    it('should throw error if student not found', async () => {
      mockStudentModel.findByPk.mockResolvedValue(null);

      await expect(studentService.removeFromClass(1, '1', 1)).rejects.toThrow('学生不存在');
    });

    it('should throw error if student not in specified class', async () => {
      const studentId = 1;
      const classId = '2';
      const mockStudent = { id: 1, classId: 1 };

      mockStudentModel.findByPk.mockResolvedValue(mockStudent);

      await expect(studentService.removeFromClass(studentId, classId, 1)).rejects.toThrow('学生不在指定班级中');
    });
  });
});
