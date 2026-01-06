/**
 * 统计分析相关API端点测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/statistics.ts
 */

import { 
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

describe, it, expect } from 'vitest';
import {
  STATISTICS_ENDPOINTS,
  ANALYSIS_ENDPOINTS,
  CUSTOMER_ENDPOINTS,
  RISK_ENDPOINTS,
  METRICS_ENDPOINTS
} from '@/api/endpoints/statistics';

describe('统计分析相关API端点', () => {
  describe('统计分析接口', () => {
    it('应该定义正确的统计分析基础端点', () => {
      expect(STATISTICS_ENDPOINTS.BASE).toBe('/statistics');
    });

    it('应该支持多维度统计分析', () => {
      expect(STATISTICS_ENDPOINTS.DASHBOARD).toBe('/statistics/dashboard');
      expect(STATISTICS_ENDPOINTS.ENROLLMENT).toBe('/statistics/enrollment');
      expect(STATISTICS_ENDPOINTS.STUDENTS).toBe('/statistics/students');
      expect(STATISTICS_ENDPOINTS.TEACHERS).toBe('/statistics/teachers');
      expect(STATISTICS_ENDPOINTS.CLASSES).toBe('/statistics/classes');
      expect(STATISTICS_ENDPOINTS.ACTIVITIES).toBe('/statistics/activities');
      expect(STATISTICS_ENDPOINTS.FINANCE).toBe('/statistics/finance');
    });

    it('应该支持满意度统计', () => {
      expect(STATISTICS_ENDPOINTS.PARENT_SATISFACTION).toBe('/statistics/parent-satisfaction');
    });

    it('应该支持考勤统计', () => {
      expect(STATISTICS_ENDPOINTS.ATTENDANCE).toBe('/statistics/attendance');
    });

    it('应该支持性能和趋势分析', () => {
      expect(STATISTICS_ENDPOINTS.PERFORMANCE).toBe('/statistics/performance');
      expect(STATISTICS_ENDPOINTS.TRENDS).toBe('/statistics/trends');
      expect(STATISTICS_ENDPOINTS.COMPARISON).toBe('/statistics/comparison');
    });

    it('应该支持报表和自定义分析', () => {
      expect(STATISTICS_ENDPOINTS.EXPORT).toBe('/statistics/export');
      expect(STATISTICS_ENDPOINTS.REPORTS).toBe('/statistics/reports');
      expect(STATISTICS_ENDPOINTS.CUSTOM_REPORT).toBe('/statistics/custom-report');
    });
  });

  describe('数据分析接口', () => {
    it('应该定义正确的数据分析基础端点', () => {
      expect(ANALYSIS_ENDPOINTS.BASE).toBe('/analysis');
    });

    it('应该支持漏斗分析', () => {
      expect(ANALYSIS_ENDPOINTS.ENROLLMENT_FUNNEL).toBe('/analysis/enrollment-funnel');
    });

    it('应该支持多维度性能分析', () => {
      expect(ANALYSIS_ENDPOINTS.STUDENT_RETENTION).toBe('/analysis/student-retention');
      expect(ANALYSIS_ENDPOINTS.TEACHER_PERFORMANCE).toBe('/analysis/teacher-performance');
      expect(ANALYSIS_ENDPOINTS.CLASS_EFFICIENCY).toBe('/analysis/class-efficiency');
    });

    it('应该支持财务分析', () => {
      expect(ANALYSIS_ENDPOINTS.REVENUE_ANALYSIS).toBe('/analysis/revenue');
      expect(ANALYSIS_ENDPOINTS.COST_ANALYSIS).toBe('/analysis/cost');
      expect(ANALYSIS_ENDPOINTS.PROFIT_ANALYSIS).toBe('/analysis/profit');
    });

    it('应该支持增长和趋势分析', () => {
      expect(ANALYSIS_ENDPOINTS.GROWTH_ANALYSIS).toBe('/analysis/growth');
      expect(ANALYSIS_ENDPOINTS.SEASONAL_TRENDS).toBe('/analysis/seasonal-trends');
    });

    it('应该支持高级分析功能', () => {
      expect(ANALYSIS_ENDPOINTS.COMPETITIVE_ANALYSIS).toBe('/analysis/competitive');
      expect(ANALYSIS_ENDPOINTS.PREDICTIVE_ANALYSIS).toBe('/analysis/predictive');
      expect(ANALYSIS_ENDPOINTS.RISK_ANALYSIS).toBe('/analysis/risk');
    });
  });

  describe('客户分析接口', () => {
    it('应该定义正确的客户分析基础端点', () => {
      expect(CUSTOMER_ENDPOINTS.BASE).toBe('/customers');
    });

    it('应该支持客户池管理', () => {
      expect(CUSTOMER_ENDPOINTS.POOL).toBe('/customer-pool');
    });

    it('应该支持客户生命周期分析', () => {
      expect(CUSTOMER_ENDPOINTS.LIFECYCLE).toBe('/customers/lifecycle');
      expect(CUSTOMER_ENDPOINTS.SEGMENTATION).toBe('/customers/segmentation');
      expect(CUSTOMER_ENDPOINTS.RETENTION).toBe('/customers/retention');
    });

    it('应该支持客户行为分析', () => {
      expect(CUSTOMER_ENDPOINTS.BEHAVIOR).toBe('/customers/behavior');
      expect(CUSTOMER_ENDPOINTS.ENGAGEMENT).toBe('/customers/engagement');
    });

    it('应该支持客户满意度管理', () => {
      expect(CUSTOMER_ENDPOINTS.SATISFACTION).toBe('/customers/satisfaction');
      expect(CUSTOMER_ENDPOINTS.FEEDBACK).toBe('/customers/feedback');
    });

    it('应该支持预测分析', () => {
      expect(CUSTOMER_ENDPOINTS.CHURN_PREDICTION).toBe('/customers/churn-prediction');
      expect(CUSTOMER_ENDPOINTS.VALUE_ANALYSIS).toBe('/customers/value-analysis');
    });

    it('应该支持调查和导出', () => {
      expect(CUSTOMER_ENDPOINTS.SURVEYS).toBe('/customers/surveys');
      expect(CUSTOMER_ENDPOINTS.EXPORT).toBe('/customers/export');
    });
  });

  describe('风险管理接口', () => {
    it('应该定义正确的风险管理基础端点', () => {
      expect(RISK_ENDPOINTS.BASE).toBe('/risk');
    });

    it('应该支持风险评估和监控', () => {
      expect(RISK_ENDPOINTS.ASSESSMENT).toBe('/risk/assessment');
      expect(RISK_ENDPOINTS.MONITORING).toBe('/risk/monitoring');
    });

    it('应该支持风险处理', () => {
      expect(RISK_ENDPOINTS.ALERTS).toBe('/risk/alerts');
      expect(RISK_ENDPOINTS.MITIGATION).toBe('/risk/mitigation');
    });

    it('应该支持风险报告和合规', () => {
      expect(RISK_ENDPOINTS.REPORTS).toBe('/risk/reports');
      expect(RISK_ENDPOINTS.COMPLIANCE).toBe('/risk/compliance');
    });

    it('应该支持审计和应急计划', () => {
      expect(RISK_ENDPOINTS.AUDIT).toBe('/risk/audit');
      expect(RISK_ENDPOINTS.INCIDENTS).toBe('/risk/incidents');
      expect(RISK_ENDPOINTS.EMERGENCY_PLANS).toBe('/risk/emergency-plans');
    });
  });

  describe('性能指标接口', () => {
    it('应该定义正确的性能指标基础端点', () => {
      expect(METRICS_ENDPOINTS.BASE).toBe('/metrics');
    });

    it('应该支持KPI和目标管理', () => {
      expect(METRICS_ENDPOINTS.KPI).toBe('/metrics/kpi');
      expect(METRICS_ENDPOINTS.GOALS).toBe('/metrics/goals');
      expect(METRICS_ENDPOINTS.TARGETS).toBe('/metrics/targets');
    });

    it('应该支持基准和成就管理', () => {
      expect(METRICS_ENDPOINTS.BENCHMARKS).toBe('/metrics/benchmarks');
      expect(METRICS_ENDPOINTS.ACHIEVEMENTS).toBe('/metrics/achievements');
    });

    it('应该支持分析和预测', () => {
      expect(METRICS_ENDPOINTS.TRENDS).toBe('/metrics/trends');
      expect(METRICS_ENDPOINTS.COMPARISONS).toBe('/metrics/comparisons');
      expect(METRICS_ENDPOINTS.FORECASTS).toBe('/metrics/forecasts');
    });

    it('应该支持记分卡和警报', () => {
      expect(METRICS_ENDPOINTS.SCORECARDS).toBe('/metrics/scorecards');
      expect(METRICS_ENDPOINTS.ALERTS).toBe('/metrics/alerts');
    });

    it('应该支持指标导出', () => {
      expect(METRICS_ENDPOINTS.EXPORT).toBe('/metrics/export');
    });
  });

  describe('端点路径格式', () => {
    it('所有基础端点应该以斜杠开头', () => {
      const baseEndpoints = [
        STATISTICS_ENDPOINTS.BASE,
        ANALYSIS_ENDPOINTS.BASE,
        CUSTOMER_ENDPOINTS.BASE,
        RISK_ENDPOINTS.BASE,
        METRICS_ENDPOINTS.BASE
      ];

      baseEndpoints.forEach(endpoint => {
        expect(endpoint.startsWith('/')).toBe(true);
      });
    });

    it('路径应该符合RESTful规范', () => {
      // 测试嵌套资源路径
      expect(STATISTICS_ENDPOINTS.DASHBOARD).toBe('/statistics/dashboard');
      expect(ANALYSIS_ENDPOINTS.ENROLLMENT_FUNNEL).toBe('/analysis/enrollment-funnel');
      expect(CUSTOMER_ENDPOINTS.LIFECYCLE).toBe('/customers/lifecycle');

      // 测试复合路径
      expect(RISK_ENDPOINTS.ASSESSMENT).toBe('/risk/assessment');
      expect(METRICS_ENDPOINTS.BENCHMARKS).toBe('/metrics/benchmarks');
    });

    it('应该支持一致的命名规范', () => {
      // 测试kebab-case命名
      const kebabCaseEndpoints = [
        STATISTICS_ENDPOINTS.PARENT_SATISFACTION,
        ANALYSIS_ENDPOINTS.STUDENT_RETENTION,
        CUSTOMER_ENDPOINTS.CHURN_PREDICTION,
        RISK_ENDPOINTS.EMERGENCY_PLANS
      ];

      kebabCaseEndpoints.forEach(endpoint => {
        expect(endpoint).toMatch(/^[a-z][a-z0-9-]*\/[a-z][a-z0-9-]*$/);
      });
    });
  });

  describe('端点功能完整性', () => {
    it('统计分析端点应该包含完整的数据维度', () => {
      const statisticsFunctions = [
        'BASE', 'DASHBOARD', 'ENROLLMENT', 'STUDENTS', 'TEACHERS', 'CLASSES',
        'ACTIVITIES', 'FINANCE', 'PARENT_SATISFACTION', 'ATTENDANCE',
        'PERFORMANCE', 'TRENDS', 'COMPARISON', 'EXPORT', 'REPORTS', 'CUSTOM_REPORT'
      ];

      statisticsFunctions.forEach(func => {
        expect(STATISTICS_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('数据分析端点应该支持全面的分析功能', () => {
      const analysisFunctions = [
        'BASE', 'ENROLLMENT_FUNNEL', 'STUDENT_RETENTION', 'TEACHER_PERFORMANCE',
        'CLASS_EFFICIENCY', 'REVENUE_ANALYSIS', 'COST_ANALYSIS', 'PROFIT_ANALYSIS',
        'GROWTH_ANALYSIS', 'SEASONAL_TRENDS', 'COMPETITIVE_ANALYSIS',
        'PREDICTIVE_ANALYSIS', 'RISK_ANALYSIS'
      ];

      analysisFunctions.forEach(func => {
        expect(ANALYSIS_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('客户分析端点应该支持完整的客户管理', () => {
      const customerFunctions = [
        'BASE', 'POOL', 'LIFECYCLE', 'SEGMENTATION', 'BEHAVIOR', 'SATISFACTION',
        'RETENTION', 'CHURN_PREDICTION', 'VALUE_ANALYSIS', 'ENGAGEMENT',
        'FEEDBACK', 'SURVEYS', 'EXPORT'
      ];

      customerFunctions.forEach(func => {
        expect(CUSTOMER_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('风险管理端点应该支持全面的风险控制', () => {
      const riskFunctions = [
        'BASE', 'ASSESSMENT', 'MONITORING', 'ALERTS', 'MITIGATION', 'REPORTS',
        'COMPLIANCE', 'AUDIT', 'INCIDENTS', 'EMERGENCY_PLANS'
      ];

      riskFunctions.forEach(func => {
        expect(RISK_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('性能指标端点应该支持完整的指标管理', () => {
      const metricsFunctions = [
        'BASE', 'KPI', 'GOALS', 'BENCHMARKS', 'SCORECARDS', 'TARGETS',
        'ACHIEVEMENTS', 'TRENDS', 'COMPARISONS', 'FORECASTS', 'ALERTS', 'EXPORT'
      ];

      metricsFunctions.forEach(func => {
        expect(METRICS_ENDPOINTS).toHaveProperty(func);
      });
    });
  });

  describe('分析维度覆盖', () => {
    it('应该覆盖招生分析维度', () => {
      expect(STATISTICS_ENDPOINTS.ENROLLMENT).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.ENROLLMENT_FUNNEL).toBeDefined();
    });

    it('应该覆盖学生分析维度', () => {
      expect(STATISTICS_ENDPOINTS.STUDENTS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.STUDENT_RETENTION).toBeDefined();
    });

    it('应该覆盖教师分析维度', () => {
      expect(STATISTICS_ENDPOINTS.TEACHERS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.TEACHER_PERFORMANCE).toBeDefined();
    });

    it('应该覆盖班级分析维度', () => {
      expect(STATISTICS_ENDPOINTS.CLASSES).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.CLASS_EFFICIENCY).toBeDefined();
    });

    it('应该覆盖财务分析维度', () => {
      expect(STATISTICS_ENDPOINTS.FINANCE).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.REVENUE_ANALYSIS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.COST_ANALYSIS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.PROFIT_ANALYSIS).toBeDefined();
    });

    it('应该覆盖活动分析维度', () => {
      expect(STATISTICS_ENDPOINTS.ACTIVITIES).toBeDefined();
    });

    it('应该覆盖满意度分析维度', () => {
      expect(STATISTICS_ENDPOINTS.PARENT_SATISFACTION).toBeDefined();
      expect(CUSTOMER_ENDPOINTS.SATISFACTION).toBeDefined();
    });

    it('应该覆盖考勤分析维度', () => {
      expect(STATISTICS_ENDPOINTS.ATTENDANCE).toBeDefined();
    });
  });

  describe('高级分析功能', () => {
    it('应该支持预测分析', () => {
      expect(ANALYSIS_ENDPOINTS.PREDICTIVE_ANALYSIS).toBeDefined();
      expect(CUSTOMER_ENDPOINTS.CHURN_PREDICTION).toBeDefined();
      expect(METRICS_ENDPOINTS.FORECASTS).toBeDefined();
    });

    it('应该支持竞争分析', () => {
      expect(ANALYSIS_ENDPOINTS.COMPETITIVE_ANALYSIS).toBeDefined();
    });

    it('应该支持趋势分析', () => {
      expect(STATISTICS_ENDPOINTS.TRENDS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.SEASONAL_TRENDS).toBeDefined();
      expect(METRICS_ENDPOINTS.TRENDS).toBeDefined();
    });

    it('应该支持比较分析', () => {
      expect(STATISTICS_ENDPOINTS.COMPARISON).toBeDefined();
      expect(METRICS_ENDPOINTS.COMPARISONS).toBeDefined();
    });

    it('应该支持风险分析', () => {
      expect(ANALYSIS_ENDPOINTS.RISK_ANALYSIS).toBeDefined();
      expect(RISK_ENDPOINTS.ASSESSMENT).toBeDefined();
    });

    it('应该支持价值分析', () => {
      expect(CUSTOMER_ENDPOINTS.VALUE_ANALYSIS).toBeDefined();
      expect(ANALYSIS_ENDPOINTS.PROFIT_ANALYSIS).toBeDefined();
    });
  });
});