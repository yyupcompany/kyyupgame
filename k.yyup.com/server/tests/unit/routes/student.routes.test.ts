import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock Express app
const mockApp = express();

// Mock controllers
const mockStudentController = {
  getStudents: jest.fn(),
  getStudentById: jest.fn(),
  createStudent: jest.fn(),
  updateStudent: jest.fn(),
  deleteStudent: jest.fn(),
  assignToClass: jest.fn(),
  removeFromClass: jest.fn(),
  getStudentParents: jest.fn(),
  addParentRelation: jest.fn(),
  removeParentRelation: jest.fn(),
  getStudentActivities: jest.fn(),
  registerForActivity: jest.fn(),
  unregisterFromActivity: jest.fn(),
  updateStudentStatus: jest.fn(),
  getStudentReports: jest.fn(),
  uploadStudentPhoto: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockPermissionMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockValidationMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());
const mockUploadMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/student.controller', () => mockStudentController);
jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({
jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  uploadStudentPhoto: mockUploadMiddleware
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

describe('Student Routes', () => {
  let studentRouter: any;

  beforeAll(async () => {
    // 动态导入路由
    const { default: importedStudentRouter } = await import('../../../../../src/routes/student.routes');
    studentRouter = importedStudentRouter;
    
    // 设置Express应用
    mockApp.use('/students', studentRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 设置默认的控制器响应
    mockStudentController.getStudents.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          students: [
            {
              id: 1,
              name: '小明',
              gender: 'male',
              birthDate: '2019-05-15',
              status: 'active',
              class: { id: 1, name: '小班A' },
              kindergarten: { id: 1, name: '阳光幼儿园' }
            },
            {
              id: 2,
              name: '小红',
              gender: 'female',
              birthDate: '2018-08-20',
              status: 'active',
              class: { id: 2, name: '中班B' },
              kindergarten: { id: 1, name: '阳光幼儿园' }
            }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        }
      });
    });
    
    mockStudentController.getStudentById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          name: '小明',
          gender: 'male',
          birthDate: '2019-05-15',
          status: 'active',
          allergies: ['花生', '海鲜'],
          medicalConditions: [],
          emergencyContact: '张三',
          emergencyPhone: '13800138000',
          class: { id: 1, name: '小班A' },
          kindergarten: { id: 1, name: '阳光幼儿园' },
          parents: [
            { id: 1, name: '张爸爸', relationship: 'father' },
            { id: 2, name: '李妈妈', relationship: 'mother' }
          ]
        }
      });
    });
    
    mockStudentController.createStudent.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        message: '学生创建成功',
        data: {
          id: 3,
          name: req.body.name,
          gender: req.body.gender,
          birthDate: req.body.birthDate,
          status: 'active'
        }
      });
    });
  });

  describe('GET /students', () => {
    it('应该获取学生列表', async () => {
      const response = await request(mockApp)
        .get('/students')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: {
          students: expect.any(Array),
          total: 2,
          page: 1,
          pageSize: 10
        }
      });

      expect(mockStudentController.getStudents).toHaveBeenCalled();
    });

    it('应该支持分页查询', async () => {
      await request(mockApp)
        .get('/students')
        .query({ page: 2, pageSize: 5 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStudentController.getStudents).toHaveBeenCalled();
    });

    it('应该支持按班级筛选', async () => {
      await request(mockApp)
        .get('/students')
        .query({ classId: 1 })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStudentController.getStudents).toHaveBeenCalled();
    });

    it('应该支持按状态筛选', async () => {
      await request(mockApp)
        .get('/students')
        .query({ status: 'active' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStudentController.getStudents).toHaveBeenCalled();
    });

    it('应该支持搜索功能', async () => {
      await request(mockApp)
        .get('/students')
        .query({ search: '小明' })
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(mockStudentController.getStudents).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/students');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求学生查看权限', async () => {
      await request(mockApp)
        .get('/students')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('GET /students/:id', () => {
    it('应该获取指定学生信息', async () => {
      const studentId = 1;
      const response = await request(mockApp)
        .get(`/students/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          name: '小明',
          gender: 'male',
          birthDate: '2019-05-15',
          status: 'active'
        })
      });

      expect(mockStudentController.getStudentById).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .get('/students/1');

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求学生查看权限', async () => {
      await request(mockApp)
        .get('/students/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /students', () => {
    it('应该创建新学生', async () => {
      const studentData = {
        name: '小刚',
        gender: 'male',
        birthDate: '2020-03-10',
        kindergartenId: 1,
        classId: 1,
        allergies: ['牛奶'],
        medicalConditions: [],
        emergencyContact: '王五',
        emergencyPhone: '13900139000',
        address: '北京市朝阳区学生家园456号'
      };

      const response = await request(mockApp)
        .post('/students')
        .set('Authorization', 'Bearer valid-token')
        .send(studentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: '学生创建成功',
        data: expect.objectContaining({
          name: '小刚',
          gender: 'male',
          birthDate: '2020-03-10'
        })
      });

      expect(mockStudentController.createStudent).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/students')
        .set('Authorization', 'Bearer valid-token')
        .send({
          name: '测试学生',
          gender: 'male'
        });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      await request(mockApp)
        .post('/students')
        .send({ name: '测试' });

      expect(mockAuthMiddleware).toHaveBeenCalled();
    });

    it('应该要求学生创建权限', async () => {
      await request(mockApp)
        .post('/students')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('PUT /students/:id', () => {
    it('应该更新学生信息', async () => {
      const studentId = 1;
      const updateData = {
        name: '小明明',
        allergies: ['花生', '海鲜', '牛奶'],
        emergencyContact: '张四',
        emergencyPhone: '13800138001'
      };

      mockStudentController.updateStudent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生更新成功',
          data: {
            id: studentId,
            ...updateData
          }
        });
      });

      const response = await request(mockApp)
        .put(`/students/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生更新成功',
        data: expect.objectContaining(updateData)
      });

      expect(mockStudentController.updateStudent).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .put('/students/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });

    it('应该要求学生更新权限', async () => {
      await request(mockApp)
        .put('/students/1')
        .set('Authorization', 'Bearer valid-token')
        .send({ name: '测试' });

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /students/:id', () => {
    it('应该删除学生', async () => {
      const studentId = 1;

      mockStudentController.deleteStudent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生删除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/students/${studentId}`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生删除成功'
      });

      expect(mockStudentController.deleteStudent).toHaveBeenCalled();
    });

    it('应该要求学生删除权限', async () => {
      await request(mockApp)
        .delete('/students/1')
        .set('Authorization', 'Bearer valid-token');

      expect(mockPermissionMiddleware).toHaveBeenCalled();
    });
  });

  describe('POST /students/:id/assign-class', () => {
    it('应该分配学生到班级', async () => {
      const studentId = 1;
      const classData = {
        classId: 2
      };

      mockStudentController.assignToClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生分配到班级成功'
        });
      });

      const response = await request(mockApp)
        .post(`/students/${studentId}/assign-class`)
        .set('Authorization', 'Bearer valid-token')
        .send(classData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生分配到班级成功'
      });

      expect(mockStudentController.assignToClass).toHaveBeenCalled();
    });

    it('应该应用验证中间件', async () => {
      await request(mockApp)
        .post('/students/1/assign-class')
        .set('Authorization', 'Bearer valid-token')
        .send({ classId: 1 });

      expect(mockValidationMiddleware).toHaveBeenCalled();
    });
  });

  describe('DELETE /students/:id/remove-class', () => {
    it('应该从班级移除学生', async () => {
      const studentId = 1;

      mockStudentController.removeFromClass.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生从班级移除成功'
        });
      });

      const response = await request(mockApp)
        .delete(`/students/${studentId}/remove-class`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生从班级移除成功'
      });

      expect(mockStudentController.removeFromClass).toHaveBeenCalled();
    });
  });

  describe('GET /students/:id/parents', () => {
    it('应该获取学生家长列表', async () => {
      const studentId = 1;

      mockStudentController.getStudentParents.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '张爸爸',
              relationship: 'father',
              phone: '13800138000',
              email: 'father@example.com'
            },
            {
              id: 2,
              name: '李妈妈',
              relationship: 'mother',
              phone: '13900139000',
              email: 'mother@example.com'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/students/${studentId}/parents`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '张爸爸',
            relationship: 'father'
          })
        ])
      });

      expect(mockStudentController.getStudentParents).toHaveBeenCalled();
    });
  });

  describe('POST /students/:id/parents', () => {
    it('应该添加家长关系', async () => {
      const studentId = 1;
      const parentData = {
        parentId: 3,
        relationship: 'guardian'
      };

      mockStudentController.addParentRelation.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '家长关系添加成功'
        });
      });

      const response = await request(mockApp)
        .post(`/students/${studentId}/parents`)
        .set('Authorization', 'Bearer valid-token')
        .send(parentData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '家长关系添加成功'
      });

      expect(mockStudentController.addParentRelation).toHaveBeenCalled();
    });
  });

  describe('GET /students/:id/activities', () => {
    it('应该获取学生活动列表', async () => {
      const studentId = 1;

      mockStudentController.getStudentActivities.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              name: '绘画课',
              type: 'art',
              status: 'active',
              registrationDate: '2024-01-15'
            },
            {
              id: 2,
              name: '音乐课',
              type: 'music',
              status: 'active',
              registrationDate: '2024-01-20'
            }
          ]
        });
      });

      const response = await request(mockApp)
        .get(`/students/${studentId}/activities`)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            name: '绘画课',
            type: 'art'
          })
        ])
      });

      expect(mockStudentController.getStudentActivities).toHaveBeenCalled();
    });
  });

  describe('POST /students/:id/photo', () => {
    it('应该上传学生照片', async () => {
      const studentId = 1;

      mockStudentController.uploadStudentPhoto.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '照片上传成功',
          data: {
            photo: '/uploads/students/student1.jpg'
          }
        });
      });

      const response = await request(mockApp)
        .post(`/students/${studentId}/photo`)
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
      expect(mockStudentController.uploadStudentPhoto).toHaveBeenCalled();
    });
  });

  describe('PUT /students/:id/status', () => {
    it('应该更新学生状态', async () => {
      const studentId = 1;
      const statusData = {
        status: 'graduated'
      };

      mockStudentController.updateStudentStatus.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          message: '学生状态更新成功'
        });
      });

      const response = await request(mockApp)
        .put(`/students/${studentId}/status`)
        .set('Authorization', 'Bearer valid-token')
        .send(statusData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        message: '学生状态更新成功'
      });

      expect(mockStudentController.updateStudentStatus).toHaveBeenCalled();
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器抛出的错误', async () => {
      mockStudentController.getStudents.mockImplementation((req, res, next) => {
        const error = new Error('数据库连接失败');
        next(error);
      });

      await request(mockApp)
        .get('/students')
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
        .post('/students')
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
        .get('/students')
        .set('Authorization', 'Bearer valid-token')
        .expect(403);
    });
  });
});
