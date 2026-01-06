const fs = require('fs');
const path = require('path');

// Template for basic controller test
const basicControllerTestTemplate = (controllerName, controllerPath, imports = [], methods = []) => `// Mock dependencies
jest.mock('${controllerPath}');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
${imports.map(imp => `import { ${imp} } from '${controllerPath}';`).join('\n')}
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;

describe('${controllerName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  ${methods.map(method => {
    const methodName = method.name;
    const description = method.description || methodName;
    const requiresAuth = method.requiresAuth || false;
    const validations = method.validations || [];
    
    return `describe('${methodName}', () => {
    it('应该成功${description}', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${method.setupRequest || ''}

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        ${method.expectedResponse ? `data: ${method.expectedResponse},` : 'data: expect.any(Object),'}
        message: expect.any(String)
      });
    });

    ${requiresAuth ? `it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${method.setupRequest || ''}
      req.user = null;

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? `expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          code: 'UNAUTHORIZED'
        })
      );` : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });`}
    });` : ''}

    ${validations.map(validation => `
    it('应该验证${validation.description}', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${validation.setup || ''}

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? `expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: ${validation.statusCode || 400},
          code: '${validation.code || 'BAD_REQUEST'}'
        })
      );` : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: '${validation.message}',
        statusCode: ${validation.statusCode || 400}
      });`}
    });`).join('')}

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      ${requiresAuth ? 'req.user = { id: 1 };' : ''}
      ${method.setupRequest || ''}

      // 模拟错误
      const original${methodName.charAt(0).toUpperCase() + methodName.slice(1)} = ${methodName};
      (${methodName} as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await ${methodName}(req as Request, res as Response${method.usesNext ? ', mockNext' : ''});

      ${method.usesNext ? 'expect(mockNext).toHaveBeenCalledWith(expect.any(Error));' : `expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });`}

      // 恢复原始函数
      (${methodName} as jest.Mock).mockImplementation(original${methodName.charAt(0).toUpperCase() + methodName.slice(1)});
    });
  });`;
  }).join('\n  ')}
});`;

