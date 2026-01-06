/**
 * 性能集成测试
 * 验证系统在各种负载下的性能表现和资源使用情况
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../../server/src/app';
import {
import { authApi } from '@/api/auth';

  RealEnvironmentManager,
  TestUtils
} from './real-env.config';

describe('Performance Integration Tests', () => {
  let envManager: RealEnvironmentManager;
  let testEnv: any;
  let performanceUsers: any[] = [];

  beforeAll(async () => {
    envManager = RealEnvironmentManager.getInstance();
    await envManager.initializeEnvironment();
    testEnv = envManager.getEnvironment();

    // 创建性能测试用户
    await createPerformanceTestUsers();
  }, 60000);

  afterAll(async () => {
    await envManager.cleanupEnvironment();
  }, 30000);

  beforeEach(async () => {
    await TestUtils.wait(100);
  });

  afterEach(async () => {
    await TestUtils.wait(100);
  });

  /**
   * 创建性能测试用户
   */
  async function createPerformanceTestUsers(): Promise<void> {
    const userCount = 15;
    for (let i = 0; i < userCount; i++) {
      const userData = TestUtils.createRandomTestData(`perf_user_${i}`);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: userData.username,
          email: userData.email,
          password: 'TestPass123!',
          realName: userData.name,
          roleIds: i % 3 === 0 ? ['teacher'] : ['parent']
        });

      if (response.status === 201) {
        const loginResponse = await request(app)
          .post('/api/auth/unified-login')
          .send({
            username: userData.username,
            password: 'TestPass123!'
          });

        performanceUsers.push({
          id: response.body.data.id,
          username: userData.username,
          role: i % 3 === 0 ? 'teacher' : 'parent',
          token: loginResponse.body.data.token
        });
      }
    }
  }

  interface PerformanceMetrics {
    responseTime: number;
    memoryUsage?: NodeJS.MemoryUsage;
    cpuUsage?: NodeJS.CpuUsage;
    status: number;
    dataSize?: number;
  }

  /**
   * 测量API响应性能
   */
  async function measurePerformance(
    requestFn: () => Promise<any>,
    iterations = 1
  ): Promise<PerformanceMetrics[]> {
    const metrics: PerformanceMetrics[] = [];

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const startMemory = process.memoryUsage();

      const response = await requestFn();
      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      metrics.push({
        responseTime: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        status: response.status,
        dataSize: JSON.stringify(response.body).length
      });
    }

    return metrics;
  }

  /**
   * 计算性能统计
   */
  function calculateStats(metrics: PerformanceMetrics[]) {
    const responseTimes = metrics.map(m => m.responseTime);
    const dataSizes = metrics.map(m => m.dataSize || 0);

    return {
      count: metrics.length,
      averageResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
      minResponseTime: Math.min(...responseTimes),
      maxResponseTime: Math.max(...responseTimes),
      medianResponseTime: responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length / 2)],
      p95ResponseTime: responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)],
      averageDataSize: dataSizes.reduce((a, b) => a + b, 0) / dataSizes.length,
      successRate: metrics.filter(m => m.status === 200).length / metrics.length * 100
    };
  }

  describe('基础API性能测试', () => {
    it('应该在合理时间内响应基本认证请求', async () => {
      const iterations = 10;
      const metrics = await measurePerformance(
        () => request(app)
          .post('/api/auth/unified-login')
          .send({
            username: 'test_13800138000',
            password: 'Admin123!'
          }),
        iterations
      );

      const stats = calculateStats(metrics);

      expect(stats.averageResponseTime).toBeLessThan(500); // 平均500ms内
      expect(stats.maxResponseTime).toBeLessThan(1000); // 最大1秒内
      expect(stats.successRate).toBe(100);

      console.log(`🔐 登录API性能统计 (${iterations}次请求):`);
      console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 最小响应时间: ${stats.minResponseTime}ms`);
      console.log(`   - 最大响应时间: ${stats.maxResponseTime}ms`);
      console.log(`   - 中位数响应时间: ${stats.medianResponseTime}ms`);
      console.log(`   - P95响应时间: ${stats.p95ResponseTime.toFixed(2)}ms`);
      console.log(`   - 成功率: ${stats.successRate}%`);
    });

    it('应该在合理时间内响应用户列表请求', async () => {
      const user = performanceUsers[0];
      const iterations = 15;

      const metrics = await measurePerformance(
        () => request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${user.token}`)
          .query({ page: 1, pageSize: 20 }),
        iterations
      );

      const stats = calculateStats(metrics);

      expect(stats.averageResponseTime).toBeLessThan(1000); // 平均1秒内
      expect(stats.maxResponseTime).toBeLessThan(2000); // 最大2秒内
      expect(stats.successRate).toBe(100);
      expect(stats.averageDataSize).toBeGreaterThan(0); // 应该返回数据

      console.log(`👥 用户列表API性能统计 (${iterations}次请求):`);
      console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 平均数据大小: ${(stats.averageDataSize / 1024).toFixed(2)}KB`);
      console.log(`   - 成功率: ${stats.successRate}%`);
    });

    it('应该在合理时间内响应仪表板请求', async () => {
      const user = performanceUsers[Math.floor(Math.random() * performanceUsers.length)];
      const iterations = 20;

      const metrics = await measurePerformance(
        () => request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${user.token}`),
        iterations
      );

      const stats = calculateStats(metrics);

      expect(stats.averageResponseTime).toBeLessThan(1500); // 平均1.5秒内
      expect(stats.p95ResponseTime).toBeLessThan(3000); // P95在3秒内
      expect(stats.successRate).toBeGreaterThan(95); // 至少95%成功

      console.log(`📊 仪表板API性能统计 (${iterations}次请求):`);
      console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - P95响应时间: ${stats.p95ResponseTime.toFixed(2)}ms`);
      console.log(`   - 成功率: ${stats.successRate}%`);
    });
  });

  describe('大数据量性能测试', () => {
    it('应该高效处理大量学生数据', async () => {
      // 首先创建大量测试学生数据
      const 13800138000Token = testEnv.13800138000Token;
      const studentCount = 100;

      console.log(`📝 创建${studentCount}个测试学生...`);
      const createPromises = Array(studentCount).fill().map((_, index) =>
        request(app)
          .post('/api/students')
          .set('Authorization', `Bearer ${13800138000Token}`)
          .send({
            name: `性能测试学生${index}`,
            age: 4 + (index % 3),
            address: `测试地址${index}`
          })
      );

      const createResults = await Promise.all(createPromises);
      const successfulCreates = createResults.filter(r => r.status === 201);
      console.log(`✅ 成功创建${successfulCreates.length}个学生`);

      // 测试分页查询性能
      const pageSizes = [10, 50, 100];
      for (const pageSize of pageSizes) {
        const metrics = await measurePerformance(
          () => request(app)
            .get('/api/students')
            .set('Authorization', `Bearer ${13800138000Token}`)
            .query({ page: 1, pageSize: pageSize }),
          5 // 每个页面大小测试5次
        );

        const stats = calculateStats(metrics);

        expect(stats.averageResponseTime).toBeLessThan(2000); // 平均2秒内
        expect(stats.successRate).toBe(100);

        console.log(`📄 学生数据查询性能 (页面大小: ${pageSize}):`);
        console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
        console.log(`   - 平均数据大小: ${(stats.averageDataSize / 1024).toFixed(2)}KB`);
      }

      // 清理测试数据
      const deletePromises = successfulCreates.map(result =>
        request(app)
          .delete(`/api/students/${result.body.data.id}`)
          .set('Authorization', `Bearer ${13800138000Token}`)
      );

      await Promise.all(deletePromises);
    });

    it('应该高效处理复杂查询', async () => {
      const user = performanceUsers.find(u => u.role === 'teacher') || performanceUsers[0];

      // 测试带过滤和排序的复杂查询
      const complexQueries = [
        {
          name: '用户多条件查询',
          request: () => request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${user.token}`)
            .query({
              page: 1,
              pageSize: 50,
              search: 'test',
              role: 'teacher',
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })
        },
        {
          name: '班级多条件查询',
          request: () => request(app)
            .get('/api/classes')
            .set('Authorization', `Bearer ${user.token}`)
            .query({
              page: 1,
              pageSize: 20,
              ageGroup: '4-5岁',
              hasCapacity: true,
              sortBy: 'studentCount'
            })
        },
        {
          name: '活动多条件查询',
          request: () => request(app)
            .get('/api/activities')
            .set('Authorization', `Bearer ${user.token}`)
            .query({
              page: 1,
              pageSize: 30,
              type: 'educational',
              status: 'upcoming',
              dateFrom: new Date().toISOString(),
              dateTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            })
        }
      ];

      for (const query of complexQueries) {
        const metrics = await measurePerformance(query.request, 8);

        const stats = calculateStats(metrics);

        expect(stats.averageResponseTime).toBeLessThan(2500); // 复杂查询平均2.5秒内
        expect(stats.p95ResponseTime).toBeLessThan(4000); // P95在4秒内
        expect(stats.successRate).toBeGreaterThan(90);

        console.log(`🔍 ${query.name}性能统计:`);
        console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
        console.log(`   - P95响应时间: ${stats.p95ResponseTime.toFixed(2)}ms`);
        console.log(`   - 成功率: ${stats.successRate}%`);
      }
    });
  });

  describe('并发负载性能测试', () => {
    it('应该在中等并发负载下保持性能', async () => {
      const concurrentUsers = 20;
      const requestsPerUser = 5;

      const allMetrics: PerformanceMetrics[] = [];

      for (let i = 0; i < concurrentUsers; i++) {
        const user = performanceUsers[i % performanceUsers.length];

        for (let j = 0; j < requestsPerUser; j++) {
          const metrics = await measurePerformance(
            () => request(app)
              .get('/api/dashboard')
              .set('Authorization', `Bearer ${user.token}`),
            1
          );

          allMetrics.push(...metrics);
        }
      }

      const stats = calculateStats(allMetrics);

      expect(stats.averageResponseTime).toBeLessThan(2000); // 平均2秒内
      expect(stats.p95ResponseTime).toBeLessThan(5000); // P95在5秒内
      expect(stats.successRate).toBeGreaterThan(95); // 至少95%成功

      console.log(`⚡ 中等并发负载性能统计 (${concurrentUsers}用户 x ${requestsPerUser}请求):`);
      console.log(`   - 总请求数: ${stats.count}`);
      console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - P95响应时间: ${stats.p95ResponseTime.toFixed(2)}ms`);
      console.log(`   - 成功率: ${stats.successRate}%`);
    });

    it('应该在高并发场景下优雅降级', async () => {
      const highConcurrency = 50;
      const startTime = Date.now();

      const requests = Array(highConcurrency).fill().map((_, index) => {
        const user = performanceUsers[index % performanceUsers.length];

        return request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${user.token}`)
          .query({ page: 1, pageSize: 10 })
          .then(response => ({
            index: index,
            status: response.status,
            responseTime: Date.now()
          }));
      });

      const results = await Promise.all(requests);
      const endTime = Date.now();

      const successful = results.filter(r => r.status === 200);
      const failed = results.filter(r => r.status >= 400);
      const totalTime = endTime - startTime;

      // 高并发下允许一定的失败率，但成功率应该仍然较高
      const successRate = (successful.length / results.length) * 100;
      expect(successRate).toBeGreaterThan(85); // 至少85%成功
      expect(totalTime).toBeLessThan(30000); // 总时间在30秒内

      console.log(`🔥 高并发场景性能统计 (${highConcurrency}并发请求):`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 成功请求: ${successful.length}`);
      console.log(`   - 失败请求: ${failed.length}`);
      console.log(`   - 成功率: ${successRate.toFixed(1)}%`);
      console.log(`   - 平均并发响应时间: ${(totalTime / highConcurrency).toFixed(2)}ms`);
    });
  });

  describe('内存和资源使用测试', () => {
    it('应该在大量操作后保持合理的内存使用', async () => {
      const initialMemory = process.memoryUsage();
      console.log('🧠 初始内存使用:', {
        rss: `${(initialMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`
      });

      // 执行大量操作
      const operationCount = 100;
      const user = performanceUsers[0];

      for (let i = 0; i < operationCount; i++) {
        await request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${user.token}`);

        if (i % 20 === 0) {
          // 每20次操作强制垃圾回收（如果可用）
          if (global.gc) {
            global.gc();
          }
        }
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = {
        rss: finalMemory.rss - initialMemory.rss,
        heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
        heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
      };

      console.log('🧠 最终内存使用:', {
        rss: `${(finalMemory.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)}MB`
      });

      console.log('🧠 内存增长:', {
        rss: `${(memoryIncrease.rss / 1024 / 1024).toFixed(2)}MB`,
        heapUsed: `${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)}MB`,
        heapTotal: `${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)}MB`
      });

      // 验证内存增长在合理范围内
      expect(memoryIncrease.heapUsed).toBeLessThan(50 * 1024 * 1024); // 堆内存增长不超过50MB
      expect(memoryIncrease.rss).toBeLessThan(100 * 1024 * 1024); // RSS增长不超过100MB
    });

    it('应该在长时间运行下保持稳定性能', async () => {
      const duration = 30000; // 30秒
      const requestInterval = 200; // 每200ms一次请求
      const user = performanceUsers[1];

      const metrics: PerformanceMetrics[] = [];
      const startTime = Date.now();

      while (Date.now() - startTime < duration) {
        const metric = await measurePerformance(
          () => request(app)
            .get('/api/classes')
            .set('Authorization', `Bearer ${user.token}`),
          1
        );

        metrics.push(...metric);
        await TestUtils.wait(requestInterval);
      }

      const stats = calculateStats(metrics);

      // 将时间分为前半段和后半段，比较性能
      const midPoint = Math.floor(metrics.length / 2);
      const firstHalfStats = calculateStats(metrics.slice(0, midPoint));
      const secondHalfStats = calculateStats(metrics.slice(midPoint));

      // 性能不应该显著下降
      const performanceDegradation = secondHalfStats.averageResponseTime / firstHalfStats.averageResponseTime;
      expect(performanceDegradation).toBeLessThan(1.5); // 性能下降不超过50%

      console.log(`⏱️ 长时间运行性能统计 (${duration}ms):`);
      console.log(`   - 总请求数: ${stats.count}`);
      console.log(`   - 前半段平均响应时间: ${firstHalfStats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 后半段平均响应时间: ${secondHalfStats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 性能下降比: ${performanceDegradation.toFixed(2)}x`);
      console.log(`   - 最终成功率: ${stats.successRate}%`);
    });
  });

  describe('数据库查询优化测试', () => {
    it('应该优化复杂关联查询', async () => {
      const 13800138000Token = testEnv.13800138000Token;

      // 测试班级学生关联查询性能
      const complexQueryMetrics = await measurePerformance(
        () => request(app)
          .get('/api/classes')
          .set('Authorization', `Bearer ${13800138000Token}`)
          .query({
            page: 1,
            pageSize: 20,
            include: 'students,teacher,statistics',
            sortBy: 'studentCount',
            sortOrder: 'desc'
          }),
        10
      );

      const complexStats = calculateStats(complexQueryMetrics);

      // 测试简单查询作为对比
      const simpleQueryMetrics = await measurePerformance(
        () => request(app)
          .get('/api/classes')
          .set('Authorization', `Bearer ${13800138000Token}`)
          .query({ page: 1, pageSize: 20 }),
        10
      );

      const simpleStats = calculateStats(simpleQueryMetrics);

      // 复杂查询应该比简单查询慢，但不应该慢太多
      const performanceRatio = complexStats.averageResponseTime / simpleStats.averageResponseTime;

      expect(complexStats.averageResponseTime).toBeLessThan(3000); // 复杂查询平均3秒内
      expect(performanceRatio).toBeLessThan(3); // 复杂查询不超过简单查询3倍时间
      expect(complexStats.successRate).toBe(100);

      console.log(`🗄️ 数据库查询性能对比:`);
      console.log(`   - 简单查询平均时间: ${simpleStats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 复杂查询平均时间: ${complexStats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 性能比率: ${performanceRatio.toFixed(2)}x`);
      console.log(`   - 复杂数据大小: ${(complexStats.averageDataSize / 1024).toFixed(2)}KB`);
    });

    it('应该有效处理聚合统计查询', async () => {
      const user = performanceUsers.find(u => u.role === 'teacher') || performanceUsers[0];

      const aggregationQueries = [
        {
          name: '用户统计',
          request: () => request(app)
            .get('/api/users/statistics')
            .set('Authorization', `Bearer ${user.token}`)
        },
        {
          name: '仪表板统计',
          request: () => request(app)
            .get('/api/dashboard/statistics')
            .set('Authorization', `Bearer ${user.token}`)
        },
        {
          name: '活动统计',
          request: () => request(app)
            .get('/api/activities/statistics')
            .set('Authorization', `Bearer ${user.token}`)
        }
      ];

      for (const query of aggregationQueries) {
        const metrics = await measurePerformance(query.request, 8);

        const stats = calculateStats(metrics);

        expect(stats.averageResponseTime).toBeLessThan(2000); // 聚合查询平均2秒内
        expect(stats.p95ResponseTime).toBeLessThan(4000); // P95在4秒内
        expect(stats.successRate).toBeGreaterThan(95);

        console.log(`📈 ${query.name}聚合查询性能:`);
        console.log(`   - 平均响应时间: ${stats.averageResponseTime.toFixed(2)}ms`);
        console.log(`   - P95响应时间: ${stats.p95ResponseTime.toFixed(2)}ms`);
        console.log(`   - 成功率: ${stats.successRate}%`);
      }
    });
  });

  describe('缓存性能测试', () => {
    it('应该在缓存命中时提供更快的响应', async () => {
      const user = performanceUsers[0];
      const endpoint = '/api/dashboard';

      // 第一次请求（缓存未命中）
      const firstRequestMetrics = await measurePerformance(
        () => request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${user.token}`),
        5
      );

      // 连续快速请求（可能有缓存命中）
      const cachedRequestMetrics = await measurePerformance(
        () => request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${user.token}`),
        5
      );

      const firstStats = calculateStats(firstRequestMetrics);
      const cachedStats = calculateStats(cachedRequestMetrics);

      console.log(`💾 缓存性能对比:`);
      console.log(`   - 首次请求平均时间: ${firstStats.averageResponseTime.toFixed(2)}ms`);
      console.log(`   - 缓存请求平均时间: ${cachedStats.averageResponseTime.toFixed(2)}ms`);

      // 缓存请求应该更快（如果实现了缓存）
      if (cachedStats.averageResponseTime < firstStats.averageResponseTime) {
        const improvementPercent = ((firstStats.averageResponseTime - cachedStats.averageResponseTime) / firstStats.averageResponseTime) * 100;
        console.log(`   - 性能提升: ${improvementPercent.toFixed(1)}%`);
      }
    });
  });

  describe('压力测试和极限测试', () => {
    it('应该在极限负载下保持系统稳定', async () => {
      const extremeLoad = 200;
      const startTime = Date.now();

      console.log(`🚨 开始极限负载测试: ${extremeLoad}个并发请求`);

      const extremeRequests = Array(extremeLoad).fill().map((_, index) => {
        const user = performanceUsers[index % performanceUsers.length];

        return request(app)
          .get('/api/dashboard')
          .set('Authorization', `Bearer ${user.token}`)
          .timeout(10000) // 10秒超时
          .then(response => ({
            index: index,
            status: response.status,
            success: response.status < 400
          }))
          .catch(error => ({
            index: index,
            status: 0,
            success: false,
            error: error.message
          }));
      });

      const results = await Promise.all(extremeRequests);
      const endTime = Date.now();

      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      const timeOuts = results.filter(r => r.status === 0);

      const totalTime = endTime - startTime;
      const successRate = (successful.length / results.length) * 100;

      console.log(`🚨 极限负载测试结果:`);
      console.log(`   - 总请求数: ${results.length}`);
      console.log(`   - 总耗时: ${totalTime}ms`);
      console.log(`   - 成功请求: ${successful.length}`);
      console.log(`   - 失败请求: ${failed.length}`);
      console.log(`   - 超时请求: ${timeOuts.length}`);
      console.log(`   - 成功率: ${successRate.toFixed(1)}%`);
      console.log(`   - 平均并发响应时间: ${(totalTime / extremeLoad).toFixed(2)}ms`);

      // 极限负载下，成功率应该仍然可以接受
      expect(successRate).toBeGreaterThan(70); // 至少70%成功
      expect(timeOuts.length).toBeLessThan(extremeLoad * 0.2); // 超时不超过20%
      expect(totalTime).toBeLessThan(60000); // 总时间不超过60秒
    });
  });
});