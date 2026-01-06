# 招生中心API接口设计规范

## 📋 设计概览

**目标**: 为招生中心前端页面提供完整的API支持，包括概览统计、计划管理、申请管理、咨询管理、数据分析和AI功能。

**设计原则**:
- 🎯 **RESTful设计** - 遵循REST API设计规范
- 📊 **数据聚合** - 提供聚合接口减少前端请求次数
- 🔄 **统一响应** - 统一的响应格式和错误处理
- 🚀 **性能优化** - 支持分页、筛选、排序等功能

## 🏗️ API架构设计

### 基础路径结构
```
/api/enrollment/                    # 招生中心聚合接口
├── overview                        # 概览数据
├── plans/                          # 计划管理
├── applications/                   # 申请管理
├── consultations/                  # 咨询管理
├── analytics/                      # 数据分析
└── ai/                            # AI功能
```

### 现有API路径映射
```
现有路径                            新聚合路径
/api/enrollment-plans              → /api/enrollment/plans
/api/enrollment-applications       → /api/enrollment/applications  
/api/enrollment-consultations      → /api/enrollment/consultations
/api/enrollment-ai                 → /api/enrollment/ai
/api/enrollment-statistics         → /api/enrollment/analytics
```

## 📑 详细API接口设计

### 1. 概览数据接口

#### GET /api/enrollment/overview
**功能**: 获取招生中心概览数据，包括核心统计指标和趋势图表数据

**请求参数**:
```typescript
interface OverviewQuery {
  timeRange?: 'week' | 'month' | 'quarter' | 'year';  // 时间范围
  kindergartenId?: number;                             // 幼儿园ID
}
```

**响应数据**:
```typescript
interface OverviewResponse {
  // 核心统计指标
  statistics: {
    totalConsultations: {
      value: number;
      trend: number;        // 增长百分比
      trendText: string;    // 趋势描述
    };
    applications: {
      value: number;
      trend: number;
      trendText: string;
    };
    trials: {
      value: number;
      trend: number;
      trendText: string;
    };
    conversionRate: {
      value: number;        // 百分比
      trend: number;
      trendText: string;
    };
  };
  
  // 趋势图表数据
  charts: {
    enrollmentTrend: {
      categories: string[];     // X轴标签
      series: Array<{
        name: string;
        data: number[];
      }>;
    };
    sourceChannel: {
      categories: string[];
      series: Array<{
        name: string;
        data: number[];
      }>;
    };
  };
  
  // 快速操作数据
  quickStats: {
    pendingApplications: number;    // 待处理申请
    todayConsultations: number;     // 今日咨询
    upcomingInterviews: number;     // 即将面试
  };
}
```

### 2. 计划管理接口

#### GET /api/enrollment/plans
**功能**: 获取招生计划列表，支持分页、搜索、筛选

**请求参数**:
```typescript
interface PlansQuery {
  page?: number;                    // 页码，默认1
  pageSize?: number;               // 每页数量，默认10
  search?: string;                 // 搜索关键词
  year?: number;                   // 年度筛选
  semester?: 'spring' | 'autumn';  // 学期筛选
  status?: 'draft' | 'active' | 'inactive'; // 状态筛选
  sortBy?: 'createdAt' | 'year' | 'targetCount'; // 排序字段
  sortOrder?: 'asc' | 'desc';     // 排序方向
}
```

**响应数据**:
```typescript
interface PlansResponse {
  data: Array<{
    id: number;
    title: string;
    year: number;
    semester: string;
    targetCount: number;
    appliedCount: number;           // 已报名数量
    progress: number;               // 进度百分比
    status: string;
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
    
    // 关联数据
    quotas?: Array<{               // 配额信息
      id: number;
      className: string;
      totalQuota: number;
      usedQuota: number;
    }>;
  }>;
  
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

#### POST /api/enrollment/plans
**功能**: 创建新的招生计划

**请求数据**:
```typescript
interface CreatePlanRequest {
  title: string;
  year: number;
  semester: 'spring' | 'autumn';
  targetCount: number;
  targetAmount?: number;
  ageRange?: string;
  startDate: string;
  endDate: string;
  description?: string;
  status?: 'draft' | 'active';
  
