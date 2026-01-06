import { jest } from '@jest/globals';
import { vi } from 'vitest'

// 严格验证工具函数
const validateRequiredFields = (data: any, requiredFields: string[]): { valid: boolean; missing: string[] } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, missing: requiredFields };
  }

  const missing: string[] = [];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }

  return { valid: missing.length === 0, missing };
};

const validateFieldTypes = (data: any, fieldTypes: Record<string, string>): { valid: boolean; errors: string[] } => {
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Data is not an object'] };
  }

  const errors: string[] = [];

  for (const [field, expectedType] of Object.entries(fieldTypes)) {
    const actualValue = data[field];

    if (actualValue === undefined || actualValue === null) {
      continue;
    }

    let actualType = typeof actualValue;

    if (expectedType === 'array') {
      if (!Array.isArray(actualValue)) {
        errors.push(`${field}: Expected array, got ${actualType}`);
      }
    } else if (expectedType === 'object') {
      if (actualType !== 'object' || Array.isArray(actualValue)) {
        errors.push(`${field}: Expected object, got ${actualType}`);
      }
    } else if (actualType !== expectedType) {
      errors.push(`${field}: Expected ${expectedType}, got ${actualType}`);
    }
  }

  return { valid: errors.length === 0, errors };
};

const validateApiResponseStructure = (response: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!response || typeof response !== 'object') {
    return { valid: false, errors: ['Response is not an object'] };
  }

  if (response.success !== undefined && typeof response.success !== 'boolean') {
    errors.push('success field must be boolean');
  }

  if (response.message !== undefined && typeof response.message !== 'string') {
    errors.push('message field must be string');
  }

  if (response.data !== undefined && response.data === null && response.success === true) {
    errors.push('data should not be null when success is true');
  }

  return { valid: errors.length === 0, errors };
};

// Mock services
const mockEnrollmentManagementService = {
  submitApplication: jest.fn(),
  reviewApplication: jest.fn(),
  getApplications: jest.fn(),
  getApplicationById: jest.fn(),
  updateApplication: jest.fn(),
  deleteApplication: jest.fn(),
  createStudentRecord: jest.fn(),
  getApplicationStatistics: jest.fn(),
  sendEnrollmentConfirmation: jest.fn(),
  sendBatchReminders: jest.fn(),
  validateStudentAge: jest.fn(),
  validateEnrollmentPeriod: jest.fn()
};

const mockEnrollmentConsultationService = {
  createConsultation: jest.fn(),
  getConsultations: jest.fn(),
  getConsultationById: jest.fn(),
  updateConsultation: jest.fn(),
  cancelConsultation: jest.fn(),
  confirmConsultation: jest.fn(),
  getAvailableSlots: jest.fn(),
  submitFeedback: jest.fn()
};

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/services/enrollment/enrollment-management.service', () => ({
  default: mockEnrollmentManagementService
}));

jest.unstable_mockModule('../../../../../src/services/enrollment/enrollment-consultation.service', () => ({
  default: mockEnrollmentConsultationService
}));

