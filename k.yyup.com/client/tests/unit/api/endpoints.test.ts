
vi.mock('@/api/endpoints', () => ({
  AUTH_ENDPOINTS: {
    LOGIN: '/api/auth/unified-login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  API_ENDPOINTS: {},
  USER_ENDPOINTS: {}
}))

/**
 * API端点配置文件测试
 * 测试文件: /home/zhgue/yyupcc/k.yyup.com/client/src/api/endpoints.ts
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
import { authApi } from '@/api/auth';

  ENROLLMENT_ENDPOINTS,
  PRINCIPAL_ENDPOINTS,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  ROLE_ENDPOINTS,
  PERMISSION_ENDPOINTS,
  DASHBOARD_ENDPOINTS,
  KINDERGARTEN_ENDPOINTS,
  CLASS_ENDPOINTS,
  TEACHER_ENDPOINTS,
  STUDENT_ENDPOINTS,
  PARENT_ENDPOINTS,
  AI_ENDPOINTS,
  SYSTEM_ENDPOINTS,
  FILE_ENDPOINTS,
  NOTIFICATION_ENDPOINTS_10,
  SCHEDULE_ENDPOINTS,
  TODO_ENDPOINTS,
  SYSTEM_TEST_ENDPOINTS,
  SYSTEM_BACKUP_ENDPOINTS,
  OPERATION_LOG_ENDPOINTS,
  ADVERTISEMENT_ENDPOINTS,
  MARKETING_CAMPAIGN_ENDPOINTS,
  CHANNEL_TRACKING_ENDPOINTS,
  CONVERSION_TRACKING_ENDPOINTS,
  ADMISSION_RESULT_ENDPOINTS,
  ADMISSION_NOTIFICATION_ENDPOINTS,
  POSTER_TEMPLATE_ENDPOINTS,
  POSTER_GENERATION_ENDPOINTS,
  PERFORMANCE_RULE_ENDPOINTS,
  PERFORMANCE_ENDPOINTS,
  SYSTEM_CONFIG_ENDPOINTS,
  SYSTEM_AI_MODEL_ENDPOINTS,
  ENROLLMENT_TASK_ENDPOINTS,
  MESSAGE_TEMPLATE_ENDPOINTS_11,
  NOTIFICATION_ENDPOINTS,
  CHAT_ENDPOINTS,
  EXAMPLE_ENDPOINTS,
  ERROR_ENDPOINTS,
  UPLOAD_ENDPOINTS,
  ATTENDANCE_ENDPOINTS,
  ENROLLMENT_STATISTICS_ENDPOINTS,
  STATISTICS_ENDPOINTS,
  ANALYSIS_ENDPOINTS,
  CUSTOMER_ENDPOINTS,
  RISK_ENDPOINTS,
  METRICS_ENDPOINTS,
  MARKETING_ENDPOINTS,
  BACKUP_ENDPOINTS,
  ENROLLMENT_FOLLOW_ENDPOINTS,
  ACTIVITY_PLANNER_ENDPOINTS,
  EXPERT_CONSULTATION_ENDPOINTS,
  SMART_EXPERT_ENDPOINTS,
  MARKETING_AUTOMATION_ENDPOINTS,
  CUSTOMER_LIFECYCLE_ENDPOINTS,
  ACTIVITY_ANALYTICS_ENDPOINTS,
  DECISION_SUPPORT_ENDPOINTS,
  APPLICATION_ENDPOINTS
} from '@/api/endpoints';

describe('API端点配置文件', () => {
  describe('向后兼容性导出', () => {
    it('应该重新导出所有模块化端点', () => {
      // 测试主要端点的重新导出
      expect(AUTH_ENDPOINTS).toBeDefined();
      expect(USER_ENDPOINTS).toBeDefined();
      expect(DASHBOARD_ENDPOINTS).toBeDefined();
      expect(KINDERGARTEN_ENDPOINTS).toBeDefined();
      expect(CLASS_ENDPOINTS).toBeDefined();
      expect(TEACHER_ENDPOINTS).toBeDefined();
      expect(STUDENT_ENDPOINTS).toBeDefined();
      expect(PARENT_ENDPOINTS).toBeDefined();
      expect(AI_ENDPOINTS).toBeDefined();
      expect(SYSTEM_ENDPOINTS).toBeDefined();
    });

    it('应该导出APPLICATION_ENDPOINTS别名', () => {
      expect(APPLICATION_ENDPOINTS).toBeDefined();
      expect(typeof APPLICATION_ENDPOINTS).toBe('object');
    });
  });

  describe('招生管理聚合接口', () => {
    it('应该定义正确的招生管理基础端点', () => {
      expect(ENROLLMENT_ENDPOINTS.BASE).toBe('/enrollment-plans');
    });

    it('应该支持统计和分析', () => {
      expect(ENROLLMENT_ENDPOINTS.STATISTICS).toBe('/enrollment-statistics');
      expect(ENROLLMENT_ENDPOINTS.ANALYTICS).toBe('/enrollment-plans/analytics');
      expect(ENROLLMENT_ENDPOINTS.OVERVIEW).toBe('/enrollment-plans/overview');
    });

    it('应该支持跟进功能', () => {
      expect(ENROLLMENT_ENDPOINTS.FOLLOW_UP).toBe('/enrollment-consultations/automated-follow-up');
    });
  });

  describe('校长管理接口', () => {
    it('应该定义正确的校长管理基础端点', () => {
      expect(PRINCIPAL_ENDPOINTS.BASE).toBe('/principal');
    });

    it('应该支持仪表盘功能', () => {
      expect(PRINCIPAL_ENDPOINTS.DASHBOARD_STATS).toBe('/principal/dashboard');
      expect(PRINCIPAL_ENDPOINTS.NOTICES).toBe('/principal/notices');
      expect(PRINCIPAL_ENDPOINTS.SCHEDULE).toBe('/principal/schedule');
    });

    it('应该支持招生趋势分析', () => {
      expect(PRINCIPAL_ENDPOINTS.ENROLLMENT_TREND).toBe('/principal/enrollment/trend');
    });

    it('应该支持客户池管理', () => {
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_STATS).toBe('/principal/customer-pool/stats');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_LIST).toBe('/principal/customer-pool');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL).toBe('/principal/customer-pool');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_BATCH_ASSIGN).toBe('/principal/customer-pool/batch-assign');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_ASSIGN).toBe('/principal/customer-pool/assign');
    });

    it('应该支持客户详情操作', () => {
      const id = 123;
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_DETAIL(id)).toBe('/principal/customer-pool/123');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_DELETE(id)).toBe('/principal/customer-pool/123');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_FOLLOW_UP_BY_ID(id)).toBe('/principal/customer-pool/123/follow-up');
    });

    it('应该支持活动管理', () => {
      expect(PRINCIPAL_ENDPOINTS.ACTIVITIES).toBe('/principal/activities');
      expect(PRINCIPAL_ENDPOINTS.ACTIVITIES_BATCH).toBe('/principal/activities/batch');
    });

    it('应该支持绩效管理', () => {
      expect(PRINCIPAL_ENDPOINTS.PERFORMANCE_STATS).toBe('/principal/performance/stats');
      expect(PRINCIPAL_ENDPOINTS.PERFORMANCE_RANKINGS).toBe('/principal/performance/rankings');
      expect(PRINCIPAL_ENDPOINTS.PERFORMANCE_DETAILS).toBe('/principal/performance/details');
    });

    it('应该支持园区管理', () => {
      expect(PRINCIPAL_ENDPOINTS.CAMPUS_OVERVIEW).toBe('/principal/campus/overview');
    });

    it('应该支持审批管理', () => {
      const id = 456;
      const action = 'approve';
      expect(PRINCIPAL_ENDPOINTS.APPROVAL_HANDLE(id, action)).toBe('/principal/approvals/456/approve');
    });

    it('应该支持通知管理', () => {
      expect(PRINCIPAL_ENDPOINTS.NOTICES_IMPORTANT).toBe('/principal/notices/important');
      expect(PRINCIPAL_ENDPOINTS.NOTICES_PUBLISH).toBe('/principal/notices');
    });

    it('应该支持海报模板管理', () => {
      expect(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATES).toBe('/principal/poster-templates');
      const id = 789;
      expect(PRINCIPAL_ENDPOINTS.POSTER_TEMPLATE_BY_ID(id)).toBe('/principal/poster-templates/789');
    });
  });

  describe('认证相关接口', () => {
    it('应该定义完整的认证端点', () => {
      expect(AUTH_ENDPOINTS.LOGIN).toBe('/auth/login');
      expect(AUTH_ENDPOINTS.REGISTER).toBe('/auth/register');
      expect(AUTH_ENDPOINTS.LOGOUT).toBe('/auth/logout');
      expect(AUTH_ENDPOINTS.REFRESH_TOKEN).toBe('/auth/refresh-token');
      expect(AUTH_ENDPOINTS.VERIFY_TOKEN).toBe('/auth/verify-token');
      expect(AUTH_ENDPOINTS.FORGOT_PASSWORD).toBe('/auth/forgot-password');
      expect(AUTH_ENDPOINTS.RESET_PASSWORD).toBe('/auth/reset-password');
      expect(AUTH_ENDPOINTS.CHANGE_PASSWORD).toBe('/auth/change-password');
      expect(AUTH_ENDPOINTS.USER_INFO).toBe('/auth/me');
    });
  });

  describe('用户管理接口', () => {
    it('应该支持用户CRUD操作', () => {
      expect(USER_ENDPOINTS.BASE).toBe('/users');
      const id = 123;
      expect(USER_ENDPOINTS.GET_BY_ID(id)).toBe('/users/123');
      expect(USER_ENDPOINTS.UPDATE(id)).toBe('/users/123');
      expect(USER_ENDPOINTS.DELETE(id)).toBe('/users/123');
    });

    it('应该支持用户资料管理', () => {
      expect(USER_ENDPOINTS.GET_PROFILE).toBe('/users/profile');
      expect(USER_ENDPOINTS.UPDATE_PROFILE).toBe('/users/profile');
    });

    it('应该支持用户角色管理', () => {
      const id = 456;
      expect(USER_ENDPOINTS.UPDATE_ROLES(id)).toBe('/users/456/roles');
    });

    it('应该支持用户搜索和批量操作', () => {
      expect(USER_ENDPOINTS.SEARCH).toBe('/users/search');
      expect(USER_ENDPOINTS.EXPORT).toBe('/users/export');
      expect(USER_ENDPOINTS.IMPORT).toBe('/users/import');
      expect(USER_ENDPOINTS.BATCH_UPDATE).toBe('/users/batch-update');
      expect(USER_ENDPOINTS.BATCH_DELETE).toBe('/users/batch-delete');
    });

    it('应该支持用户状态管理', () => {
      const id = 789;
      expect(USER_ENDPOINTS.UPDATE_STATUS(id)).toBe('/users/789/status');
      expect(USER_ENDPOINTS.RESET_PASSWORD(id)).toBe('/users/789/reset-password');
    });
  });

  describe('角色和权限接口', () => {
    it('应该支持角色CRUD操作', () => {
      expect(ROLE_ENDPOINTS.BASE).toBe('/roles');
      const id = 123;
      expect(ROLE_ENDPOINTS.GET_BY_ID(id)).toBe('/roles/123');
      expect(ROLE_ENDPOINTS.UPDATE(id)).toBe('/roles/123');
      expect(ROLE_ENDPOINTS.DELETE(id)).toBe('/roles/123');
    });

    it('应该支持角色权限管理', () => {
      const id = 456;
      expect(ROLE_ENDPOINTS.GET_PERMISSIONS(id)).toBe('/roles/456/permissions');
      expect(ROLE_ENDPOINTS.ASSIGN_PERMISSIONS(id)).toBe('/roles/456/permissions');
    });

    it('应该支持角色搜索和批量操作', () => {
      expect(ROLE_ENDPOINTS.SEARCH).toBe('/roles/search');
      expect(ROLE_ENDPOINTS.EXPORT).toBe('/roles/export');
      expect(ROLE_ENDPOINTS.BATCH_DELETE).toBe('/roles/batch-delete');
    });

    it('应该支持权限管理', () => {
      expect(PERMISSION_ENDPOINTS.BASE).toBe('/system/permissions');
      const id = 789;
      expect(PERMISSION_ENDPOINTS.GET_BY_ID(id)).toBe('/system/permissions/789');
      expect(PERMISSION_ENDPOINTS.UPDATE(id)).toBe('/system/permissions/789');
      expect(PERMISSION_ENDPOINTS.DELETE(id)).toBe('/system/permissions/789');
    });

    it('应该支持特殊权限路径', () => {
      expect(PERMISSION_ENDPOINTS.MY_PAGES).toBe('/permissions/my-pages');
      const pagePath = '/dashboard';
      expect(PERMISSION_ENDPOINTS.CHECK_PAGE(pagePath)).toBe('/permissions/check/dashboard');
      const roleId = 123;
      expect(PERMISSION_ENDPOINTS.ROLE_PAGES(roleId)).toBe('/permissions/roles/123');
      expect(PERMISSION_ENDPOINTS.UPDATE_ROLE_PAGES(roleId)).toBe('/permissions/roles/123');
    });

    it('应该支持权限搜索和批量操作', () => {
      expect(PERMISSION_ENDPOINTS.SEARCH).toBe('/permissions/search');
      expect(PERMISSION_ENDPOINTS.EXPORT).toBe('/permissions/export');
      expect(PERMISSION_ENDPOINTS.BATCH_DELETE).toBe('/permissions/batch-delete');
    });
  });

  describe('特殊端点测试', () => {
    it('应该定义测试系统端点', () => {
      expect(SYSTEM_TEST_ENDPOINTS.HEALTH).toBe('/health');
      expect(SYSTEM_TEST_ENDPOINTS.VERSION).toBe('/version');
      expect(SYSTEM_TEST_ENDPOINTS.CACHE).toBe('/cache');
      expect(SYSTEM_TEST_ENDPOINTS.DOCS).toBe('/docs');
      expect(SYSTEM_TEST_ENDPOINTS.TEST).toBe('/test');
    });

    it('应该定义上传端点', () => {
      expect(UPLOAD_ENDPOINTS.FILE).toBe('/upload/file');
      expect(UPLOAD_ENDPOINTS.IMAGE).toBe('/upload/image');
      expect(UPLOAD_ENDPOINTS.AVATAR).toBe('/upload/avatar');
    });

    it('应该定义聊天端点', () => {
      expect(CHAT_ENDPOINTS.BASE).toBe('/chat');
      expect(CHAT_ENDPOINTS.SEND_MESSAGE).toBe('/chat/send');
      const conversationId = 123;
      expect(CHAT_ENDPOINTS.GET_HISTORY(conversationId)).toBe('/chat/history/123');
      expect(CHAT_ENDPOINTS.START_CONVERSATION).toBe('/chat/start');
    });

    it('应该定义示例端点', () => {
      expect(EXAMPLE_ENDPOINTS.BASE).toBe('/examples');
      const id = 456;
      expect(EXAMPLE_ENDPOINTS.GET_BY_ID(id)).toBe('/examples/456');
    });

    it('应该定义错误管理端点', () => {
      expect(ERROR_ENDPOINTS.BASE).toBe('/errors');
      expect(ERROR_ENDPOINTS.REPORT).toBe('/errors/report');
      const id = 789;
      expect(ERROR_ENDPOINTS.GET_BY_ID(id)).toBe('/errors/789');
    });
  });

  describe('端点重复定义处理', () => {
    it('应该正确处理重复的端点定义', () => {
      // 测试多个版本的端点定义
      expect(ADVERTISEMENT_ENDPOINTS).toBeDefined();
      expect(ADVERTISEMENT_ENDPOINTS_2).toBeDefined();
      
      expect(MARKETING_CAMPAIGN_ENDPOINTS).toBeDefined();
      expect(MARKETING_CAMPAIGN_ENDPOINTS_3).toBeDefined();

      expect(CHANNEL_TRACKING_ENDPOINTS).toBeDefined();
      expect(CHANNEL_TRACKING_ENDPOINTS_4).toBeDefined();

      expect(CONVERSION_TRACKING_ENDPOINTS).toBeDefined();
      expect(CONVERSION_TRACKING_ENDPOINTS_5).toBeDefined();

      expect(ADMISSION_RESULT_ENDPOINTS).toBeDefined();
      expect(ADMISSION_RESULT_ENDPOINTS_6).toBeDefined();

      expect(ADMISSION_NOTIFICATION_ENDPOINTS).toBeDefined();
      expect(ADMISSION_NOTIFICATION_ENDPOINTS_7).toBeDefined();

      expect(POSTER_TEMPLATE_ENDPOINTS).toBeDefined();
      expect(POSTER_TEMPLATE_ENDPOINTS_8).toBeDefined();

      expect(POSTER_GENERATION_ENDPOINTS).toBeDefined();
      expect(POSTER_GENERATION_ENDPOINTS_9).toBeDefined();

      expect(MESSAGE_TEMPLATE_ENDPOINTS).toBeDefined();
      expect(MESSAGE_TEMPLATE_ENDPOINTS_11).toBeDefined();
      expect(MESSAGE_TEMPLATE_ENDPOINTS_10).toBeDefined();
    });

    it('应该保持端点路径的一致性', () => {
      // 测试重复定义的端点路径是否一致
      expect(ADVERTISEMENT_ENDPOINTS.BASE).toBe('/advertisement');
      expect(ADVERTISEMENT_ENDPOINTS_2.BASE).toBe('/advertisement');

      expect(MARKETING_CAMPAIGN_ENDPOINTS.BASE).toBe('/marketing-campaign');
      expect(MARKETING_CAMPAIGN_ENDPOINTS_3.BASE).toBe('/marketing-campaign');
    });
  });

  describe('高级功能端点', () => {
    it('应该定义AI记忆端点', () => {
      expect(AI_ENDPOINTS.MEMORY).toBeDefined();
      expect(AI_ENDPOINTS.MEMORY.CREATE).toBe('/ai/memory');
      const conversationId = 123;
      const userId = 456;
      expect(AI_ENDPOINTS.MEMORY.GET_CONVERSATION(conversationId, userId)).toBe('/ai/memory/conversation/123/users/456');
    });

    it('应该定义智能专家咨询端点', () => {
      expect(SMART_EXPERT_ENDPOINTS).toBeDefined();
      expect(SMART_EXPERT_ENDPOINTS.SMART_CHAT).toBe('/ai/smart-expert/smart-chat');
      expect(SMART_EXPERT_ENDPOINTS.UNIFIED_CHAT).toBe('/ai/unified/unified-chat');
    });

    it('应该定义营销自动化端点', () => {
      expect(MARKETING_AUTOMATION_ENDPOINTS).toBeDefined();
      expect(MARKETING_AUTOMATION_ENDPOINTS.BASE).toBe('/marketing');
      expect(MARKETING_AUTOMATION_ENDPOINTS.INTELLIGENT_CAMPAIGN).toBe('/marketing/intelligent-campaign');
    });

    it('应该定义客户生命周期端点', () => {
      expect(CUSTOMER_LIFECYCLE_ENDPOINTS).toBeDefined();
      expect(CUSTOMER_LIFECYCLE_ENDPOINTS.BASE).toBe('/customer');
      expect(CUSTOMER_LIFECYCLE_ENDPOINTS.LIFECYCLE_ANALYSIS).toBe('/ai/customer-lifecycle-analysis');
    });

    it('应该定义决策支持端点', () => {
      expect(DECISION_SUPPORT_ENDPOINTS).toBeDefined();
      expect(DECISION_SUPPORT_ENDPOINTS.BASE).toBe('/decision');
      expect(DECISION_SUPPORT_ENDPOINTS.SCENARIO_ANALYSIS).toBe('/ai/decision-scenario-analysis');
    });
  });

  describe('端点路径格式验证', () => {
    it('所有基础端点应该以斜杠开头', () => {
      const testBaseEndpoints = (endpoints: any) => {
        Object.values(endpoints).forEach((endpoint: any) => {
          if (typeof endpoint === 'string' && endpoint.includes('/')) {
            expect(endpoint.startsWith('/')).toBe(true);
          }
        });
      };

      testBaseEndpoints(AUTH_ENDPOINTS);
      testBaseEndpoints(USER_ENDPOINTS);
      testBaseEndpoints(DASHBOARD_ENDPOINTS);
      testBaseEndpoints(ENROLLMENT_ENDPOINTS);
    });

    it('应该支持数字和字符串ID参数', () => {
      const numericId = 123;
      const stringId = 'user-abc-123';

      expect(USER_ENDPOINTS.GET_BY_ID(numericId)).toBe('/users/123');
      expect(USER_ENDPOINTS.GET_BY_ID(stringId)).toBe('/users/user-abc-123');

      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_DETAIL(numericId)).toBe('/principal/customer-pool/123');
      expect(PRINCIPAL_ENDPOINTS.CUSTOMER_POOL_DETAIL(stringId)).toBe('/principal/customer-pool/user-abc-123');
    });

    it('路径应该符合RESTful规范', () => {
      // 测试嵌套资源路径
      expect(USER_ENDPOINTS.UPDATE_ROLES(1)).toBe('/users/1/roles');
      expect(ROLE_ENDPOINTS.GET_PERMISSIONS(2)).toBe('/roles/2/permissions');
      expect(PRINCIPAL_ENDPOINTS.APPROVAL_HANDLE(3, 'approve')).toBe('/principal/approvals/3/approve');

      // 测试操作路径
      expect(USER_ENDPOINTS.UPDATE_STATUS(4)).toBe('/users/4/status');
      expect(AUTH_ENDPOINTS.CHANGE_PASSWORD).toBe('/auth/change-password');
    });
  });

  describe('导出完整性', () => {
    it('应该导出所有必要的端点对象', () => {
      const expectedEndpoints = [
        'ENROLLMENT_ENDPOINTS', 'PRINCIPAL_ENDPOINTS', 'AUTH_ENDPOINTS', 'USER_ENDPOINTS',
        'ROLE_ENDPOINTS', 'PERMISSION_ENDPOINTS', 'DASHBOARD_ENDPOINTS', 'KINDERGARTEN_ENDPOINTS',
        'CLASS_ENDPOINTS', 'TEACHER_ENDPOINTS', 'STUDENT_ENDPOINTS', 'PARENT_ENDPOINTS',
        'AI_ENDPOINTS', 'SYSTEM_ENDPOINTS', 'FILE_ENDPOINTS', 'NOTIFICATION_ENDPOINTS_10',
        'SCHEDULE_ENDPOINTS', 'TODO_ENDPOINTS', 'SYSTEM_TEST_ENDPOINTS', 'SYSTEM_BACKUP_ENDPOINTS',
        'ADVERTISEMENT_ENDPOINTS', 'MARKETING_CAMPAIGN_ENDPOINTS', 'CHANNEL_TRACKING_ENDPOINTS',
        'CONVERSION_TRACKING_ENDPOINTS', 'ADMISSION_RESULT_ENDPOINTS', 'ADMISSION_NOTIFICATION_ENDPOINTS',
        'POSTER_TEMPLATE_ENDPOINTS', 'POSTER_GENERATION_ENDPOINTS', 'PERFORMANCE_RULE_ENDPOINTS',
        'PERFORMANCE_ENDPOINTS', 'SYSTEM_CONFIG_ENDPOINTS', 'SYSTEM_AI_MODEL_ENDPOINTS',
        'ENROLLMENT_TASK_ENDPOINTS', 'MESSAGE_TEMPLATE_ENDPOINTS_11', 'NOTIFICATION_ENDPOINTS',
        'CHAT_ENDPOINTS', 'EXAMPLE_ENDPOINTS', 'ERROR_ENDPOINTS', 'UPLOAD_ENDPOINTS',
        'ATTENDANCE_ENDPOINTS', 'ENROLLMENT_STATISTICS_ENDPOINTS', 'STATISTICS_ENDPOINTS',
        'ANALYSIS_ENDPOINTS', 'CUSTOMER_ENDPOINTS', 'RISK_ENDPOINTS', 'METRICS_ENDPOINTS',
        'MARKETING_ENDPOINTS', 'BACKUP_ENDPOINTS', 'ENROLLMENT_FOLLOW_ENDPOINTS',
        'ACTIVITY_PLANNER_ENDPOINTS', 'EXPERT_CONSULTATION_ENDPOINTS', 'SMART_EXPERT_ENDPOINTS',
        'MARKETING_AUTOMATION_ENDPOINTS', 'CUSTOMER_LIFECYCLE_ENDPOINTS', 'ACTIVITY_ANALYTICS_ENDPOINTS',
        'DECISION_SUPPORT_ENDPOINTS', 'APPLICATION_ENDPOINTS'
      ];

      expectedEndpoints.forEach(endpointName => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((globalThis as any)[endpointName]).toBeDefined();
      });
    });

    it('所有端点对象都应该不为空', () => {
      const endpointObjects = [
        AUTH_ENDPOINTS, USER_ENDPOINTS, ROLE_ENDPOINTS, PERMISSION_ENDPOINTS,
        DASHBOARD_ENDPOINTS, ENROLLMENT_ENDPOINTS, PRINCIPAL_ENDPOINTS, AI_ENDPOINTS
      ];

      endpointObjects.forEach(endpointObject => {
        expect(endpointObject).toBeDefined();
        expect(typeof endpointObject).toBe('object');
        expect(Object.keys(endpointObject).length).toBeGreaterThan(0);
      });
    });
  });
});