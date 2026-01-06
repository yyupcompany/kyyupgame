import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockTeacherController = {
  getTeachers: jest.fn(),
  getTeacherById: jest.fn(),
  createTeacher: jest.fn(),
  updateTeacher: jest.fn(),
  deleteTeacher: jest.fn(),
  assignToClass: jest.fn(),
  removeFromClass: jest.fn(),
  getTeacherClasses: jest.fn(),
  updateTeacherStatus: jest.fn(),
  updateTeacherLevel: jest.fn(),
  addCertification: jest.fn(),
  removeCertification: jest.fn(),
  getTeacherCertifications: jest.fn(),
  uploadTeacherPhoto: jest.fn(),
  getTeacherSchedule: jest.fn(),
  updateTeacherSchedule: jest.fn(),
  getTeacherPerformance: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/teacher.controller', () => mockTeacherController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadTeacherPhoto: mockUploadMiddleware
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

describe('Teacher Routes', () => {
  let teacherRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedTeacherRouter } = await import('../../../../../src/routes/teacher.routes');
    teacherRouter = importedTeacherRouter;
    
    // 设置Express应用
    mockApp.use('/teachers', teacherRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockTeacherController.getTeachers.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          teachers: [
            {
              id: 1,
              name: '张老师',
              gender: 'female',
              birthDate: '1985-06-20',
              phone: '13800138000',
              email: 'teacher1@example.com',
              level: 'senior',
              status: 'active',
              kindergarten: { id: 1, name: '阳光幼儿园' },
              classes: [
                { id: 1, name: '小班A', level: 'small' }
              ]
            },
            {
              id: 2,
              name: '李老师',
              gender: 'male',
              birthDate: '1988-03-15',
              phone: '13900139000',
              email: 'teacher2@example.com',
              level: 'intermediate',
              status: 'active',
              kindergarten: { id: 1, name: '阳光幼儿园' },
              classes: [
                { id: 2, name: '中班B', level: 'medium' }
              ]
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockTeacherController.getTeacherById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '张老师',
          gender: 'female',
          birthDate: '1985-06-20',
          phone: '13800138000',
          email: 'teacher1@example.com',
          level: 'senior',
          status: 'active',
          workYears: 8,
          education: '本科',
          major: '学前教育',
          certifications: [
            { id: 1, name: '教师资格证', issueDate: '2015-07-01' },
            { id: 2, name: '普通话等级证', issueDate: '2014-12-15' }
          ],
          kindergarten: { id: 1, name: '阳光幼儿园' },
          classes: [
            { id: 1, name: '小班A', level: 'small', studentCount: 25 }
          ]
        }
      });
    });
    
    mockTeacherController.createTeacher.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '教师创建成功',
        data: {
          id: 3,
          name: req.body.name,
          gender: req.body.gender,
          phone: req.body.phone,
          email: req.body.email,
          level: req.body.level || 'junior',
          status: 'active'
        }
      });
    });
  });

  describe('GET /teachers', () => {
    it('应该获取教师列表', async () => {
      const response = await request(mockApp)
        .get('/teachers')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          teachers: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockTeacherController.getTeachers).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/teachers')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockTeacherController.getTeachers).toHaveBeenCalled();
    });

    it('应该支持按级别筛选', async () => {
      await request(mockApp)
        .get('/teachers')
        .query({ level: 'senior' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockTeacherController.getTeachers).toHaveBeenCalled();
    });

    it('应该支持按状态筛选', async () => {
      await request(mockApp)
        .get('/teachers')
        .query({ status: 'active' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockTeacherController.getTeachers).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/teachers')
        .query({ search: '张老师' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockTeacherController.getTeachers).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/teachers');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求教师查看权限', async () => {
      await request(mockApp)
        .get('/teachers')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /teachers/:id', () => {
    it('应该获取指定教师信息', async () => {
      const teacherId = 1;
      const response = await request(mockApp)
        .get(`/teachers/${teacherId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: '张老师',
          gender: 'female',
          phone: '13800138000',
          email: 'teacher1@example.com',
          level: 'senior',
          status: 'active'
        })
      });

      expect(mockTeacherController.getTeacherById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/teachers/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求教师查看权限', async () => {
      await request(mockApp)
        .get('/teachers/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /teachers', () => {
    it('应该创建新教师', async () => {
      const teacherData = {
        name: '王老师',
        gender: 'female',
        birthDate: '1990-08-25',
        phone: '13700137000',
        email: 'teacher3@example.com',
        kindergartenId: 1,
        level: 'junior',
        education: '本科',
        major: '学前教育',
        workYears: 2,
        address: '北京市海淀区教师公寓789号'
      };

      const response = await request(mockApp)
        .post('/teachers')
        .set('Authorization', 'Bearer valid-token')
        .send(teacherData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '教师创建成功',
        data: expect.objectContaining({
          name: '王老师',
          gender: 'female',
          phone: '13700137000',
          email: 'teacher3@example.com'
        })
      });

      expect(mockTeacherController.createTeacher).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/teachers')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: '测试教师',
          gender: 'female'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/teachers')
        .send({ name: '测试' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求教师创建权限', async () => {
      await request(mockApp)
        .post('/teachers')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /teachers/:id', () => {
    it('应该更新教师信息', async () => {
      const teacherId = 1;
      const updateData = {
        name: '张老师（更新）',
        phone: '13800138001',
        email: 'teacher1_updated@example.com',
        level: 'expert',
        workYears: 9
      };

      mockTeacherController.updateTeacher.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师更新成功',
          data: {
            id: teacherId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/teachers/${teacherId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockTeacherController.updateTeacher).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/teachers/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求教师更新权限', async () => {
      await request(mockApp)
        .put('/teachers/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /teachers/:id', () => {
    it('应该删除教师', async () => {
      const teacherId = 1;

      mockTeacherController.deleteTeacher.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/teachers/${teacherId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师删除成功'
      });

      expect(mockTeacherController.deleteTeacher).toHaveBeenCalled();
    });

    it('应该要求教师删除权限', async () => {
      await request(mockApp)
        .delete('/teachers/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /teachers/:id/assign-class', () => {
    it('应该分配教师到班级', async () => {
      const teacherId = 1;
      const classData = {
        classId: 2,
        role: 'main'
      };

      mockTeacherController.assignToClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师分配到班级成功'
        });
      });

      const response = await request(mockApp)
        .post(`/teachers/${teacherId}/assign-class`)
        .set('Authorization', 'Bearer valid-token')
        .send(classData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师分配到班级成功'
      });

      expect(mockTeacherController.assignToClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/teachers/1/assign-class')
        .set('Authorization', 'Bearer valid-token')
        .send({ classId: 1 });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /teachers/:id/remove-class/:classId', () => {
    it('应该从班级移除教师', async () => {
      const teacherId = 1;
      const classId = 2;

      mockTeacherController.removeFromClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师从班级移除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/teachers/${teacherId}/remove-class/${classId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师从班级移除成功'
      });

      expect(mockTeacherController.removeFromClass).toHaveBeenCalled();
    });
  });

  describe('GET /teachers/:id/classes', () => {
    it('应该获取教师班级列表', async () => {
      const teacherId = 1;

      mockTeacherController.getTeacherClasses.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '小班A',
              level: 'small',
              studentCount: 25,
              role: 'main'
            },
            {
              id: 2,
              name: '中班B',
              level: 'medium',
              studentCount: 28,
              role: 'assistant'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/teachers/${teacherId}/classes`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '小班A',
            level: 'small',
            role: 'main'
          })
        ])
      });

      expect(mockTeacherController.getTeacherClasses).toHaveBeenCalled();
    });
  });

  describe('PUT /teachers/:id/status', () => {
    it('应该更新教师状态', async () => {
      const teacherId = 1;
      const statusData = {
        status: 'inactive'
      };

      mockTeacherController.updateTeacherStatus.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师状态更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/teachers/${teacherId}/status`)
        .set('Authorization', 'Bearer valid-token')
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师状态更新成功'
      });

      expect(mockTeacherController.updateTeacherStatus).toHaveBeenCalled();
    });
  });

  describe('PUT /teachers/:id/level', () => {
    it('应该更新教师级别', async () => {
      const teacherId = 1;
      const levelData = {
        level: 'expert'
      };

      mockTeacherController.updateTeacherLevel.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师级别更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/teachers/${teacherId}/level`)
        .set('Authorization', 'Bearer valid-token')
        .send(levelData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师级别更新成功'
      });

      expect(mockTeacherController.updateTeacherLevel).toHaveBeenCalled();
    });
  });

  describe('POST /teachers/:id/certifications', () => {
    it('应该添加教师资格证书', async () => {
      const teacherId = 1;
      const certificationData = {
        name: '心理咨询师证',
        issueDate: '2023-06-15',
        expiryDate: '2028-06-15',
        issuer: '国家心理咨询师协会'
      };

      mockTeacherController.addCertification.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '资格证书添加成功'
        });
      });

      const response = await request(mockApp)
        .post(`/teachers/${teacherId}/certifications`)
        .set('Authorization', 'Bearer valid-token')
        .send(certificationData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '资格证书添加成功'
      });

      expect(mockTeacherController.addCertification).toHaveBeenCalled();
    });
  });

  describe('GET /teachers/:id/certifications', () => {
    it('应该获取教师资格证书列表', async () => {
      const teacherId = 1;

      mockTeacherController.getTeacherCertifications.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '教师资格证',
              issueDate: '2015-07-01',
              expiryDate: '2025-07-01',
              issuer: '教育部'
            },
            {
              id: 2,
              name: '普通话等级证',
              issueDate: '2014-12-15',
              expiryDate: null,
              issuer: '语言文字工作委员会'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/teachers/${teacherId}/certifications`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '教师资格证',
            issuer: '教育部'
          })
        ])
      });

      expect(mockTeacherController.getTeacherCertifications).toHaveBeenCalled();
    });
  });

  describe('POST /teachers/:id/photo', () => {
    it('应该上传教师照片', async () => {
      const teacherId = 1;

      mockTeacherController.uploadTeacherPhoto.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '照片上传成功',
          data: {
            photo: '/uploads/teachers/teacher1.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .post(`/teachers/${teacherId}/photo`)
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
      expect(mockTeacherController.uploadTeacherPhoto).toHaveBeenCalled();
    });
  });

  describe('GET /teachers/:id/schedule', () => {
    it('应该获取教师课程表', async () => {
      const teacherId = 1;

      mockTeacherController.getTeacherSchedule.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            monday: [
              { time: '08:00-09:00', subject: '语言课', class: '小班A' },
              { time: '09:30-10:30', subject: '数学课', class: '小班A' }
            ],
            tuesday: [
              { time: '08:00-09:00', subject: '美术课', class: '小班A' }
            ]
          }
        });
      });

      const response = await request(mockApp)
        .get(`/teachers/${teacherId}/schedule`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          monday: expect.any(Array),
          tuesday: expect.any(Array)
        })
      });

      expect(mockTeacherController.getTeacherSchedule).toHaveBeenCalled();
    });
  });

  describe('GET /teachers/:id/performance', () => {
    it('应该获取教师绩效信息', async () => {
      const teacherId = 1;

      mockTeacherController.getTeacherPerformance.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            rating: 4.8,
            totalClasses: 120,
            attendanceRate: 98.5,
            studentSatisfaction: 4.9,
            parentFeedback: 4.7,
            achievements: [
              { title: '优秀教师', date: '2023-09-01' },
              { title: '教学能手', date: '2023-06-01' }
            ]
          }
        });
      });

      const response = await request(mockApp)
        .get(`/teachers/${teacherId}/performance`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          rating: 4.8,
          totalClasses: 120,
          attendanceRate: 98.5
        })
      });

      expect(mockTeacherController.getTeacherPerformance).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockTeacherController.getTeachers.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/teachers')
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
        .post('/teachers')
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
        .get('/teachers')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
