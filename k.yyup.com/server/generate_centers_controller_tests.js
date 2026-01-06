const fs = require('fs');
const path = require('path');

// Template for centers controller test
const centersControllerTestTemplate = (controllerName, controllerPath, imports = [], methods = []) => `// Mock dependencies
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

// Centers Controller configurations
const centersControllerConfigs = [
  {
    name: 'Activity Center Controller',
    fileName: 'centers/activity-center.controller.test.ts',
    imports: ['getActivityDashboard', 'getActivityStats', 'getRecentActivities'],
    methods: [
      {
        name: 'getActivityDashboard',
        description: '获取活动中心仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getActivityStats',
        description: '获取活动统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          timeRange: 'month',
          activityType: 'all'
        };`
      },
      {
        name: 'getRecentActivities',
        description: '获取最近活动',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          limit: '10',
          status: 'active'
        };`
      }
    ]
  },
  {
    name: 'Customer Pool Center Controller',
    fileName: 'centers/customer-pool-center.controller.test.ts',
    imports: ['getCustomerPoolDashboard', 'getLeadStats', 'getConversionStats'],
    methods: [
      {
        name: 'getCustomerPoolDashboard',
        description: '获取客户池中心仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getLeadStats',
        description: '获取线索统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          source: 'all',
          timeRange: 'month'
        };`
      },
      {
        name: 'getConversionStats',
        description: '获取转化统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          period: 'quarter',
          funnelStage: 'all'
        };`
      }
    ]
  },
  {
    name: 'Finance Center Controller',
    fileName: 'centers/finance-center.controller.test.ts',
    imports: ['getFinanceDashboard', 'getRevenueStats', 'getExpenseStats'],
    methods: [
      {
        name: 'getFinanceDashboard',
        description: '获取财务中心仪表板',
        requiresAuth: true,
        usesNext: false,
        setupRequest: ''
      },
      {
        name: 'getRevenueStats',
        description: '获取收入统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          timeRange: 'month',
          revenueType: 'tuition'
        };`
      },
      {
        name: 'getExpenseStats',
        description: '获取支出统计',
        requiresAuth: true,
        usesNext: false,
        setupRequest: `req.query = { 
          timeRange: 'month',
          category: 'all'
        };`
      }
    ]
  }
];

// Create test files
const testDir = path.join(__dirname, 'tests/unit/controllers/centers');

if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

centersControllerConfigs.forEach(config => {
  const testContent = centersControllerTestTemplate(
    config.name,
    `../../../src/controllers/${config.fileName.replace('.test.ts', '')}`,
    config.imports,
    config.methods
  );

  const filePath = path.join(testDir, config.fileName.split('/').pop());
  fs.writeFileSync(filePath, testContent);
  console.log(`Created test file: ${filePath}`);
});

console.log(`Generated ${centersControllerConfigs.length} centers controller test files`);