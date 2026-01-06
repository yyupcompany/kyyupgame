import { jest } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import express from 'express';

// Mock controllers
const mockEnrollmentController = {
  getEnrollments: jest.fn(),
  getEnrollmentById: jest.fn(),
  createEnrollment: jest.fn(),
  updateEnrollment: jest.fn(),
  deleteEnrollment: jest.fn(),
  approveEnrollment: jest.fn(),
  rejectEnrollment: jest.fn(),
  getEnrollmentStats: jest.fn(),
  searchEnrollments: jest.fn(),
  getEnrollmentsByKindergarten: jest.fn(),
  getEnrollmentsByStudent: jest.fn(),
  getEnrollmentsByParent: jest.fn(),
  bulkUpdateEnrollments: jest.fn(),
  exportEnrollments: jest.fn(),
  getEnrollmentHistory: jest.fn(),
  transferEnrollment: jest.fn(),
  withdrawEnrollment: jest.fn()
};

// Mock middlewares
const mockAuthMiddleware = {
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 1, username: 'admin', role: 'admin' };
    next();
  }),
  requireRole: jest.fn(() => (req, res, next) => next()),
  requirePermission: jest.fn(() => (req, res, next) => next())
};

const mockValidationMiddleware = {
  validateEnrollmentCreation: jest.fn((req, res, next) => next()),
  validateEnrollmentUpdate: jest.fn((req, res, next) => next()),
  validateEnrollmentApproval: jest.fn((req, res, next) => next()),
  validateEnrollmentTransfer: jest.fn((req, res, next) => next()),
  validateSearch: jest.fn((req, res, next) => next())
};

const mockUploadMiddleware = {
  fields: jest.fn(() => (req, res, next) => {
    req.files = {
      documents: [
        {
          originalname: 'birth_certificate.pdf',
          mimetype: 'application/pdf',
          size: 1024,
          buffer: Buffer.from('fake pdf data')
        }
      ]
    };
    next();
  })
};

const mockRateLimitMiddleware = jest.fn().mockImplementation((req: any, res: any, next: any) => next());

// Mock imports
jest.unstable_mockModule('../../../../../src/controllers/enrollment.controller', () => ({
  default: mockEnrollmentController
}));

