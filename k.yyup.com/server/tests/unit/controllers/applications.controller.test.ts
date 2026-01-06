/**
 * 申请控制器测试
 */

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { ApplicationsController } from '../../../src/controllers/applications.controller';
import { sequelize } from '../../../src/init';

// 模拟依赖
jest.mock('../../../src/init');


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

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    controller = new ApplicationsController();
    mockRequest = {
      body: {},
      query: {},
      params: {},
      user: { id: 1 }
    };
    jsonSpy = jest.fn();
    mockResponse = {
      json: jsonSpy
    };

    // 重置所有模拟
    jest.clearAllMocks();
  });

  describe('getApplications', () => {
    it('应该成功获取申请列表', async () => {
      const mockApplications = [
        {
          id: 1,
          studentName: '张三',
          studentGender: 1,
          studentBirthday: '2020-01-01',
          parentName: '李四',
          phone: '13800138000',
          email: 'test@example.com',
          address: '测试地址',
          status: 1,
          createdAt: '2024-01-01',
          interviewTime: '2024-01-10',
          notes: '测试备注',
          className: '小班',
          gradeLevel: 1
        }
      ];

      const mockCount = [{ total: 25 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockApplications)
        .mockResolvedValueOnce(mockCount);

      mockRequest.query = {
        page: '2',
        pageSize: '10',
        status: '1',
        keyword: '张'
      };

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledTimes(2);
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT ea.id, ea.student_name as studentName'),
        expect.objectContaining({
          type: 'SELECT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取申请列表成功',
        data: {
          applications: expect.arrayContaining([
            expect.objectContaining({
              id: 1,
              studentName: '张三',
              parentName: '李四',
              phone: '13800138000',
              status: 1,
              className: '小班'
            })
          ]),
          pagination: {
            total: 25,
            page: 2,
            pageSize: 10,
            totalPages: 3
          }
        }
      });
    });

    it('应该使用默认分页参数', async () => {
      const mockApplications = [];
      const mockCount = [{ total: 5 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockApplications)
        .mockResolvedValueOnce(mockCount);

      mockRequest.query = {}; // 空查询参数

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '获取申请列表成功',
        data: {
          applications: [],
          pagination: {
            total: 5,
            page: 1,
            pageSize: 10,
            totalPages: 1
          }
        }
      });
    });

    it('应该正确构建查询条件', async () => {
      const mockApplications = [];
      const mockCount = [{ total: 0 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockApplications)
        .mockResolvedValueOnce(mockCount);

      mockRequest.query = {
        status: '2',
        keyword: '测试'
      };

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      const queryCall = (sequelize.query as jest.Mock).mock.calls[0][0];
      
      expect(queryCall).toContain('ea.status = 2');
      expect(queryCall).toContain('ea.student_name LIKE \'%测试%\'');
      expect(queryCall).toContain('ea.parent_name LIKE \'%测试%\'');
      expect(queryCall).toContain('ea.phone LIKE \'%测试%\'');
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('数据库连接失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '获取申请列表失败',
        error: {
          code: 'SERVER_ERROR',
          message: expect.any(String)
        }
      });
    });
  });

  describe('createApplication', () => {
    it('应该成功创建申请', async () => {
      const mockResult = [[1]]; // 插入ID

      (sequelize.query as jest.Mock).mockResolvedValue(mockResult);

      mockRequest.body = {
        studentName: '张三',
        studentGender: 1,
        studentBirthday: '2020-01-01',
        parentName: '李四',
        phone: '13800138000',
        email: 'test@example.com',
        address: '测试地址',
        targetClassId: 1,
        notes: '测试备注'
      };

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO enrollment_applications'),
        expect.objectContaining({
          replacements: [
            '张三',
            1,
            '2020-01-01',
            '李四',
            '13800138000',
            'test@example.com',
            '测试地址',
            1,
            '测试备注',
            1
          ],
          type: 'INSERT'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '创建申请成功',
        data: expect.objectContaining({
          id: 1,
          studentName: '张三',
          parentName: '李四',
          phone: '13800138000',
          status: 1
        })
      });
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('创建失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.body = {
        studentName: '张三',
        parentName: '李四',
        phone: '13800138000'
      };

      await controller.createApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '创建申请失败',
        error: {
          code: 'SERVER_ERROR',
          message: expect.any(String)
        }
      });
    });
  });

  describe('updateApplicationStatus', () => {
    it('应该成功更新申请状态', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 2,
        notes: '面试安排',
        interviewTime: '2024-01-10 10:00:00'
      };

      await controller.updateApplicationStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE enrollment_applications'),
        expect.objectContaining({
          replacements: [
            2,
            '面试安排',
            '2024-01-10 10:00:00',
            '1'
          ],
          type: 'UPDATE'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '更新申请状态成功',
        data: expect.objectContaining({
          id: 1,
          status: 2,
          notes: '面试安排',
          interviewTime: '2024-01-10 10:00:00'
        })
      });
    });

    it('应该处理部分字段更新', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 3
        // 只更新状态，不更新其他字段
      };

      await controller.updateApplicationStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE enrollment_applications'),
        expect.objectContaining({
          replacements: [
            3,
            null, // notes
            null, // interviewTime
            '1'
          ],
          type: 'UPDATE'
        })
      );
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('更新失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 2 };

      await controller.updateApplicationStatus(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '更新申请状态失败',
        error: {
          code: 'SERVER_ERROR',
          message: expect.any(String)
        }
      });
    });
  });

  describe('deleteApplication', () => {
    it('应该成功删除申请', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue({});

      mockRequest.params = { id: '1' };

      await controller.deleteApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE enrollment_applications SET deleted_at = NOW()'),
        expect.objectContaining({
          replacements: ['1'],
          type: 'UPDATE'
        })
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: true,
        message: '删除申请成功',
        data: expect.objectContaining({
          id: 1,
          deletedAt: expect.any(String)
        })
      });
    });

    it('应该处理数据库错误', async () => {
      const mockError = new Error('删除失败');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      mockRequest.params = { id: '1' };

      await controller.deleteApplication(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '删除申请失败',
        error: {
          code: 'SERVER_ERROR',
          message: expect.any(String)
        }
      });
    });
  });

  describe('错误处理', () => {
    it('应该正确处理错误并记录日志', async () => {
      const mockError = new Error('测试错误');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        '获取申请列表失败:',
        mockError
      );

      consoleSpy.mockRestore();
    });

    it('应该返回正确的错误格式', async () => {
      const mockError = new Error('测试错误');
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '获取申请列表失败',
        error: {
          code: 'SERVER_ERROR',
          message: '测试错误'
        }
      });
    });

    it('应该处理未知错误类型', async () => {
      const mockError = '字符串错误';
      (sequelize.query as jest.Mock).mockRejectedValue(mockError);

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(jsonSpy).toHaveBeenCalledWith({
        success: false,
        message: '获取申请列表失败',
        error: {
          code: 'SERVER_ERROR',
          message: '未知错误'
        }
      });
    });
  });

  describe('响应格式验证', () => {
    it('应该返回正确的成功响应格式', async () => {
      const mockApplications = [{
        id: 1,
        studentName: '张三',
        parentName: '李四',
        phone: '13800138000',
        status: 1
      }];

      const mockCount = [{ total: 1 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockApplications)
        .mockResolvedValueOnce(mockCount);

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      
      expect(response).toHaveProperty('success', true);
      expect(response).toHaveProperty('message', '获取申请列表成功');
      expect(response).toHaveProperty('data');
      expect(response.data).toHaveProperty('applications');
      expect(response.data).toHaveProperty('pagination');
      
      response.data.applications.forEach((app: any) => {
        expect(app).toHaveProperty('id');
        expect(app).toHaveProperty('studentName');
        expect(app).toHaveProperty('parentName');
        expect(app).toHaveProperty('phone');
        expect(app).toHaveProperty('status');
      });
    });

    it('应该返回正确的分页格式', async () => {
      const mockApplications = [];
      const mockCount = [{ total: 25 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockApplications)
        .mockResolvedValueOnce(mockCount);

      mockRequest.query = { page: '2', pageSize: '10' };

      await controller.getApplications(
        mockRequest as Request,
        mockResponse as Response
      );

      const response = jsonSpy.mock.calls[0][0];
      const pagination = response.data.pagination;
      
      expect(pagination).toHaveProperty('total', 25);
      expect(pagination).toHaveProperty('page', 2);
      expect(pagination).toHaveProperty('pageSize', 10);
      expect(pagination).toHaveProperty('totalPages', 3);
    });
  });
});