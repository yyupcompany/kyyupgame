import { request } from '@/utils/request';

/**
 * 企业仪表盘API
 */

export interface GlobalKPIs {
  totalStudents: number;
  totalTeachers: number;
  totalActivities: number;
  totalRevenue: number;
  systemHealth: number;
  overallGrowth: number;
}

export interface CenterMetrics {
  primary: {
    label: string;
    value: number;
    unit: string;
  };
  secondary: {
    label: string;
    value: number;
    unit: string;
  };
  trend: number;
}

export interface CenterData {
  id: string;
  name: string;
  icon: string;
  color: string;
  path: string;
  metrics: CenterMetrics;
  status: 'normal' | 'warning';
}

export interface EnterpriseDashboardData {
  globalKPIs: GlobalKPIs;
  centers: CenterData[];
  meta: {
    responseTime: number;
    lastUpdated: string;
    timeRange: string;
    totalCenters: number;
  };
}

/**
 * 获取企业仪表盘汇总数据
 */
export function getEnterpriseDashboardOverview(params?: { timeRange?: string }) {
  return request.get<EnterpriseDashboardData>('/enterprise-dashboard/overview', { params });
}

