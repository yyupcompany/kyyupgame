// 园长模块API服务
import request from '../../utils/request';
import type { ApiResponse } from '../../utils/request';
import { API_PREFIX } from '../endpoints/base';

// 解构request实例中的方法
const { get, post, put, del } = request;

// API端点常量
const PRINCIPAL_ENDPOINTS = {
  POSTER_GENERATE: `${API_PREFIX}/poster-generation/generate`
} as const;

/**
 * 园长仪表盘统计数据接口
 */
export interface PrincipalDashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalTeachers: number;
  totalActivities: number;
  pendingApplications: number;
  enrollmentRate: number;
  teacherAttendanceRate: number;
  studentAttendanceRate: number;
  studentTrend?: number;
  classTrend?: number;
  applicationTrend?: number;
  enrollmentTrend?: number;
}

/**
 * 园区概览数据接口
 */
export interface CampusOverview {
  id: string;
  name: string;
  address: string;
  area: number;
  classroomCount: number;
  occupiedClassroomCount: number;
  outdoorPlaygroundArea: number;
  indoorPlaygroundArea: number;
  establishedYear: number;
  principalName: string;
  contactPhone: string;
  email: string;
  description: string;
  images: string[];
  facilities: Array<{
    id: string;
    name: string;
    status: string;
    lastMaintenance?: string;
  }>;
  events: Array<{
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    location: string;
    description?: string;
  }>;
}

/**
 * 审批项目接口
 */
