/**
 * 统计分析相关API端点
 */
import { API_PREFIX } from './base';

// 统计分析接口
export const STATISTICS_ENDPOINTS = {
  BASE: `${API_PREFIX}statistics`,
  DASHBOARD: `${API_PREFIX}statistics/dashboard`,
  ENROLLMENT: `${API_PREFIX}statistics/enrollment`,
  STUDENTS: `${API_PREFIX}statistics/students`,
  TEACHERS: `${API_PREFIX}statistics/teachers`,
  CLASSES: `${API_PREFIX}statistics/classes`,
  ACTIVITIES: `${API_PREFIX}statistics/activities`,
  FINANCE: `${API_PREFIX}statistics/finance`,
  PARENT_SATISFACTION: `${API_PREFIX}statistics/parent-satisfaction`,
  ATTENDANCE: `${API_PREFIX}statistics/attendance`,
  PERFORMANCE: `${API_PREFIX}statistics/performance`,
  TRENDS: `${API_PREFIX}statistics/trends`,
  COMPARISON: `${API_PREFIX}statistics/comparison`,
  EXPORT: `${API_PREFIX}statistics/export`,
  REPORTS: `${API_PREFIX}statistics/reports`,
  CUSTOM_REPORT: `${API_PREFIX}statistics/custom-report`,
} as const;

// 数据分析接口
export const ANALYSIS_ENDPOINTS = {
  BASE: `${API_PREFIX}analysis`,
  ENROLLMENT_FUNNEL: `${API_PREFIX}analysis/enrollment-funnel`,
  STUDENT_RETENTION: `${API_PREFIX}analysis/student-retention`,
  TEACHER_PERFORMANCE: `${API_PREFIX}analysis/teacher-performance`,
  CLASS_EFFICIENCY: `${API_PREFIX}analysis/class-efficiency`,
  REVENUE_ANALYSIS: `${API_PREFIX}analysis/revenue`,
  COST_ANALYSIS: `${API_PREFIX}analysis/cost`,
  PROFIT_ANALYSIS: `${API_PREFIX}analysis/profit`,
  GROWTH_ANALYSIS: `${API_PREFIX}analysis/growth`,
  SEASONAL_TRENDS: `${API_PREFIX}analysis/seasonal-trends`,
  COMPETITIVE_ANALYSIS: `${API_PREFIX}analysis/competitive`,
  PREDICTIVE_ANALYSIS: `${API_PREFIX}analysis/predictive`,
  RISK_ANALYSIS: `${API_PREFIX}analysis/risk`,
} as const;

// 客户分析接口
export const CUSTOMER_ENDPOINTS = {
  BASE: `${API_PREFIX}customers`,
  POOL: `${API_PREFIX}customer-pool`,
  LIFECYCLE: `${API_PREFIX}customers/lifecycle`,
  SEGMENTATION: `${API_PREFIX}customers/segmentation`,
  BEHAVIOR: `${API_PREFIX}customers/behavior`,
  SATISFACTION: `${API_PREFIX}customers/satisfaction`,
  RETENTION: `${API_PREFIX}customers/retention`,
  CHURN_PREDICTION: `${API_PREFIX}customers/churn-prediction`,
  VALUE_ANALYSIS: `${API_PREFIX}customers/value-analysis`,
  ENGAGEMENT: `${API_PREFIX}customers/engagement`,
  FEEDBACK: `${API_PREFIX}customers/feedback`,
  SURVEYS: `${API_PREFIX}customers/surveys`,
  EXPORT: `${API_PREFIX}customers/export`,
} as const;

// 风险管理接口
export const RISK_ENDPOINTS = {
  BASE: `${API_PREFIX}risk`,
  ASSESSMENT: `${API_PREFIX}risk/assessment`,
  MONITORING: `${API_PREFIX}risk/monitoring`,
  ALERTS: `${API_PREFIX}risk/alerts`,
  MITIGATION: `${API_PREFIX}risk/mitigation`,
  REPORTS: `${API_PREFIX}risk/reports`,
  COMPLIANCE: `${API_PREFIX}risk/compliance`,
  AUDIT: `${API_PREFIX}risk/audit`,
  INCIDENTS: `${API_PREFIX}risk/incidents`,
  EMERGENCY_PLANS: `${API_PREFIX}risk/emergency-plans`,
} as const;

// 性能指标接口
export const METRICS_ENDPOINTS = {
  BASE: `${API_PREFIX}metrics`,
  KPI: `${API_PREFIX}metrics/kpi`,
  GOALS: `${API_PREFIX}metrics/goals`,
  BENCHMARKS: `${API_PREFIX}metrics/benchmarks`,
  SCORECARDS: `${API_PREFIX}metrics/scorecards`,
  TARGETS: `${API_PREFIX}metrics/targets`,
  ACHIEVEMENTS: `${API_PREFIX}metrics/achievements`,
  TRENDS: `${API_PREFIX}metrics/trends`,
  COMPARISONS: `${API_PREFIX}metrics/comparisons`,
  FORECASTS: `${API_PREFIX}metrics/forecasts`,
  ALERTS: `${API_PREFIX}metrics/alerts`,
  EXPORT: `${API_PREFIX}metrics/export`,
} as const;