jest.unstable_mockModule('../../../../../src/middlewares/auth.middleware', () => ({

jest.unstable_mockModule('../../../../../src/middlewares/upload.middleware', () => ({
  default: mockUploadMiddleware
}));

jest.unstable_mockModule('../../../../../src/middlewares/rate-limit.middleware', () => ({
  default: mockRateLimitMiddleware
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

describe('Enrollment Routes', () => {
  let app: express.Application;
  let enrollmentRoutes: any;

  beforeAll(async () => {
    // Create Express app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Import routes
    const imported = await import('../../../../../src/routes/enrollment.routes');
    enrollmentRoutes = imported.default || imported.enrollmentRoutes || imported;
    
    // Mount routes
    app.use('/api/enrollments', enrollmentRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mock responses
    mockEnrollmentController.getEnrollments.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: [
          {
            id: 1,
            studentId: 1,
            kindergartenId: 1,
            classId: 1,
            status: 'pending',
            applicationDate: '2024-01-15',
            student: { name: '张小明', age: 4 },
            kindergarten: { name: '阳光幼儿园' }
          },
          {
            id: 2,
            studentId: 2,
            kindergartenId: 1,
            classId: 2,
            status: 'approved',
            applicationDate: '2024-01-10',
            student: { name: '李小红', age: 5 },
            kindergarten: { name: '阳光幼儿园' }
          }
        ],
        pagination: { page: 1, pageSize: 10, total: 2 }
      });
    });

    mockEnrollmentController.getEnrollmentById.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: {
          id: 1,
          studentId: 1,
          kindergartenId: 1,
          classId: 1,
          status: 'pending',
          applicationDate: '2024-01-15',
          documents: [
            { type: 'birth_certificate', url: '/uploads/birth_cert.pdf' },
            { type: 'health_record', url: '/uploads/health.pdf' }
          ],
          student: { name: '张小明', age: 4, parentId: 1 },
          kindergarten: { name: '阳光幼儿园', address: '北京市朝阳区' },
          class: { name: '小班A', capacity: 25, currentEnrollment: 20 }
        }
      });
    });

    mockEnrollmentController.createEnrollment.mockImplementation((req, res) => {
      res.status(201).json({
        success: true,
        data: { id: 3, ...req.body, status: 'pending' },
        message: 'Enrollment application submitted successfully'
      });
    });

    mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: parseInt(req.params.id), ...req.body },
        message: 'Enrollment updated successfully'
      });
    });

    mockEnrollmentController.approveEnrollment.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: parseInt(req.params.id), status: 'approved' },
        message: 'Enrollment approved successfully'
      });
    });

    mockEnrollmentController.rejectEnrollment.mockImplementation((req, res) => {
      res.status(200).json({
        success: true,
        data: { id: parseInt(req.params.id), status: 'rejected' },
        message: 'Enrollment rejected'
      });
    });
  });

  describe('GET /api/enrollments', () => {
    it('应该获取报名申请列表', async () => {
      const response = await request(app)
        .get('/api/enrollments')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object)
      });
      expect(response.body.data).toHaveLength(2);
      expect(mockEnrollmentController.getEnrollments).toHaveBeenCalled();
    });

    it('应该支持分页参数', async () => {
      await request(app)
        .get('/api/enrollments?page=2&pageSize=5')
        .expect(200);

      expect(mockEnrollmentController.getEnrollments).toHaveBeenCalled();
    });

    it('应该支持状态筛选', async () => {
      await request(app)
        .get('/api/enrollments?status=pending')
        .expect(200);

      expect(mockEnrollmentController.getEnrollments).toHaveBeenCalled();
    });

    it('应该支持日期范围筛选', async () => {
      await request(app)
        .get('/api/enrollments?startDate=2024-01-01&endDate=2024-01-31')
        .expect(200);

      expect(mockEnrollmentController.getEnrollments).toHaveBeenCalled();
    });

    it('应该要求认证', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({ success: false, message: 'Unauthorized' });
      });

      await request(app)
        .get('/api/enrollments')
        .expect(401);
    });
  });

  describe('GET /api/enrollments/:id', () => {
    it('应该获取指定报名申请详情', async () => {
      const response = await request(app)
        .get('/api/enrollments/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          status: 'pending',
          student: expect.objectContaining({
            name: '张小明'
          }),
          documents: expect.any(Array)
        })
      });
      expect(mockEnrollmentController.getEnrollmentById).toHaveBeenCalled();
    });

    it('应该验证报名ID格式', async () => {
      mockEnrollmentController.getEnrollmentById.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid enrollment ID format'
        });
      });

      await request(app)
        .get('/api/enrollments/invalid-id')
        .expect(400);
    });

    it('应该处理报名不存在的情况', async () => {
      mockEnrollmentController.getEnrollmentById.mockImplementation((req, res) => {
        res.status(404).json({
          success: false,
          message: 'Enrollment not found'
        });
      });

      await request(app)
        .get('/api/enrollments/999')
        .expect(404);
    });
  });

  describe('POST /api/enrollments', () => {
    it('应该创建新的报名申请', async () => {
      const enrollmentData = {
        studentId: 1,
        kindergartenId: 1,
        classId: 1,
        preferredStartDate: '2024-09-01',
        specialRequirements: '孩子对花生过敏',
        emergencyContact: {
          name: '张爸爸',
          phone: '13800138001',
          relationship: 'father'
        }
      };

      const response = await request(app)
        .post('/api/enrollments')
        .send(enrollmentData)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          studentId: 1,
          kindergartenId: 1,
          status: 'pending'
        }),
        message: 'Enrollment application submitted successfully'
      });
      expect(mockEnrollmentController.createEnrollment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateEnrollmentCreation).toHaveBeenCalled();
    });

    it('应该验证必填字段', async () => {
      mockValidationMiddleware.validateEnrollmentCreation.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Student ID is required', 'Kindergarten ID is required']
        });
      });

      await request(app)
        .post('/api/enrollments')
        .send({})
        .expect(400);

      expect(mockValidationMiddleware.validateEnrollmentCreation).toHaveBeenCalled();
    });

    it('应该检查重复申请', async () => {
      mockEnrollmentController.createEnrollment.mockImplementation((req, res) => {
        res.status(409).json({
          success: false,
          message: 'Student already has a pending enrollment for this kindergarten'
        });
      });

      const enrollmentData = {
        studentId: 1,
        kindergartenId: 1,
        classId: 1
      };

      await request(app)
        .post('/api/enrollments')
        .send(enrollmentData)
        .expect(409);
    });

    it('应该支持文档上传', async () => {
      const enrollmentData = {
        studentId: 1,
        kindergartenId: 1,
        classId: 1
      };

      const response = await request(app)
        .post('/api/enrollments')
        .field('data', JSON.stringify(enrollmentData))
        .attach('documents', Buffer.from('fake pdf'), 'birth_certificate.pdf')
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(mockEnrollmentController.createEnrollment).toHaveBeenCalled();
    });
  });

  describe('PUT /api/enrollments/:id', () => {
    it('应该更新报名申请信息', async () => {
      const updateData = {
        preferredStartDate: '2024-10-01',
        specialRequirements: '更新的特殊要求',
        status: 'under_review'
      };

      const response = await request(app)
        .put('/api/enrollments/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          preferredStartDate: '2024-10-01'
        }),
        message: 'Enrollment updated successfully'
      });
      expect(mockEnrollmentController.updateEnrollment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateEnrollmentUpdate).toHaveBeenCalled();
    });

    it('应该验证权限', async () => {
      mockAuthMiddleware.requirePermission.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions'
        });
      });

      await request(app)
        .put('/api/enrollments/1')
        .send({ status: 'approved' })
        .expect(403);
    });

    it('应该防止无效状态转换', async () => {
      mockEnrollmentController.updateEnrollment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Invalid status transition'
        });
      });

      await request(app)
        .put('/api/enrollments/1')
        .send({ status: 'invalid_status' })
        .expect(400);
    });
  });

  describe('POST /api/enrollments/:id/approve', () => {
    it('应该批准报名申请', async () => {
      const approvalData = {
        approvedBy: 1,
        approvalNotes: '符合入学条件',
        assignedClassId: 1,
        startDate: '2024-09-01'
      };

      const response = await request(app)
        .post('/api/enrollments/1/approve')
        .send(approvalData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          status: 'approved'
        }),
        message: 'Enrollment approved successfully'
      });
      expect(mockEnrollmentController.approveEnrollment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateEnrollmentApproval).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Admin role required'
        });
      });

      await request(app)
        .post('/api/enrollments/1/approve')
        .send({ approvedBy: 1 })
        .expect(403);
    });

    it('应该检查班级容量', async () => {
      mockEnrollmentController.approveEnrollment.mockImplementation((req, res) => {
        res.status(400).json({
          success: false,
          message: 'Class is at full capacity'
        });
      });

      await request(app)
        .post('/api/enrollments/1/approve')
        .send({ assignedClassId: 1 })
        .expect(400);
    });
  });

  describe('POST /api/enrollments/:id/reject', () => {
    it('应该拒绝报名申请', async () => {
      const rejectionData = {
        rejectedBy: 1,
        rejectionReason: '年龄不符合要求',
        rejectionNotes: '需要等到下一学年'
      };

      const response = await request(app)
        .post('/api/enrollments/1/reject')
        .send(rejectionData)
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          id: 1,
          status: 'rejected'
        }),
        message: 'Enrollment rejected'
      });
      expect(mockEnrollmentController.rejectEnrollment).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Admin role required'
        });
      });

      await request(app)
        .post('/api/enrollments/1/reject')
        .send({ rejectionReason: 'Test' })
        .expect(403);
    });

    it('应该验证拒绝原因', async () => {
      mockValidationMiddleware.validateEnrollmentApproval.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      });

      await request(app)
        .post('/api/enrollments/1/reject')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/enrollments/search', () => {
    it('应该搜索报名申请', async () => {
      mockEnrollmentController.searchEnrollments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, student: { name: '张小明' }, status: 'pending' }
          ],
          pagination: { page: 1, pageSize: 10, total: 1 }
        });
      });

      const response = await request(app)
        .get('/api/enrollments/search?q=张小明')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(mockEnrollmentController.searchEnrollments).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateSearch).toHaveBeenCalled();
    });

    it('应该支持高级搜索', async () => {
      await request(app)
        .get('/api/enrollments/search?q=张&status=pending&kindergarten=1')
        .expect(200);

      expect(mockEnrollmentController.searchEnrollments).toHaveBeenCalled();
    });
  });

  describe('GET /api/enrollments/kindergarten/:kindergartenId', () => {
    it('应该获取指定幼儿园的报名申请', async () => {
      mockEnrollmentController.getEnrollmentsByKindergarten.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, student: { name: '张小明' }, status: 'pending' },
            { id: 2, student: { name: '李小红' }, status: 'approved' }
          ]
        });
      });

      const response = await request(app)
        .get('/api/enrollments/kindergarten/1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(mockEnrollmentController.getEnrollmentsByKindergarten).toHaveBeenCalled();
    });

    it('应该支持状态筛选', async () => {
      await request(app)
        .get('/api/enrollments/kindergarten/1?status=pending')
        .expect(200);

      expect(mockEnrollmentController.getEnrollmentsByKindergarten).toHaveBeenCalled();
    });
  });

  describe('GET /api/enrollments/student/:studentId', () => {
    it('应该获取指定学生的报名申请', async () => {
      mockEnrollmentController.getEnrollmentsByStudent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, kindergarten: { name: '阳光幼儿园' }, status: 'approved' }
          ]
        });
      });

      const response = await request(app)
        .get('/api/enrollments/student/1')
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(mockEnrollmentController.getEnrollmentsByStudent).toHaveBeenCalled();
    });
  });

  describe('GET /api/enrollments/parent/:parentId', () => {
    it('应该获取指定家长的报名申请', async () => {
      mockEnrollmentController.getEnrollmentsByParent.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            { id: 1, student: { name: '张小明' }, status: 'pending' },
            { id: 2, student: { name: '张小红' }, status: 'approved' }
          ]
        });
      });

      const response = await request(app)
        .get('/api/enrollments/parent/1')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(mockEnrollmentController.getEnrollmentsByParent).toHaveBeenCalled();
    });
  });

  describe('GET /api/enrollments/stats', () => {
    it('应该获取报名统计信息', async () => {
      mockEnrollmentController.getEnrollmentStats.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: {
            total: 150,
            pending: 45,
            approved: 80,
            rejected: 20,
            withdrawn: 5,
            byKindergarten: {
              '阳光幼儿园': 60,
              '星星幼儿园': 45,
              '月亮幼儿园': 45
            },
            byMonth: [
              { month: '2024-01', count: 25 },
              { month: '2024-02', count: 30 }
            ]
          }
        });
      });

      const response = await request(app)
        .get('/api/enrollments/stats')
        .expect(200);

      expect(response.body.data).toEqual(
        expect.objectContaining({
          total: 150,
          pending: 45,
          byKindergarten: expect.any(Object)
        })
      );
      expect(mockEnrollmentController.getEnrollmentStats).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Admin role required'
        });
      });

      await request(app)
        .get('/api/enrollments/stats')
        .expect(403);
    });
  });

  describe('POST /api/enrollments/:id/transfer', () => {
    it('应该转移报名申请', async () => {
      const transferData = {
        newKindergartenId: 2,
        newClassId: 3,
        transferReason: '搬家到新地址',
        transferDate: '2024-03-01'
      };

      mockEnrollmentController.transferEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { id: 1, kindergartenId: 2, classId: 3 },
          message: 'Enrollment transferred successfully'
        });
      });

      const response = await request(app)
        .post('/api/enrollments/1/transfer')
        .send(transferData)
        .expect(200);

      expect(response.body.message).toBe('Enrollment transferred successfully');
      expect(mockEnrollmentController.transferEnrollment).toHaveBeenCalled();
      expect(mockValidationMiddleware.validateEnrollmentTransfer).toHaveBeenCalled();
    });

    it('应该验证转移权限', async () => {
      mockAuthMiddleware.requirePermission.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Transfer permission required'
        });
      });

      await request(app)
        .post('/api/enrollments/1/transfer')
        .send({ newKindergartenId: 2 })
        .expect(403);
    });
  });

  describe('POST /api/enrollments/:id/withdraw', () => {
    it('应该撤回报名申请', async () => {
      const withdrawData = {
        withdrawReason: '家庭计划变更',
        withdrawDate: '2024-02-15'
      };

      mockEnrollmentController.withdrawEnrollment.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { id: 1, status: 'withdrawn' },
          message: 'Enrollment withdrawn successfully'
        });
      });

      const response = await request(app)
        .post('/api/enrollments/1/withdraw')
        .send(withdrawData)
        .expect(200);

      expect(response.body.message).toBe('Enrollment withdrawn successfully');
      expect(mockEnrollmentController.withdrawEnrollment).toHaveBeenCalled();
    });
  });

  describe('GET /api/enrollments/:id/history', () => {
    it('应该获取报名申请历史记录', async () => {
      mockEnrollmentController.getEnrollmentHistory.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: [
            {
              id: 1,
              action: 'created',
              timestamp: '2024-01-15T10:00:00Z',
              userId: 1,
              details: '报名申请已提交'
            },
            {
              id: 2,
              action: 'under_review',
              timestamp: '2024-01-16T14:30:00Z',
              userId: 2,
              details: '开始审核'
            }
          ]
        });
      });

      const response = await request(app)
        .get('/api/enrollments/1/history')
        .expect(200);

      expect(response.body.data).toHaveLength(2);
      expect(mockEnrollmentController.getEnrollmentHistory).toHaveBeenCalled();
    });
  });

  describe('PUT /api/enrollments/bulk', () => {
    it('应该批量更新报名申请', async () => {
      const bulkData = {
        enrollmentIds: [1, 2, 3],
        updates: { status: 'under_review' }
      };

      mockEnrollmentController.bulkUpdateEnrollments.mockImplementation((req, res) => {
        res.status(200).json({
          success: true,
          data: { updatedCount: 3 },
          message: 'Enrollments updated successfully'
        });
      });

      const response = await request(app)
        .put('/api/enrollments/bulk')
        .send(bulkData)
        .expect(200);

      expect(response.body.data.updatedCount).toBe(3);
      expect(mockEnrollmentController.bulkUpdateEnrollments).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Admin role required'
        });
      });

      await request(app)
        .put('/api/enrollments/bulk')
        .send({ enrollmentIds: [1, 2], updates: {} })
        .expect(403);
    });
  });

  describe('GET /api/enrollments/export', () => {
    it('应该导出报名申请数据', async () => {
      mockEnrollmentController.exportEnrollments.mockImplementation((req, res) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=enrollments.csv');
        res.status(200).send('id,student,kindergarten,status\n1,张小明,阳光幼儿园,pending');
      });

      const response = await request(app)
        .get('/api/enrollments/export?format=csv')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(mockEnrollmentController.exportEnrollments).toHaveBeenCalled();
    });

    it('应该要求管理员权限', async () => {
      mockAuthMiddleware.requireRole.mockImplementation(() => (req, res, next) => {
        res.status(403).json({
          success: false,
          message: 'Admin role required'
        });
      });

      await request(app)
        .get('/api/enrollments/export')
        .expect(403);
    });
  });

  describe('错误处理', () => {
    it('应该处理控制器错误', async () => {
      mockEnrollmentController.getEnrollments.mockImplementation((req, res, next) => {
        const error = new Error('Database connection failed');
        next(error);
      });

      await request(app)
        .get('/api/enrollments')
        .expect(500);
    });

    it('应该处理验证错误', async () => {
      mockValidationMiddleware.validateEnrollmentCreation.mockImplementation((req, res, next) => {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: ['Invalid student ID']
        });
      });

      await request(app)
        .post('/api/enrollments')
        .send({ studentId: 'invalid' })
        .expect(400);
    });

    it('应该处理认证错误', async () => {
      mockAuthMiddleware.authenticate.mockImplementation((req, res, next) => {
        res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      });

      await request(app)
        .post('/api/enrollments')
        .send({ studentId: 1 })
        .expect(401);
    });
  });

  describe('路由参数验证', () => {
    it('应该验证数字ID参数', async () => {
      await request(app)
        .get('/api/enrollments/abc')
        .expect(400);
    });

    it('应该验证查询参数', async () => {
      await request(app)
        .get('/api/enrollments?page=invalid')
        .expect(400);
    });

    it('应该处理缺失的必需参数', async () => {
      await request(app)
        .post('/api/enrollments/1/approve')
        .send({})
        .expect(400);
    });
  });
});
