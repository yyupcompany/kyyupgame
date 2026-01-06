/**
 * AI助手优化功能测试
 * 验证三级分层处理的效果和性能
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

describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { vi } from 'vitest'
import request from 'supertest';
import { app } from '../src/app';
import { queryRouterService } from '../src/services/ai/query-router.service';
import { directResponseService } from '../src/services/ai/direct-response.service';
import { semanticSearchService } from '../src/services/ai/semantic-search.service';
import { complexityEvaluatorService } from '../src/services/ai/complexity-evaluator.service';
import { dynamicContextService } from '../src/services/ai/dynamic-context.service';

describe('AI助手优化功能测试', () => {
  let authToken: string;
  let testUserId: number;

  beforeAll(async () => {
    // 设置测试环境
    testUserId = 1;
    authToken = 'test-token'; // 在实际测试中应该获取真实token
  });

  describe('查询路由器测试', () => {
    it('应该正确识别直接匹配查询', async () => {
      const testCases = [
        { query: '学生总数', expectedLevel: 'direct' },
        { query: '教师总数', expectedLevel: 'direct' },
        { query: '今日活动', expectedLevel: 'direct' },
        { query: '添加学生', expectedLevel: 'direct' },
        { query: '考勤统计', expectedLevel: 'direct' }
      ];

      for (const testCase of testCases) {
        const result = await queryRouterService.routeQuery(testCase.query);
        expect(result.level).toBe(testCase.expectedLevel);
        expect(result.confidence).toBeGreaterThan(0.9);
        expect(result.estimatedTokens).toBeLessThan(100);
        expect(result.processingTime).toBeLessThan(100);
      }
    });

    it('应该正确识别语义检索查询', async () => {
      const testCases = [
        { query: '找姓张的老师', expectedLevel: 'semantic' },
        { query: '3岁适合的活动', expectedLevel: 'semantic' },
        { query: '本周的课程安排', expectedLevel: 'semantic' },
        { query: '缺勤的学生名单', expectedLevel: 'semantic' }
      ];

      for (const testCase of testCases) {
        const result = await queryRouterService.routeQuery(testCase.query);
        expect(result.level).toBe(testCase.expectedLevel);
        expect(result.estimatedTokens).toBeGreaterThan(50);
        expect(result.estimatedTokens).toBeLessThan(600);
      }
    });

    it('应该正确识别复杂分析查询', async () => {
      const testCases = [
        { query: '分析班级活动参与率并给出改进建议', expectedLevel: 'complex' },
        { query: '比较不同年龄段学生的学习表现趋势', expectedLevel: 'complex' },
        { query: '为什么最近学生出勤率下降了？', expectedLevel: 'complex' },
        { query: '如何提高家长满意度？', expectedLevel: 'complex' }
      ];

      for (const testCase of testCases) {
        const result = await queryRouterService.routeQuery(testCase.query);
        expect(result.level).toBe(testCase.expectedLevel);
        expect(result.estimatedTokens).toBeGreaterThan(400);
        expect(result.processingTime).toBeLessThan(200);
      }
    });
  });

  describe('直接响应服务测试', () => {
    it('应该快速返回学生统计', async () => {
      const startTime = Date.now();
      const result = await directResponseService.executeDirectAction('count_students', '学生总数');
      const endTime = Date.now();

      expect(result.success).toBe(true);
      expect(result.response).toContain('名在校学生');
      expect(result.tokensUsed).toBeLessThanOrEqual(10);
      expect(result.processingTime).toBeLessThan(500);
      expect(endTime - startTime).toBeLessThan(1000); // 1秒内完成
    });

    it('应该快速返回教师统计', async () => {
      const result = await directResponseService.executeDirectAction('count_teachers', '教师总数');

      expect(result.success).toBe(true);
      expect(result.response).toContain('名在职教师');
      expect(result.tokensUsed).toBeLessThanOrEqual(10);
    });

    it('应该正确处理页面导航', async () => {
      const result = await directResponseService.executeDirectAction('navigate_to_student_create', '添加学生');

      expect(result.success).toBe(true);
      expect(result.action).toBe('navigate');
      expect(result.navigationPath).toBe('/student/create');
      expect(result.tokensUsed).toBeLessThanOrEqual(5);
    });
  });

  describe('优化API接口测试', () => {
    it('应该正确处理直接匹配查询', async () => {
      const response = await request(app)
        .post('/api/ai-assistant-optimized/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: '学生总数',
          conversationId: 'test-conv-1',
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.level).toBe('direct');
      expect(response.body.data.tokensUsed).toBeLessThan(50);
      expect(response.body.data.tokensSaved).toBeGreaterThan(2950); // 节省了大量Token
      expect(response.body.data.processingTime).toBeLessThan(1000);
    });

    it('应该正确处理语义检索查询', async () => {
      const response = await request(app)
        .post('/api/ai-assistant-optimized/query')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: '找姓张的老师',
          conversationId: 'test-conv-2',
          userId: testUserId
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.level).toBe('semantic');
      expect(response.body.data.tokensUsed).toBeLessThan(600);
      expect(response.body.data.tokensSaved).toBeGreaterThan(2400);
    });

    it('应该获取性能统计', async () => {
      const response = await request(app)
        .get('/api/ai-assistant-optimized/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('performance');
      expect(response.body.data).toHaveProperty('router');
      expect(response.body.data).toHaveProperty('optimization');
    });
  });

  describe('性能基准测试', () => {
    it('直接匹配查询应该在100ms内完成', async () => {
      const queries = ['学生总数', '教师总数', '今日活动', '添加学生', '考勤统计'];
      
      for (const query of queries) {
        const startTime = Date.now();
        
        const response = await request(app)
          .post('/api/ai-assistant-optimized/query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query,
            conversationId: `test-perf-${Date.now()}`,
            userId: testUserId
          });

        const endTime = Date.now();
        const totalTime = endTime - startTime;

        expect(response.status).toBe(200);
        expect(response.body.data.level).toBe('direct');
        expect(totalTime).toBeLessThan(1000); // API调用总时间<1秒
        expect(response.body.data.processingTime).toBeLessThan(100); // 处理时间<100ms
      }
    });

    it('Token消耗应该显著降低', async () => {
      const testQueries = [
        { query: '学生总数', maxTokens: 50 },
        { query: '找姓李的老师', maxTokens: 500 },
        { query: '分析学生出勤情况', maxTokens: 2000 }
      ];

      for (const test of testQueries) {
        const response = await request(app)
          .post('/api/ai-assistant-optimized/query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query: test.query,
            conversationId: `test-token-${Date.now()}`,
            userId: testUserId
          });

        expect(response.status).toBe(200);
        expect(response.body.data.tokensUsed).toBeLessThanOrEqual(test.maxTokens);
        
        // 计算节省率
        const originalTokens = 3000; // 假设原来平均消耗
        const savedTokens = response.body.data.tokensSaved;
        const savingRate = (savedTokens / originalTokens) * 100;
        
        if (response.body.data.level === 'direct') {
          expect(savingRate).toBeGreaterThan(95); // 直接匹配应该节省95%以上
        } else if (response.body.data.level === 'semantic') {
          expect(savingRate).toBeGreaterThan(70); // 语义检索应该节省70%以上
        }
      }
    });
  });

  describe('路由测试接口', () => {
    it('应该测试查询路由功能', async () => {
      const response = await request(app)
        .post('/api/ai-assistant-optimized/test-route')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          query: '学生总数'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.level).toBe('direct');
    });

    it('应该测试直接响应功能', async () => {
      const response = await request(app)
        .post('/api/ai-assistant-optimized/test-direct')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'count_students',
          query: '学生总数'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toBe(true);
    });
  });

  describe('语义检索服务测试', () => {
    it('应该正确执行语义检索', async () => {
      const results = await semanticSearchService.performSemanticSearch('找老师', 3);

      expect(results).toBeDefined();
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeLessThanOrEqual(3);

      if (results.length > 0) {
        expect(results[0]).toHaveProperty('entity');
        expect(results[0]).toHaveProperty('similarity');
        expect(results[0]).toHaveProperty('confidence');
      }
    });

    it('应该缓存检索结果', async () => {
      const query = '学生信息查询';

      // 第一次检索
      const startTime1 = Date.now();
      await semanticSearchService.performSemanticSearch(query);
      const time1 = Date.now() - startTime1;

      // 第二次检索（应该从缓存获取）
      const startTime2 = Date.now();
      await semanticSearchService.performSemanticSearch(query);
      const time2 = Date.now() - startTime2;

      // 缓存的查询应该更快
      expect(time2).toBeLessThan(time1);
    });
  });

  describe('复杂度评估服务测试', () => {
    it('应该正确评估简单查询', async () => {
      const evaluation = complexityEvaluatorService.evaluateComplexity('学生总数');

      expect(evaluation.score).toBeLessThan(0.3);
      expect(evaluation.level).toBe('simple');
      expect(evaluation.recommendedStrategy.level).toBe('direct');
      expect(evaluation.estimatedTokens).toBeLessThan(100);
    });

    it('应该正确评估复杂查询', async () => {
      const evaluation = complexityEvaluatorService.evaluateComplexity('分析学生出勤率趋势并给出改进建议');

      expect(evaluation.score).toBeGreaterThan(0.7);
      expect(evaluation.level).toMatch(/complex|expert/);
      expect(evaluation.recommendedStrategy.level).toMatch(/ai_light|ai_full/);
      expect(evaluation.estimatedTokens).toBeGreaterThan(500);
    });

    it('应该提供详细的复杂度因子', async () => {
      const evaluation = complexityEvaluatorService.evaluateComplexity('比较不同班级的活动参与率');

      expect(evaluation.factors).toBeDefined();
      expect(Array.isArray(evaluation.factors)).toBe(true);
      expect(evaluation.factors.length).toBeGreaterThan(0);

      evaluation.factors.forEach(factor => {
        expect(factor).toHaveProperty('name');
        expect(factor).toHaveProperty('weight');
        expect(factor).toHaveProperty('score');
        expect(factor).toHaveProperty('description');
      });
    });
  });

  describe('动态上下文服务测试', () => {
    it('应该构建最小上下文', async () => {
      const context = dynamicContextService.buildDynamicContext({
        size: 'minimal',
        includeHistory: false,
        includeMemory: false,
        includePageContext: false,
        includeUserProfile: false,
        maxTokens: 100
      }, '测试查询');

      expect(context.totalTokens).toBeLessThanOrEqual(100);
      expect(context.components.length).toBeGreaterThan(0);
      expect(context.systemPrompt).toBeDefined();
    });

    it('应该构建完整上下文', async () => {
      const context = dynamicContextService.buildDynamicContext({
        size: 'full',
        includeHistory: true,
        includeMemory: true,
        includePageContext: true,
        includeUserProfile: true,
        maxTokens: 2000
      }, '复杂分析查询', 1, [], { currentPage: 'test' }, []);

      expect(context.totalTokens).toBeLessThanOrEqual(2000);
      expect(context.components.length).toBeGreaterThan(1);
      expect(context.systemPrompt).toContain('高级AI助手');
    });

    it('应该正确截断超长上下文', async () => {
      const context = dynamicContextService.buildDynamicContext({
        size: 'full',
        includeHistory: true,
        includeMemory: true,
        includePageContext: true,
        includeUserProfile: true,
        maxTokens: 50 // 很小的限制
      }, '测试查询');

      expect(context.totalTokens).toBeLessThanOrEqual(50);
      expect(context.truncated).toBe(true);
    });
  });

  describe('集成测试', () => {
    it('应该完整处理优化流程', async () => {
      const testQueries = [
        { query: '学生总数', expectedLevel: 'direct' },
        { query: '找姓张的老师', expectedLevel: 'semantic' },
        { query: '分析班级活动效果并提供改进建议', expectedLevel: 'complex' }
      ];

      for (const test of testQueries) {
        const response = await request(app)
          .post('/api/ai-assistant-optimized/query')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            query: test.query,
            conversationId: `test-integration-${Date.now()}`,
            userId: testUserId
          });

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data.level).toBe(test.expectedLevel);

        // 验证Token节省效果
        if (test.expectedLevel === 'direct') {
          expect(response.body.data.tokensUsed).toBeLessThan(100);
          expect(response.body.data.tokensSaved).toBeGreaterThan(2900);
        }
      }
    });
  });

  describe('健康检查', () => {
    it('应该返回健康状态', async () => {
      const response = await request(app)
        .get('/api/ai-assistant-optimized/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('healthy');
      expect(response.body.data.features.directResponse).toBe(true);
      expect(response.body.data.features.semanticRouting).toBe(true);
      expect(response.body.data.features.complexAnalysis).toBe(true);
    });
  });
});

// 性能测试辅助函数
const measurePerformance = async (fn: () => Promise<any>): Promise<{ result: any; time: number }> => {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  return { result, time: endTime - startTime };
};

// 批量测试辅助函数
const batchTest = async (queries: string[], expectedLevel: string) => {
  const results = [];
  
  for (const query of queries) {
    const { result, time } = await measurePerformance(async () => {
      return await queryRouterService.routeQuery(query);
    });
    
    results.push({
      query,
      level: result.level,
      confidence: result.confidence,
      tokens: result.estimatedTokens,
      time: result.processingTime,
      totalTime: time
    });
  }
  
  return results;
};
