import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockKindergartenController = {
  getKindergartens: jest.fn(),
  getKindergartenById: jest.fn(),
  createKindergarten: jest.fn(),
  updateKindergarten: jest.fn(),
  deleteKindergarten: jest.fn(),
  getKindergartenStats: jest.fn(),
  getKindergartenClasses: jest.fn(),
  getKindergartenStudents: jest.fn(),
  getKindergartenTeachers: jest.fn(),
  getKindergartenActivities: jest.fn(),
  uploadKindergartenImages: jest.fn(),
  updateKindergartenStatus: jest.fn(),
  getKindergartenEnrollmentPlans: jest.fn(),
  getKindergartenReports: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/kindergarten.controller', () => mockKindergartenController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadKindergartenImages: mockUploadMiddleware
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

describe('Kindergarten Routes', () => {
  let kindergartenRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedKindergartenRouter } = await import('../../../../../src/routes/kindergarten.routes');
    kindergartenRouter = importedKindergartenRouter;
    
    // 设置Express应用
    mockApp.use('/kindergartens', kindergartenRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockKindergartenController.getKindergartens.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          kindergartens: [
            {
              id: 1,
              name: '阳光幼儿园',
              address: '北京市朝阳区阳光街123号',
              phone: '010-12345678',
              status: 'active',
              capacity: 300,
              currentEnrollment: 250
            },
            {
              id: 2,
              name: '彩虹幼儿园',
              address: '北京市海淀区彩虹路456号',
              phone: '010-87654321',
              status: 'active',
              capacity: 200,
              currentEnrollment: 180
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockKindergartenController.getKindergartenById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '阳光幼儿园',
          address: '北京市朝阳区阳光街123号',
          phone: '010-12345678',
          email: 'sunshine@kindergarten.com',
          status: 'active',
          capacity: 300,
          currentEnrollment: 250,
          establishedDate: '2020-01-15',
          description: '专业的幼儿教育机构'
        }
      });
    });
    
    mockKindergartenController.createKindergarten.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '幼儿园创建成功',
        data: {
          id: 3,
          name: req.body.name,
          address: req.body.address,
          phone: req.body.phone,
          status: 'active'
        }
      });
    });
  });

  describe('GET /kindergartens', () => {
    it('应该获取幼儿园列表', async () => {
      const response = await request(mockApp)
        .get('/kindergartens')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          kindergartens: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockKindergartenController.getKindergartens).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/kindergartens')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockKindergartenController.getKindergartens).toHaveBeenCalled();
    });

    it('应该支持状态筛选', async () => {
      await request(mockApp)
        .get('/kindergartens')
        .query({ status: 'active' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockKindergartenController.getKindergartens).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/kindergartens')
        .query({ search: '阳光' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockKindergartenController.getKindergartens).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/kindergartens');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求幼儿园查看权限', async () => {
      await request(mockApp)
        .get('/kindergartens')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /kindergartens/:id', () => {
    it('应该获取指定幼儿园信息', async () => {
      const kindergartenId = 1;
      const response = await request(mockApp)
        .get(`/kindergartens/${kindergartenId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: '阳光幼儿园',
          address: '北京市朝阳区阳光街123号',
          phone: '010-12345678',
          status: 'active'
        })
      });

      expect(mockKindergartenController.getKindergartenById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/kindergartens/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求幼儿园查看权限', async () => {
      await request(mockApp)
        .get('/kindergartens/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /kindergartens', () => {
    it('应该创建新幼儿园', async () => {
      const kindergartenData = {
        name: '新星幼儿园',
        address: '北京市西城区新星路789号',
        phone: '010-11111111',
        email: 'newstar@kindergarten.com',
        capacity: 150,
        establishedDate: '2024-01-01',
        description: '新建的现代化幼儿园'
      };

      const response = await request(mockApp)
        .post('/kindergartens')
        .set('Authorization', 'Bearer valid-token')
        .send(kindergartenData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '幼儿园创建成功',
        data: expect.objectContaining({
          name: '新星幼儿园',
          address: '北京市西城区新星路789号',
          phone: '010-11111111'
        })
      });

      expect(mockKindergartenController.createKindergarten).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/kindergartens')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: '测试幼儿园',
          address: '测试地址'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/kindergartens')
        .send({ name: '测试' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求幼儿园创建权限', async () => {
      await request(mockApp)
        .post('/kindergartens')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /kindergartens/:id', () => {
    it('应该更新幼儿园信息', async () => {
      const kindergartenId = 1;
      const updateData = {
        name: '更新的幼儿园名称',
        phone: '010-99999999',
        email: 'updated@kindergarten.com',
        capacity: 350
      };

      mockKindergartenController.updateKindergarten.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '幼儿园更新成功',
          data: {
            id: kindergartenId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/kindergartens/${kindergartenId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '幼儿园更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockKindergartenController.updateKindergarten).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/kindergartens/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求幼儿园更新权限', async () => {
      await request(mockApp)
        .put('/kindergartens/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /kindergartens/:id', () => {
    it('应该删除幼儿园', async () => {
      const kindergartenId = 1;

      mockKindergartenController.deleteKindergarten.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '幼儿园删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/kindergartens/${kindergartenId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '幼儿园删除成功'
      });

      expect(mockKindergartenController.deleteKindergarten).toHaveBeenCalled();
    });

    it('应该要求幼儿园删除权限', async () => {
      await request(mockApp)
        .delete('/kindergartens/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /kindergartens/:id/stats', () => {
    it('应该获取幼儿园统计信息', async () => {
      const kindergartenId = 1;

      mockKindergartenController.getKindergartenStats.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalStudents: 250,
            totalTeachers: 25,
            totalClasses: 12,
            enrollmentRate: 83.3,
            activeActivities: 5,
            monthlyRevenue: 125000
          }
        });
      });

      const response = await request(mockApp)
        .get(`/kindergartens/${kindergartenId}/stats`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          totalStudents: 250,
          totalTeachers: 25,
          totalClasses: 12,
          enrollmentRate: 83.3
        })
      });

      expect(mockKindergartenController.getKindergartenStats).toHaveBeenCalled();
    });
  });

  describe('GET /kindergartens/:id/classes', () => {
    it('应该获取幼儿园班级列表', async () => {
      const kindergartenId = 1;

      mockKindergartenController.getKindergartenClasses.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '小班A',
              ageGroup: 'small',
              capacity: 25,
              currentEnrollment: 23,
              teacher: { name: '张老师' }
            },
            {
              id: 2,
              name: '中班B',
              ageGroup: 'medium',
              capacity: 30,
              currentEnrollment: 28,
              teacher: { name: '李老师' }
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/kindergartens/${kindergartenId}/classes`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '小班A',
            ageGroup: 'small',
            capacity: 25
          })
        ])
      });

      expect(mockKindergartenController.getKindergartenClasses).toHaveBeenCalled();
    });
  });

  describe('GET /kindergartens/:id/students', () => {
    it('应该获取幼儿园学生列表', async () => {
      const kindergartenId = 1;

      mockKindergartenController.getKindergartenStudents.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            students: [
              {
                id: 1,
                name: '小明',
                gender: 'male',
                birthDate: '2019-05-15',
                class: { name: '小班A' },
                status: 'active'
              },
              {
                id: 2,
                name: '小红',
                gender: 'female',
                birthDate: '2018-08-20',
                class: { name: '中班B' },
                status: 'active'
              }
            ],
            total: 2,
            page: 1,
            pageSize: 10
          }
        });
      });

      const response = await request(mockApp)
        .get(`/kindergartens/${kindergartenId}/students`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          students: expect.arrayContaining([
            expect.objectContaining({
              name: '小明',
              gender: 'male'
            })
          ]),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockKindergartenController.getKindergartenStudents).toHaveBeenCalled();
    });
  });

  describe('GET /kindergartens/:id/teachers', () => {
    it('应该获取幼儿园教师列表', async () => {
      const kindergartenId = 1;

      mockKindergartenController.getKindergartenTeachers.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '张老师',
              gender: 'female',
              level: 'senior',
              type: 'full_time',
              status: 'active',
              classes: [{ name: '小班A' }]
            },
            {
              id: 2,
              name: '李老师',
              gender: 'female',
              level: 'intermediate',
              type: 'full_time',
              status: 'active',
              classes: [{ name: '中班B' }]
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/kindergartens/${kindergartenId}/teachers`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '张老师',
            level: 'senior',
            type: 'full_time'
          })
        ])
      });

      expect(mockKindergartenController.getKindergartenTeachers).toHaveBeenCalled();
    });
  });

  describe('POST /kindergartens/:id/images', () => {
    it('应该上传幼儿园图片', async () => {
      const kindergartenId = 1;

      mockKindergartenController.uploadKindergartenImages.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '图片上传成功',
          data: {
            images: [
              '/uploads/kindergarten1/image1.jpg',
              '/uploads/kindergarten1/image2.jpg'
            ]
          }
        });
      });

      const response = await request(mockApp)
        .post(`/kindergartens/${kindergartenId}/images`)
        .set('Authorization', 'Bearer valid-token')
        .attach('images', Buffer.from('fake image data 1'), 'image1.jpg')
        .attach('images', Buffer.from('fake image data 2'), 'image2.jpg')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '图片上传成功',
        data: expect.objectContaining({
          images: expect.any(Array)
        })
      });

      expect(mockUploadMiddleware).toHaveBeenCalled();
      expect(mockKindergartenController.uploadKindergartenImages).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockKindergartenController.getKindergartens.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/kindergartens')
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
        .post('/kindergartens')
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
        .get('/kindergartens')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
