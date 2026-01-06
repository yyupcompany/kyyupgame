import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockClassController = {
  getClasses: jest.fn(),
  getClassById: jest.fn(),
  createClass: jest.fn(),
  updateClass: jest.fn(),
  deleteClass: jest.fn(),
  getClassStudents: jest.fn(),
  addStudentToClass: jest.fn(),
  removeStudentFromClass: jest.fn(),
  getClassTeachers: jest.fn(),
  assignTeacherToClass: jest.fn(),
  removeTeacherFromClass: jest.fn(),
  getClassSchedule: jest.fn(),
  updateClassSchedule: jest.fn(),
  getClassStatistics: jest.fn(),
  updateClassStatus: jest.fn(),
  getClassActivities: jest.fn(),
  uploadClassPhoto: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/class.controller', () => mockClassController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadClassPhoto: mockUploadMiddleware
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

describe('Class Routes', () => {
  let classRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedClassRouter } = await import('../../../../../src/routes/class.routes');
    classRouter = importedClassRouter;
    
    // 设置Express应用
    mockApp.use('/classes', classRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockClassController.getClasses.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          classes: [
            {
              id: 1,
              name: '小班A',
              level: 'small',
              capacity: 25,
              currentStudents: 22,
              status: 'active',
              kindergarten: { id: 1, name: '阳光幼儿园' },
              teachers: [
                { id: 1, name: '张老师', role: 'main' },
                { id: 2, name: '李老师', role: 'assistant' }
              ]
            },
            {
              id: 2,
              name: '中班B',
              level: 'medium',
              capacity: 28,
              currentStudents: 25,
              status: 'active',
              kindergarten: { id: 1, name: '阳光幼儿园' },
              teachers: [
                { id: 3, name: '王老师', role: 'main' }
              ]
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockClassController.getClassById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '小班A',
          level: 'small',
          ageGroup: '3-4岁',
          capacity: 25,
          currentStudents: 22,
          status: 'active',
          classroom: 'A101',
          description: '活泼好动的小班',
          kindergarten: { id: 1, name: '阳光幼儿园' },
          teachers: [
            { id: 1, name: '张老师', role: 'main', subject: '综合' },
            { id: 2, name: '李老师', role: 'assistant', subject: '音乐' }
          ],
          students: [
            { id: 1, name: '小明', age: 4, status: 'active' },
            { id: 2, name: '小红', age: 3, status: 'active' }
          ]
        }
      });
    });
    
    mockClassController.createClass.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '班级创建成功',
        data: {
          id: 3,
          name: req.body.name,
          level: req.body.level,
          capacity: req.body.capacity,
          status: 'active'
        }
      });
    });
  });

  describe('GET /classes', () => {
    it('应该获取班级列表', async () => {
      const response = await request(mockApp)
        .get('/classes')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          classes: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockClassController.getClasses).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/classes')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockClassController.getClasses).toHaveBeenCalled();
    });

    it('应该支持按级别筛选', async () => {
      await request(mockApp)
        .get('/classes')
        .query({ level: 'small' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockClassController.getClasses).toHaveBeenCalled();
    });

    it('应该支持按状态筛选', async () => {
      await request(mockApp)
        .get('/classes')
        .query({ status: 'active' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockClassController.getClasses).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/classes')
        .query({ search: '小班' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockClassController.getClasses).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/classes');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求班级查看权限', async () => {
      await request(mockApp)
        .get('/classes')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id', () => {
    it('应该获取指定班级信息', async () => {
      const classId = 1;
      const response = await request(mockApp)
        .get(`/classes/${classId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: '小班A',
          level: 'small',
          capacity: 25,
          currentStudents: 22,
          status: 'active'
        })
      });

      expect(mockClassController.getClassById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/classes/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求班级查看权限', async () => {
      await request(mockApp)
        .get('/classes/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /classes', () => {
    it('应该创建新班级', async () => {
      const classData = {
        name: '大班C',
        level: 'large',
        ageGroup: '5-6岁',
        capacity: 30,
        kindergartenId: 1,
        classroom: 'A301',
        description: '即将升入小学的大班'
      };

      const response = await request(mockApp)
        .post('/classes')
        .set('Authorization', 'Bearer valid-token')
        .send(classData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '班级创建成功',
        data: expect.objectContaining({
          name: '大班C',
          level: 'large',
          capacity: 30
        })
      });

      expect(mockClassController.createClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/classes')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: '测试班级',
          level: 'small'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/classes')
        .send({ name: '测试' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求班级创建权限', async () => {
      await request(mockApp)
        .post('/classes')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /classes/:id', () => {
    it('应该更新班级信息', async () => {
      const classId = 1;
      const updateData = {
        name: '小班A（更新）',
        capacity: 26,
        description: '更新后的班级描述',
        classroom: 'A102'
      };

      mockClassController.updateClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '班级更新成功',
          data: {
            id: classId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/classes/${classId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '班级更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockClassController.updateClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/classes/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求班级更新权限', async () => {
      await request(mockApp)
        .put('/classes/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /classes/:id', () => {
    it('应该删除班级', async () => {
      const classId = 1;

      mockClassController.deleteClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '班级删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/classes/${classId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '班级删除成功'
      });

      expect(mockClassController.deleteClass).toHaveBeenCalled();
    });

    it('应该要求班级删除权限', async () => {
      await request(mockApp)
        .delete('/classes/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id/students', () => {
    it('应该获取班级学生列表', async () => {
      const classId = 1;

      mockClassController.getClassStudents.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '小明',
              gender: 'male',
              age: 4,
              status: 'active',
              enrollmentDate: '2024-09-01'
            },
            {
              id: 2,
              name: '小红',
              gender: 'female',
              age: 3,
              status: 'active',
              enrollmentDate: '2024-09-01'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/classes/${classId}/students`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '小明',
            age: 4
          })
        ])
      });

      expect(mockClassController.getClassStudents).toHaveBeenCalled();
    });
  });

  describe('POST /classes/:id/students', () => {
    it('应该添加学生到班级', async () => {
      const classId = 1;
      const studentData = {
        studentId: 3,
        enrollmentDate: '2024-10-01',
        notes: '转班学生'
      };

      mockClassController.addStudentToClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生添加到班级成功'
        });
      });

      const response = await request(mockApp)
        .post(`/classes/${classId}/students`)
        .set('Authorization', 'Bearer valid-token')
        .send(studentData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生添加到班级成功'
      });

      expect(mockClassController.addStudentToClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/classes/1/students')
        .set('Authorization', 'Bearer valid-token')
        .send({ studentId: 1 });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /classes/:id/students/:studentId', () => {
    it('应该从班级移除学生', async () => {
      const classId = 1;
      const studentId = 2;

      mockClassController.removeStudentFromClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生从班级移除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/classes/${classId}/students/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生从班级移除成功'
      });

      expect(mockClassController.removeStudentFromClass).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id/teachers', () => {
    it('应该获取班级教师列表', async () => {
      const classId = 1;

      mockClassController.getClassTeachers.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '张老师',
              role: 'main',
              subject: '综合',
              assignedDate: '2024-09-01'
            },
            {
              id: 2,
              name: '李老师',
              role: 'assistant',
              subject: '音乐',
              assignedDate: '2024-09-01'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/classes/${classId}/teachers`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '张老师',
            role: 'main'
          })
        ])
      });

      expect(mockClassController.getClassTeachers).toHaveBeenCalled();
    });
  });

  describe('POST /classes/:id/teachers', () => {
    it('应该分配教师到班级', async () => {
      const classId = 1;
      const teacherData = {
        teacherId: 4,
        role: 'assistant',
        subject: '体育',
        assignedDate: '2024-10-01'
      };

      mockClassController.assignTeacherToClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '教师分配到班级成功'
        });
      });

      const response = await request(mockApp)
        .post(`/classes/${classId}/teachers`)
        .set('Authorization', 'Bearer valid-token')
        .send(teacherData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '教师分配到班级成功'
      });

      expect(mockClassController.assignTeacherToClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/classes/1/teachers')
        .set('Authorization', 'Bearer valid-token')
        .send({ teacherId: 1 });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id/schedule', () => {
    it('应该获取班级课程表', async () => {
      const classId = 1;

      mockClassController.getClassSchedule.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            monday: [
              { time: '08:00-09:00', subject: '语言课', teacher: '张老师' },
              { time: '09:30-10:30', subject: '数学课', teacher: '张老师' }
            ],
            tuesday: [
              { time: '08:00-09:00', subject: '美术课', teacher: '李老师' }
            ]
          }
        });
      });

      const response = await request(mockApp)
        .get(`/classes/${classId}/schedule`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          monday: expect.any(Array),
          tuesday: expect.any(Array)
        })
      });

      expect(mockClassController.getClassSchedule).toHaveBeenCalled();
    });
  });

  describe('GET /classes/:id/statistics', () => {
    it('应该获取班级统计信息', async () => {
      const classId = 1;

      mockClassController.getClassStatistics.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            totalStudents: 22,
            capacity: 25,
            occupancyRate: 88,
            genderDistribution: {
              male: 12,
              female: 10
            },
            ageDistribution: {
              '3': 8,
              '4': 14
            },
            attendanceRate: 95.5,
            teacherCount: 2
          }
        });
      });

      const response = await request(mockApp)
        .get(`/classes/${classId}/statistics`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          totalStudents: 22,
          capacity: 25,
          occupancyRate: 88
        })
      });

      expect(mockClassController.getClassStatistics).toHaveBeenCalled();
    });
  });

  describe('PUT /classes/:id/status', () => {
    it('应该更新班级状态', async () => {
      const classId = 1;
      const statusData = {
        status: 'inactive'
      };

      mockClassController.updateClassStatus.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '班级状态更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/classes/${classId}/status`)
        .set('Authorization', 'Bearer valid-token')
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '班级状态更新成功'
      });

      expect(mockClassController.updateClassStatus).toHaveBeenCalled();
    });
  });

  describe('POST /classes/:id/photo', () => {
    it('应该上传班级照片', async () => {
      const classId = 1;

      mockClassController.uploadClassPhoto.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '照片上传成功',
          data: {
            photo: '/uploads/classes/class1.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .post(`/classes/${classId}/photo`)
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
      expect(mockClassController.uploadClassPhoto).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockClassController.getClasses.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/classes')
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
        .post('/classes')
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
        .get('/classes')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