  // 配额分配
  quotas?: Array<{
    classId: number;
    quota: number;
  }>;
}
```

#### GET /api/enrollment/plans/:id
**功能**: 获取招生计划详情，包含完整的关联数据

**响应数据**:
```typescript
interface PlanDetailResponse {
  id: number;
  title: string;
  year: number;
  semester: string;
  targetCount: number;
  appliedCount: number;
  status: string;
  startDate: string;
  endDate: string;
  description: string;
  
  // 详细统计
  statistics: {
    totalApplications: number;
    pendingApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    conversionRate: number;
  };
  
  // 配额详情
  quotas: Array<{
    id: number;
    className: string;
    totalQuota: number;
    usedQuota: number;
    availableQuota: number;
    classId: number;
  }>;
  
  // 申请趋势
  applicationTrend: {
    categories: string[];
    data: number[];
  };
}
```

#### PUT /api/enrollment/plans/:id
**功能**: 更新招生计划

#### DELETE /api/enrollment/plans/:id
**功能**: 删除招生计划

### 3. 申请管理接口

#### GET /api/enrollment/applications
**功能**: 获取申请列表，支持分页、搜索、筛选

**请求参数**:
```typescript
interface ApplicationsQuery {
  page?: number;
  pageSize?: number;
  search?: string;                 // 搜索学生姓名、家长姓名
  planId?: number;                // 计划ID筛选
  status?: 'pending' | 'approved' | 'rejected' | 'interview'; // 状态筛选
  applicationDateFrom?: string;    // 申请日期范围
  applicationDateTo?: string;
  sortBy?: 'applicationDate' | 'studentName' | 'status';
  sortOrder?: 'asc' | 'desc';
}
```

**响应数据**:
```typescript
interface ApplicationsResponse {
  data: Array<{
    id: number;
    applicationNo: string;          // 申请编号
    studentName: string;
    gender: string;
    birthDate: string;
    parentName: string;
    parentPhone: string;
    planTitle: string;
    planId: number;
    status: string;
    applicationDate: string;
    
    // 关联数据预览
    materialsCount: number;         // 材料数量
    interviewScheduled: boolean;    // 是否已安排面试
  }>;
  
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}
```

#### GET /api/enrollment/applications/:id
**功能**: 获取申请详情，包含学生信息、材料、面试记录等

**响应数据**:
```typescript
interface ApplicationDetailResponse {
  id: number;
  applicationNo: string;
  
  // 学生信息
  student: {
    name: string;
    gender: string;
    birthDate: string;
    idCard?: string;
    address?: string;
    specialNeeds?: string;
  };
  
  // 家长信息
  parent: {
    name: string;
    phone: string;
    email?: string;
    relationship: string;
    occupation?: string;
  };
  
  // 申请信息
  application: {
    planId: number;
    planTitle: string;
    applicationDate: string;
    applicationSource: string;
    status: string;
    remarks?: string;
  };
  
  // 申请材料
  materials: Array<{
    id: number;
    materialName: string;
    materialType: string;
    filePath?: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    verificationRemarks?: string;
    uploadDate: string;
  }>;
  
  // 面试记录
  interviews: Array<{
    id: number;
    interviewDate: string;
    interviewer: string;
    score?: number;
    evaluation?: string;
    result: 'pending' | 'pass' | 'fail';
  }>;
  
  // 操作历史
  history: Array<{
    id: number;
    action: string;
    operator: string;
    operateTime: string;
    remarks?: string;
  }>;
}
```

#### PUT /api/enrollment/applications/:id/status
**功能**: 更新申请状态

**请求数据**:
```typescript
interface UpdateStatusRequest {
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  remarks?: string;
  notifyParent?: boolean;          // 是否通知家长
}
```

### 4. 咨询管理接口

#### GET /api/enrollment/consultations
**功能**: 获取咨询列表

#### GET /api/enrollment/consultations/statistics
**功能**: 获取咨询统计数据

**响应数据**:
```typescript
interface ConsultationStatistics {
  todayConsultations: number;
  pendingFollowUp: number;
  monthlyConversions: number;
  averageResponseTime: number;     // 小时
  
  // 来源分析
  sourceAnalysis: Array<{
    source: string;
    count: number;
    conversionRate: number;
  }>;
  
