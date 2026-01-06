// Mock dependencies
jest.mock('../../../src/services/parent/parent.service');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { ParentController } from '../../../src/controllers/parent.controller';
import { ParentService } from '../../../src/services/parent/parent.service';

// Mock implementations
const mockParentService = {
  create: jest.fn(),
  list: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getByStudentId: jest.fn(),
  getByUserId: jest.fn(),
  updateContactInfo: jest.fn(),
  setAsPrimaryContact: jest.fn()
};

// Setup mocks
(ParentService as jest.MockedClass<typeof ParentService>).mockImplementation(() => mockParentService as any);

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('Parent Controller', () => {
  let parentController: ParentController;

  beforeEach(() => {
    jest.clearAllMocks();
    parentController = new ParentController();
  });

  describe('create', () => {
    it('应该成功创建家长', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        userId: 2,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: true,
        isLegalGuardian: true,
        contactPhone: '13800138000',
        contactEmail: 'father@example.com',
        workUnit: '某公司',
        occupation: '工程师',
        emergencyContact: '13900139000'
      };

      const mockCreatedParent = {
        id: 1,
        userId: 2,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: true,
        isLegalGuardian: true,
        contactPhone: '13800138000',
        contactEmail: 'father@example.com',
        workUnit: '某公司',
        occupation: '工程师',
        emergencyContact: '13900139000',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockParentService.create.mockResolvedValue(mockCreatedParent);

      await parentController.create(req as Request, res as Response, mockNext);

      expect(mockParentService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        data: mockCreatedParent,
        message: '家长创建成功'
      });
    });

    it('应该处理创建失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        userId: 2,
        studentId: 1,
        relationship: 'mother'
      };

      const serviceError = new Error('创建家长失败');
      mockParentService.create.mockRejectedValue(serviceError);

      await parentController.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });

    it('应该处理必填字段验证', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        // 缺少必填字段
      };

      const validationError = new Error('缺少必填字段');
      mockParentService.create.mockRejectedValue(validationError);

      await parentController.create(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });

  describe('list', () => {
    it('应该成功获取家长列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10',
        keyword: '张',
        studentId: '1',
        relationship: 'father',
        isPrimaryContact: 'true',
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      };

      const mockParentList = {
        data: [
          {
            id: 1,
            relationship: 'father',
            isPrimaryContact: true,
            isLegalGuardian: true,
            contactPhone: '13800138000',
            User: { id: 2, name: '张爸爸', email: 'father@example.com' },
            Student: { id: 1, name: '张小明', age: 5 }
          },
          {
            id: 2,
            relationship: 'mother',
            isPrimaryContact: false,
            isLegalGuardian: true,
            contactPhone: '13900139000',
            User: { id: 3, name: '张妈妈', email: 'mother@example.com' },
            Student: { id: 1, name: '张小明', age: 5 }
          }
        ],
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      };

      mockParentService.list.mockResolvedValue(mockParentList);

      await parentController.list(req as Request, res as Response, mockNext);

      expect(mockParentService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: '张',
        studentId: 1,
        userId: undefined,
        relationship: 'father',
        isPrimaryContact: true,
        isLegalGuardian: undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
      expect(res.json).toHaveBeenCalledWith({
        data: mockParentList,
        message: '获取家长列表成功'
      });
    });

    it('应该使用默认查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockEmptyList = {
        data: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0
      };

      mockParentService.list.mockResolvedValue(mockEmptyList);

      await parentController.list(req as Request, res as Response, mockNext);

      expect(mockParentService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        studentId: undefined,
        userId: undefined,
        relationship: undefined,
        isPrimaryContact: undefined,
        isLegalGuardian: undefined,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
    });

    it('应该处理布尔值查询参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        isPrimaryContact: 'false',
        isLegalGuardian: 'true'
      };

      const mockList = { data: [], total: 0, page: 1, pageSize: 10, totalPages: 0 };
      mockParentService.list.mockResolvedValue(mockList);

      await parentController.list(req as Request, res as Response, mockNext);

      expect(mockParentService.list).toHaveBeenCalledWith({
        page: 1,
        pageSize: 10,
        keyword: undefined,
        studentId: undefined,
        userId: undefined,
        relationship: undefined,
        isPrimaryContact: false,
        isLegalGuardian: true,
        sortBy: 'createdAt',
        sortOrder: 'DESC'
      });
    });

    it('应该处理获取列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('获取家长列表失败');
      mockParentService.list.mockRejectedValue(serviceError);

      await parentController.list(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getById', () => {
    it('应该成功获取家长详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockParent = {
        id: 1,
        userId: 2,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: true,
        isLegalGuardian: true,
        contactPhone: '13800138000',
        contactEmail: 'father@example.com',
        workUnit: '某公司',
        occupation: '工程师',
        emergencyContact: '13900139000',
        User: {
          id: 2,
          name: '张爸爸',
          email: 'father@example.com',
          avatar: '/avatars/father.jpg'
        },
        Student: {
          id: 1,
          name: '张小明',
          age: 5,
          gender: 'male',
          birthDate: '2019-03-15'
        }
      };

      mockParentService.getById.mockResolvedValue(mockParent);

      await parentController.getById(req as Request, res as Response, mockNext);

      expect(mockParentService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        data: mockParent,
        message: '获取家长详情成功'
      });
    });

    it('应该处理家长不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockParentService.getById.mockResolvedValue(null);

      await parentController.getById(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: '家长不存在'
      });
    });

    it('应该处理无效的家长ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      const validationError = new Error('无效的家长ID');
      mockParentService.getById.mockRejectedValue(validationError);

      await parentController.getById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });

  describe('update', () => {
    it('应该成功更新家长信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        contactPhone: '13800138001',
        contactEmail: 'updated@example.com',
        workUnit: '新公司',
        occupation: '高级工程师',
        emergencyContact: '13900139001'
      };

      const mockUpdatedParent = {
        id: 1,
        userId: 2,
        studentId: 1,
        relationship: 'father',
        isPrimaryContact: true,
        isLegalGuardian: true,
        contactPhone: '13800138001',
        contactEmail: 'updated@example.com',
        workUnit: '新公司',
        occupation: '高级工程师',
        emergencyContact: '13900139001',
        updatedAt: new Date()
      };

      mockParentService.update.mockResolvedValue(mockUpdatedParent);

      await parentController.update(req as Request, res as Response, mockNext);

      expect(mockParentService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        data: mockUpdatedParent,
        message: '家长信息更新成功'
      });
    });

    it('应该处理更新不存在的家长', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { contactPhone: '13800138001' };

      mockParentService.update.mockResolvedValue(null);

      await parentController.update(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: '家长不存在'
      });
    });

    it('应该处理更新失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = { contactPhone: 'invalid_phone' };

      const serviceError = new Error('更新家长信息失败');
      mockParentService.update.mockRejectedValue(serviceError);

      await parentController.update(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('delete', () => {
    it('应该成功删除家长', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      mockParentService.delete.mockResolvedValue(undefined);

      await parentController.delete(req as Request, res as Response, mockNext);

      expect(mockParentService.delete).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        message: '家长删除成功'
      });
    });

    it('应该处理删除不存在的家长', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockParentService.delete.mockResolvedValue(undefined);

      await parentController.delete(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: '家长不存在'
      });
    });

    it('应该处理删除失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const serviceError = new Error('删除家长失败');
      mockParentService.delete.mockRejectedValue(serviceError);

      await parentController.delete(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getByStudentId', () => {
    it('应该成功获取学生的家长列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { studentId: '1' };

      const mockParents = [
        {
          id: 1,
          relationship: 'father',
          isPrimaryContact: true,
          User: { id: 2, name: '张爸爸' }
        },
        {
          id: 2,
          relationship: 'mother',
          isPrimaryContact: false,
          User: { id: 3, name: '张妈妈' }
        }
      ];

      mockParentService.getByStudentId.mockResolvedValue(mockParents);

      await parentController.getByStudentId(req as Request, res as Response, mockNext);

      expect(mockParentService.getByStudentId).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        data: mockParents,
        message: '获取学生家长列表成功'
      });
    });

    it('应该处理学生无家长的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { studentId: '999' };

      mockParentService.getByStudentId.mockResolvedValue([]);

      await parentController.getByStudentId(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        data: [],
        message: '获取学生家长列表成功'
      });
    });

    it('应该处理获取失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { studentId: 'invalid' };

      const serviceError = new Error('获取学生家长列表失败');
      mockParentService.getByStudentId.mockRejectedValue(serviceError);

      await parentController.getByStudentId(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });
});