export interface ApprovalItem {
  id: string;
  title: string;
  type: 'LEAVE' | 'EXPENSE' | 'EVENT' | 'OTHER';
  requestBy: string;
  requestTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

/**
 * 园长通知项目接口
 */
export interface PrincipalNotice {
  id: string;
  title: string;
  content: string;
  publishTime: string;
  expireTime?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  readCount: number;
  totalCount: number;
}

/**
 * 客户池统计接口
 */
export interface CustomerPoolStats {
  totalCustomers: number;
  newCustomersThisMonth: number;
  unassignedCustomers: number;
  convertedCustomersThisMonth: number;
}

/**
 * 绩效统计接口
 */
export interface PerformanceStats {
  totalEnrollments: number;
  monthlyEnrollments: number;
  avgConversionRate: number;
  totalCommission: number;
  enrollmentTrend: Array<{
    period: string;
    value: number;
  }>;
}

/**
 * 绩效排名接口
 */
export interface PerformanceRanking {
  id: number | string;
  name: string;
  value: number;
}

/**
 * 绩效详情接口
 */
export interface PerformanceDetail {
  id: number | string;
  name: string;
  leads: number;
  followups: number;
  visits: number;
  applications: number;
  enrollments: number;
  commission: number;
}

/**
 * 佣金规则接口
 */
export interface CommissionRule {
  baseRate: number;
  tiers: Array<{
    minCount: number;
    rate: number;
  }>;
  classRules: Array<{
    classType: string;
    rate: number;
  }>;
}

/**
 * 绩效目标接口
 */
export interface PerformanceGoal {
  kindergartenGoals: {
    yearlyTarget: number;
    quarterlyTargets: number[];
    monthlyTargets: number[];
  };
  teacherGoals: Array<{
    id: number | string;
    name: string;
    department: string;
    yearlyTarget: number;
    quarterlyTargets: number[];
    monthlyTargets: number[];
  }>;
}

/**
 * 绩效规则接口
 */
export interface PerformanceRule {
  id: number;
  name: string;
  description: string;
  calculationMethod: string;
  targetValue: number;
  bonusAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  kindergartenId: number;
  creatorId: number;
  updaterId?: number;
}

/**
 * 海报模板接口
 */
export interface PosterTemplate {
  id: number;
  name: string;
  category: string;
  thumbnail: string;
  previewImage: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  width: number;
  height: number;
  description: string | null;
  marketingTools: string[];
  groupBuySettings: {
    minUsers: number;
    discount: number;
  } | null;
  pointsSettings: {
    points: number;
    discount: number;
  } | null;
  customSettings: Record<string, any> | null;
}

/**
 * 海报模板查询参数接口
 */
export interface PosterTemplateQueryParams {
  page?: number;
  pageSize?: number;
  category?: string;
  keyword?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

/**
 * 客户池查询参数接口
 */
interface CustomerPoolParams {
  page?: number;
  pageSize?: number;
  source?: string;
  status?: string;
  teacher?: string;
  keyword?: string;
}

/**
 * 分配教师数据接口
 */
interface AssignTeacherData {
  customerId: number;
  teacherId: number;
  remark?: string;
}

/**
 * 批量分配数据接口
 */
interface BatchAssignData {
  customerIds: number[];
  teacherId: number;
  remark?: string;
}

/**
 * 绩效规则类型
 */
export type PerformanceRuleType = 'ENROLLMENT' | 'TRIAL_CLASS' | 'ORDER' | 'PRE_REGISTRATION';

/**
 * 获取园长仪表盘统计数据
 * @returns Promise
 */
export function getPrincipalDashboardStats(): Promise<ApiResponse<PrincipalDashboardStats>> {
  // 使用真实API
  return get('/api/dashboard/principal/stats');
}

/**
 * 获取园区概览数据
 * @returns {Promise<ApiResponse<CampusOverview>>} 园区概览数据
 */
export const getCampusOverview = () => {
  return get('/api/principal/campus/overview');
};

/**
 * 获取园长待审批列表
 * @param {Object} params - 查询参数
 * @returns {Promise<ApiResponse<{ items: ApprovalItem[], total: number }>>} 待审批列表和总数
 */
export const getApprovalList = (params: { status?: string; type?: string; page?: number; pageSize?: number } = {}) => {
  return get('/api/principal/approvals', params);
};

/**
 * 处理审批
 * @param {string} id - 审批ID
 * @param {string} action - 审批动作
 * @param {string} comment - 审批意见
 * @returns {Promise<ApiResponse<ApprovalItem>>} 更新后的审批项目
 */
export const handleApproval = (id: string, action: 'APPROVE' | 'REJECT', comment?: string) => {
  return post(`/api/principal/approvals/${id}/${action.toLowerCase()}`, { comment });
};

/**
 * 获取重要通知
 * @returns Promise
 */
export function getImportantNotices(): Promise<ApiResponse<PrincipalNotice[]>> {
  // 使用真实API
  return get('/api/principal/notices/important');
}

/**
 * 发布园长通知
 * @param {Object} data - 通知数据
 * @returns {Promise<ApiResponse<PrincipalNotice>>} 创建的通知
 */
export const publishNotice = (data: {
  title: string;
  content: string;
  expireTime?: string;
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
  recipientType: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC';
  recipientIds?: string[];
}) => {
  return post('/api/principal/notices', data);
};

/**
 * 获取园长工作安排
 * @returns Promise
 */
export function getPrincipalSchedule(): Promise<ApiResponse<any>> {
  // 使用真实API
  return get('/api/principal/schedule');
}

/**
 * 创建园长日程安排
 * @param {Object} data - 日程安排数据
 * @returns {Promise<ApiResponse<{ id: string; title: string; startTime: string; endTime: string; location?: string; description?: string; }>>} 创建的日程安排
 */
export const createPrincipalSchedule = (data: {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}) => {
  return post('/api/principal/schedule', data);
};

/**
 * 获取招生趋势数据
 * @param period 周期：week, month, year
 * @returns Promise
 */
export function getEnrollmentTrend(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<any>> {
  // 使用真实API
  return get('/api/principal/enrollment/trend', { period });
}

/**
 * 获取客户池统计数据
 * @returns Promise
 */
export function getCustomerPoolStats(): Promise<ApiResponse<CustomerPoolStats>> {
  // 使用真实API
  return get('/api/principal/customer-pool/stats');
  // 备选模拟数据方案（暂不使用）
  // return request({
  //   url: '/mock/customer-pool-stats.json',
  //   method: 'get',
  //   useMock: true
  // });
}

/**
 * 获取客户池数据
 * @param params 查询参数
 * @returns Promise
 */
export function getCustomerPoolList(params: CustomerPoolParams): Promise<ApiResponse<any>> {
  // 使用真实API
  return get('/api/principal/customer-pool/list', params);
  // 备选模拟数据方案（暂不使用）
  // return request({
  //   url: '/mock/customer-pool-list.json',
  //   method: 'get',
  //   params,
  //   useMock: true
  // });
}

/**
 * 分配客户给老师
 * @param data 分配数据
 * @returns Promise
 */
export function assignCustomerTeacher(data: AssignTeacherData): Promise<ApiResponse<any>> {
  return post('/api/principal/customer-pool/assign', data);
}

/**
 * 批量分配客户给老师
 * @param data 批量分配数据
 * @returns Promise
 */
export function batchAssignCustomerTeacher(data: BatchAssignData): Promise<ApiResponse<any>> {
  return post('/api/principal/customer-pool/batch-assign', data);
}

/**
 * 删除客户
 * @param id 客户ID
 * @returns Promise
 */
export function deleteCustomer(id: number): Promise<ApiResponse<any>> {
  return del(`/api/principal/customer-pool/${id}`);
}

/**
 * 导出客户数据
 * @param params 查询参数
 * @returns Promise
 */
export function exportCustomerData(params: CustomerPoolParams): Promise<ApiResponse<Blob>> {
  return request.request({
    url: '/api8570',
    method: 'GET',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取绩效统计数据
 * @param params 查询参数
 * @returns Promise
 */
export function getPerformanceStats(params?: {
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<PerformanceStats>> {
  return get('/api/principal/performance/stats', params);
}

/**
 * 获取绩效排名数据
 * @param params 查询参数
 * @returns Promise
 */
export function getPerformanceRankings(params: {
  type: 'total' | 'month' | 'rate';
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<PerformanceRanking[]>> {
  return get('/api/principal/performance/rankings', params);
}

/**
 * 获取绩效详情数据
 * @param params 查询参数
 * @returns Promise
 */
export function getPerformanceDetails(params: {
  type: 'teacher' | 'source' | 'class';
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{ items: PerformanceDetail[]; total: number }>> {
  return get('/api/principal/performance/details', params);
}

/**
 * 导出绩效数据
 * @param params 查询参数
 * @returns Promise
 */
export function exportPerformanceData(params: {
  type: 'teacher' | 'source' | 'class';
  startDate?: string;
  endDate?: string;
}): Promise<ApiResponse<Blob>> {
  return request.request({
    url: '/api9843',
    method: 'GET',
    params,
    responseType: 'blob'
  });
}

/**
 * 获取提成规则
 * @returns Promise
 */
export function getCommissionRules(): Promise<ApiResponse<CommissionRule>> {
  return get('/api/principal/commission/rules');
}

/**
 * 保存提成规则
 * @param data 提成规则数据
 * @returns Promise
 */
export function saveCommissionRules(data: CommissionRule): Promise<ApiResponse<CommissionRule>> {
  return post('/api/principal/commission/rules', data);
}

/**
 * 获取绩效目标
 * @returns Promise
 */
export function getPerformanceGoals(): Promise<ApiResponse<PerformanceGoal>> {
  return get('/api/principal/performance/goals');
}

/**
 * 保存绩效目标
 * @param data 绩效目标数据
 * @returns Promise
 */
export function savePerformanceGoals(data: PerformanceGoal): Promise<ApiResponse<PerformanceGoal>> {
  return post('/api/principal/performance/goals', data);
}

/**
 * 模拟计算提成
 * @param data 模拟数据
 * @returns Promise
 */
export function simulateCommission(data: {
  enrollmentCount: number;
  classType: string;
}): Promise<ApiResponse<{
  enrollmentCount: number;
  classType: string;
  baseRate: number;
  finalRate: number;
  tuitionFee: number;
  commission: number;
  details: Array<{
    name: string;
    rate: number;
    amount: number;
  }>;
}>> {
  return post('/api/principal/commission/simulate', data);
}

/**
 * 获取客户详情
 * @param id 客户ID
 * @returns Promise
 */
export function getCustomerDetail(id: number): Promise<ApiResponse<any>> {
  return get(`/api/principal/customer-pool/${id}`);
}

/**
 * 添加客户跟进记录
 * @param id 客户ID
 * @param data 跟进记录数据
 * @returns Promise
 */
export function addCustomerFollowUp(id: number, data: { content: string; type: string }): Promise<ApiResponse<any>> {
  return post(`/api/principal/customer-pool/${id}/follow-up`, data);
}

/**
 * 导入客户数据
 * @param file 文件对象
 * @returns Promise
 */
export function importCustomerData(file: File): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return post('/api/principal/customer-pool/import', { file: file.name });
}

/**
 * 获取绩效规则列表
 * @param params 查询参数
 * @returns Promise
 */
export function getPerformanceRuleList(params?: {
  type?: PerformanceRuleType;
  isActive?: boolean;
}): Promise<ApiResponse<PerformanceRule[]>> {
  return get('/api/performance/rules', params);
}

/**
 * 获取绩效规则详情
 * @param id 规则ID
 * @returns Promise
 */
export function getPerformanceRuleDetail(id: number | string): Promise<ApiResponse<PerformanceRule>> {
  return get(`/api/performance/rules/${id}`);
}

/**
 * 创建绩效规则
 * @param data 规则数据
 * @returns Promise
 */
export function createPerformanceRule(data: Omit<PerformanceRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PerformanceRule>> {
  return post('/api/performance/rules', data);
}

/**
 * 更新绩效规则
 * @param id 规则ID
 * @param data 规则数据
 * @returns Promise
 */
export function updatePerformanceRule(id: number | string, data: Partial<Omit<PerformanceRule, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ApiResponse<PerformanceRule>> {
  return put(`/api/performance/rules/${id}`, data);
}

/**
 * 删除绩效规则
 * @param id 规则ID
 * @returns Promise
 */
export function deletePerformanceRule(id: number | string): Promise<ApiResponse<{ id: number | string }>> {
  return del(`/api/performance/rules/${id}`);
}

/**
 * 切换绩效规则状态
 * @param id 规则ID
 * @param isActive 是否激活
 * @returns Promise
 */
export function togglePerformanceRuleStatus(id: number | string, isActive: boolean): Promise<ApiResponse<PerformanceRule>> {
  return request.request({
    url: `/performance/rules/${id}/status`,
    method: 'PATCH',
    data: { isActive }
  });
}

/**
 * 获取海报模板列表
 * @param params 查询参数
 * @returns Promise<ApiResponse<{ templates: PosterTemplate[]; total: number }>>
 */
export async function getPosterTemplates(params?: PosterTemplateQueryParams): Promise<ApiResponse<{ templates: PosterTemplate[]; total: number }>> {
  try {
    // 直接调用API
    const response = await get('/api/poster-templates', params);
    
    if (response.success) {
      let templates: PosterTemplate[] = [];
      let total = 0;
      
      if (response.data && (response.data as any).items) {
        templates = ((response.data as any).items || []).map(transformPosterTemplate);
        total = (response.data as any).total || 0;
      } else if (Array.isArray(response.data)) {
        templates = response.data.map(transformPosterTemplate);
        total = templates.length;
      } else if ((response as any).items && Array.isArray((response as any).items)) {
        templates = (response as any).items.map(transformPosterTemplate);
        total = (response as any).total || templates.length;
      }
      
      return {
        success: true,
        message: response.message || '获取海报模板列表成功',
        data: {
          templates,
          total
        }
      };
    }
    
    return response;
  } catch (error) {
    console.error('获取海报模板列表失败:', error);
    return {
      success: false,
      message: '获取海报模板列表失败',
      data: { templates: [], total: 0 }
    };
  }
}

/**
 * 获取海报模板详情
 * @param id 模板ID
 * @returns Promise<ApiResponse<PosterTemplate>>
 */
export async function getPosterTemplate(id: number): Promise<ApiResponse<PosterTemplate>> {
  return get(`/api/poster-templates/${id}`).then(response => {
    if (response.success && response.data) {
      return {
        ...response,
        data: transformPosterTemplate(response.data)
      };
    }
    return response as ApiResponse<PosterTemplate>;
  });
}

/**
 * 创建海报模板
 * @param data 模板数据
 * @returns Promise<ApiResponse<PosterTemplate>>
 */
export async function createPosterTemplate(data: Omit<PosterTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<ApiResponse<PosterTemplate>> {
  return post(`/api/poster-templates`, data).then(response => {
    if (response.success && response.data) {
      return {
        ...response,
        data: transformPosterTemplate(response.data)
      };
    }
    return response as ApiResponse<PosterTemplate>;
  });
}

/**
 * 更新海报模板
 * @param id 模板ID
 * @param data 模板数据
 * @returns Promise<ApiResponse<PosterTemplate>>
 */
export async function updatePosterTemplate(id: number, data: Partial<Omit<PosterTemplate, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>>): Promise<ApiResponse<PosterTemplate>> {
  return put(`/api/poster-templates/${id}`, data).then(response => {
    if (response.success && response.data) {
      return {
        ...response,
        data: transformPosterTemplate(response.data)
      };
    }
    return response as ApiResponse<PosterTemplate>;
  });
}

/**
 * 删除海报模板
 * @param id 模板ID
 * @returns Promise<ApiResponse<{ id: number }>>
 */
export async function deletePosterTemplate(id: number): Promise<ApiResponse<{ id: number }>> {
  return del(`/api/poster-templates/${id}`);
}

/**
 * 生成海报
 * @param data 生成参数
 * @returns Promise<ApiResponse<{ url: string }>>
 */
export async function generatePoster(data: {
  templateId: number;
  customData: Record<string, any>;
}): Promise<ApiResponse<{ url: string }>> {
  return post(PRINCIPAL_ENDPOINTS.POSTER_GENERATE, data);
}

// 转换函数
export function transformPosterTemplate(data: PosterTemplate): PosterTemplate {
  return {
    ...data,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    marketingTools: data.marketingTools || [],
  };
} 