  // 状态分布
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}
```

### 5. 数据分析接口

#### GET /api/enrollment/analytics/trends
**功能**: 获取招生趋势分析数据

**请求参数**:
```typescript
interface AnalyticsQuery {
  timeRange: 'month' | 'quarter' | 'year';
  dimension?: 'source' | 'plan' | 'region';    // 分析维度
  compareWith?: 'lastPeriod' | 'lastYear';     // 对比基准
}
```

#### GET /api/enrollment/analytics/funnel
**功能**: 获取转化漏斗分析数据

#### GET /api/enrollment/analytics/regions
**功能**: 获取地域分布分析数据

#### GET /api/enrollment/analytics/metrics
**功能**: 获取关键指标对比数据

**响应数据**:
```typescript
interface MetricsResponse {
  yoyGrowth: number;              // 同比增长
  momGrowth: number;              // 环比增长
  targetCompletion: number;       // 目标完成率
  averageCost: number;            // 平均获客成本
  
  // 详细对比数据
  comparison: {
    current: {
      period: string;
      consultations: number;
      applications: number;
      conversions: number;
    };
    previous: {
      period: string;
      consultations: number;
      applications: number;
      conversions: number;
    };
  };
}
```

### 6. AI功能接口

#### POST /api/enrollment/ai/predict
**功能**: 智能预测分析

**请求数据**:
```typescript
interface PredictRequest {
  planId?: number;
  timeRange: 'month' | 'quarter' | 'year';
  factors?: string[];             // 影响因素
}
```

**响应数据**:
```typescript
interface PredictResponse {
  prediction: {
    expectedApplications: number;
    confidence: number;             // 置信度
    factors: Array<{
      name: string;
      impact: number;               // 影响权重
      description: string;
    }>;
  };
  
  chart: {
    categories: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
}
```

#### POST /api/enrollment/ai/strategy
**功能**: 策略优化建议

**响应数据**:
```typescript
interface StrategyResponse {
  suggestions: Array<{
    id: string;
    title: string;
    description: string;
    expectedImprovement: string;
    confidence: number;
    priority: 'high' | 'medium' | 'low';
    category: 'marketing' | 'timing' | 'pricing' | 'process';
    
    // 实施建议
    implementation: {
      steps: string[];
      timeline: string;
      resources: string[];
    };
  }>;
  
  metrics: {
    predictedApplications: number;
    recommendedQuota: number;
    optimalTiming: string;
    riskAssessment: 'low' | 'medium' | 'high';
  };
}
```

## 🔧 技术实现规范

### 统一响应格式
```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  code: string;
  timestamp: string;
  
