/**
 * 招生管理相关API端点测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/enrollment.ts
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { vi } from 'vitest'
import {
  ENROLLMENT_PLAN_ENDPOINTS,
  ENROLLMENT_QUOTA_ENDPOINTS,
  ENROLLMENT_APPLICATION_ENDPOINTS,
  ENROLLMENT_CONSULTATION_ENDPOINTS,
  ENROLLMENT_CHANNEL_ENDPOINTS,
  ENROLLMENT_ACTIVITY_ENDPOINTS
} from '@/api/endpoints/enrollment';
import { expectNoConsoleErrors } from '../../../setup/console-monitoring';

// 控制台错误检测变量
let consoleSpy: any

describe('招生管理相关API端点 - 严格验证', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  })
  // 控制台错误检测
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  afterEach(() => {
    expectNoConsoleErrors();
  })
  // 验证控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore();
  describe('招生计划接口', () => {
    it('应该定义正确的招生计划基础端点并进行严格验证', () => {
      // 验证基础端点存在且格式正确
      expect(ENROLLMENT_PLAN_ENDPOINTS.BASE).toBe('/enrollment-plans');
      expect(ENROLLMENT_PLAN_ENDPOINTS.LIST).toBe('/enrollment-plans');
      expect(ENROLLMENT_PLAN_ENDPOINTS.CREATE).toBe('/enrollment-plans');

      // 验证端点格式符合RESTful规范
      expect(ENROLLMENT_PLAN_ENDPOINTS.BASE).toMatch(/^\/[a-z-]+$/);
      expect(typeof ENROLLMENT_PLAN_ENDPOINTS.BASE).toBe('string');
      expect(ENROLLMENT_PLAN_ENDPOINTS.BASE.length).toBeGreaterThan(0);
    });

    it('应该支持招生计划CRUD操作并进行严格验证', () => {
      const id = 123;
      const stringId = 'plan-abc-123';

      // 验证数字ID参数
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-plans/123');
      expect(ENROLLMENT_PLAN_ENDPOINTS.UPDATE(id)).toBe('/enrollment-plans/123');
      expect(ENROLLMENT_PLAN_ENDPOINTS.DELETE(id)).toBe('/enrollment-plans/123');

      // 验证字符串ID参数
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(stringId)).toBe('/enrollment-plans/plan-abc-123');
      expect(ENROLLMENT_PLAN_ENDPOINTS.UPDATE(stringId)).toBe('/enrollment-plans/plan-abc-123');
      expect(ENROLLMENT_PLAN_ENDPOINTS.DELETE(stringId)).toBe('/enrollment-plans/plan-abc-123');

      // 验证端点函数存在且为函数类型
      expect(typeof ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID).toBe('function');
      expect(typeof ENROLLMENT_PLAN_ENDPOINTS.UPDATE).toBe('function');
      expect(typeof ENROLLMENT_PLAN_ENDPOINTS.DELETE).toBe('function');

      // 验证返回的端点路径格式
      const getByIdEndpoint = ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id);
      expect(getByIdEndpoint).toMatch(/^\/[a-z-]+\/[\w-]+$/);
      expect(getByIdEndpoint).toContain('/enrollment-plans/');
    });

    it('应该支持招生计划关联数据查询', () => {
      const id = 456;
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_QUOTAS(id)).toBe('/enrollment-plans/456/quotas');
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_STATISTICS(id)).toBe('/enrollment-plans/456/statistics');
    });

    it('应该支持招生计划状态管理', () => {
      const id = 789;
      expect(ENROLLMENT_PLAN_ENDPOINTS.UPDATE_STATUS(id)).toBe('/enrollment-plans/789/status');
    });

    it('应该支持招生计划导出', () => {
      const id = 101;
      expect(ENROLLMENT_PLAN_ENDPOINTS.EXPORT(id)).toBe('/enrollment-plans/101/export');
    });

    it('应该支持招生计划分析', () => {
      expect(ENROLLMENT_PLAN_ENDPOINTS.ANALYTICS).toBe('/enrollment-plans/analytics');
      expect(ENROLLMENT_PLAN_ENDPOINTS.OVERVIEW).toBe('/enrollment-plans/overview');
    });

    it('应该支持招生计划跟踪', () => {
      const id = 202;
      expect(ENROLLMENT_PLAN_ENDPOINTS.TRACKING(id)).toBe('/enrollment-plans/202/tracking');
    });

    it('应该支持批量删除', () => {
      expect(ENROLLMENT_PLAN_ENDPOINTS.BATCH_DELETE).toBe('/enrollment-plans/batch-delete');
    });
  });

  describe('招生名额接口', () => {
    it('应该定义正确的招生名额基础端点', () => {
      expect(ENROLLMENT_QUOTA_ENDPOINTS.BASE).toBe('/enrollment-quotas');
    });

    it('应该支持招生名额CRUD操作', () => {
      const id = 303;
      expect(ENROLLMENT_QUOTA_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-quotas/303');
      expect(ENROLLMENT_QUOTA_ENDPOINTS.UPDATE(id)).toBe('/enrollment-quotas/303');
      expect(ENROLLMENT_QUOTA_ENDPOINTS.DELETE(id)).toBe('/enrollment-quotas/303');
    });

    it('应该支持名额批量操作', () => {
      expect(ENROLLMENT_QUOTA_ENDPOINTS.BATCH).toBe('/enrollment-quotas/batch');
      expect(ENROLLMENT_QUOTA_ENDPOINTS.BATCH_ADJUST).toBe('/enrollment-quotas/batch-adjust');
    });

    it('应该支持名额调整', () => {
      const id = 404;
      expect(ENROLLMENT_QUOTA_ENDPOINTS.ADJUST(id)).toBe('/enrollment-quotas/404/adjust');
    });

    it('应该支持名额统计', () => {
      expect(ENROLLMENT_QUOTA_ENDPOINTS.STATISTICS).toBe('/enrollment-quotas/statistics');
      expect(ENROLLMENT_QUOTA_ENDPOINTS.MANAGE).toBe('/enrollment-quotas/manage');
    });

    it('应该支持名额历史记录', () => {
      const id = 505;
      expect(ENROLLMENT_QUOTA_ENDPOINTS.HISTORY(id)).toBe('/enrollment-quotas/505/history');
    });

    it('应该支持名额预测', () => {
      expect(ENROLLMENT_QUOTA_ENDPOINTS.FORECAST).toBe('/enrollment-quotas/forecast');
    });
  });

  describe('招生申请接口', () => {
    it('应该定义正确的招生申请基础端点', () => {
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.BASE).toBe('/enrollment-applications');
    });

    it('应该支持招生申请CRUD操作', () => {
      const id = 606;
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-applications/606');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.UPDATE(id)).toBe('/enrollment-applications/606');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.DELETE(id)).toBe('/enrollment-applications/606');
    });

    it('应该支持申请状态管理', () => {
      const id = 707;
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.UPDATE_STATUS(id)).toBe('/enrollment-applications/707/status');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.APPROVE(id)).toBe('/enrollment-applications/707/approve');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.REJECT(id)).toBe('/enrollment-applications/707/reject');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.REVIEW(id)).toBe('/enrollment-applications/707/review');
    });

    it('应该支持申请文档管理', () => {
      const id = 808;
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.DOCUMENTS(id)).toBe('/enrollment-applications/808/documents');
    });

    it('应该支持批量操作', () => {
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_APPROVE).toBe('/enrollment-applications/batch-approve');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.BATCH_REJECT).toBe('/enrollment-applications/batch-reject');
    });

    it('应该支持申请导出和统计', () => {
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.EXPORT).toBe('/enrollment-applications/export');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.STATISTICS).toBe('/enrollment-applications/statistics');
    });
  });

  describe('招生咨询接口', () => {
    it('应该定义正确的招生咨询基础端点', () => {
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.BASE).toBe('/enrollment-consultations');
    });

    it('应该支持招生咨询CRUD操作', () => {
      const id = 909;
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-consultations/909');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.UPDATE(id)).toBe('/enrollment-consultations/909');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.DELETE(id)).toBe('/enrollment-consultations/909');
    });

    it('应该支持咨询状态管理', () => {
      const id = 1010;
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.UPDATE_STATUS(id)).toBe('/enrollment-consultations/1010/status');
    });

    it('应该支持咨询跟进功能', () => {
      const id = 1111;
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.FOLLOW_UP(id)).toBe('/enrollment-consultations/1111/follow-up');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.SCHEDULE(id)).toBe('/enrollment-consultations/1111/schedule');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.NOTES(id)).toBe('/enrollment-consultations/1111/notes');
    });

    it('应该支持咨询导出和统计', () => {
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.EXPORT).toBe('/enrollment-consultations/export');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.STATISTICS).toBe('/enrollment-consultations/statistics');
    });

    it('应该支持自动化跟进', () => {
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.AUTOMATED_FOLLOW_UP).toBe('/enrollment-consultations/automated-follow-up');
    });
  });

  describe('招生渠道接口', () => {
    it('应该定义正确的招生渠道基础端点', () => {
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.BASE).toBe('/enrollment-channels');
    });

    it('应该支持招生渠道CRUD操作', () => {
      const id = 1212;
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-channels/1212');
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.UPDATE(id)).toBe('/enrollment-channels/1212');
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.DELETE(id)).toBe('/enrollment-channels/1212');
    });

    it('应该支持渠道性能分析', () => {
      const id = 1313;
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.PERFORMANCE(id)).toBe('/enrollment-channels/1313/performance');
    });

    it('应该支持渠道分析功能', () => {
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.STATISTICS).toBe('/enrollment-channels/statistics');
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.ANALYSIS).toBe('/enrollment-channels/analysis');
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.OPTIMIZATION).toBe('/enrollment-channels/optimization');
    });

    it('应该支持ROI分析', () => {
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.ROI).toBe('/enrollment-channels/roi');
    });
  });

  describe('招生活动接口', () => {
    it('应该定义正确的招生活动基础端点', () => {
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.BASE).toBe('/enrollment-activities');
    });

    it('应该支持招生活动CRUD操作', () => {
      const id = 1414;
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.GET_BY_ID(id)).toBe('/enrollment-activities/1414');
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.UPDATE(id)).toBe('/enrollment-activities/1414');
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.DELETE(id)).toBe('/enrollment-activities/1414');
    });

    it('应该支持活动参与者管理', () => {
      const id = 1515;
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.PARTICIPANTS(id)).toBe('/enrollment-activities/1515/participants');
    });

    it('应该支持活动报名功能', () => {
      const id = 1616;
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.REGISTER(id)).toBe('/enrollment-activities/1616/register');
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.CANCEL_REGISTRATION(id)).toBe('/enrollment-activities/1616/cancel-registration');
    });

    it('应该支持活动反馈', () => {
      const id = 1717;
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.FEEDBACK(id)).toBe('/enrollment-activities/1717/feedback');
    });

    it('应该支持活动统计和效果分析', () => {
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.STATISTICS).toBe('/enrollment-activities/statistics');
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.EFFECTIVENESS).toBe('/enrollment-activities/effectiveness');
    });
  });

  describe('端点路径格式', () => {
    it('所有基础端点应该以斜杠开头', () => {
      const baseEndpoints = [
        ENROLLMENT_PLAN_ENDPOINTS.BASE,
        ENROLLMENT_QUOTA_ENDPOINTS.BASE,
        ENROLLMENT_APPLICATION_ENDPOINTS.BASE,
        ENROLLMENT_CONSULTATION_ENDPOINTS.BASE,
        ENROLLMENT_CHANNEL_ENDPOINTS.BASE,
        ENROLLMENT_ACTIVITY_ENDPOINTS.BASE
      ];

      baseEndpoints.forEach(endpoint => {
        expect(endpoint.startsWith('/')).toBe(true);
      });
    });

    it('应该支持不同类型的ID参数', () => {
      const numericId = 123;
      const stringId = 'plan-abc-123';

      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(numericId)).toBe('/enrollment-plans/123');
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(stringId)).toBe('/enrollment-plans/plan-abc-123');

      expect(ENROLLMENT_APPLICATION_ENDPOINTS.UPDATE_STATUS(numericId)).toBe('/enrollment-applications/123/status');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.UPDATE_STATUS(stringId)).toBe('/enrollment-applications/plan-abc-123/status');
    });

    it('路径应该符合RESTful规范', () => {
      // 测试嵌套资源路径
      expect(ENROLLMENT_PLAN_ENDPOINTS.GET_QUOTAS(1)).toBe('/enrollment-plans/1/quotas');
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.DOCUMENTS(2)).toBe('/enrollment-applications/2/documents');
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.FOLLOW_UP(3)).toBe('/enrollment-consultations/3/follow-up');

      // 测试操作路径
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.APPROVE(4)).toBe('/enrollment-applications/4/approve');
      expect(ENROLLMENT_QUOTA_ENDPOINTS.ADJUST(5)).toBe('/enrollment-quotas/5/adjust');
    });
  });

  describe('端点功能完整性', () => {
    it('招生计划端点应该包含完整的管理功能', () => {
      const planFunctions = [
        'BASE', 'LIST', 'CREATE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'GET_QUOTAS',
        'GET_STATISTICS', 'EXPORT', 'UPDATE_STATUS', 'ANALYTICS', 'OVERVIEW',
        'TRACKING', 'BATCH_DELETE'
      ];

      planFunctions.forEach(func => {
        expect(ENROLLMENT_PLAN_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('招生申请端点应该支持完整的申请流程', () => {
      const applicationFunctions = [
        'BASE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'UPDATE_STATUS', 'APPROVE',
        'REJECT', 'REVIEW', 'DOCUMENTS', 'EXPORT', 'BATCH_APPROVE',
        'BATCH_REJECT', 'STATISTICS'
      ];

      applicationFunctions.forEach(func => {
        expect(ENROLLMENT_APPLICATION_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('招生咨询端点应该支持完整的销售流程', () => {
      const consultationFunctions = [
        'BASE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'UPDATE_STATUS', 'FOLLOW_UP',
        'SCHEDULE', 'NOTES', 'EXPORT', 'STATISTICS', 'AUTOMATED_FOLLOW_UP'
      ];

      consultationFunctions.forEach(func => {
        expect(ENROLLMENT_CONSULTATION_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('所有端点模块应该支持统计分析', () => {
      expect(ENROLLMENT_PLAN_ENDPOINTS.STATISTICS).toBeDefined();
      expect(ENROLLMENT_QUOTA_ENDPOINTS.STATISTICS).toBeDefined();
      expect(ENROLLMENT_APPLICATION_ENDPOINTS.STATISTICS).toBeDefined();
      expect(ENROLLMENT_CONSULTATION_ENDPOINTS.STATISTICS).toBeDefined();
      expect(ENROLLMENT_CHANNEL_ENDPOINTS.STATISTICS).toBeDefined();
      expect(ENROLLMENT_ACTIVITY_ENDPOINTS.STATISTICS).toBeDefined();
    });
  });
});