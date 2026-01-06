/**
 * 仪表盘相关API端点测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints/dashboard.ts
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
  DASHBOARD_ENDPOINTS,
  NOTIFICATION_ENDPOINTS,
  TODO_ENDPOINTS,
  SCHEDULE_ENDPOINTS
} from '@/api/endpoints/dashboard';

describe('仪表盘相关API端点', () => {
  describe('仪表盘接口', () => {
    it('应该定义正确的仪表盘基础端点', () => {
      expect(DASHBOARD_ENDPOINTS.STATS).toBe('/api/dashboard/stats');
      expect(DASHBOARD_ENDPOINTS.CLASSES).toBe('/api/dashboard/classes');
      expect(DASHBOARD_ENDPOINTS.TODOS).toBe('/api/dashboard/todos');
      expect(DASHBOARD_ENDPOINTS.SCHEDULES).toBe('/api/dashboard/schedules');
    });

    it('应该支持TODO操作', () => {
      const id = 123;
      expect(DASHBOARD_ENDPOINTS.TODO_STATUS(id)).toBe('/api/dashboard/todos/123/status');
      expect(DASHBOARD_ENDPOINTS.TODO_DELETE(id)).toBe('/api/dashboard/todos/123');
    });

    it('应该支持数据分析端点', () => {
      expect(DASHBOARD_ENDPOINTS.ENROLLMENT_TRENDS).toBe('/api/dashboard/enrollment-trends');
      expect(DASHBOARD_ENDPOINTS.CHANNEL_ANALYSIS).toBe('/api/dashboard/channel-analysis');
      expect(DASHBOARD_ENDPOINTS.CONVERSION_FUNNEL).toBe('/api/dashboard/conversion-funnel');
      expect(DASHBOARD_ENDPOINTS.ACTIVITIES).toBe('/api/dashboard/activities');
    });

    it('应该支持概览和系统状态', () => {
      expect(DASHBOARD_ENDPOINTS.OVERVIEW).toBe('/api/dashboard/overview');
      expect(DASHBOARD_ENDPOINTS.SYSTEM_STATUS).toBe('/api/dashboard/real-time/system-status');
    });

    it('应该支持统计相关端点', () => {
      expect(DASHBOARD_ENDPOINTS.STATISTICS).toBe('/api/dashboard/statistics');
      expect(DASHBOARD_ENDPOINTS.STATISTICS_TABLE).toBe('/api/dashboard/statistics/table');
      expect(DASHBOARD_ENDPOINTS.STATISTICS_ENROLLMENT_TRENDS).toBe('/api/dashboard/statistics/enrollment-trends');
      expect(DASHBOARD_ENDPOINTS.STATISTICS_ACTIVITY_DATA).toBe('/api/dashboard/statistics/activity-data');
    });

    it('应该支持通知管理端点', () => {
      expect(DASHBOARD_ENDPOINTS.NOTICES_STATS).toBe('/api/dashboard/notices/stats');
      expect(DASHBOARD_ENDPOINTS.NOTICES_IMPORTANT).toBe('/api/dashboard/notices/important');
      expect(DASHBOARD_ENDPOINTS.NOTICES_MARK_ALL_READ).toBe('/api/dashboard/notices/mark-all-read');
    });

    it('应该支持通知操作', () => {
      const id = 456;
      expect(DASHBOARD_ENDPOINTS.NOTICE_READ(id)).toBe('/api/dashboard/notices/456/read');
      expect(DASHBOARD_ENDPOINTS.NOTICE_DELETE(id)).toBe('/api/dashboard/notices/456');
    });

    it('应该支持快速统计和活动', () => {
      expect(DASHBOARD_ENDPOINTS.QUICK_STATS).toBe('/api/dashboard/quick-stats');
      expect(DASHBOARD_ENDPOINTS.RECENT_ACTIVITIES).toBe('/api/dashboard/recent-activities');
    });

    it('应该支持性能指标和警报', () => {
      expect(DASHBOARD_ENDPOINTS.PERFORMANCE_METRICS).toBe('/api/dashboard/performance-metrics');
      expect(DASHBOARD_ENDPOINTS.ALERTS).toBe('/api/dashboard/alerts');
    });

    it('应该支持小组件数据', () => {
      const widget = 'user-stats';
      expect(DASHBOARD_ENDPOINTS.WIDGET_DATA(widget)).toBe('/api/dashboard/widgets/user-stats');
    });
  });

  describe('通知管理接口', () => {
    it('应该定义正确的通知基础端点', () => {
      expect(NOTIFICATION_ENDPOINTS.BASE).toBe('/api/notifications');
    });

    it('应该支持通知CRUD操作', () => {
      const id = 789;
      expect(NOTIFICATION_ENDPOINTS.GET_BY_ID(id)).toBe('/api/notifications/789');
      expect(NOTIFICATION_ENDPOINTS.UPDATE(id)).toBe('/api/notifications/789');
      expect(NOTIFICATION_ENDPOINTS.DELETE(id)).toBe('/api/notifications/789');
    });

    it('应该支持通知状态操作', () => {
      const id = 101;
      expect(NOTIFICATION_ENDPOINTS.MARK_READ(id)).toBe('/api/notifications/101/read');
      expect(NOTIFICATION_ENDPOINTS.MARK_ALL_READ).toBe('/api/notifications/mark-all-read');
    });

    it('应该支持通知查询', () => {
      expect(NOTIFICATION_ENDPOINTS.GET_UNREAD).toBe('/api/notifications/unread');
      expect(NOTIFICATION_ENDPOINTS.GET_RECENT).toBe('/api/notifications/recent');
    });

    it('应该支持通知发送', () => {
      expect(NOTIFICATION_ENDPOINTS.SEND).toBe('/api/notifications/send');
      expect(NOTIFICATION_ENDPOINTS.BATCH_SEND).toBe('/api/notifications/batch-send');
    });

    it('应该支持通知模板和设置', () => {
      expect(NOTIFICATION_ENDPOINTS.TEMPLATES).toBe('/api/notifications/templates');
      expect(NOTIFICATION_ENDPOINTS.SETTINGS).toBe('/api/notifications/settings');
    });
  });

  describe('待办事项接口', () => {
    it('应该定义正确的待办事项基础端点', () => {
      expect(TODO_ENDPOINTS.BASE).toBe('/api/todos');
    });

    it('应该支持待办事项CRUD操作', () => {
      const id = 202;
      expect(TODO_ENDPOINTS.GET_BY_ID(id)).toBe('/api/todos/202');
      expect(TODO_ENDPOINTS.UPDATE(id)).toBe('/api/todos/202');
      expect(TODO_ENDPOINTS.DELETE(id)).toBe('/api/todos/202');
    });

    it('应该支持待办事项状态更新', () => {
      const id = 303;
      expect(TODO_ENDPOINTS.UPDATE_STATUS(id)).toBe('/api/todos/303/status');
    });

    it('应该支持批量操作', () => {
      expect(TODO_ENDPOINTS.BATCH_UPDATE).toBe('/api/todos/batch-update');
      expect(TODO_ENDPOINTS.BATCH_DELETE).toBe('/api/todos/batch-delete');
    });

    it('应该支持待办事项查询', () => {
      expect(TODO_ENDPOINTS.GET_MY_TODOS).toBe('/api/todos/my');
      expect(TODO_ENDPOINTS.GET_OVERDUE).toBe('/api/todos/overdue');
      expect(TODO_ENDPOINTS.STATISTICS).toBe('/api/todos/statistics');
    });
  });

  describe('日程管理接口', () => {
    it('应该定义正确的日程基础端点', () => {
      expect(SCHEDULE_ENDPOINTS.BASE).toBe('/api/schedules');
    });

    it('应该支持日程CRUD操作', () => {
      const id = 404;
      expect(SCHEDULE_ENDPOINTS.GET_BY_ID(id)).toBe('/api/schedules/404');
      expect(SCHEDULE_ENDPOINTS.UPDATE(id)).toBe('/api/schedules/404');
      expect(SCHEDULE_ENDPOINTS.DELETE(id)).toBe('/api/schedules/404');
    });

    it('应该支持按时间查询日程', () => {
      const date = '2023-12-25';
      const week = '2023-W52';
      const month = '2023-12';

      expect(SCHEDULE_ENDPOINTS.GET_BY_DATE(date)).toBe('/api/schedules/date/2023-12-25');
      expect(SCHEDULE_ENDPOINTS.GET_BY_WEEK(week)).toBe('/api/schedules/week/2023-W52');
      expect(SCHEDULE_ENDPOINTS.GET_BY_MONTH(month)).toBe('/api/schedules/month/2023-12');
    });

    it('应该支持日程冲突检测', () => {
      expect(SCHEDULE_ENDPOINTS.GET_CONFLICTS).toBe('/api/schedules/conflicts');
    });

    it('应该支持批量操作', () => {
      expect(SCHEDULE_ENDPOINTS.BATCH_CREATE).toBe('/api/schedules/batch-create');
    });

    it('应该支持日程导出', () => {
      expect(SCHEDULE_ENDPOINTS.EXPORT).toBe('/api/schedules/export');
    });
  });

  describe('端点路径格式', () => {
    it('所有端点路径应该以斜杠开头', () => {
      const checkEndpointPaths = (endpoints: any) => {
        Object.values(endpoints).forEach((endpoint: any) => {
          if (typeof endpoint === 'string') {
            expect(endpoint.startsWith('/')).toBe(true);
          } else if (typeof endpoint === 'function') {
            // 测试函数返回的路径
            const result = endpoint('test');
            expect(result.startsWith('/')).toBe(true);
          }
        });
      };

      checkEndpointPaths(DASHBOARD_ENDPOINTS);
      checkEndpointPaths(NOTIFICATION_ENDPOINTS);
      checkEndpointPaths(TODO_ENDPOINTS);
      checkEndpointPaths(SCHEDULE_ENDPOINTS);
    });

    it('应该支持数字和字符串ID', () => {
      const numericId = 123;
      const stringId = 'abc-123';

      expect(DASHBOARD_ENDPOINTS.TODO_STATUS(numericId)).toBe('/api/dashboard/todos/123/status');
      expect(DASHBOARD_ENDPOINTS.TODO_STATUS(stringId)).toBe('/api/dashboard/todos/abc-123/status');

      expect(NOTIFICATION_ENDPOINTS.GET_BY_ID(numericId)).toBe('/api/notifications/123');
      expect(NOTIFICATION_ENDPOINTS.GET_BY_ID(stringId)).toBe('/api/notifications/abc-123');
    });

    it('应该支持特殊字符的参数', () => {
      const specialWidget = 'user-stats@2023';
      expect(DASHBOARD_ENDPOINTS.WIDGET_DATA(specialWidget)).toBe('/api/dashboard/widgets/user-stats@2023');

      const specialDate = '2023-12/25';
      expect(SCHEDULE_ENDPOINTS.GET_BY_DATE(specialDate)).toBe('/api/schedules/date/2023-12/25');
    });
  });

  describe('端点功能分组', () => {
    it('仪表盘端点应该包含完整的功能模块', () => {
      const dashboardFunctions = [
        'STATS', 'CLASSES', 'TODOS', 'SCHEDULES', 'ENROLLMENT_TRENDS',
        'CHANNEL_ANALYSIS', 'CONVERSION_FUNNEL', 'ACTIVITIES', 'OVERVIEW',
        'SYSTEM_STATUS', 'STATISTICS', 'QUICK_STATS', 'RECENT_ACTIVITIES',
        'PERFORMANCE_METRICS', 'ALERTS', 'WIDGET_DATA'
      ];

      dashboardFunctions.forEach(func => {
        expect(DASHBOARD_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('通知端点应该包含完整的生命周期管理', () => {
      const notificationFunctions = [
        'BASE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'MARK_READ', 'MARK_ALL_READ',
        'GET_UNREAD', 'GET_RECENT', 'SEND', 'BATCH_SEND', 'TEMPLATES', 'SETTINGS'
      ];

      notificationFunctions.forEach(func => {
        expect(NOTIFICATION_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('待办事项端点应该支持个人和批量管理', () => {
      const todoFunctions = [
        'BASE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'UPDATE_STATUS', 'BATCH_UPDATE',
        'BATCH_DELETE', 'GET_MY_TODOS', 'GET_OVERDUE', 'STATISTICS'
      ];

      todoFunctions.forEach(func => {
        expect(TODO_ENDPOINTS).toHaveProperty(func);
      });
    });

    it('日程端点应该支持时间维度的查询', () => {
      const scheduleFunctions = [
        'BASE', 'GET_BY_ID', 'UPDATE', 'DELETE', 'GET_BY_DATE', 'GET_BY_WEEK',
        'GET_BY_MONTH', 'GET_CONFLICTS', 'BATCH_CREATE', 'EXPORT'
      ];

      scheduleFunctions.forEach(func => {
        expect(SCHEDULE_ENDPOINTS).toHaveProperty(func);
      });
    });
  });
});