  // 分页信息（列表接口）
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  
  // 错误信息（失败时）
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### 错误处理规范
```typescript
// 错误代码定义
enum ErrorCodes {
  // 通用错误
  INVALID_PARAMS = 'INVALID_PARAMS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  
  // 业务错误
  PLAN_NOT_FOUND = 'PLAN_NOT_FOUND',
  PLAN_QUOTA_EXCEEDED = 'PLAN_QUOTA_EXCEEDED',
  APPLICATION_DUPLICATE = 'APPLICATION_DUPLICATE',
  CONSULTATION_EXPIRED = 'CONSULTATION_EXPIRED',
}
```

### 权限控制
```typescript
// 权限定义
enum Permissions {
  // 查看权限
  VIEW_ENROLLMENT_OVERVIEW = 'enrollment:overview:view',
  VIEW_ENROLLMENT_PLANS = 'enrollment:plans:view',
  VIEW_ENROLLMENT_APPLICATIONS = 'enrollment:applications:view',
  
  // 操作权限
  CREATE_ENROLLMENT_PLAN = 'enrollment:plans:create',
  UPDATE_ENROLLMENT_PLAN = 'enrollment:plans:update',
  DELETE_ENROLLMENT_PLAN = 'enrollment:plans:delete',
  
  APPROVE_APPLICATION = 'enrollment:applications:approve',
  REJECT_APPLICATION = 'enrollment:applications:reject',
  
  // 高级权限
  VIEW_ENROLLMENT_ANALYTICS = 'enrollment:analytics:view',
  USE_ENROLLMENT_AI = 'enrollment:ai:use',
}
```

## 📊 性能优化策略

### 缓存策略
- **概览数据**: 缓存5分钟，支持手动刷新
- **统计数据**: 缓存15分钟，定时更新
- **图表数据**: 缓存30分钟，按参数缓存
- **AI分析**: 缓存1小时，相同参数复用

### 数据库优化
- **索引优化**: 为常用查询字段添加索引
- **分页查询**: 使用游标分页提升性能
- **关联查询**: 合理使用JOIN和子查询
- **数据聚合**: 预计算统计数据

### API性能
- **请求合并**: 提供聚合接口减少请求次数
- **数据压缩**: 启用GZIP压缩
- **并发控制**: 限制并发请求数量
- **超时设置**: 合理设置请求超时时间

## 🚀 实施计划

### 第一阶段：基础接口实现 (1周)
1. **概览接口** - `/api/enrollment/overview`
2. **计划管理基础CRUD** - `/api/enrollment/plans/*`
3. **申请管理基础CRUD** - `/api/enrollment/applications/*`
4. **咨询统计接口** - `/api/enrollment/consultations/statistics`

### 第二阶段：高级功能实现 (1周)
1. **数据分析接口** - `/api/enrollment/analytics/*`
2. **详细统计和图表** - 各模块的统计分析功能
3. **批量操作接口** - 批量审批、导出等功能
4. **权限控制完善** - 细化权限控制

### 第三阶段：AI功能实现 (1周)
1. **AI预测接口** - `/api/enrollment/ai/predict`
2. **策略建议接口** - `/api/enrollment/ai/strategy`
3. **智能分析功能** - 容量分析、优化建议等
4. **性能优化** - 缓存、索引、查询优化

## 📝 实现示例

### 控制器实现示例
```typescript
// server/src/controllers/enrollment-center.controller.ts
import { Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { EnrollmentCenterService } from '../services/enrollment-center.service';

export class EnrollmentCenterController {
  private enrollmentService = new EnrollmentCenterService();

  // 获取概览数据
  async getOverview(req: Request, res: Response) {
    try {
      const { timeRange = 'month', kindergartenId } = req.query;

      const overview = await this.enrollmentService.getOverviewData({
        timeRange: timeRange as string,
        kindergartenId: kindergartenId ? Number(kindergartenId) : undefined
      });

      return ApiResponse.success(res, overview, '获取概览数据成功');
    } catch (error) {
      console.error('获取概览数据失败:', error);
      return ApiResponse.error(res, '获取概览数据失败', 'INTERNAL_ERROR', 500);
    }
  }

  // 获取计划列表
  async getPlans(req: Request, res: Response) {
    try {
      const query = {
        page: Number(req.query.page) || 1,
        pageSize: Number(req.query.pageSize) || 10,
        search: req.query.search as string,
        year: req.query.year ? Number(req.query.year) : undefined,
        semester: req.query.semester as string,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string || 'createdAt',
        sortOrder: req.query.sortOrder as 'asc' | 'desc' || 'desc'
      };

      const result = await this.enrollmentService.getPlans(query);

      return ApiResponse.success(res, result, '获取计划列表成功');
    } catch (error) {
      console.error('获取计划列表失败:', error);
      return ApiResponse.error(res, '获取计划列表失败', 'INTERNAL_ERROR', 500);
    }
  }
}
```

### 服务层实现示例
```typescript
// server/src/services/enrollment-center.service.ts
import { Op } from 'sequelize';
import { EnrollmentPlan } from '../models/enrollment-plan.model';
import { EnrollmentApplication } from '../models/enrollment-application.model';
import { EnrollmentConsultation } from '../models/enrollment-consultation.model';

export class EnrollmentCenterService {

  async getOverviewData(params: { timeRange: string; kindergartenId?: number }) {
    const { timeRange, kindergartenId } = params;

    // 计算时间范围
    const timeFilter = this.getTimeFilter(timeRange);
    const baseWhere = kindergartenId ? { kindergartenId } : {};

    // 并行获取统计数据
    const [
      totalConsultations,
      applications,
      trials,
      chartData
    ] = await Promise.all([
      this.getConsultationStats({ ...baseWhere, ...timeFilter }),
      this.getApplicationStats({ ...baseWhere, ...timeFilter }),
      this.getTrialStats({ ...baseWhere, ...timeFilter }),
      this.getChartData({ ...baseWhere, ...timeFilter })
    ]);

    return {
      statistics: {
        totalConsultations,
        applications,
        trials,
        conversionRate: this.calculateConversionRate(totalConsultations, applications)
      },
      charts: chartData,
      quickStats: await this.getQuickStats(baseWhere)
    };
  }

  private getTimeFilter(timeRange: string) {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1);
    }

    return {
      createdAt: {
        [Op.gte]: startDate,
        [Op.lte]: now
      }
    };
  }
}
```

### 路由实现示例
```typescript
// server/src/routes/enrollment-center.routes.ts
import { Router } from 'express';
import { EnrollmentCenterController } from '../controllers/enrollment-center.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();
const controller = new EnrollmentCenterController();

// 使用认证中间件
router.use(verifyToken);

// 概览数据
router.get('/overview',
  checkPermission('enrollment:overview:view'),
  controller.getOverview.bind(controller)
);

// 计划管理
router.get('/plans',
  checkPermission('enrollment:plans:view'),
  controller.getPlans.bind(controller)
);

router.post('/plans',
  checkPermission('enrollment:plans:create'),
  controller.createPlan.bind(controller)
);

router.get('/plans/:id',
  checkPermission('enrollment:plans:view'),
  controller.getPlanDetail.bind(controller)
);

router.put('/plans/:id',
  checkPermission('enrollment:plans:update'),
  controller.updatePlan.bind(controller)
);

router.delete('/plans/:id',
  checkPermission('enrollment:plans:delete'),
  controller.deletePlan.bind(controller)
);

// 申请管理
router.get('/applications',
  checkPermission('enrollment:applications:view'),
  controller.getApplications.bind(controller)
);

router.get('/applications/:id',
  checkPermission('enrollment:applications:view'),
  controller.getApplicationDetail.bind(controller)
);

router.put('/applications/:id/status',
  checkPermission('enrollment:applications:approve'),
  controller.updateApplicationStatus.bind(controller)
);

// 咨询管理
router.get('/consultations',
  checkPermission('enrollment:consultations:view'),
  controller.getConsultations.bind(controller)
);

router.get('/consultations/statistics',
  checkPermission('enrollment:consultations:view'),
  controller.getConsultationStatistics.bind(controller)
);

// 数据分析
router.get('/analytics/trends',
  checkPermission('enrollment:analytics:view'),
  controller.getAnalyticsTrends.bind(controller)
);

router.get('/analytics/funnel',
  checkPermission('enrollment:analytics:view'),
  controller.getAnalyticsFunnel.bind(controller)
);

router.get('/analytics/metrics',
  checkPermission('enrollment:analytics:view'),
  controller.getAnalyticsMetrics.bind(controller)
);

// AI功能
router.post('/ai/predict',
  checkPermission('enrollment:ai:use'),
  controller.aiPredict.bind(controller)
);

router.post('/ai/strategy',
  checkPermission('enrollment:ai:use'),
  controller.aiStrategy.bind(controller)
);

export default router;
```

## 🧪 测试策略

### 单元测试
```typescript
// tests/services/enrollment-center.service.test.ts
import { EnrollmentCenterService } from '../../src/services/enrollment-center.service';

describe('EnrollmentCenterService', () => {
  let service: EnrollmentCenterService;

  beforeEach(() => {
    service = new EnrollmentCenterService();
  });

  describe('getOverviewData', () => {
    it('should return overview data with correct structure', async () => {
      const result = await service.getOverviewData({ timeRange: 'month' });

      expect(result).toHaveProperty('statistics');
      expect(result).toHaveProperty('charts');
      expect(result).toHaveProperty('quickStats');
      expect(result.statistics).toHaveProperty('totalConsultations');
      expect(result.statistics).toHaveProperty('applications');
    });
  });
});
```

### 集成测试
```typescript
// tests/routes/enrollment-center.routes.test.ts
import request from 'supertest';
import app from '../../src/app';

describe('Enrollment Center API', () => {
  describe('GET /api/enrollment/overview', () => {
    it('should return overview data', async () => {
      const response = await request(app)
        .get('/api/enrollment/overview')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('statistics');
    });
  });
});
```

## 📚 文档和部署

### API文档生成
使用Swagger自动生成API文档，确保文档与代码同步更新。

### 部署检查清单
- [ ] 数据库迁移脚本
- [ ] 环境变量配置
- [ ] 权限数据初始化
- [ ] 缓存配置
- [ ] 监控和日志配置
- [ ] 性能测试通过
- [ ] 安全测试通过

这个API设计为招生中心前端页面提供了完整的数据支持，确保了功能的完整性和性能的优化。通过分阶段实施，可以逐步完善功能，确保系统的稳定性和可维护性。