jest.unstable_mockModule('../../../../../src/utils/logger', () => ({
  default: mockLogger
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

describe('Enrollment Controller - 严格验证', () => {
  let enrollmentController: any;
  let mockRequest: any;
  let mockResponse: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/controllers/enrollment.controller');
    enrollmentController = imported.default || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { id: 1, role: 'admin' },
      headers: {},
      files: {}
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('submitApplication', () => {
    it('应该成功提交报名申请并进行严格验证', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: {
          name: '张小明',
          gender: 'male',
          birthDate: '2020-05-15',
          idNumber: '110101202005151234'
        },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '13800138001',
            email: 'father@example.com'
          },
          mother: {
            name: '张妈妈',
            phone: '13800138002',
            email: 'mother@example.com'
          }
        },
        contactInfo: {
          primaryContact: 'father',
          address: {
            province: '北京市',
            city: '北京市',
            district: '朝阳区',
            street: '某某街道123号'
          }
        },
        preferences: {
          classType: 'regular',
          startDate: '2024-09-01'
        }
      };

      const mockApplication = {
        id: 1,
        applicationNumber: 'APP202400001',
        status: 'submitted',
        ...mockRequest.body,
        createdAt: new Date().toISOString()
      };

      const expectedResponse = {
        success: true,
        message: '报名申请提交成功',
        data: mockApplication
      };

      mockEnrollmentManagementService.submitApplication.mockResolvedValue(mockApplication);
      mockResponse.json.mockImplementation((data) => {
        // 存储响应数据以便验证
        mockResponse.responseData = data;
        return mockResponse;
      });

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      // 1. 验证服务调用
      expect(mockEnrollmentManagementService.submitApplication).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);

      // 2. 验证响应结构
      const apiValidation = validateApiResponseStructure(mockResponse.responseData);
      expect(apiValidation.valid).toBe(true);

      // 3. 验证响应内容
      expect(mockResponse.responseData.success).toBe(true);
      expect(typeof mockResponse.responseData.message).toBe('string');
      expect(mockResponse.responseData.data).toBeDefined();

      // 4. 验证返回数据的必填字段
      const requiredFields = ['id', 'applicationNumber', 'status', 'kindergartenId', 'studentInfo', 'parentInfo', 'contactInfo'];
      const fieldValidation = validateRequiredFields(mockResponse.responseData.data, requiredFields);
      expect(fieldValidation.valid).toBe(true);

      // 5. 验证字段类型
      const typeValidation = validateFieldTypes(mockResponse.responseData.data, {
        id: 'number',
        applicationNumber: 'string',
        status: 'string',
        kindergartenId: 'number',
        studentInfo: 'object',
        parentInfo: 'object',
        contactInfo: 'object',
        preferences: 'object',
        createdAt: 'string'
      });
      expect(typeValidation.valid).toBe(true);

      // 6. 验证学生信息必填字段
      const studentRequiredFields = ['name', 'gender', 'birthDate', 'idNumber'];
      const studentValidation = validateRequiredFields(mockResponse.responseData.data.studentInfo, studentRequiredFields);
      expect(studentValidation.valid).toBe(true);

      // 7. 验证学生信息字段类型
      const studentTypeValidation = validateFieldTypes(mockResponse.responseData.data.studentInfo, {
        name: 'string',
        gender: 'string',
        birthDate: 'string',
        idNumber: 'string'
      });
      expect(studentTypeValidation.valid).toBe(true);

      // 8. 验证家长信息字段
      if (mockResponse.responseData.data.parentInfo.father) {
        const fatherRequiredFields = ['name', 'phone', 'email'];
        const fatherValidation = validateRequiredFields(mockResponse.responseData.data.parentInfo.father, fatherRequiredFields);
        expect(fatherValidation.valid).toBe(true);
      }

      // 9. 验证业务逻辑
      expect(mockResponse.responseData.data.id).toBeGreaterThan(0);
      expect(mockResponse.responseData.data.applicationNumber).toMatch(/^APP\d{9}$/);
      expect(['submitted', 'pending', 'approved', 'rejected']).toContain(mockResponse.responseData.data.status);
      expect(typeof Date.parse(mockResponse.responseData.data.createdAt)).not.toBeNaN);
    });

    it('应该处理幼儿园未开放报名', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' }
      };

      mockEnrollmentManagementService.submitApplication.mockRejectedValue(new Error('该幼儿园当前未开放报名'));

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '该幼儿园当前未开放报名'
      });
    });

    it('应该处理报名名额已满', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' }
      };

      mockEnrollmentManagementService.submitApplication.mockRejectedValue(new Error('报名名额已满'));

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '报名名额已满'
      });
    });

    it('应该处理重复报名', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { idNumber: '110101202005151234' }
      };

      mockEnrollmentManagementService.submitApplication.mockRejectedValue(new Error('该学生已有报名申请'));

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '该学生已有报名申请'
      });
    });

    it('应该验证必填字段', async () => {
      mockRequest.body = {
        // 缺少必填字段
        studentInfo: { name: '张小明' }
      };

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '幼儿园ID是必填字段'
      });
    });

    it('应该处理文件上传', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' }
      };
      mockRequest.files = {
        birthCertificate: [{ filename: 'birth_cert.pdf', path: '/uploads/birth_cert.pdf' }],
        vaccinationRecord: [{ filename: 'vaccination.pdf', path: '/uploads/vaccination.pdf' }]
      };

      const mockApplication = {
        id: 1,
        applicationNumber: 'APP202400001',
        documents: {
          birthCertificate: '/uploads/birth_cert.pdf',
          vaccinationRecord: '/uploads/vaccination.pdf'
        }
      };

      mockEnrollmentManagementService.submitApplication.mockResolvedValue(mockApplication);

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.submitApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          documents: {
            birthCertificate: '/uploads/birth_cert.pdf',
            vaccinationRecord: '/uploads/vaccination.pdf'
          }
        })
      );
    });
  });

  describe('reviewApplication', () => {
    it('应该成功审核通过申请', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'approved',
        reviewNotes: '符合入学条件，同意录取',
        assignedClassId: 3,
        enrollmentDate: '2024-09-01'
      };

      const mockReviewedApplication = {
        id: 1,
        status: 'approved',
        reviewerId: 1,
        reviewNotes: '符合入学条件，同意录取',
        assignedClassId: 3,
        reviewedAt: new Date().toISOString()
      };

      mockEnrollmentManagementService.reviewApplication.mockResolvedValue(mockReviewedApplication);

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.reviewApplication).toHaveBeenCalledWith(1, {
        ...mockRequest.body,
        reviewerId: 1
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '申请审核成功',
        data: mockReviewedApplication
      });
    });

    it('应该成功审核拒绝申请', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'rejected',
        reviewNotes: '年龄不符合要求',
        rejectionReason: 'age_requirement'
      };

      const mockRejectedApplication = {
        id: 1,
        status: 'rejected',
        reviewerId: 1,
        reviewNotes: '年龄不符合要求',
        rejectionReason: 'age_requirement',
        reviewedAt: new Date().toISOString()
      };

      mockEnrollmentManagementService.reviewApplication.mockResolvedValue(mockRejectedApplication);

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '申请审核成功',
        data: mockRejectedApplication
      });
    });

    it('应该处理申请不存在', async () => {
      mockRequest.params = { id: '999' };
      mockRequest.body = { status: 'approved' };

      mockEnrollmentManagementService.reviewApplication.mockRejectedValue(new Error('申请不存在'));

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '申请不存在'
      });
    });

    it('应该处理申请已审核', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { status: 'approved' };

      mockEnrollmentManagementService.reviewApplication.mockRejectedValue(new Error('申请已经审核过，无法重复审核'));

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '申请已经审核过，无法重复审核'
      });
    });

    it('应该处理班级容量不足', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'approved',
        assignedClassId: 3
      };

      mockEnrollmentManagementService.reviewApplication.mockRejectedValue(new Error('指定班级已满员'));

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '指定班级已满员'
      });
    });

    it('应该验证审核状态', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        status: 'invalid_status'
      };

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的审核状态'
      });
    });
  });

  describe('getApplications', () => {
    it('应该获取申请列表', async () => {
      mockRequest.query = {
        kindergartenId: '1',
        status: 'submitted',
        page: '1',
        pageSize: '10',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      const mockApplications = {
        applications: [
          {
            id: 1,
            applicationNumber: 'APP202400001',
            status: 'submitted',
            studentInfo: { name: '张小明' },
            createdAt: new Date().toISOString()
          },
          {
            id: 2,
            applicationNumber: 'APP202400002',
            status: 'submitted',
            studentInfo: { name: '李小红' },
            createdAt: new Date().toISOString()
          }
        ],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 25,
          totalPages: 3
        }
      };

      mockEnrollmentManagementService.getApplications.mockResolvedValue(mockApplications);

      await enrollmentController.getApplications(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.getApplications).toHaveBeenCalledWith({
        kindergartenId: 1,
        status: 'submitted',
        page: 1,
        pageSize: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplications
      });
    });

    it('应该支持多种筛选条件', async () => {
      mockRequest.query = {
        kindergartenId: '1',
        status: 'submitted,under_review',
        studentName: '张',
        parentPhone: '138',
        dateRange: '2024-01-01,2024-12-31'
      };

      await enrollmentController.getApplications(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.getApplications).toHaveBeenCalledWith({
        kindergartenId: 1,
        status: ['submitted', 'under_review'],
        studentName: '张',
        parentPhone: '138',
        dateRange: {
          start: '2024-01-01',
          end: '2024-12-31'
        },
        page: 1,
        pageSize: 20
      });
    });

    it('应该处理查询参数验证', async () => {
      mockRequest.query = {
        page: 'invalid',
        pageSize: '0'
      };

      await enrollmentController.getApplications(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的查询参数'
      });
    });
  });

  describe('getApplicationById', () => {
    it('应该获取申请详情', async () => {
      mockRequest.params = { id: '1' };

      const mockApplication = {
        id: 1,
        applicationNumber: 'APP202400001',
        status: 'submitted',
        studentInfo: {
          name: '张小明',
          gender: 'male',
          birthDate: '2020-05-15'
        },
        parentInfo: {
          father: { name: '张爸爸', phone: '13800138001' }
        },
        documents: {
          birthCertificate: '/uploads/birth_cert.pdf',
          vaccinationRecord: '/uploads/vaccination.pdf'
        },
        createdAt: new Date().toISOString()
      };

      mockEnrollmentManagementService.getApplicationById.mockResolvedValue(mockApplication);

      await enrollmentController.getApplicationById(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.getApplicationById).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockApplication
      });
    });

    it('应该处理申请不存在', async () => {
      mockRequest.params = { id: '999' };

      mockEnrollmentManagementService.getApplicationById.mockResolvedValue(null);

      await enrollmentController.getApplicationById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '申请不存在'
      });
    });

    it('应该验证申请ID格式', async () => {
      mockRequest.params = { id: 'invalid' };

      await enrollmentController.getApplicationById(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '无效的申请ID'
      });
    });
  });

  describe('createStudentRecord', () => {
    it('应该为通过审核的申请创建学生记录', async () => {
      mockRequest.params = { id: '1' };

      const mockStudentRecord = {
        student: {
          id: 1,
          studentNumber: 'STU202400001',
          name: '张小明',
          classId: 3,
          kindergartenId: 1
        },
        parent: {
          id: 1,
          name: '张爸爸',
          phone: '13800138001'
        }
      };

      mockEnrollmentManagementService.createStudentRecord.mockResolvedValue(mockStudentRecord);

      await enrollmentController.createStudentRecord(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.createStudentRecord).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '学生记录创建成功',
        data: mockStudentRecord
      });
    });

    it('应该处理申请未通过审核', async () => {
      mockRequest.params = { id: '1' };

      mockEnrollmentManagementService.createStudentRecord.mockRejectedValue(new Error('只能为已通过审核的申请创建学生记录'));

      await enrollmentController.createStudentRecord(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '只能为已通过审核的申请创建学生记录'
      });
    });

    it('应该处理已创建学生记录', async () => {
      mockRequest.params = { id: '1' };

      mockEnrollmentManagementService.createStudentRecord.mockRejectedValue(new Error('该申请已创建学生记录'));

      await enrollmentController.createStudentRecord(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '该申请已创建学生记录'
      });
    });
  });

  describe('getApplicationStatistics', () => {
    it('应该获取申请统计信息', async () => {
      mockRequest.query = {
        kindergartenId: '1',
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      };

      const mockStatistics = {
        totalApplications: 165,
        statusBreakdown: {
          submitted: 50,
          under_review: 20,
          approved: 80,
          rejected: 15
        },
        approvalRate: 0.842,
        monthlyTrends: [
          { month: '2024-01', applications: 20, approvals: 15 },
          { month: '2024-02', applications: 25, approvals: 20 }
        ],
        ageDistribution: {
          3: 30,
          4: 60,
          5: 50,
          6: 25
        }
      };

      mockEnrollmentManagementService.getApplicationStatistics.mockResolvedValue(mockStatistics);

      await enrollmentController.getApplicationStatistics(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.getApplicationStatistics).toHaveBeenCalledWith(1, {
        start: '2024-01-01',
        end: '2024-12-31'
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatistics
      });
    });

    it('应该处理无统计数据', async () => {
      mockRequest.query = {
        kindergartenId: '1',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockEnrollmentManagementService.getApplicationStatistics.mockResolvedValue({
        totalApplications: 0,
        statusBreakdown: {},
        approvalRate: 0
      });

      await enrollmentController.getApplicationStatistics(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalApplications: 0
        })
      });
    });
  });

  describe('sendBatchReminders', () => {
    it('应该批量发送提醒通知', async () => {
      mockRequest.body = {
        status: 'submitted',
        daysOverdue: 7,
        kindergartenId: 1
      };

      const mockReminderResult = {
        sent: 15,
        failed: 2,
        details: [
          { applicationId: 1, status: 'sent' },
          { applicationId: 2, status: 'failed', error: '邮箱无效' }
        ]
      };

      mockEnrollmentManagementService.sendBatchReminders.mockResolvedValue(mockReminderResult);

      await enrollmentController.sendBatchReminders(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.sendBatchReminders).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '批量提醒发送完成',
        data: mockReminderResult
      });
    });

    it('应该处理无符合条件的申请', async () => {
      mockRequest.body = {
        status: 'submitted',
        daysOverdue: 30
      };

      mockEnrollmentManagementService.sendBatchReminders.mockResolvedValue({
        sent: 0,
        failed: 0,
        details: []
      });

      await enrollmentController.sendBatchReminders(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '没有符合条件的申请需要发送提醒',
        data: expect.objectContaining({
          sent: 0
        })
      });
    });
  });

  describe('Consultation Management', () => {
    it('应该创建咨询预约', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        parentInfo: {
          name: '张家长',
          phone: '13800138001',
          email: 'parent@example.com'
        },
        childInfo: {
          name: '张小明',
          age: 4,
          gender: 'male'
        },
        consultationType: 'enrollment_inquiry',
        preferredDate: '2024-05-15',
        preferredTime: '10:00'
      };

      const mockConsultation = {
        id: 1,
        consultationNumber: 'CON202400001',
        status: 'scheduled',
        ...mockRequest.body,
        createdAt: new Date().toISOString()
      };

      mockEnrollmentConsultationService.createConsultation.mockResolvedValue(mockConsultation);

      await enrollmentController.createConsultation(mockRequest, mockResponse);

      expect(mockEnrollmentConsultationService.createConsultation).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '咨询预约创建成功',
        data: mockConsultation
      });
    });

    it('应该获取可用咨询时段', async () => {
      mockRequest.query = {
        kindergartenId: '1',
        date: '2024-05-15'
      };

      const mockAvailableSlots = [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
        { time: '14:00', available: true }
      ];

      mockEnrollmentConsultationService.getAvailableSlots.mockResolvedValue(mockAvailableSlots);

      await enrollmentController.getAvailableConsultationSlots(mockRequest, mockResponse);

      expect(mockEnrollmentConsultationService.getAvailableSlots).toHaveBeenCalledWith(1, '2024-05-15');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAvailableSlots
      });
    });

    it('应该提交咨询反馈', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = {
        parentSatisfaction: 5,
        consultantRating: 4,
        facilityRating: 5,
        comments: '咨询师非常专业，解答了我们所有的疑问',
        likelyToEnroll: true
      };

      const mockFeedback = {
        id: 1,
        consultationId: 1,
        ...mockRequest.body,
        submittedAt: new Date().toISOString()
      };

      mockEnrollmentConsultationService.submitFeedback.mockResolvedValue(mockFeedback);

      await enrollmentController.submitConsultationFeedback(mockRequest, mockResponse);

      expect(mockEnrollmentConsultationService.submitFeedback).toHaveBeenCalledWith(1, mockRequest.body);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '反馈提交成功',
        data: mockFeedback
      });
    });
  });

  describe('Error Handling', () => {
    it('应该处理服务层错误', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' }
      };

      mockEnrollmentManagementService.submitApplication.mockRejectedValue(new Error('数据库连接失败'));

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '提交申请失败，请稍后重试'
      });
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('应该处理权限验证失败', async () => {
      mockRequest.user = { id: 1, role: 'parent' };
      mockRequest.params = { id: '999' }; // 不是自己的申请

      await enrollmentController.reviewApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '权限不足，无法执行此操作'
      });
    });

    it('应该记录详细的错误日志', async () => {
      mockRequest.body = { kindergartenId: 1 };
      const error = new Error('数据库连接超时');
      error.stack = 'Error stack trace...';

      mockEnrollmentManagementService.submitApplication.mockRejectedValue(error);

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('提交报名申请失败'),
        expect.objectContaining({
          userId: 1,
          kindergartenId: 1,
          error: error.message,
          stack: error.stack
        })
      );
    });
  });

  describe('Input Validation', () => {
    it('应该验证学生年龄', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: {
          name: '张小明',
          birthDate: '2022-01-01' // 太小
        }
      };

      mockEnrollmentManagementService.validateStudentAge.mockResolvedValue(undefined);

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '学生年龄不符合入学要求'
      });
    });

    it('应该验证报名时间窗口', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' }
      };

      mockEnrollmentManagementService.validateEnrollmentPeriod.mockResolvedValue(undefined);

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '当前不在报名时间范围内'
      });
    });

    it('应该验证联系方式格式', async () => {
      mockRequest.body = {
        kindergartenId: 1,
        studentInfo: { name: '张小明' },
        parentInfo: {
          father: {
            name: '张爸爸',
            phone: '123', // 无效手机号
            email: 'invalid-email'
          }
        }
      };

      await enrollmentController.submitApplication(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: '联系方式格式无效'
      });
    });
  });

  describe('Performance Considerations', () => {
    it('应该支持批量操作', async () => {
      mockRequest.body = {
        applicationIds: [1, 2, 3, 4, 5],
        status: 'under_review',
        reviewerId: 1
      };

      const mockBatchResult = {
        updated: 5,
        failed: 0,
        details: [
          { applicationId: 1, status: 'success' },
          { applicationId: 2, status: 'success' }
        ]
      };

      mockEnrollmentManagementService.batchUpdateApplications.mockResolvedValue(mockBatchResult);

      await enrollmentController.batchUpdateApplications(mockRequest, mockResponse);

      expect(mockEnrollmentManagementService.batchUpdateApplications).toHaveBeenCalledWith(
        [1, 2, 3, 4, 5],
        { status: 'under_review', reviewerId: 1 }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: '批量更新完成',
        data: mockBatchResult
      });
    });

    it('应该实现分页查询优化', async () => {
      mockRequest.query = {
        page: '10',
        pageSize: '100' // 大页面
      };

      await enrollmentController.getApplications(mockRequest, mockResponse);

      // 验证是否限制了最大页面大小
      expect(mockEnrollmentManagementService.getApplications).toHaveBeenCalledWith(
        expect.objectContaining({
          pageSize: 50 // 应该被限制为最大值
        })
      );
    });
  });
});
