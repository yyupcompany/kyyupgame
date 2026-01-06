import { request } from '@/utils/request';

/**
 * 文档统计分析API
 */

export interface OverviewData {
  totalDocuments: number;
  statusStats: Array<{ status: string; count: number }>;
  thisMonthDocuments: number;
  avgProgress: number;
  upcomingOverdue: number;
  overdue: number;
}

export interface TrendData {
  period: string;
  trends: Array<{ date: string; count: number }>;
}

export interface TemplateRankingData {
  ranking: Array<{
    templateId: number;
    count: number;
    template: {
      id: number;
      code: string;
      name: string;
      category: string;
    };
  }>;
}

export interface CompletionRateData {
  total: number;
  completionRate: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  progressStats: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
}

export interface UserStatsData {
  ownerStats: Array<{
    ownerId: number;
    totalCount: number;
    avgProgress: number;
  }>;
  assigneeStats: Array<{
    assignedTo: number;
    totalCount: number;
    avgProgress: number;
  }>;
}

/**
 * 获取统计概览
 */
export function getOverview() {
  return request.get<OverviewData>('/document-statistics/overview');
}

/**
 * 获取使用趋势
 */
export function getTrends(period: '7days' | '30days' | '90days' | '1year' = '30days') {
  return request.get<TrendData>('/document-statistics/trends', {
    params: { period }
  });
}

/**
 * 获取模板使用排行
 */
export function getTemplateRanking(limit: number = 10) {
  return request.get<TemplateRankingData>('/document-statistics/template-ranking', {
    params: { limit }
  });
}

/**
 * 获取完成率统计
 */
export function getCompletionRate() {
  return request.get<CompletionRateData>('/document-statistics/completion-rate');
}

/**
 * 获取用户统计
 */
export function getUserStats() {
  return request.get<UserStatsData>('/document-statistics/user-stats');
}

/**
 * 导出统计报表
 */
export function exportReport(format: 'excel' | 'pdf' = 'excel') {
  return request.get<any>('/document-statistics/export', {
    params: { format }
  });
}

