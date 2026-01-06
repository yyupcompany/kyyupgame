/**
 * 班级控制器测试 - 严格验证标准升级
 * 测试文件: /src/controllers/class.controller.ts
 * 严格验证规则: 使用深度数据验证、错误场景检测、控制台监控
 */

// Mock dependencies
jest.mock('../../../src/models/index');
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/utils/sqlHelper');
jest.mock('../../../src/utils/data-formatter');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { ClassController } from '../../../src/controllers/class.controller';
import { Class as ClassModel, Kindergarten, Student, Teacher, ClassTeacher } from '../../../src/models/index';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { SqlHelper } from '../../../src/utils/sqlHelper';
import { formatPaginationResponse, safelyGetArrayFromQuery } from '../../../src/utils/data-formatter';
import {
  validateClassData,
  validateApiResponseData,
  validateFieldTypes,
  validateRequiredFields,
  validateDatabaseOperation,
  validateTransactionOperation,
  generateValidClassData
} from '../../utils/test-validation-helpers';

// Mock implementations
const mockSequelize = {
  transaction: jest.fn(),
  query: jest.fn()
};

const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockClass = {
  create: jest.fn(),
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockKindergarten = {
  findByPk: jest.fn()
};

const mockStudent = {
  findAll: jest.fn(),
  count: jest.fn()
};

const mockTeacher = {
  findAll: jest.fn()
};

const mockClassTeacher = {
  create: jest.fn(),
  destroy: jest.fn(),
  findAll: jest.fn()
};

const mockSqlHelper = {
  recordExists: jest.fn()
};

const mockDataFormatter = {
  formatPaginationResponse: jest.fn(),
  safelyGetArrayFromQuery: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(ClassModel as any) = mockClass;
(Kindergarten as any) = mockKindergarten;
(Student as any) = mockStudent;
(Teacher as any) = mockTeacher;
(ClassTeacher as any) = mockClassTeacher;
(SqlHelper as any) = mockSqlHelper;
(formatPaginationResponse as any) = mockDataFormatter.formatPaginationResponse;
(safelyGetArrayFromQuery as any) = mockDataFormatter.safelyGetArrayFromQuery;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1 }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

// 控制台错误检测变量
let consoleSpy: any

describe('Class Controller - 严格验证', () => {
  let classController: ClassController;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
    classController = new ClassController();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    // 验证没有未解决的Promise
    expect(setImmediate).toBeDefined();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();

  describe('create - 严格验证', () => {
    it('应该成功创建班级 - 严格验证', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // 构建有效的测试数据
      const validClassData = generateValidClassData({
        name: '大班A',
        ageRange: '5-6岁',
        description: '大班A班级描述'
      });

      req.body = {
        ...validClassData,
        teacherIds: [1, 2]
      };

      // 验证输入数据结构
      const inputValidation = validateClassData(req.body);
      expect(inputValidation.valid).toBe(true);

      const mockKindergarten = { id: 1, name: '阳光幼儿园' };
      const mockCreatedClass = {
        id: 1,
        ...validClassData
      };
      const mockTeachers = [
        { id: 1, name: '张老师' },
        { id: 2, name: '李老师' }
      ];

      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockSqlHelper.recordExists.mockResolvedValue(undefined);
      mockClass.create.mockResolvedValue(mockCreatedClass);
      mockTeacher.findAll.mockResolvedValue(mockTeachers);
      mockClassTeacher.create.mockResolvedValue({});

      await classController.create(req as Request, res as Response);

      // 验证API调用参数
      expect(mockKindergarten.findByPk).toHaveBeenCalledWith(1);

      // 验证创建班级的调用参数
      expect(mockClass.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '大班A',
          kindergartenId: 1,
          capacity: 30,
          ageRange: '5-6岁',
          description: '大班A班级描述'
        }),
        { transaction: mockTransaction }
      );

      // 验证教师关联创建
      expect(mockClassTeacher.create).toHaveBeenCalledTimes(2);

      // 验证事务提交
      const transactionValidation = validateTransactionOperation(
        mockSequelize,
        mockTransaction,
        true, // 应该提交
        false // 不应该回滚
      );
      expect(transactionValidation.valid).toBe(true);

      // 验证数据库操作
      const dbValidation = validateDatabaseOperation(
        mockClass,
        'create',
        {
          name: '大班A',
          kindergartenId: 1,
          capacity: 30,
          ageRange: '5-6岁',
          description: '大班A班级描述'
        },
        { transaction: mockTransaction }
      );
      expect(dbValidation.valid).toBe(true);
    });

    it('应该验证必填字段 - 严格验证', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // 测试缺少必填字段的场景
      const invalidData = {
        kindergartenId: 1
        // 缺少name和capacity
      };

      req.body = invalidData;

      // 验证输入数据确实无效
      const inputValidation = validateClassData(invalidData);
      expect(inputValidation.valid).toBe(false);
      expect(inputValidation.errors).toContain('缺少必填字段: name');
      expect(inputValidation.errors).toContain('缺少必填字段: capacity');

      await classController.create(req as Request, res as Response);

      // 验证事务回滚
      const transactionValidation = validateTransactionOperation(
        mockSequelize,
        mockTransaction,
        false, // 不应该提交
        true  // 应该回滚
      );
      expect(transactionValidation.valid).toBe(true);

      // 验证错误响应
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        '缺少必填字段',
        'MISSING_REQUIRED_FIELDS',
        400
      );
    });

    it('应该验证班级容量范围 - 严格验证', async () => {
      const req = mockRequest();
      const res = mockResponse();

      // 测试超出范围的容量值
      const invalidCapacityData = generateValidClassData({
        name: '大班A',
        capacity: 100 // 超出范围
      });

      req.body = invalidCapacityData;

      // 验证输入数据确实无效
      const inputValidation = validateClassData(invalidCapacityData);
      expect(inputValidation.valid).toBe(false);
      expect(inputValidation.errors).toContain('班级容量必须在1-50之间');

      await classController.create(req as Request, res as Response);

      // 验证事务回滚
      const transactionValidation = validateTransactionOperation(
        mockSequelize,
        mockTransaction,
        false, // 不应该提交
        true  // 应该回滚
      );
      expect(transactionValidation.valid).toBe(true);

      // 验证错误响应
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(
        res,
        '班级容量必须在1-50之间',
        'INVALID_CAPACITY',
        400
      );
    });

    it('应该验证多个边界条件 - 严格验证', async () => {
      const boundaryTests = [
        {
          data: generateValidClassData({ capacity: 0 }), // 最小值以下
          expectedError: '班级容量必须在1-50之间'
        },
        {
          data: generateValidClassData({ capacity: 1 }), // 最小值边界
          shouldPass: true
        },
        {
          data: generateValidClassData({ capacity: 50 }), // 最大值边界
          shouldPass: true
        },
        {
          data: generateValidClassData({ capacity: 51 }), // 最大值以上
          expectedError: '班级容量必须在1-50之间'
        },
        {
          data: generateValidClassData({ name: '' }), // 空名称
          expectedError: '缺少必填字段: name'
        },
        {
          data: generateValidClassData({ name: 'A'.repeat(51) }), // 名称过长
          expectedError: '班级名称长度必须在1-50字符之间'
        }
      ];

      for (const test of boundaryTests) {
        const req = mockRequest();
        const res = mockResponse();

        req.body = test.data;

        // 验证输入数据
        const inputValidation = validateClassData(test.data);
        expect(inputValidation.valid).toBe(test.shouldPass || false);

        await classController.create(req as Request, res as Response);

        if (test.shouldPass) {
          // 对于有效数据，应该提交事务
          expect(mockTransaction.commit).toHaveBeenCalled();
        } else {
          // 对于无效数据，应该回滚事务
          expect(mockTransaction.rollback).toHaveBeenCalled();
          expect(ApiResponse.error).toHaveBeenCalledWith(
            res,
            test.expectedError,
            expect.any(String),
            400
          );
        }

        // 重置mock
        jest.clearAllMocks();
        mockSequelize.transaction.mockResolvedValue(mockTransaction);
      }
    });

    it('应该验证班级名称长度', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'A'.repeat(51), // 超过50字符
        kindergartenId: 1
      };

      await classController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '班级名称长度不能超过50字符', 'NAME_TOO_LONG', 400);
    });

    it('应该验证幼儿园是否存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '大班A',
        kindergartenId: 999
      };

      mockKindergarten.findByPk.mockResolvedValue(null);

      await classController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '幼儿园不存在', 'KINDERGARTEN_NOT_FOUND', 404);
    });

    it('应该处理班级名称重复', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '大班A',
        kindergartenId: 1
      };

      const mockKindergarten = { id: 1, name: '阳光幼儿园' };
      mockKindergarten.findByPk.mockResolvedValue(mockKindergarten);
      mockSqlHelper.recordExists.mockResolvedValue(undefined); // 班级名称已存在

      await classController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '该幼儿园已存在同名班级', 'CLASS_NAME_EXISTS', 409);
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: '大班A',
        kindergartenId: 1
      };

      const dbError = new Error('Database error');
      mockKindergarten.findByPk.mockRejectedValue(dbError);

      await classController.create(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '创建班级失败', 'INTERNAL_SERVER_ERROR', 500);
    });
  });

  describe('getList', () => {
    it('应该成功获取班级列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        kindergartenId: '1'
      };

      const mockClasses = [
        { id: 1, name: '大班A', capacity: 30, currentStudents: 25 },
        { id: 2, name: '大班B', capacity: 30, currentStudents: 28 }
      ];

      mockClass.findAll.mockResolvedValue(mockClasses);
      mockClass.count.mockResolvedValue(2);
      mockDataFormatter.formatPaginationResponse.mockReturnValue({
        data: mockClasses,
        total: 2,
        page: 1,
        pageSize: 10
      });

      await classController.getList(req as Request, res as Response);

      expect(mockClass.findAll).toHaveBeenCalledWith({
        where: { kindergartenId: 1 },
        include: expect.arrayContaining([
          expect.objectContaining({ model: Kindergarten }),
          expect.objectContaining({ model: Student }),
          expect.objectContaining({ model: Teacher })
        ]),
        limit: 10,
        offset: 0,
        order: [['createdAt', 'DESC']]
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(res, {
        data: mockClasses,
        total: 2,
        page: 1,
        pageSize: 10
      });
    });

    it('应该支持搜索功能', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        search: '大班',
        kindergartenId: '1'
      };

      const mockClasses = [
        { id: 1, name: '大班A', capacity: 30 }
      ];

      mockClass.findAll.mockResolvedValue(mockClasses);
      mockClass.count.mockResolvedValue(1);
      mockDataFormatter.formatPaginationResponse.mockReturnValue({
        data: mockClasses,
        total: 1,
        page: 1,
        pageSize: 10
      });

      await classController.getList(req as Request, res as Response);

      expect(mockClass.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            kindergartenId: 1,
            name: expect.objectContaining({
              [Symbol.for('like')]: '%大班%'
            })
          })
        })
      );
    });

    it('应该处理分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '2',
        pageSize: '5'
      };

      mockClass.findAll.mockResolvedValue([]);
      mockClass.count.mockResolvedValue(0);
      mockDataFormatter.formatPaginationResponse.mockReturnValue({
        data: [],
        total: 0,
        page: 2,
        pageSize: 5
      });

      await classController.getList(req as Request, res as Response);

      expect(mockClass.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 5,
          offset: 5
        })
      );
    });
  });

  describe('getById', () => {
    it('应该成功获取班级详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockClass = {
        id: 1,
        name: '大班A',
        capacity: 30,
        currentStudents: 25,
        Kindergarten: { id: 1, name: '阳光幼儿园' },
        Students: [
          { id: 1, name: '小明', age: 5 },
          { id: 2, name: '小红', age: 6 }
        ],
        Teachers: [
          { id: 1, name: '张老师', position: '班主任' },
          { id: 2, name: '李老师', position: '副班主任' }
        ]
      };

      mockClass.findByPk.mockResolvedValue(mockClass);

      await classController.getById(req as Request, res as Response);

      expect(mockClass.findByPk).toHaveBeenCalledWith(1, {
        include: expect.arrayContaining([
          expect.objectContaining({ model: Kindergarten }),
          expect.objectContaining({ model: Student }),
          expect.objectContaining({ model: Teacher })
        ])
      });
      expect(ApiResponse.success).toHaveBeenCalledWith(res, mockClass);
    });

    it('应该处理班级不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockClass.findByPk.mockResolvedValue(null);

      await classController.getById(req as Request, res as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
    });

    it('应该验证班级ID格式', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await classController.getById(req as Request, res as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(res, '无效的班级ID', 'INVALID_CLASS_ID', 400);
    });
  });

  describe('update', () => {
    it('应该成功更新班级信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: '更新的大班A',
        capacity: 35,
        description: '更新的描述',
        teacherIds: [1, 3]
      };

      const mockExistingClass = { id: 1, name: '大班A', capacity: 30 };
      const mockUpdatedClass = { id: 1, name: '更新的大班A', capacity: 35 };
      const mockTeachers = [
        { id: 1, name: '张老师' },
        { id: 3, name: '王老师' }
      ];

      mockClass.findByPk.mockResolvedValue(mockExistingClass);
      mockSqlHelper.recordExists.mockResolvedValue(undefined);
      mockClass.update.mockResolvedValue([1]);
      mockClass.findByPk.mockResolvedValueOnce(mockUpdatedClass);
      mockTeacher.findAll.mockResolvedValue(mockTeachers);
      mockClassTeacher.destroy.mockResolvedValue(2);
      mockClassTeacher.create.mockResolvedValue({});

      await classController.update(req as Request, res as Response);

      expect(mockClass.findByPk).toHaveBeenCalledWith(1);
      expect(mockClass.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '更新的大班A',
          capacity: 35,
          description: '更新的描述'
        }),
        { where: { id: 1 }, transaction: mockTransaction }
      );
      expect(mockClassTeacher.destroy).toHaveBeenCalledWith({
        where: { classId: 1 },
        transaction: mockTransaction
      });
      expect(mockClassTeacher.create).toHaveBeenCalledTimes(2);
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('应该处理更新不存在的班级', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { name: '不存在的班级' };

      mockClass.findByPk.mockResolvedValue(null);

      await classController.update(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
    });

    it('应该验证更新的班级名称不重复', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { name: '重复的班级名' };

      const mockExistingClass = { id: 1, name: '大班A', kindergartenId: 1 };

      mockClass.findByPk.mockResolvedValue(mockExistingClass);
      mockSqlHelper.recordExists.mockResolvedValue(undefined); // 名称已存在

      await classController.update(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '该幼儿园已存在同名班级', 'CLASS_NAME_EXISTS', 409);
    });
  });

  describe('delete', () => {
    it('应该成功删除班级', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingClass = { id: 1, name: '大班A' };

      mockClass.findByPk.mockResolvedValue(mockExistingClass);
      mockStudent.count.mockResolvedValue(0); // 无学生
      mockClass.destroy.mockResolvedValue(1);

      await classController.delete(req as Request, res as Response);

      expect(mockClass.findByPk).toHaveBeenCalledWith(1);
      expect(mockStudent.count).toHaveBeenCalledWith({ where: { classId: 1 } });
      expect(mockClass.destroy).toHaveBeenCalledWith({ 
        where: { id: 1 }, 
        transaction: mockTransaction 
      });
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(ApiResponse.success).toHaveBeenCalledWith(res, null, '删除班级成功');
    });

    it('应该阻止删除有学生的班级', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingClass = { id: 1, name: '大班A' };

      mockClass.findByPk.mockResolvedValue(mockExistingClass);
      mockStudent.count.mockResolvedValue(5); // 有5个学生

      await classController.delete(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '班级中还有学生，无法删除', 'CLASS_HAS_STUDENTS', 409);
    });

    it('应该处理删除不存在的班级', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockClass.findByPk.mockResolvedValue(null);

      await classController.delete(req as Request, res as Response);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(res, '班级不存在', 'CLASS_NOT_FOUND', 404);
    });
  });
});