// Controller configurations
const controllerConfigs = [
  {
    name: 'Activity Poster Controller',
    fileName: 'activity-poster.controller.test.ts',
    imports: ['createPoster', 'getPosters', 'getPosterById', 'updatePoster', 'deletePoster'],
    methods: [
      {
        name: 'createPoster',
        description: '创建活动海报',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          title: '活动海报',
          description: '海报描述',
          imageUrl: 'http://example.com/image.jpg'
        };`,
        validations: [
          {
            description: '标题不能为空',
            setup: `req.body = {
              // 缺少title
              description: '海报描述',
              imageUrl: 'http://example.com/image.jpg'
            };`,
            message: '标题不能为空'
          }
        ]
      },
      {
        name: 'getPosters',
        description: '获取海报列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'getPosterById',
        description: '获取海报详情',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`,
        validations: [
          {
            description: 'ID不能为空',
            setup: `req.params = {};`,
            message: '海报ID不能为空'
          }
        ]
      },
      {
        name: 'updatePoster',
        description: '更新海报',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { title: '更新后的海报' };`
      },
      {
        name: 'deletePoster',
        description: '删除海报',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Activity Registration Controller',
    fileName: 'activity-registration.controller.test.ts',
    imports: ['register', 'getRegistrations', 'getRegistrationById', 'updateRegistration', 'cancelRegistration'],
    methods: [
      {
        name: 'register',
        description: '活动报名',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          activityId: 1,
          contactName: '张三',
          contactPhone: '13800138000',
          childName: '小明',
          childAge: 5
        };`,
        validations: [
          {
            description: '活动ID不能为空',
            setup: `req.body = {
              // 缺少activityId
              contactName: '张三',
              contactPhone: '13800138000'
            };`,
            message: '活动ID不能为空'
          }
        ]
      },
      {
        name: 'getRegistrations',
        description: '获取报名列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { activityId: '1', page: '1', limit: '10' };`
      },
      {
        name: 'getRegistrationById',
        description: '获取报名详情',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      },
      {
        name: 'updateRegistration',
        description: '更新报名信息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { contactName: '李四' };`
      },
      {
        name: 'cancelRegistration',
        description: '取消报名',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Activity Template Controller',
    fileName: 'activity-template.controller.test.ts',
    imports: ['createTemplate', 'getTemplates', 'getTemplateById', 'updateTemplate', 'deleteTemplate'],
    methods: [
      {
        name: 'createTemplate',
        description: '创建活动模板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '亲子活动模板',
          description: '标准亲子活动模板'
        };`
      },
      {
        name: 'getTemplates',
        description: '获取模板列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'getTemplateById',
        description: '获取模板详情',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      },
      {
        name: 'updateTemplate',
        description: '更新模板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { name: '更新后的模板' };`
      },
      {
        name: 'deleteTemplate',
        description: '删除模板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Auto Image Controller',
    fileName: 'auto-image.controller.test.ts',
    imports: ['uploadImage', 'processImage', 'deleteImage'],
    methods: [
      {
        name: 'uploadImage',
        description: '上传图片',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.file = {
          originalname: 'test.jpg',
          buffer: Buffer.from('test'),
          mimetype: 'image/jpeg'
        };`
      },
      {
        name: 'processImage',
        description: '处理图片',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { operations: ['resize', 'crop'] };`
      },
      {
        name: 'deleteImage',
        description: '删除图片',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Data Import Controller',
    fileName: 'data-import.controller.test.ts',
    imports: ['importData', 'getImportHistory', 'getImportStatus'],
    methods: [
      {
        name: 'importData',
        description: '导入数据',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          type: 'students',
          data: [{ name: '张三', age: 5 }],
          mapping: { name: '姓名', age: '年龄' }
        };`
      },
      {
        name: 'getImportHistory',
        description: '获取导入历史',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'getImportStatus',
        description: '获取导入状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Document Import Controller',
    fileName: 'document-import.controller.test.ts',
    imports: ['uploadDocument', 'processDocument', 'getDocuments'],
    methods: [
      {
        name: 'uploadDocument',
        description: '上传文档',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.file = {
          originalname: 'document.pdf',
          buffer: Buffer.from('test'),
          mimetype: 'application/pdf'
        };`
      },
      {
        name: 'processDocument',
        description: '处理文档',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { extractText: true };`
      },
      {
        name: 'getDocuments',
        description: '获取文档列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      }
    ]
  },
  {
    name: 'Enrollment AI Controller',
    fileName: 'enrollment-ai.controller.test.ts',
    imports: ['analyzeApplication', 'predictEnrollment', 'generateRecommendations'],
    methods: [
      {
        name: 'analyzeApplication',
        description: '分析申请',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          applicationId: 1,
          studentInfo: { name: '张三', age: 5 }
        };`
      },
      {
        name: 'predictEnrollment',
        description: '预测招生',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          historicalData: [],
          factors: ['location', 'age', 'income']
        };`
      },
      {
        name: 'generateRecommendations',
        description: '生成推荐',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { studentId: '1' };`
      }
    ]
  },
  {
    name: 'Enrollment Center Controller',
    fileName: 'enrollment-center.controller.test.ts',
    imports: ['getDashboard', 'getStatistics', 'getRecentApplications'],
    methods: [
      {
        name: 'getDashboard',
        description: '获取仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getStatistics',
        description: '获取统计数据',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { period: 'month' };`
      },
      {
        name: 'getRecentApplications',
        description: '获取最近申请',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { limit: '10' };`
      }
    ]
  },
  {
    name: 'Enrollment Consultation Controller',
    fileName: 'enrollment-consultation.controller.test.ts',
    imports: ['createConsultation', 'getConsultations', 'updateConsultation'],
    methods: [
      {
        name: 'createConsultation',
        description: '创建咨询',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          parentId: 1,
          studentName: '小明',
          contactPhone: '13800138000',
          consultationTime: new Date()
        };`
      },
      {
        name: 'getConsultations',
        description: '获取咨询列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updateConsultation',
        description: '更新咨询',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { status: 'completed' };`
      }
    ]
  },
  {
    name: 'Enrollment Finance Controller',
    fileName: 'enrollment-finance.controller.test.ts',
    imports: ['createPayment', 'getPayments', 'updatePaymentStatus'],
    methods: [
      {
        name: 'createPayment',
        description: '创建缴费',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          applicationId: 1,
          amount: 5000,
          paymentMethod: 'bank_transfer'
        };`
      },
      {
        name: 'getPayments',
        description: '获取缴费记录',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updatePaymentStatus',
        description: '更新缴费状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { status: 'paid' };`
      }
    ]
  },
  {
    name: 'Enrollment Interview Controller',
    fileName: 'enrollment-interview.controller.test.ts',
    imports: ['scheduleInterview', 'getInterviews', 'updateInterviewResult'],
    methods: [
      {
        name: 'scheduleInterview',
        description: '安排面试',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          applicationId: 1,
          interviewTime: new Date(),
          interviewerId: 1
        };`
      },
      {
        name: 'getInterviews',
        description: '获取面试列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updateInterviewResult',
        description: '更新面试结果',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { result: 'passed', comments: '表现优秀' };`
      }
    ]
  },
  {
    name: 'Enrollment Quota Controller',
    fileName: 'enrollment-quota.controller.test.ts',
    imports: ['setQuota', 'getQuotas', 'updateQuota'],
    methods: [
      {
        name: 'setQuota',
        description: '设置配额',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          grade: '小班',
          totalQuota: 30,
          availableQuota: 25
        };`
      },
      {
        name: 'getQuotas',
        description: '获取配额列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { academicYear: '2024' };`
      },
      {
        name: 'updateQuota',
        description: '更新配额',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { availableQuota: 20 };`
      }
    ]
  },
  {
    name: 'Enrollment Statistics Controller',
    fileName: 'enrollment-statistics.controller.test.ts',
    imports: ['getEnrollmentStats', 'getApplicationStats', 'getConversionStats'],
    methods: [
      {
        name: 'getEnrollmentStats',
        description: '获取招生统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { period: 'month', year: '2024' };`
      },
      {
        name: 'getApplicationStats',
        description: '获取申请统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { status: 'pending' };`
      },
      {
        name: 'getConversionStats',
        description: '获取转化统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { period: 'quarter' };`
      }
    ]
  },
  {
    name: 'Errors Controller',
    fileName: 'errors.controller.test.ts',
    imports: ['handleError', 'getErrorLogs'],
    methods: [
      {
        name: 'handleError',
        description: '处理错误',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.body = {
          error: 'Test error',
          stack: 'Error stack trace'
        };`
      },
      {
        name: 'getErrorLogs',
        description: '获取错误日志',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      }
    ]
  },
  {
    name: 'Example Controller',
    fileName: 'example.controller.test.ts',
    imports: ['exampleMethod'],
    methods: [
      {
        name: 'exampleMethod',
        description: '示例方法',
        requiresAuth: false,
        usesNext: false,
        setupRequest: ''
      }
    ]
  },
  {
    name: 'Kindergarten Basic Info Controller',
    fileName: 'kindergarten-basic-info.controller.test.ts',
    imports: ['getBasicInfo', 'updateBasicInfo'],
    methods: [
      {
        name: 'getBasicInfo',
        description: '获取基本信息',
        requiresAuth: false,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'updateBasicInfo',
        description: '更新基本信息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '阳光幼儿园',
          address: '北京市朝阳区',
          phone: '010-12345678'
        };`
      }
    ]
  },
  {
    name: 'Marketing Center Controller',
    fileName: 'marketing-center.controller.test.ts',
    imports: ['getDashboard', 'getCampaignStats', 'getLeadStats'],
    methods: [
      {
        name: 'getDashboard',
        description: '获取营销仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getCampaignStats',
        description: '获取活动统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { period: 'month' };`
      },
      {
        name: 'getLeadStats',
        description: '获取线索统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { source: 'online' };`
      }
    ]
  },
  {
    name: 'Migration Controller',
    fileName: 'migration.controller.test.ts',
    imports: ['runMigration', 'getMigrationStatus', 'rollbackMigration'],
    methods: [
      {
        name: 'runMigration',
        description: '运行迁移',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { migrationName: 'add_users_table' };`
      },
      {
        name: 'getMigrationStatus',
        description: '获取迁移状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'rollbackMigration',
        description: '回滚迁移',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { migrationName: 'add_users_table' };`
      }
    ]
  },
  {
    name: 'Page Guide Controller',
    fileName: 'page-guide.controller.test.ts',
    imports: ['createGuide', 'getGuides', 'updateGuide'],
    methods: [
      {
        name: 'createGuide',
        description: '创建页面指南',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          page: 'dashboard',
          title: '仪表板使用指南',
          content: '仪表板使用说明'
        };`
      },
      {
        name: 'getGuides',
        description: '获取指南列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: 'dashboard' };`
      },
      {
        name: 'updateGuide',
        description: '更新指南',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { title: '更新后的指南' };`
      }
    ]
  },
  {
    name: 'Page Guide Section Controller',
    fileName: 'page-guide-section.controller.test.ts',
    imports: ['createSection', 'getSections', 'updateSection'],
    methods: [
      {
        name: 'createSection',
        description: '创建指南章节',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          guideId: 1,
          title: '第一章',
          content: '章节内容',
          order: 1
        };`
      },
      {
        name: 'getSections',
        description: '获取章节列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { guideId: '1' };`
      },
      {
        name: 'updateSection',
        description: '更新章节',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { title: '更新后的章节' };`
      }
    ]
  },
  {
    name: 'Page Permissions Controller',
    fileName: 'page-permissions.controller.test.ts',
    imports: ['getPagePermissions', 'updatePagePermissions'],
    methods: [
      {
        name: 'getPagePermissions',
        description: '获取页面权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: 'dashboard' };`
      },
      {
        name: 'updatePagePermissions',
        description: '更新页面权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          page: 'dashboard',
          permissions: ['read', 'write'],
          roles: ['admin', 'teacher']
        };`
      }
    ]
  },
  {
    name: 'Parent Student Relation Controller',
    fileName: 'parent-student-relation.controller.test.ts',
    imports: ['createRelation', 'getRelations', 'updateRelation'],
    methods: [
      {
        name: 'createRelation',
        description: '创建家长学生关系',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          parentId: 1,
          studentId: 1,
          relationship: '父亲'
        };`
      },
      {
        name: 'getRelations',
        description: '获取关系列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { parentId: '1' };`
      },
      {
        name: 'updateRelation',
        description: '更新关系',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { relationship: '母亲' };`
      }
    ]
  },
  {
    name: 'Performance Rule Controller',
    fileName: 'performance-rule.controller.test.ts',
    imports: ['createRule', 'getRules', 'updateRule'],
    methods: [
      {
        name: 'createRule',
        description: '创建绩效规则',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '教学评分规则',
          description: '教师教学绩效评分规则',
          criteria: ['教学质量', '学生反馈', '课堂管理']
        };`
      },
      {
        name: 'getRules',
        description: '获取规则列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updateRule',
        description: '更新规则',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { name: '更新后的规则' };`
      }
    ]
  },
  {
    name: 'Permission Cache Controller',
    fileName: 'permission-cache.controller.test.ts',
    imports: ['clearCache', 'getCacheStatus', 'refreshCache'],
    methods: [
      {
        name: 'clearCache',
        description: '清除缓存',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { cacheType: 'permissions' };`
      },
      {
        name: 'getCacheStatus',
        description: '获取缓存状态',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'refreshCache',
        description: '刷新缓存',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { cacheType: 'permissions' };`
      }
    ]
  },
  {
    name: 'Permissions Controller',
    fileName: 'permissions.controller.test.ts',
    imports: ['getPermissions', 'createPermission', 'updatePermission'],
    methods: [
      {
        name: 'getPermissions',
        description: '获取权限列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'createPermission',
        description: '创建权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: 'user.manage',
          description: '用户管理权限',
          resource: 'users'
        };`
      },
      {
        name: 'updatePermission',
        description: '更新权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { description: '更新后的权限描述' };`
      }
    ]
  },
  {
    name: 'Personnel Center Controller',
    fileName: 'personnel-center.controller.test.ts',
    imports: ['getDashboard', 'getStaffStats', 'getDepartmentStats'],
    methods: [
      {
        name: 'getDashboard',
        description: '获取人事仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getStaffStats',
        description: '获取员工统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { department: 'teaching' };`
      },
      {
        name: 'getDepartmentStats',
        description: '获取部门统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { period: 'month' };`
      }
    ]
  },
  {
    name: 'Poster Template Controller',
    fileName: 'poster-template.controller.test.ts',
    imports: ['createTemplate', 'getTemplates', 'updateTemplate'],
    methods: [
      {
        name: 'createTemplate',
        description: '创建海报模板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '活动海报模板',
          description: '标准活动海报模板',
          template: { width: 800, height: 600 }
        };`
      },
      {
        name: 'getTemplates',
        description: '获取模板列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updateTemplate',
        description: '更新模板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { name: '更新后的模板' };`
      }
    ]
  },
  {
    name: 'Poster Upload Controller',
    fileName: 'poster-upload.controller.test.ts',
    imports: ['uploadPoster', 'getPosters', 'deletePoster'],
    methods: [
      {
        name: 'uploadPoster',
        description: '上传海报',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.file = {
          originalname: 'poster.jpg',
          buffer: Buffer.from('test'),
          mimetype: 'image/jpeg'
        };
        req.body = { title: '活动海报' };`
      },
      {
        name: 'getPosters',
        description: '获取海报列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'deletePoster',
        description: '删除海报',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Role Permission Controller',
    fileName: 'role-permission.controller.test.ts',
    imports: ['assignPermission', 'getRolePermissions', 'removePermission'],
    methods: [
      {
        name: 'assignPermission',
        description: '分配权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          roleId: 1,
          permissionId: 1
        };`
      },
      {
        name: 'getRolePermissions',
        description: '获取角色权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { roleId: '1' };`
      },
      {
        name: 'removePermission',
        description: '移除权限',
        requiresAuth: true,
        usesAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          roleId: 1,
          permissionId: 1
        };`
      }
    ]
  },
  {
    name: 'Script Category Controller',
    fileName: 'script-category.controller.test.ts',
    imports: ['createCategory', 'getCategories', 'updateCategory'],
    methods: [
      {
        name: 'createCategory',
        description: '创建脚本分类',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '活动脚本',
          description: '活动相关脚本'
        };`
      },
      {
        name: 'getCategories',
        description: '获取分类列表',
        requiresAuth: false,
        usesNext: false,
        setupRequest: `req.query = { page: '1', limit: '10' };`
      },
      {
        name: 'updateCategory',
        description: '更新分类',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { name: '更新后的分类' };`
      }
    ]
  },
  {
    name: 'Script Controller',
    fileName: 'script.controller.test.ts',
    imports: ['createScript', 'getScripts', 'executeScript'],
    methods: [
      {
        name: 'createScript',
        description: '创建脚本',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          name: '数据同步脚本',
          content: 'console.log("Hello World");',
          categoryId: 1
        };`
      },
      {
        name: 'getScripts',
        description: '获取脚本列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { categoryId: '1', page: '1', limit: '10' };`
      },
      {
        name: 'executeScript',
        description: '执行脚本',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Setup Permissions Controller',
    fileName: 'setup-permissions.controller.test.ts',
    imports: ['setupPermissions', 'getPermissionSetup', 'resetPermissions'],
    methods: [
      {
        name: 'setupPermissions',
        description: '设置权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          role: 'admin',
          permissions: ['user.manage', 'system.admin']
        };`
      },
      {
        name: 'getPermissionSetup',
        description: '获取权限设置',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { role: 'admin' };`
      },
      {
        name: 'resetPermissions',
        description: '重置权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { role: 'admin' };`
      }
    ]
  },
  {
    name: 'Simple Permissions Controller',
    fileName: 'simple-permissions.controller.test.ts',
    imports: ['checkPermission', 'getUserPermissions', 'grantPermission'],
    methods: [
      {
        name: 'checkPermission',
        description: '检查权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { permission: 'user.manage' };`
      },
      {
        name: 'getUserPermissions',
        description: '获取用户权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { userId: '1' };`
      },
      {
        name: 'grantPermission',
        description: '授予权限',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          userId: 1,
          permission: 'user.manage'
        };`
      }
    ]
  },
  {
    name: 'System Log Controller',
    fileName: 'system-log.controller.test.ts',
    imports: ['getLogs', 'createLog', 'clearLogs'],
    methods: [
      {
        name: 'getLogs',
        description: '获取日志列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          level: 'error',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          page: '1',
          limit: '10'
        };`
      },
      {
        name: 'createLog',
        description: '创建日志',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          level: 'info',
          message: '系统操作日志',
          module: 'user_management'
        };`
      },
      {
        name: 'clearLogs',
        description: '清除日志',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = { 
          beforeDate: '2024-01-01',
          level: 'info'
        };`
      }
    ]
  },
  {
    name: 'Task Controller',
    fileName: 'task.controller.test.ts',
    imports: ['createTask', 'getTasks', 'updateTask', 'completeTask'],
    methods: [
      {
        name: 'createTask',
        description: '创建任务',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          title: '系统维护任务',
          description: '定期系统维护',
          assigneeId: 1,
          dueDate: new Date()
        };`
      },
      {
        name: 'getTasks',
        description: '获取任务列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          status: 'pending',
          assigneeId: '1',
          page: '1',
          limit: '10'
        };`
      },
      {
        name: 'updateTask',
        description: '更新任务',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { status: 'in_progress' };`
      },
      {
        name: 'completeTask',
        description: '完成任务',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  },
  {
    name: 'Teacher Customers Controller',
    fileName: 'teacher-customers.controller.test.ts',
    imports: ['getCustomers', 'addCustomer', 'updateCustomer'],
    methods: [
      {
        name: 'getCustomers',
        description: '获取客户列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          teacherId: '1',
          page: '1',
          limit: '10'
        };`
      },
      {
        name: 'addCustomer',
        description: '添加客户',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          teacherId: 1,
          customerName: '张三',
          customerPhone: '13800138000',
          customerType: 'potential'
        };`
      },
      {
        name: 'updateCustomer',
        description: '更新客户',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };
        req.body = { customerType: 'converted' };`
      }
    ]
  },
  {
    name: 'User Role Controller',
    fileName: 'user-role.controller.test.ts',
    imports: ['assignRole', 'getUserRoles', 'removeRole'],
    methods: [
      {
        name: 'assignRole',
        description: '分配角色',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          userId: 1,
          roleId: 1
        };`
      },
      {
        name: 'getUserRoles',
        description: '获取用户角色',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { userId: '1' };`
      },
      {
        name: 'removeRole',
        description: '移除角色',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.body = {
          userId: 1,
          roleId: 1
        };`
      }
    ]
  },
  {
    name: 'User Simple Controller',
    fileName: 'user-simple.controller.test.ts',
    imports: ['getSimpleUsers', 'getSimpleUserById'],
    methods: [
      {
        name: 'getSimpleUsers',
        description: '获取简化用户列表',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          role: 'teacher',
          page: '1',
          limit: '10'
        };`
      },
      {
        name: 'getSimpleUserById',
        description: '获取简化用户信息',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.params = { id: '1' };`
      }
    ]
  }
];

// Create test files
const testDir = path.join(__dirname, 'tests/unit/controllers');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

controllerConfigs.forEach(config => {
  const testContent = basicControllerTestTemplate(
    config.name,
    `../../../src/controllers/${config.fileName.replace('.test.ts', '')}`,
    config.imports,
    config.methods
  );

  const filePath = path.join(testDir, config.fileName);
  fs.writeFileSync(filePath, testContent);
  console.log(`Created test file: ${filePath}`);
});

console.log(`Generated ${controllerConfigs.length} controller test files`);