/**
 * Admin测评数据中心 API
 */
import request from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const ASSESSMENT_ANALYTICS_ENDPOINTS = {
  OVERVIEW: `${API_PREFIX}/assessment-analytics/overview`,
  RECORDS: `${API_PREFIX}/assessment-analytics/records`,
  RECORD_BY_ID: (id: number) => `${API_PREFIX}/assessment-analytics/records/${id}`,
  REPORTS: `${API_PREFIX}/assessment-analytics/reports`,
  EXPORT: `${API_PREFIX}/assessment-analytics/export`,
  TRENDS: `${API_PREFIX}/assessment-analytics/trends`
} as const;

export interface AssessmentOverviewStats {
  totalAssessments: number;
  monthlyAssessments: number;
  completionRate: number;
  averageScore: number;
  trendData: {
    labels: string[];
    values: number[];
  };
  ageDistribution: Array<{
    age: number;
    count: number;
  }>;
  dimensionScores: {
    cognitive: number;
    physical: number;
    social: number;
    emotional: number;
    language: number;
  };
  dqDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  recentRecords: any[];
}

export interface RecordFilters {
  keyword?: string;
  assessmentType?: string[];
  startDate?: string;
  endDate?: string;
  minScore?: number;
  maxScore?: number;
  minAge?: number;
  maxAge?: number;
  status?: string;
  page: number;
  pageSize: number;
}

export interface TrendQuery {
  startDate: string;
  endDate: string;
  groupBy: 'day' | 'week' | 'month';
}

/**
 * 获取测评总览统计
 */
export function getAssessmentOverview() {
  return request.get<AssessmentOverviewStats>(ASSESSMENT_ANALYTICS_ENDPOINTS.OVERVIEW);
}

/**
 * 获取测评记录列表
 */
export function getAssessmentRecords(params: RecordFilters) {
  return request.get(ASSESSMENT_ANALYTICS_ENDPOINTS.RECORDS, params);
}

/**
 * 获取测评记录详情
 */
export function getAssessmentRecordDetail(id: number) {
  return request.get(ASSESSMENT_ANALYTICS_ENDPOINTS.RECORD_BY_ID(id));
}

/**
 * 获取测评报告列表
 */
export function getAssessmentReports(params: { page: number; pageSize: number }) {
  return request.get(ASSESSMENT_ANALYTICS_ENDPOINTS.REPORTS, params);
}

/**
 * 导出测评数据
 */
export function exportAssessmentData(data: {
  format: 'pdf' | 'excel';
  recordIds: number[];
}) {
  return request.post(ASSESSMENT_ANALYTICS_ENDPOINTS.EXPORT, data, {
    responseType: 'blob',
  });
}

/**
 * 获取趋势数据
 */
export function getAssessmentTrends(params: TrendQuery) {
  return request.get(ASSESSMENT_ANALYTICS_ENDPOINTS.TRENDS, params);
}







