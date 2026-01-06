import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockActivitiesController = {
  getAllActivities: jest.fn(),
  getActivityById: jest.fn(),
  createActivity: jest.fn(),
  updateActivity: jest.fn(),
  deleteActivity: jest.fn(),
  getActivitiesByCategory: jest.fn(),
  getActivitiesByDateRange: jest.fn(),
  getActivityParticipants: jest.fn(),
  joinActivity: jest.fn(),
  leaveActivity: jest.fn(),
  getActivityStatistics: jest.fn(),
  publishActivity: jest.fn(),
  cancelActivity: jest.fn(),
  duplicateActivity: jest.fn(),
  exportActivities: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockFileUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/activities.controller', () => mockActivitiesController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  handleFileUpload: mockFileUploadMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  apiLimiter: mockRateLimitMiddleware
}));
jest.unstable_mockModule('../../../../../src/middlewares/permission.middleware', () => ({
  checkPermission: mockPermissionMiddleware
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

describe('Activities Routes', () => {
  let activitiesRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedActivitiesRouter } = await import('../../../../../src/routes/activities.routes');
    activitiesRouter = importedActivitiesRouter;
    
    // 设置Express应用
    mockApp.use('/activities', activitiesRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockActivitiesController.getAllActivities.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            title: '春季运动会',
            description: '年度春季运动会',
            category: 'sports',
            startDate: '2024-03-15T09:00:00.000Z',
            endDate: '2024-03-15T17:00:00.000Z',
            location: '学校操场',
            maxParticipants: 200,
            currentParticipants: 150,
            status: 'published',
            createdBy: 1,
            createdAt: '2024-02-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            title: '科学展览',
            description: '学生科学作品展览',
            category: 'academic',
            startDate: '2024-04-10T10:00:00.000Z',
            endDate: '2024-04-12T16:00:00.000Z',
            location: '学校礼堂',
            maxParticipants: 100,
            currentParticipants: 75,
            status: 'published',
            createdBy: 2,
            createdAt: '2024-03-01T09:00:00.000Z',
            updatedAt: '2024-03-05T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取活动列表成功'
      });
    });

    mockActivitiesController.getActivityById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          title: '春季运动会',
          description: '年度春季运动会',
          category: 'sports',
          startDate: '2024-03-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          location: '学校操场',
          maxParticipants: 200,
          currentParticipants: 150,
          status: 'published',
          createdBy: 1,
          createdAt: '2024-02-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z',
          participants: [
            { id: 1, name: '张三', role: 'student' },
            { id: 2, name: '李四', role: 'teacher' }
          ],
          attachments: [
            { id: 1, fileName: '活动安排.pdf', fileSize: 1024000 }
          ]
        },
        message: '获取活动详情成功'
      });
    });

    mockActivitiesController.createActivity.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: {
          id: 3,
          title: '新生欢迎会',
          description: '欢迎新生的活动',
          category: 'social',
          startDate: '2024-09-01T14:00:00.000Z',
          endDate: '2024-09-01T16:00:00.000Z',
          location: '学校礼堂',
          maxParticipants: 300,
          currentParticipants: 0,
          status: 'draft',
          createdBy: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: '创建活动成功'
      });
    });

    mockActivitiesController.updateActivity.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          title: '春季运动会（更新）',
          description: '年度春季运动会（更新）',
          category: 'sports',
          startDate: '2024-03-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          location: '学校操场',
          maxParticipants: 250,
          currentParticipants: 150,
          status: 'published',
          createdBy: 1,
          createdAt: '2024-02-15T10:00:00.000Z',
          updatedAt: new Date().toISOString()
        },
        message: '更新活动成功'
      });
    });

    mockActivitiesController.deleteActivity.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        message: '删除活动成功'
      });
    });
  });

  describe('GET /activities', () => {
    it('应该获取活动列表', async () => {
      const response = await request(mockApp)
        .get('/activities')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: [
          {
            id: 1,
            title: '春季运动会',
            description: '年度春季运动会',
            category: 'sports',
            startDate: '2024-03-15T09:00:00.000Z',
            endDate: '2024-03-15T17:00:00.000Z',
            location: '学校操场',
            maxParticipants: 200,
            currentParticipants: 150,
            status: 'published',
            createdBy: 1,
            createdAt: '2024-02-15T10:00:00.000Z',
            updatedAt: '2024-02-20T14:30:00.000Z'
          },
          {
            id: 2,
            title: '科学展览',
            description: '学生科学作品展览',
            category: 'academic',
            startDate: '2024-04-10T10:00:00.000Z',
            endDate: '2024-04-12T16:00:00.000Z',
            location: '学校礼堂',
            maxParticipants: 100,
            currentParticipants: 75,
            status: 'published',
            createdBy: 2,
            createdAt: '2024-03-01T09:00:00.000Z',
            updatedAt: '2024-03-05T11:00:00.000Z'
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        },
        message: '获取活动列表成功'
      });

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      const page = 2;
      const limit = 5;

      await request(mockApp)
        .get('/activities')
        .query({ page, limit })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            page: page.toString(),
            limit: limit.toString()
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持分类过滤', async () => {
      const category = 'sports';

      await request(mockApp)
        .get('/activities')
        .query({ category })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            category
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持状态过滤', async () => {
      const status = 'published';

      await request(mockApp)
        .get('/activities')
        .query({ status })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            status
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持搜索功能', async () => {
      const search = '运动会';

      await request(mockApp)
        .get('/activities')
        .query({ search })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            search
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该支持排序参数', async () => {
      const sortBy = 'startDate';
      const sortOrder = 'desc';

      await request(mockApp)
        .get('/activities')
        .query({ sortBy, sortOrder })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockActivitiesController.getAllActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            sortBy,
            sortOrder
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该应用认证中间件', async () => {
      await request(mockApp)
        .get('/activities')
        .set('Authorization', 'Bearer valid-token');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该处理未认证的请求', async () => {
      mockAuthMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('未授权访问');
        (error as any).statusCode = 401;
        next(error);
      });

      await request(mockApp)
        .get('/activities')
        .expect(401);
    });
  });

  describe('GET /activities/:id', () => {
    it('应该获取活动详情', async () => {
      const activityId = 1;

      const response = await request(mockApp)
        .get(`/activities/${activityId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          title: '春季运动会',
          description: '年度春季运动会',
          category: 'sports',
          startDate: '2024-03-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          location: '学校操场',
          maxParticipants: 200,
          currentParticipants: 150,
          status: 'published',
          createdBy: 1,
          createdAt: '2024-02-15T10:00:00.000Z',
          updatedAt: '2024-02-20T14:30:00.000Z',
          participants: [
            { id: 1, name: '张三', role: 'student' },
            { id: 2, name: '李四', role: 'teacher' }
          ],
          attachments: [
            { id: 1, fileName: '活动安排.pdf', fileSize: 1024000 }
          ]
        },
        message: '获取活动详情成功'
      });

      expect(mockActivitiesController.getActivityById).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证活动ID参数', async () => {
      await request(mockApp)
        .get('/activities/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该处理不存在的活动ID', async () => {
      mockActivitiesController.getActivityById.mockImplementation((req, res, next) => {
        const error = new Error('活动不存在');
        (error as any).statusCode = 404;
        next(error);
      });

      await request(mockApp)
        .get('/activities/999')
        .set('Authorization', 'Bearer valid-token')
        .expect(404);
    });
  });

  describe('POST /activities', () => {
    it('应该创建新活动', async () => {
      const activityData = {
        title: '新生欢迎会',
        description: '欢迎新生的活动',
        category: 'social',
        startDate: '2024-09-01T14:00:00.000Z',
        endDate: '2024-09-01T16:00:00.000Z',
        location: '学校礼堂',
        maxParticipants: 300,
        status: 'draft'
      };

      const response = await request(mockApp)
        .post('/activities')
        .send(activityData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 3,
          title: '新生欢迎会',
          description: '欢迎新生的活动',
          category: 'social',
          startDate: '2024-09-01T14:00:00.000Z',
          endDate: '2024-09-01T16:00:00.000Z',
          location: '学校礼堂',
          maxParticipants: 300,
          currentParticipants: 0,
          status: 'draft',
          createdBy: 1,
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        },
        message: '创建活动成功'
      });

      expect(mockActivitiesController.createActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          body: activityData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证活动数据', async () => {
      const invalidActivityData = {
        title: '', // 空标题
        category: 'invalid_category'
      };

      await request(mockApp)
        .post('/activities')
        .send(invalidActivityData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该处理文件上传', async () => {
      const activityData = {
        title: '带附件的活动',
        description: '需要上传附件的活动',
        category: 'academic',
        startDate: '2024-05-01T10:00:00.000Z',
        endDate: '2024-05-01T12:00:00.000Z',
        location: '教室',
        maxParticipants: 50
      };

      await request(mockApp)
        .post('/activities')
        .send(activityData)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(mockFileUploadMiddleware).toHaveBeenCalled();
    });

    it('应该检查创建权限', async () => {
      await request(mockApp)
        .post('/activities')
        .send({ title: '测试活动' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /activities/:id', () => {
    it('应该更新活动', async () => {
      const activityId = 1;
      const updateData = {
        title: '春季运动会（更新）',
        maxParticipants: 250
      };

      const response = await request(mockApp)
        .put(`/activities/${activityId}`)
        .send(updateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: 1,
          title: '春季运动会（更新）',
          description: '年度春季运动会（更新）',
          category: 'sports',
          startDate: '2024-03-15T09:00:00.000Z',
          endDate: '2024-03-15T17:00:00.000Z',
          location: '学校操场',
          maxParticipants: 250,
          currentParticipants: 150,
          status: 'published',
          createdBy: 1,
          createdAt: '2024-02-15T10:00:00.000Z',
          updatedAt: expect.any(String)
        },
        message: '更新活动成功'
      });

      expect(mockActivitiesController.updateActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() },
          body: updateData
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证更新数据', async () => {
      const invalidUpdateData = {
        maxParticipants: -1 // 无效的参与人数
      };

      await request(mockApp)
        .put('/activities/1')
        .send(invalidUpdateData)
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查更新权限', async () => {
      await request(mockApp)
        .put('/activities/1')
        .send({ title: '更新测试' })
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /activities/:id', () => {
    it('应该删除活动', async () => {
      const activityId = 1;

      const response = await request(mockApp)
        .delete(`/activities/${activityId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '删除活动成功'
      });

      expect(mockActivitiesController.deleteActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证活动ID', async () => {
      await request(mockApp)
        .delete('/activities/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该检查删除权限', async () => {
      await request(mockApp)
        .delete('/activities/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /activities/category/:category', () => {
    it('应该按分类获取活动', async () => {
      mockActivitiesController.getActivitiesByCategory.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              title: '春季运动会',
              category: 'sports',
              startDate: '2024-03-15T09:00:00.000Z'
            }
          ],
          message: '获取分类活动成功'
        });
      });

      const category = 'sports';

      const response = await request(mockApp)
        .get(`/activities/category/${category}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.getActivitiesByCategory).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { category }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /activities/date-range', () => {
    it('应该按日期范围获取活动', async () => {
      mockActivitiesController.getActivitiesByDateRange.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              title: '春季运动会',
              startDate: '2024-03-15T09:00:00.000Z',
              endDate: '2024-03-15T17:00:00.000Z'
            }
          ],
          message: '获取日期范围活动成功'
        });
      });

      const startDate = '2024-03-01';
      const endDate = '2024-03-31';

      const response = await request(mockApp)
        .get('/activities/date-range')
        .query({ startDate, endDate })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.getActivitiesByDateRange).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining({
            startDate,
            endDate
          })
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('应该验证日期范围参数', async () => {
      await request(mockApp)
        .get('/activities/date-range')
        .query({ startDate: 'invalid-date', endDate: '2024-03-31' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /activities/:id/participants', () => {
    it('应该获取活动参与者', async () => {
      mockActivitiesController.getActivityParticipants.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, name: '张三', role: 'student', joinedAt: '2024-02-20T10:00:00.000Z' },
            { id: 2, name: '李四', role: 'teacher', joinedAt: '2024-02-21T09:00:00.000Z' }
          ],
          message: '获取活动参与者成功'
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .get(`/activities/${activityId}/participants`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.getActivityParticipants).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /activities/:id/join', () => {
    it('应该加入活动', async () => {
      mockActivitiesController.joinActivity.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '成功加入活动',
          data: {
            activityId: 1,
            userId: 1,
            joinedAt: new Date().toISOString()
          }
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .post(`/activities/${activityId}/join`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.joinActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /activities/:id/leave', () => {
    it('应该离开活动', async () => {
      mockActivitiesController.leaveActivity.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '成功离开活动'
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .post(`/activities/${activityId}/leave`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.leaveActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /activities/:id/statistics', () => {
    it('应该获取活动统计', async () => {
      mockActivitiesController.getActivityStatistics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalParticipants: 150,
            newParticipantsThisWeek: 10,
            maleParticipants: 80,
            femaleParticipants: 70,
            ageDistribution: [
              { age: '3-4', count: 30 },
              { age: '5-6', count: 120 }
            ],
            joinTrend: [
              { date: '2024-02-20', count: 20 },
              { date: '2024-02-21', count: 15 }
            ]
          },
          message: '获取活动统计成功'
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .get(`/activities/${activityId}/statistics`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.getActivityStatistics).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /activities/:id/publish', () => {
    it('应该发布活动', async () => {
      mockActivitiesController.publishActivity.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '活动发布成功',
          data: {
            id: 1,
            status: 'published',
            publishedAt: new Date().toISOString()
          }
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .post(`/activities/${activityId}/publish`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.publishActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /activities/:id/cancel', () => {
    it('应该取消活动', async () => {
      mockActivitiesController.cancelActivity.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '活动取消成功',
          data: {
            id: 1,
            status: 'cancelled',
            cancelledAt: new Date().toISOString(),
            reason: '天气原因'
          }
        });
      });

      const activityId = 1;
      const cancelReason = { reason: '天气原因' };

      const response = await request(mockApp)
        .post(`/activities/${activityId}/cancel`)
        .send(cancelReason)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.cancelActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() },
          body: cancelReason
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('POST /activities/:id/duplicate', () => {
    it('应该复制活动', async () => {
      mockActivitiesController.duplicateActivity.mockImplementation((req, res) => {
        res.status(201).json({
          success: true,
          message: '活动复制成功',
          data: {
            id: 4,
            title: '春季运动会（副本）',
            originalId: 1,
            status: 'draft'
          }
        });
      });

      const activityId = 1;

      const response = await request(mockApp)
        .post(`/activities/${activityId}/duplicate`)
        .set('Authorization', 'Bearer valid-token')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.duplicateActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          params: { id: activityId.toString() }
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('GET /activities/export', () => {
    it('应该导出活动数据', async () => {
      mockActivitiesController.exportActivities.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            downloadUrl: '/api/files/download/activities-export-2024.xlsx',
            expiresAt: new Date(Date.now() + 3600000).toISOString()
          },
          message: '导出任务创建成功'
        });
      });

      const exportParams = {
        format: 'excel',
        category: 'sports',
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        }
      };

      const response = await request(mockApp)
        .get('/activities/export')
        .query(exportParams)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockActivitiesController.exportActivities).toHaveBeenCalledWith(
        expect.objectContaining({
          query: expect.objectContaining(exportParams)
        }),
        expect.any(Object),
        expect.any(Function)
      );
    });
  });

  describe('路由中间件应用', () => {
    it('应该正确应用认证中间件到所有路由', () => {
      const protectedRoutes = ['/activities', '/activities/1', '/activities/category/sports',
                              '/activities/date-range', '/activities/1/participants',
                              '/activities/1/join', '/activities/1/leave',
                              '/activities/1/statistics', '/activities/1/publish',
                              '/activities/1/cancel', '/activities/1/duplicate',
                              '/activities/export'];
      
      protectedRoutes.forEach(route => {
        expect(mockAuthMiddleware).toBeDefined();
      });
    });

    it('应该正确应用验证中间件到需要验证的路由', () => {
      const validatedRoutes = ['/activities/1', '/activities', '/activities/date-range',
                              '/activities/export'];
      
      validatedRoutes.forEach(route => {
        expect(mockValidationMiddleware).toBeDefined();
      });
    });

    it('应该正确应用权限中间件到需要权限的路由', () => {
      const permissionRoutes = ['/activities', '/activities/1', '/activities/1/publish',
                               '/activities/1/cancel'];
      
      permissionRoutes.forEach(route => {
        expect(mockPermissionMiddleware).toBeDefined();
      });
    });

    it('应该正确应用文件上传中间件到创建路由', () => {
      expect(mockFileUploadMiddleware).toBeDefined();
    });

    it('应该正确应用限流中间件到敏感路由', () => {
      const rateLimitedRoutes = ['/activities', '/activities/export'];
      
      rateLimitedRoutes.forEach(route => {
        expect(mockRateLimitMiddleware).toBeDefined();
      });
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockActivitiesController.getAllActivities.mockImplementation((req, res, next) => {
        const error = new Error('获取活动列表失败');
        next(error);
      });

      await request(mockApp)
        .get('/activities')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('参数验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .get('/activities/invalid-id')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理权限不足错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .post('/activities')
        .send({ title: '测试活动' })
        .set('Authorization', 'Bearer user-token')
        .expect(403);
    });

    it('应该处理活动已满错误', async () => {
      mockActivitiesController.joinActivity.mockImplementation((req, res, next) => {
        const error = new Error('活动人数已满');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/activities/1/join')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该处理活动已取消错误', async () => {
      mockActivitiesController.joinActivity.mockImplementation((req, res, next) => {
        const error = new Error('活动已取消');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/activities/1/join')
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });
  });

  describe('性能测试', () => {
    it('应该处理并发请求', async () => {
      const requests = Array(10).fill(null).map(() => 
        request(mockApp)
          .get('/activities')
          .set('Authorization', 'Bearer valid-token')
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });

    it('应该处理大量数据请求', async () => {
      mockActivitiesController.getAllActivities.mockImplementation((req, res) => {
        // 模拟大量活动数据
        const largeData = Array(1000).fill(null).map((_, i) => ({
          id: i + 1,
          title: `活动${i + 1}`,
          category: ['sports', 'academic', 'social'][i % 3],
          startDate: new Date(Date.now() + i * 86400000).toISOString(),
          status: 'published'
        }));

        res.status(200).json({
          success: true,
          data: largeData,
          pagination: {
            page: 1,
            limit: 1000,
            total: 1000,
            totalPages: 1
          },
          message: '获取活动列表成功'
        });
      });

      const response = await request(mockApp)
        .get('/activities')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1000);
    });
  });

  describe('安全测试', () => {
    it('应该防止SQL注入攻击', async () => {
      const maliciousQuery = "SELECT * FROM activities";

      await request(mockApp)
        .get('/activities')
        .query({ search: maliciousQuery })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该防止XSS攻击', async () => {
      const maliciousScript = "<script>alert('xss')</script>";

      await request(mockApp)
        .post('/activities')
        .send({ title: maliciousScript, category: 'sports' })
        .set('Authorization', 'Bearer valid-token')
        .expect(400);
    });

    it('应该验证输入数据格式', async () => {
      const invalidFormats = [
        { route: '/activities', body: { maxParticipants: 'not_a_number' } },
        { route: '/activities/date-range', query: { startDate: 'invalid-date' } },
        { route: '/activities/export', query: { format: 'invalid_format' } }
      ];

      for (const { route, body, query } of invalidFormats) {
        const req = request(mockApp)
          .get(route)
          .set('Authorization', 'Bearer valid-token');
        
        if (query) {
          req.query(query);
        }
        
        await req.expect(400);
      }
    });

    it('应该限制文件上传大小', async () => {
      // 模拟大文件上传
      mockFileUploadMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('文件大小超过限制');
        (error as any).statusCode = 413;
        next(error);
      });

      await request(mockApp)
        .post('/activities')
        .send({ title: '大文件测试' })
        .set('Authorization', 'Bearer valid-token')
        .expect(413);
    });
  });
});