import {
  DASHBOARD_ENDPOINTS,
  API_PREFIX
} from '../api/endpoints';
import type { ApiResponse } from '@/utils/request';
import type {
  DashboardOverview,
  ChannelAnalysis,
  ActivityAnalysis,
  ConversionFunnel,
  EnrollmentTrend,
  PeriodComparison,
  EnrollmentForecast,
  ClassAnalysis,
  InfluenceFactor,
  ReportTemplate,
  Report
} from '../types/dashboard';

// 导入统一的请求工具
import { get, post, put, del } from '@/utils/request';

/**
 * 数据分析仪表盘API服务
 */
const dashboardApi = {
  /**
   * 获取综合统计数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<DashboardOverview>>
   */
  getOverview(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<DashboardOverview>> {
    return get(`${API_PREFIX}/dashboard/overview`, { params });
  },

  /**
   * 获取仪表盘统计数据 (兼容Dashboard.vue)
   * @param params 查询参数
   * @returns Promise<ApiResponse<DashboardOverview>>
   */
  getDashboardStats(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<DashboardOverview>> {
    return this.getOverview(params);
  },

  /**
   * 获取招生渠道分析数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<ChannelAnalysis[]>>
   */
  getChannelAnalysis(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<ChannelAnalysis[]>> {
    return get(DASHBOARD_ENDPOINTS.CHANNEL_ANALYSIS, { params });
  },

  /**
   * 获取活动效果分析数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<ActivityAnalysis[]>>
   */
  getActivityAnalysis(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<ActivityAnalysis[]>> {
    return get(`${API_PREFIX}/dashboard/statistics`, { params });
  },

  /**
   * 获取仪表盘统计数据
   * @param params 查询参数
   * @returns Promise<ApiResponse>
   */
  getStatistics(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse> {
    return get(`${API_PREFIX}/dashboard/statistics`, { params });
  },

  /**
   * 获取仪表盘状态数据
   * @param params 查询参数
   * @returns Promise<ApiResponse>
   */
  getStats(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse> {
    return get(`${API_PREFIX}/dashboard/stats`, { params });
  },

  /**
   * 获取咨询转化漏斗数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<ConversionFunnel[]>>
   */
  getConversionFunnel(params?: { kindergartenId?: number; startDate?: string; endDate?: string }): Promise<ApiResponse<ConversionFunnel[]>> {
    return get(DASHBOARD_ENDPOINTS.CONVERSION_FUNNEL, { params });
  },

  /**
   * 获取招生趋势数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<EnrollmentTrend[]>>
   */
  getEnrollmentTrends(params?: {
    kindergartenId?: number;
    startDate?: string;
    endDate?: string;
    interval?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<EnrollmentTrend[]>> {
    return get(DASHBOARD_ENDPOINTS.ENROLLMENT_TRENDS, { params });
  },

  /**
   * 获取同比环比数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<PeriodComparison[]>>
   */
  getPeriodComparison(params: {
    kindergartenId?: number;
    metrics: string[];
    compareType: 'mom' | 'yoy' | 'both'; // mom: 环比, yoy: 同比, both: 两者都有
    date: string;
  }): Promise<ApiResponse<PeriodComparison[]>> {
    return post(`${API_PREFIX}/dashboard/period-comparison`, params);
  },

  /**
   * 获取招生预测数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<EnrollmentForecast[]>>
   */
  getEnrollmentForecast(params: {
    kindergartenId?: number;
    startDate: string;
    endDate: string;
    metric: 'enrollment' | 'consultation' | 'application';
  }): Promise<ApiResponse<EnrollmentForecast[]>> {
    return post(`${API_PREFIX}/dashboard/enrollment-forecast`, params);
  },

  /**
   * 获取班级招生分析数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<ClassAnalysis[]>>
   */
  getClassAnalysis(params?: {
    kindergartenId?: number;
    planId?: number;
    academicYear?: string;
  }): Promise<ApiResponse<ClassAnalysis[]>> {
    return get(`${API_PREFIX}/dashboard/class-analysis`, { params });
  },

  /**
   * 获取招生影响因素数据
   * @param params 查询参数
   * @returns Promise<ApiResponse<InfluenceFactor[]>>
   */
  getInfluenceFactors(params?: {
    kindergartenId?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<InfluenceFactor[]>> {
    return get(`${API_PREFIX}/dashboard/influence-factors`, { params });
  },

  /**
   * 获取报表模板列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ templates: ReportTemplate[]; total: number }>>
   */
  getReportTemplates(params?: {
    page?: number;
    limit?: number;
    type?: string;
    keyword?: string;
  }): Promise<ApiResponse<{ templates: ReportTemplate[]; total: number }>> {
    return get(`${API_PREFIX}/report-templates`, { params });
  },

  /**
   * 获取报表模板详情
   * @param id 模板ID
   * @returns Promise<ApiResponse<ReportTemplate>>
   */
  getReportTemplateById(id: number): Promise<ApiResponse<ReportTemplate>> {
    return get(`${API_PREFIX}/report-templates/${id}`);
  },

  /**
   * 创建报表模板
   * @param data 模板数据
   * @returns Promise<ApiResponse<ReportTemplate>>
   */
  createReportTemplate(data: Omit<ReportTemplate, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>): Promise<ApiResponse<ReportTemplate>> {
    return post(`${API_PREFIX}/report-templates`, data);
  },

  /**
   * 更新报表模板
   * @param id 模板ID
   * @param data 模板数据
   * @returns Promise<ApiResponse<ReportTemplate>>
   */
  updateReportTemplate(id: number, data: Partial<ReportTemplate>): Promise<ApiResponse<ReportTemplate>> {
    return put(`${API_PREFIX}/report-templates/${id}`, data);
  },

  /**
   * 删除报表模板
   * @param id 模板ID
   * @returns Promise<ApiResponse<null>>
   */
  deleteReportTemplate(id: number): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/report-templates/${id}`);
  },

  /**
   * 生成报表
   * @param data 报表生成参数
   * @returns Promise<ApiResponse<Report>>
   */
  generateReport(data: {
    templateId: number;
    name: string;
    parameters?: Record<string, any>;
    format?: 'pdf' | 'excel' | 'word';
  }): Promise<ApiResponse<Report>> {
    return post(`${API_PREFIX}/reports/generate`, data);
  },

  /**
   * 获取报表列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ reports: Report[]; total: number }>>
   */
  getReports(params?: { 
    page?: number;
    limit?: number;
    templateId?: number;
    status?: 'processing' | 'completed' | 'failed';
    startDate?: string;
    endDate?: string;
    createdBy?: number;
  }): Promise<ApiResponse<{ reports: Report[]; total: number }>> {
    return get(`${API_PREFIX}/reports`, { params });
  },

  /**
   * 获取报表详情
   * @param id 报表ID
   * @returns Promise<ApiResponse<Report>>
   */
  getReportById(id: number): Promise<ApiResponse<Report>> {
    return get(`${API_PREFIX}/reports/${id}`);
  },

  /**
   * 下载报表
   * @param id 报表ID
   * @returns Promise<Blob>
   */
  downloadReport(id: number): Promise<Blob> {
    return get(`${API_PREFIX}/reports/${id}/download`, { responseType: 'blob' })
      .then((response: any) => response.data);
  },

  /**
   * 创建定时报表
   * @param data 定时报表参数
   * @returns Promise<ApiResponse<any>>
   */
  scheduleReport(data: {
    templateId: number;
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    parameters?: Record<string, any>;
    recipients: string[];
  }): Promise<ApiResponse<any>> {
    return post(`${API_PREFIX}/report-schedules`, data);
  },

  /**
   * 更新定时报表
   * @param id 定时报表ID
   * @param data 定时报表参数
   * @returns Promise<ApiResponse<any>>
   */
  updateScheduleReport(id: number, data: Partial<{
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
    parameters?: Record<string, any>;
    recipients: string[];
    isActive: boolean;
  }>): Promise<ApiResponse<any>> {
    return put(`${API_PREFIX}/report-schedules/${id}`, data);
  },

  /**
   * 删除定时报表
   * @param id 定时报表ID
   * @returns Promise<ApiResponse<null>>
   */
  deleteScheduleReport(id: number): Promise<ApiResponse<null>> {
    return del(`${API_PREFIX}/report-schedules/${id}`);
  }
};

export default dashboardApi; 