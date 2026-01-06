import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockParentController = {
  getParents: jest.fn(),
  getParentById: jest.fn(),
  createParent: jest.fn(),
  updateParent: jest.fn(),
  deleteParent: jest.fn(),
  getParentChildren: jest.fn(),
  addChildRelation: jest.fn(),
  removeChildRelation: jest.fn(),
  updateChildRelation: jest.fn(),
  getParentActivities: jest.fn(),
  getParentNotifications: jest.fn(),
  updateParentProfile: jest.fn(),
  uploadParentPhoto: jest.fn(),
  getParentStats: jest.fn(),
  sendParentNotification: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/parent.controller', () => mockParentController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadParentPhoto: mockUploadMiddleware
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

describe('Parent Routes', () => {
  let parentRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedParentRouter } = await import('../../../../../src/routes/parent.routes');
    parentRouter = importedParentRouter;
    
    // 设置Express应用
    mockApp.use('/parents', parentRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockParentController.getParents.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          parents: [
            {
              id: 1,
              name: '张父',
              phone: '13800138000',
              email: 'zhang@example.com',
              relationship: 'father',
              children: [
                { id: 1, name: '小明', age: 5, class: '小班A' }
              ]
            },
            {
              id: 2,
              name: '李母',
              phone: '13800138001',
              email: 'li@example.com',
              relationship: 'mother',
              children: [
                { id: 2, name: '小红', age: 4, class: '小班B' }
              ]
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockParentController.getParentById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '张父',
          phone: '13800138000',
          email: 'zhang@example.com',
          relationship: 'father',
          workInfo: {
            company: '科技公司',
            position: '工程师',
            workPhone: '010-12345678'
          },
          emergencyContact: {
            name: '张母',
            phone: '13800138002',
            relationship: 'spouse'
          },
          children: [
            {
              id: 1,
              name: '小明',
              age: 5,
              class: '小班A',
              relationship: 'father'
            }
          ],
          activities: [
            {
              id: 1,
              name: '春游活动',
              date: '2024-05-01',
              status: 'registered'
            }
          ]
        }
      });
    });
    
    mockParentController.createParent.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '家长信息创建成功',
        data: {
          id: 3,
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          relationship: req.body.relationship
        }
      });
    });
  });

  describe('GET /parents', () => {
    it('应该获取家长列表', async () => {
      const response = await request(mockApp)
        .get('/parents')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          parents: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockParentController.getParents).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/parents')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockParentController.getParents).toHaveBeenCalled();
    });

    it('应该支持按关系筛选', async () => {
      await request(mockApp)
        .get('/parents')
        .query({ relationship: 'father' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockParentController.getParents).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/parents')
        .query({ search: '张父' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockParentController.getParents).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/parents');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求家长查看权限', async () => {
      await request(mockApp)
        .get('/parents')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /parents/:id', () => {
    it('应该获取指定家长信息', async () => {
      const parentId = 1;
      const response = await request(mockApp)
        .get(`/parents/${parentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: '张父',
          phone: '13800138000',
          email: 'zhang@example.com',
          relationship: 'father'
        })
      });

      expect(mockParentController.getParentById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/parents/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求家长查看权限', async () => {
      await request(mockApp)
        .get('/parents/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /parents', () => {
    it('应该创建新家长', async () => {
      const parentData = {
        name: '王父',
        phone: '13800138003',
        email: 'wang@example.com',
        relationship: 'father',
        workInfo: {
          company: '教育公司',
          position: '老师',
          workPhone: '010-87654321'
        },
        emergencyContact: {
          name: '王母',
          phone: '13800138004',
          relationship: 'spouse'
        }
      };

      const response = await request(mockApp)
        .post('/parents')
        .set('Authorization', 'Bearer valid-token')
        .send(parentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '家长信息创建成功',
        data: expect.objectContaining({
          name: '王父',
          phone: '13800138003',
          email: 'wang@example.com',
          relationship: 'father'
        })
      });

      expect(mockParentController.createParent).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/parents')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: '测试家长',
          phone: '13800138000'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/parents')
        .send({ name: '测试' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求家长创建权限', async () => {
      await request(mockApp)
        .post('/parents')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /parents/:id', () => {
    it('应该更新家长信息', async () => {
      const parentId = 1;
      const updateData = {
        name: '张父（更新）',
        phone: '13800138005',
        email: 'zhang_new@example.com',
        workInfo: {
          company: '新公司',
          position: '高级工程师'
        }
      };

      mockParentController.updateParent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '家长信息更新成功',
          data: {
            id: parentId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/parents/${parentId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '家长信息更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockParentController.updateParent).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/parents/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求家长更新权限', async () => {
      await request(mockApp)
        .put('/parents/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /parents/:id', () => {
    it('应该删除家长', async () => {
      const parentId = 1;

      mockParentController.deleteParent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '家长删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/parents/${parentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '家长删除成功'
      });

      expect(mockParentController.deleteParent).toHaveBeenCalled();
    });

    it('应该要求家长删除权限', async () => {
      await request(mockApp)
        .delete('/parents/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /parents/:id/children', () => {
    it('应该获取家长的孩子列表', async () => {
      const parentId = 1;

      mockParentController.getParentChildren.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '小明',
              age: 5,
              gender: 'male',
              class: '小班A',
              relationship: 'father',
              enrollmentDate: '2024-09-01'
            },
            {
              id: 2,
              name: '小华',
              age: 3,
              gender: 'male',
              class: '托班',
              relationship: 'father',
              enrollmentDate: '2024-09-01'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/parents/${parentId}/children`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '小明',
            age: 5,
            relationship: 'father'
          })
        ])
      });

      expect(mockParentController.getParentChildren).toHaveBeenCalled();
    });
  });

  describe('POST /parents/:id/children', () => {
    it('应该添加孩子关系', async () => {
      const parentId = 1;
      const childRelationData = {
        studentId: 3,
        relationship: 'father',
        isPrimary: true,
        notes: '主要监护人'
      };

      mockParentController.addChildRelation.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '孩子关系添加成功'
        });
      });

      const response = await request(mockApp)
        .post(`/parents/${parentId}/children`)
        .set('Authorization', 'Bearer valid-token')
        .send(childRelationData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '孩子关系添加成功'
      });

      expect(mockParentController.addChildRelation).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/parents/1/children')
        .set('Authorization', 'Bearer valid-token')
        .send({ studentId: 1 });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /parents/:id/children/:studentId', () => {
    it('应该移除孩子关系', async () => {
      const parentId = 1;
      const studentId = 2;

      mockParentController.removeChildRelation.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '孩子关系移除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/parents/${parentId}/children/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '孩子关系移除成功'
      });

      expect(mockParentController.removeChildRelation).toHaveBeenCalled();
    });
  });

  describe('PUT /parents/:id/children/:studentId', () => {
    it('应该更新孩子关系', async () => {
      const parentId = 1;
      const studentId = 2;
      const updateData = {
        relationship: 'guardian',
        isPrimary: false,
        notes: '临时监护人'
      };

      mockParentController.updateChildRelation.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '孩子关系更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/parents/${parentId}/children/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '孩子关系更新成功'
      });

      expect(mockParentController.updateChildRelation).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/parents/1/children/2')
        .set('Authorization', 'Bearer valid-token')
        .send({ relationship: 'mother' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /parents/:id/activities', () => {
    it('应该获取家长相关活动', async () => {
      const parentId = 1;

      mockParentController.getParentActivities.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '春游活动',
              date: '2024-05-01',
              location: '公园',
              status: 'registered',
              children: ['小明']
            },
            {
              id: 2,
              name: '家长会',
              date: '2024-04-15',
              location: '学校',
              status: 'attended',
              children: ['小明']
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/parents/${parentId}/activities`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '春游活动',
            status: 'registered'
          })
        ])
      });

      expect(mockParentController.getParentActivities).toHaveBeenCalled();
    });
  });

  describe('GET /parents/:id/notifications', () => {
    it('应该获取家长通知', async () => {
      const parentId = 1;

      mockParentController.getParentNotifications.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              title: '活动通知',
              content: '明天有春游活动',
              type: 'activity',
              status: 'unread',
              createdAt: '2024-04-01T10:00:00Z'
            },
            {
              id: 2,
              title: '缴费通知',
              content: '请及时缴纳学费',
              type: 'payment',
              status: 'read',
              createdAt: '2024-03-25T09:00:00Z'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/parents/${parentId}/notifications`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            title: '活动通知',
            type: 'activity'
          })
        ])
      });

      expect(mockParentController.getParentNotifications).toHaveBeenCalled();
    });
  });

  describe('PUT /parents/:id/profile', () => {
    it('应该更新家长资料', async () => {
      const parentId = 1;
      const profileData = {
        avatar: '/uploads/avatars/parent1.jpg',
        bio: '关心孩子教育的家长',
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          language: 'zh-CN'
        }
      };

      mockParentController.updateParentProfile.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '家长资料更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/parents/${parentId}/profile`)
        .set('Authorization', 'Bearer valid-token')
        .send(profileData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '家长资料更新成功'
      });

      expect(mockParentController.updateParentProfile).toHaveBeenCalled();
    });
  });

  describe('POST /parents/:id/photo', () => {
    it('应该上传家长照片', async () => {
      const parentId = 1;

      mockParentController.uploadParentPhoto.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '照片上传成功',
          data: {
            photo: '/uploads/parents/parent1.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .post(`/parents/${parentId}/photo`)
        .set('Authorization', 'Bearer valid-token')
        .attach('photo', Buffer.from('fake image data'), 'photo.jpg')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '照片上传成功',
        data: expect.objectContaining({
          photo: expect.any(String)
        })
      });

      expect(mockUploadMiddleware).toHaveBeenCalled();
      expect(mockParentController.uploadParentPhoto).toHaveBeenCalled();
    });
  });

  describe('GET /parents/:id/stats', () => {
    it('应该获取家长统计信息', async () => {
      const parentId = 1;

      mockParentController.getParentStats.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            childrenCount: 2,
            activitiesParticipated: 5,
            notificationsUnread: 3,
            lastLoginAt: '2024-04-01T10:00:00Z',
            engagementScore: 85,
            paymentStatus: 'up_to_date'
          }
        });
      });

      const response = await request(mockApp)
        .get(`/parents/${parentId}/stats`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          childrenCount: 2,
          activitiesParticipated: 5,
          engagementScore: 85
        })
      });

      expect(mockParentController.getParentStats).toHaveBeenCalled();
    });
  });

  describe('POST /parents/:id/notifications', () => {
    it('应该发送家长通知', async () => {
      const parentId = 1;
      const notificationData = {
        title: '重要通知',
        content: '明天学校放假',
        type: 'announcement',
        channels: ['email', 'sms']
      };

      mockParentController.sendParentNotification.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '通知发送成功'
        });
      });

      const response = await request(mockApp)
        .post(`/parents/${parentId}/notifications`)
        .set('Authorization', 'Bearer valid-token')
        .send(notificationData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '通知发送成功'
      });

      expect(mockParentController.sendParentNotification).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockParentController.getParents.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/parents')
        .set('Authorization', 'Bearer valid-token')
        .expect(500);
    });

    it('应该处理验证中间件错误', async () => {
      mockValidationMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('验证失败');
        (error as any).statusCode = 400;
        next(error);
      });

      await request(mockApp)
        .post('/parents')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '' })
        .expect(400);
    });

    it('应该处理权限中间件错误', async () => {
      mockPermissionMiddleware.mockImplementation((req, res, next) => {
        const error = new Error('权限不足');
        (error as any).statusCode = 403;
        next(error);
      });

      await request(mockApp)
        .get('/parents')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
