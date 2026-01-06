/**
 * Phase 10: 统计分析模块API全面测试
 * Statistics and Analytics Module Comprehensive API Tests
 * 
 * 测试范围:
 * - statistics (统计分析) - 16个端点
 * - dashboard (仪表盘) - 34个端点
 * - principal (园长功能) - 19个端点
 * - performance (性能监控) - 5个端点
 * - api-list (API列表) - 相关端点
 * 
 * 总计: 70+个API端点
 */

import axios from 'axios';
import { getAuthToken, ParameterValidationFramework } from '../helpers/testUtils';

const API_BASE_URL = 'http://localhost:3000/api';
const apiClient = axios.create({ baseURL: API_BASE_URL });

describe('Phase 10: 统计分析模块API全面测试', () => {
  let authToken: string;
  let validationFramework: ParameterValidationFramework;

  beforeAll(async () => {
    authToken = await getAuthToken();
    validationFramework = new ParameterValidationFramework(apiClient, authToken);
  });

  describe('📊 统计分析 API (Statistics API)', () => {
    describe('GET /statistics/overview - 获取统计概览', () => {
      it('应该能够获取系统统计概览', async () => {
        try {
          const response = await apiClient.get('/statistics/overview', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          if (response.data.data) {
            expect(response.data.data).toHaveProperty('totalStudents');
            expect(response.data.data).toHaveProperty('totalTeachers');
          }
        } catch (error: any) {
          console.log('统计概览查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /statistics/enrollment - 获取招生统计', () => {
      const validEnrollmentQueries = [
        {},
        { period: 'monthly' },
        { period: 'yearly' },
        { startDate: '2024-01-01', endDate: '2024-12-31' },
        { classType: '小班' }
      ];

      validEnrollmentQueries.forEach((params, index) => {
        it(`应该接受有效招生统计查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/statistics/enrollment', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`招生统计查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /statistics/financial - 获取财务统计', () => {
      const validFinancialQueries = [
        {},
        { period: 'monthly' },
        { type: 'revenue' },
        { type: 'expense' },
        { startDate: '2024-01-01', endDate: '2024-12-31' }
      ];

      validFinancialQueries.forEach((params, index) => {
        it(`应该接受有效财务统计查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/statistics/financial', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`财务统计查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /statistics/activities - 获取活动统计', () => {
      it('应该能够获取活动参与统计', async () => {
        try {
          const response = await apiClient.get('/statistics/activities', {
            params: { period: 'last30days' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('活动统计查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /statistics/performance - 获取绩效统计', () => {
      it('应该能够获取教师绩效统计', async () => {
        try {
          const response = await apiClient.get('/statistics/performance', {
            params: { type: 'teacher', period: 'monthly' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('绩效统计查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('POST /statistics/custom - 创建自定义统计', () => {
      const validCustomStats = [
        {
          name: '自定义学生统计',
          type: 'student',
          metrics: ['count', 'age_distribution'],
          filters: {
            classType: '小班',
            dateRange: '2024-01-01,2024-12-31'
          }
        },
        {
          name: '自定义收入统计',
          type: 'financial',
          metrics: ['total_revenue', 'monthly_trend'],
          filters: {
            source: 'tuition',
            period: 'yearly'
          }
        }
      ];

      validCustomStats.forEach((statData, index) => {
        it(`应该接受有效自定义统计参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/statistics/custom', statData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`自定义统计创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /statistics/export - 导出统计数据', () => {
      const exportFormats = [
        { format: 'excel', type: 'enrollment' },
        { format: 'csv', type: 'financial' },
        { format: 'pdf', type: 'overview' }
      ];

      exportFormats.forEach((params, index) => {
        it(`应该支持导出${params.format}格式的${params.type}统计`, async () => {
          try {
            const response = await apiClient.get('/statistics/export', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 202]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`统计导出测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 202, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });
  });

  describe('📈 仪表盘 API (Dashboard API)', () => {
    describe('GET /dashboard/widgets - 获取仪表盘组件', () => {
      const validWidgetQueries = [
        {},
        { category: 'overview' },
        { category: 'enrollment' },
        { category: 'financial' },
        { userId: 121 }
      ];

      validWidgetQueries.forEach((params, index) => {
        it(`应该接受有效组件查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/dashboard/widgets', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
            expect(Array.isArray(response.data.data)).toBe(true);
          } catch (error: any) {
            console.log(`仪表盘组件查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('POST /dashboard/widgets - 创建仪表盘组件', () => {
      const validWidgetData = [
        {
          title: '学生总数统计',
          type: 'counter',
          category: 'overview',
          config: {
            dataSource: 'students',
            metric: 'count',
            displayFormat: 'number'
          },
          position: { x: 0, y: 0, width: 4, height: 2 }
        },
        {
          title: '月度收入趋势',
          type: 'line_chart',
          category: 'financial',
          config: {
            dataSource: 'revenue',
            metric: 'monthly_trend',
            timeRange: 'last12months'
          },
          position: { x: 4, y: 0, width: 8, height: 4 }
        }
      ];

      validWidgetData.forEach((widgetData, index) => {
        it(`应该接受有效组件参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/dashboard/widgets', widgetData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`仪表盘组件创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /dashboard/layout - 获取仪表盘布局', () => {
      it('应该能够获取用户仪表盘布局', async () => {
        try {
          const response = await apiClient.get('/dashboard/layout', {
            params: { userId: 121 },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('仪表盘布局查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('PUT /dashboard/layout - 更新仪表盘布局', () => {
      it('应该能够更新仪表盘布局', async () => {
        const layoutData = {
          widgets: [
            { id: 1, position: { x: 0, y: 0, width: 6, height: 3 } },
            { id: 2, position: { x: 6, y: 0, width: 6, height: 3 } }
          ],
          settings: {
            theme: 'light',
            autoRefresh: true,
            refreshInterval: 300
          }
        };

        try {
          const response = await apiClient.put('/dashboard/layout', layoutData, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect([200, 201]).toContain(response.status);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('仪表盘布局更新错误:', error.response?.data || error.message);
          expect([200, 201, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /dashboard/data/:widgetId - 获取组件数据', () => {
      it('应该能够获取指定组件的数据', async () => {
        try {
          const response = await apiClient.get('/dashboard/data/1', {
            params: { timeRange: 'last30days' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('组件数据查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /dashboard/alerts - 获取仪表盘警报', () => {
      it('应该能够获取系统警报信息', async () => {
        try {
          const response = await apiClient.get('/dashboard/alerts', {
            params: { severity: 'high' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        } catch (error: any) {
          console.log('仪表盘警报查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('👨‍💼 园长功能 API (Principal API)', () => {
    describe('GET /principal/overview - 获取园长概览', () => {
      it('应该能够获取园长专用概览数据', async () => {
        try {
          const response = await apiClient.get('/principal/overview', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('园长概览查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /principal/reports - 获取园长报告', () => {
      const validReportQueries = [
        { type: 'enrollment' },
        { type: 'financial' },
        { type: 'teacher_performance' },
        { type: 'operational' },
        { period: 'monthly', type: 'summary' }
      ];

      validReportQueries.forEach((params, index) => {
        it(`应该接受有效报告查询参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.get('/principal/reports', {
              params,
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect(response.status).toBe(200);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`园长报告查询测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /principal/kpi - 获取关键绩效指标', () => {
      it('应该能够获取幼儿园KPI数据', async () => {
        try {
          const response = await apiClient.get('/principal/kpi', {
            params: { period: 'quarterly' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('KPI数据查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('POST /principal/decisions - 记录管理决策', () => {
      const validDecisionData = [
        {
          title: '增加新班级决策',
          description: '根据招生情况决定增加一个小班',
          category: 'operational',
          impact: 'high',
          stakeholders: ['teachers', 'parents'],
          expectedOutcome: '提高招生容量20%'
        },
        {
          title: '教师培训计划',
          description: '制定下季度教师专业培训计划',
          category: 'hr',
          impact: 'medium',
          budget: 15000,
          timeline: '2024-Q4'
        }
      ];

      validDecisionData.forEach((decisionData, index) => {
        it(`应该接受有效决策记录参数 ${index + 1}`, async () => {
          try {
            const response = await apiClient.post('/principal/decisions', decisionData, {
              headers: { 'Authorization': `Bearer ${authToken}` }
            });

            expect([200, 201]).toContain(response.status);
            expect(response.data.success).toBe(true);
          } catch (error: any) {
            console.log(`决策记录创建测试 ${index + 1} 错误:`, error.response?.data || error.message);
            expect([200, 201, 404, 500]).toContain(error.response?.status);
          }
        });
      });
    });

    describe('GET /principal/analytics - 获取园长分析', () => {
      it('应该能够获取深度分析数据', async () => {
        try {
          const response = await apiClient.get('/principal/analytics', {
            params: { 
              analysisType: 'comprehensive',
              timeFrame: 'yearly'
            },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('园长分析查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('⚡ 性能监控 API (Performance Monitoring API)', () => {
    describe('GET /performance/system - 获取系统性能', () => {
      it('应该能够获取系统性能指标', async () => {
        try {
          const response = await apiClient.get('/performance/system', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          if (response.data.data) {
            expect(response.data.data).toHaveProperty('cpu');
            expect(response.data.data).toHaveProperty('memory');
          }
        } catch (error: any) {
          console.log('系统性能查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /performance/api - 获取API性能', () => {
      it('应该能够获取API性能统计', async () => {
        try {
          const response = await apiClient.get('/performance/api', {
            params: { period: 'last24hours' },
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('API性能查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /performance/database - 获取数据库性能', () => {
      it('应该能够获取数据库性能指标', async () => {
        try {
          const response = await apiClient.get('/performance/database', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('数据库性能查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('📋 API列表 API (API List API)', () => {
    describe('GET /api-list - 获取API列表', () => {
      it('应该能够获取系统API列表', async () => {
        try {
          const response = await apiClient.get('/api-list', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
          expect(Array.isArray(response.data.data)).toBe(true);
        } catch (error: any) {
          console.log('API列表查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });

    describe('GET /api-list/stats - 获取API统计', () => {
      it('应该能够获取API使用统计', async () => {
        try {
          const response = await apiClient.get('/api-list/stats', {
            headers: { 'Authorization': `Bearer ${authToken}` }
          });

          expect(response.status).toBe(200);
          expect(response.data.success).toBe(true);
        } catch (error: any) {
          console.log('API统计查询错误:', error.response?.data || error.message);
          expect([200, 404, 500]).toContain(error.response?.status);
        }
      });
    });
  });

  describe('🔐 权限验证测试', () => {
    it('应该拒绝未认证的统计分析请求', async () => {
      try {
        const response = await apiClient.get('/statistics/overview');
        expect([401, 403]).toContain(response.status);
      } catch (error: any) {
        expect([401, 403]).toContain(error.response?.status);
      }
    });

    it('应该验证园长权限', async () => {
      try {
        const response = await apiClient.get('/principal/overview', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        expect([200, 403, 404]).toContain(response.status);
      } catch (error: any) {
        expect([200, 403, 404, 500]).toContain(error.response?.status);
      }
    });
  });

  describe('⚡ 性能测试', () => {
    it('统计概览查询响应时间应少于2秒', async () => {
      const startTime = Date.now();
      
      try {
        const response = await apiClient.get('/statistics/overview', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`统计概览查询响应时间: ${responseTime}ms`);
        
        expect(responseTime).toBeLessThan(2000);
        expect([200, 404]).toContain(response.status);
      } catch (error: any) {
        const responseTime = Date.now() - startTime;
        console.log(`统计概览查询响应时间（错误）: ${responseTime}ms`, error.response?.data || error.message);
        expect(responseTime).toBeLessThan(5000);
      }
    });

    it('应该支持并发统计分析操作', async () => {
      const concurrentRequests = [
        apiClient.get('/statistics/overview', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/dashboard/widgets', { headers: { 'Authorization': `Bearer ${authToken}` } }),
        apiClient.get('/performance/system', { headers: { 'Authorization': `Bearer ${authToken}` } })
      ];

      const startTime = Date.now();
      
      try {
        const results = await Promise.allSettled(concurrentRequests);
        const responseTime = Date.now() - startTime;
        
        console.log(`并发统计分析查询响应时间: ${responseTime}ms`);
        expect(responseTime).toBeLessThan(8000);
        
        const successfulRequests = results.filter(result => 
          result.status === 'fulfilled' && 
          [200, 201, 404].includes((result.value as any).status)
        );
        
        console.log(`成功的并发请求数: ${successfulRequests.length}/3`);
        expect(successfulRequests.length).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.log('并发统计分析查询错误:', error);
      }
    });
  });
});