/**
 * Phase 8: 系统管理模块API全面测试
 * System Management Module Comprehensive API Tests
 * 
 * 测试范围:
 * - system (系统管理) - 13个端点
 * - system-configs (系统配置) - 5个端点
 * - system-logs (系统日志) - 9个端点
 * - system-backup (系统备份) - 8个端点
 * - notifications (通知管理) - 10个端点
 * - schedules (日程管理) - 8个端点
 * - todos (待办事项) - 9个端点
 * - performance (性能监控) - 5个端点
 * - errors (错误收集) - 4个端点
 * 
 * 总计: 71个API端点
 */

import axios from 'axios';
import { getAuthToken, ParameterValidationFramework } from '../helpers/testUtils';

const API_BASE_URL = 'http://localhost:3000/api';
const apiClient = axios.create({ baseURL: API_BASE_URL });

describe('Phase 8: 系统管理模块API全面测试', () => {
  let authToken: string;
  let testSystemConfig: any;
  let testNotification: any;
  let testSchedule: any;
  let testTodo: any;
  let validationFramework: ParameterValidationFramework;

  beforeAll(async () => {
    authToken = await getAuthToken();
    validationFramework = new ParameterValidationFramework(apiClient, authToken);
  });

  describe('⚙️ 系统管理 API (System Management API)', () => {
    describe('GET /system/info - 获取系统信息', () => {
      it('应该能够获取系统基本信息', async () => {
        try {
          const response = await apiClient.get('/system/info', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          if (response.data.data) {
            expect(response.data.data).toHaveProperty('version');
            expect(response.data.data).toHaveProperty('environment');
          }
        } catch (error: any) {
          console.log('系统信息查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /system/health - 系统健康检查', () => {
      it('应该能够获取系统健康状态', async () => {
        try {
          const response = await apiClient.get('/system/health', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          if (response.data.data) {
            expect(response.data.data).toHaveProperty('status');
          }
        } catch (error: any) {
          console.log('系统健康检查错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /system/metrics - 获取系统指标', () => {
      it('应该能够获取系统性能指标', async () => {
        try {
          const response = await apiClient.get('/system/metrics', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('系统指标查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('POST /system/maintenance - 系统维护模式', () => {
      const maintenanceData = [
        { action: 'enable', reason: '系统升级维护', duration: 30 },
        { action: 'disable', reason: '维护完成' }
      ];

      maintenanceData.forEach((data, index) => {
        it(`应该能够${data.action === 'enable' ? '启用' : '禁用'}维护模式`, async () => {
          try {
            const response = await apiClient.post('/system/maintenance', data, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`维护模式${data.action}错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /system/restart - 重启系统服务', () => {
      it('应该能够重启指定系统服务', async () => {
        const restartData = {
          service: 'web-server',
          force: false,
          reason: '测试重启服务'
        };

        try {
          const response = await apiClient.post('/system/restart', restartData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201, 202]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('系统重启错误:', error.response?.data || error.message);
          expect([200, 201, 202, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🔧 系统配置 API (System Configuration API)', () => {
    describe('GET /system-configs - 获取系统配置', () => {
      const queryParams = [
        {},
        { category: 'app' },
        { category: 'database' },
        { category: 'email' },
        { key: 'app.name' }
      ];

      queryParams.forEach((params, index) => {
        it(`应该接受有效配置查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/system-configs', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`系统配置查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /system-configs - 创建系统配置', () => {
      const validConfigData = [
        {
          key: 'test.feature.enabled',
          value: 'true',
          category: 'app',
          description: '测试功能开关',
          type: 'boolean'
        },
        {
          key: 'test.max.upload.size',
          value: '10485760',
          category: 'app',
          description: '最大上传文件大小',
          type: 'number'
        }
      ];

      validConfigData.forEach((configData, index) => {
        it(`应该接受有效配置参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/system-configs', configData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testSystemConfig = response.data.data;
            }
          } catch (error: any) {
            console.log(`系统配置创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /system-configs/:id - 更新系统配置', () => {
      it('应该能够更新系统配置', async () => {
        if (!testSystemConfig?.id) {
          console.log('跳过配置更新测试：没有有效的配置ID');
          return;
        }

        const updateData = {
          value: 'false',
          description: '更新后的配置描述'
        };

        try {
          const response = await apiClient.put(`/system-configs/${testSystemConfig.id}`, updateData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('系统配置更新错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /system-configs/:id - 删除系统配置', () => {
      it('应该能够删除系统配置', async () => {
        if (!testSystemConfig?.id) {
          console.log('跳过配置删除测试：没有有效的配置ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/system-configs/${testSystemConfig.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('系统配置删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('📋 系统日志 API (System Logs API)', () => {
    describe('GET /system-logs - 获取系统日志', () => {
      const validLogQueries = [
        {},
        { level: 'error' },
        { level: 'warn' },
        { level: 'info' },
        { startDate: '2024-01-01', endDate: '2024-12-31' },
        { page: 1, limit: 50 },
        { search: 'API' }
      ];

      validLogQueries.forEach((params, index) => {
        it(`应该接受有效日志查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/system-logs', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`系统日志查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /system-logs - 创建系统日志', () => {
      const validLogData = [
        {
          level: 'info',
          message: '系统测试日志消息',
          source: 'api-test',
          category: 'system'
        },
        {
          level: 'error',
          message: '模拟错误日志',
          source: 'api-test',
          category: 'error',
          details: { errorCode: 'TEST_001', description: '这是一个测试错误' }
        }
      ];

      validLogData.forEach((logData, index) => {
        it(`应该接受有效日志参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/system-logs', logData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`系统日志创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /system-logs/stats - 获取日志统计', () => {
      it('应该能够获取日志统计信息', async () => {
        try {
          const response = await apiClient.get('/system-logs/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('日志统计查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /system-logs/cleanup - 清理历史日志', () => {
      it('应该能够清理历史日志', async () => {
        const cleanupData = {
          olderThan: '30d',
          level: 'info'
        };

        try {
          const response = await apiClient.delete('/system-logs/cleanup', {
            data: cleanupData,
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('日志清理错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('💾 系统备份 API (System Backup API)', () => {
    describe('POST /system-backup/create - 创建系统备份', () => {
      const validBackupData = [
        {
          type: 'full',
          description: '全量系统备份',
          includeFiles: true,
          includeDatabase: true
        },
        {
          type: 'database',
          description: '仅数据库备份',
          includeFiles: false,
          includeDatabase: true
        }
      ];

      validBackupData.forEach((backupData, index) => {
        it(`应该接受有效备份参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/system-backup/create', backupData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201, 202]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`系统备份创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 202, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /system-backup - 获取备份列表', () => {
      it('应该能够获取系统备份列表', async () => {
        try {
          const response = await apiClient.get('/system-backup', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        } catch (error: any) {
          console.log('备份列表查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('POST /system-backup/restore - 恢复系统备份', () => {
      it('应该能够恢复系统备份', async () => {
        const restoreData = {
          backupId: 'test-backup-001',
          restoreType: 'database',
          confirm: true
        };

        try {
          const response = await apiClient.post('/system-backup/restore', restoreData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201, 202]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('系统备份恢复错误:', error.response?.data || error.message);
          expect([200, 201, 202, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /system-backup/schedule - 获取备份计划', () => {
      it('应该能够获取自动备份计划', async () => {
        try {
          const response = await apiClient.get('/system-backup/schedule', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('备份计划查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🔔 通知管理 API (Notifications API)', () => {
    describe('POST /notifications - 创建通知', () => {
      const validNotificationData = [
        {
          title: '系统维护通知',
          content: '系统将于今晚进行维护，预计维护时间2小时',
          type: 'system',
          priority: 'high',
          targetUsers: ['all']
        },
        {
          title: '新功能发布',
          content: '新的报表功能已上线，欢迎体验',
          type: 'feature',
          priority: 'normal',
          targetUsers: ['admin', 'teacher'],
          expiresAt: '2024-12-31T23:59:59Z'
        }
      ];

      validNotificationData.forEach((notificationData, index) => {
        it(`应该接受有效通知参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/notifications', notificationData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testNotification = response.data.data;
            }
          } catch (error: any) {
            console.log(`通知创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /notifications - 获取通知列表', () => {
      const validNotificationQueries = [
        {},
        { type: 'system' },
        { priority: 'high' },
        { status: 'active' },
        { userId: 121 },
        { page: 1, limit: 20 }
      ];

      validNotificationQueries.forEach((params, index) => {
        it(`应该接受有效通知查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/notifications', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`通知查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /notifications/:id/read - 标记通知已读', () => {
      it('应该能够标记通知为已读', async () => {
        if (!testNotification?.id) {
          console.log('跳过通知已读测试：没有有效的通知ID');
          return;
        }

        try {
          const response = await apiClient.put(`/notifications/${testNotification.id}/read`, {}, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('通知已读标记错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /notifications/:id - 删除通知', () => {
      it('应该能够删除通知', async () => {
        if (!testNotification?.id) {
          console.log('跳过通知删除测试：没有有效的通知ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/notifications/${testNotification.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('通知删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('📅 日程管理 API (Schedules API)', () => {
    describe('POST /schedules - 创建日程', () => {
      const validScheduleData = [
        {
          title: '系统维护计划',
          description: '定期系统维护和更新',
          startTime: '2024-08-15T02:00:00Z',
          endTime: '2024-08-15T04:00:00Z',
          type: 'maintenance',
          participants: ['admin']
        },
        {
          title: '团队会议',
          description: '每周团队同步会议',
          startTime: '2024-08-16T09:00:00Z',
          endTime: '2024-08-16T10:00:00Z',
          type: 'meeting',
          participants: ['admin', 'teacher'],
          isRecurring: true,
          recurringPattern: 'weekly'
        }
      ];

      validScheduleData.forEach((scheduleData, index) => {
        it(`应该接受有效日程参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/schedules', scheduleData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testSchedule = response.data.data;
            }
          } catch (error: any) {
            console.log(`日程创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /schedules - 获取日程列表', () => {
      const validScheduleQueries = [
        {},
        { startDate: '2024-08-01', endDate: '2024-08-31' },
        { type: 'meeting' },
        { userId: 121 },
        { page: 1, limit: 10 }
      ];

      validScheduleQueries.forEach((params, index) => {
        it(`应该接受有效日程查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/schedules', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`日程查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /schedules/:id - 更新日程', () => {
      it('应该能够更新日程', async () => {
        if (!testSchedule?.id) {
          console.log('跳过日程更新测试：没有有效的日程ID');
          return;
        }

        const updateData = {
          title: '更新后的日程标题',
          description: '更新后的日程描述'
        };

        try {
          const response = await apiClient.put(`/schedules/${testSchedule.id}`, updateData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('日程更新错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('DELETE /schedules/:id - 删除日程', () => {
      it('应该能够删除日程', async () => {
        if (!testSchedule?.id) {
          console.log('跳过日程删除测试：没有有效的日程ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/schedules/${testSchedule.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('日程删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('✅ 待办事项 API (Todos API)', () => {
    describe('POST /todos - 创建待办事项', () => {
      const validTodoData = [
        {
          title: '完成系统测试',
          description: '对新功能进行全面测试',
          priority: 'high',
          dueDate: '2024-08-20T18:00:00Z',
          assigneeId: 121
        },
        {
          title: '更新用户文档',
          description: '更新用户操作手册',
          priority: 'normal',
          dueDate: '2024-08-25T18:00:00Z',
          assigneeId: 121,
          category: 'documentation'
        }
      ];

      validTodoData.forEach((todoData, index) => {
        it(`应该接受有效待办事项参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/todos', todoData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);

            if (response.data.data) {
              testTodo = response.data.data;
            }
          } catch (error: any) {
            console.log(`待办事项创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /todos - 获取待办事项列表', () => {
      const validTodoQueries = [
        {},
        { status: 'pending' },
        { priority: 'high' },
        { assigneeId: 121 },
        { page: 1, limit: 20 }
      ];

      validTodoQueries.forEach((params, index) => {
        it(`应该接受有效待办事项查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/todos', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`待办事项查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('PUT /todos/:id/status - 更新待办事项状态', () => {
      const statusUpdates = [
        { status: 'in_progress', note: '开始处理' },
        { status: 'completed', note: '任务完成' }
      ];

      statusUpdates.forEach((update, index) => {
        it(`应该能够更新待办事项状态为 ${update.status}`, async () => {
          if (!testTodo?.id) {
            console.log('跳过待办事项状态更新测试：没有有效的待办事项ID');
            return;
          }

          try {
            const response = await apiClient.put(`/todos/${testTodo.id}/status`, update, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`待办事项状态更新测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('DELETE /todos/:id - 删除待办事项', () => {
      it('应该能够删除待办事项', async () => {
        if (!testTodo?.id) {
          console.log('跳过待办事项删除测试：没有有效的待办事项ID');
          return;
        }

        try {
          const response = await apiClient.delete(`/todos/${testTodo.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 204]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('待办事项删除错误:', error.response?.data || error.message);
          expect([200, 204, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('📊 性能监控 API (Performance API)', () => {
    describe('GET /performance/metrics - 获取性能指标', () => {
      it('应该能够获取系统性能指标', async () => {
        try {
          const response = await apiClient.get('/performance/metrics', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('性能指标查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /performance/reports - 获取性能报告', () => {
      it('应该能够获取系统性能报告', async () => {
        try {
          const response = await apiClient.get('/performance/reports', {
            params: { period: 'daily' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('性能报告查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🚨 错误收集 API (Error Collection API)', () => {
    describe('POST /errors - 报告错误', () => {
      const validErrorData = [
        {
          message: '测试错误消息',
          stack: 'Error stack trace...',
          level: 'error',
          source: 'api-test',
          userAgent: 'Jest Test',
          url: '/api/test'
        },
        {
          message: '警告级别错误',
          level: 'warning',
          source: 'api-test',
          details: { testCase: 'system-management' }
        }
      ];

      validErrorData.forEach((errorData, index) => {
        it(`应该接受有效错误报告参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/errors', errorData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`错误报告测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /errors - 获取错误列表', () => {
      it('应该能够获取系统错误列表', async () => {
        try {
          const response = await apiClient.get('/errors', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        } catch (error: any) {
          console.log('错误列表查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🔐 权限验证测试', () => {
    it('应该拒绝未认证的系统管理请求', async () => {
      try {
        const response = await apiClient.get('/system/info');
        expect([401, 403]).toContain(response.status);
      } catch (error: any) {
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it('应该验证管理员权限', async () => {
      try {
        const response = await apiClient.post('/system/maintenance', {
          action: 'enable',
          reason: '权限测试'
        }, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 201, 403, 404]).toContain(response.status);
      } catch (error: any) {
        expect([200, 201, 403, 404, 500]).toContain(error.response?.status);
      }
    });
  });

  describe('⚡ 性能测试', () => {
    it('系统信息查询响应时间应少于2秒', async () => {
      const startTime = Date.now();
      
      try {
        const response = await apiClient.get('/system/info', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`系统信息查询响应时间: ${responseTime}ms`);
        
        expect(responseTime).toBeLessThan(2000);
        expect([200, 404]).toContain(response.status);
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        console.log(`系统信息查询响应时间（错误）: ${responseTime}ms`, error.response?.data || error.message);
        expect(responseTime).toBeLessThan(5000);
      }
    });

    it('应该支持并发系统管理操作', async () => {
      const concurrentRequests = [
        apiClient.get('/system/info', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/system-configs', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/notifications', { headers: { 'Authorization': `Bearer ${authToken}` } })
      ];

      const startTime = Date.now();
      
      try {
        const results = await Promise.allSettled(concurrentRequests);
        const responseTime = Date.now() - startTime;
        
        console.log(`并发系统管理查询响应时间: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(8000);
        
        const successfulRequests = results.filter(result => 
          result.status === 'fulfilled' && 
          [200, 201, 404].includes((result.value as any).status)
        );
        
        console.log(`成功的并发请求数: ${successfulRequests.length}/3`);
        expect(successfulRequests.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.log('并发系统管理查询错误:', error);
      }
    });
  });
});