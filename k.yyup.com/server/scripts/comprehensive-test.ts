/**
 * AI助手优化全面测试脚本
 * 对三级分层查询系统进行全面测试
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

// 测试配置
const TEST_CONFIG = {
  baseURL: 'http://localhost:3000/api/ai-assistant-optimized',
  authToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MzQ4NjE5NzIsImV4cCI6MTczNDk0ODM3Mn0.Ej8Fy9Gp2HqKr3LmNs4Ot5Qw6Er8Ty9Ui0Op3As5Df7',
  timeout: 30000
};

// 测试查询集合
const TEST_QUERIES = {
  // 直接匹配查询（应该使用<50 tokens）
  direct: [
    '学生总数',
    '教师总数',
    '今日活动',
    '添加学生',
    '班级管理',
    '考勤统计',
    '费用统计',
    '活动列表'
  ],
  
  // 语义检索查询（应该使用100-500 tokens）
  semantic: [
    '找姓张的老师',
    '3岁适合的活动',
    '本周课程安排',
    '缺勤的学生',
    '未缴费的家长',
    '小班的活动',
    '今天生日的孩子',
    '推荐户外游戏'
  ],
  
  // 复杂分析查询（应该使用500-2000 tokens）
  complex: [
    '分析班级活动参与率并给出改进建议',
    '比较不同年龄段学生的学习表现趋势',
    '为什么最近学生出勤率下降了？',
    '如何提高家长满意度？',
    '制定下月活动计划考虑季节因素',
    '预测下学期招生情况基于历史数据',
    '评估教师工作负荷并优化排课',
    '分析费用收缴情况并制定催费策略'
  ]
};

// 测试结果接口
interface TestResult {
  query: string;
  expectedLevel: string;
  actualLevel: string;
  tokensUsed: number;
  tokensSaved: number;
  processingTime: number;
  success: boolean;
  error?: string;
  savingRate: number;
}

// 测试统计
interface TestStats {
  totalTests: number;
  successCount: number;
  failureCount: number;
  averageTokensUsed: number;
  averageTokensSaved: number;
  averageSavingRate: number;
  averageProcessingTime: number;
  levelAccuracy: {
    direct: number;
    semantic: number;
    complex: number;
  };
}

/**
 * 全面测试类
 */
class ComprehensiveTest {
  private results: TestResult[] = [];
  private axios = axios.create({
    baseURL: TEST_CONFIG.baseURL,
    timeout: TEST_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TEST_CONFIG.authToken}`
    }
  });

  /**
   * 运行全面测试
   */
  async runComprehensiveTest(): Promise<void> {
    console.log('🚀 开始AI助手优化全面测试\n');

    // 1. 健康检查
    await this.testHealthCheck();

    // 2. 直接匹配测试
    await this.testDirectMatching();

    // 3. 语义检索测试
    await this.testSemanticSearch();

    // 4. 复杂度评估测试
    await this.testComplexityEvaluation();

    // 5. 性能基准测试
    await this.testPerformanceBenchmark();

    // 6. 错误处理测试
    await this.testErrorHandling();

    // 7. 生成测试报告
    this.generateTestReport();
  }

  /**
   * 健康检查测试
   */
  private async testHealthCheck(): Promise<void> {
    console.log('🔍 1. 健康检查测试...');
    
    try {
      const response = await this.axios.get('/health');
      
      if (response.data.success && response.data.data.status === 'healthy') {
        console.log('  ✅ 健康检查通过');
        console.log(`  📊 功能状态: ${JSON.stringify(response.data.data.features)}`);
      } else {
        console.log('  ❌ 健康检查失败');
      }
    } catch (error) {
      console.log('  ❌ 健康检查异常:', error instanceof Error ? error.message : '未知错误');
    }
    
    console.log();
  }

  /**
   * 直接匹配测试
   */
  private async testDirectMatching(): Promise<void> {
    console.log('⚡ 2. 直接匹配测试...');
    
    for (const query of TEST_QUERIES.direct) {
      await this.testSingleQuery(query, 'direct');
    }
    
    const directResults = this.results.filter(r => r.expectedLevel === 'direct');
    const accuracy = directResults.filter(r => r.actualLevel === 'direct').length / directResults.length * 100;
    const avgTokens = directResults.reduce((sum, r) => sum + r.tokensUsed, 0) / directResults.length;
    
    console.log(`  📊 直接匹配准确率: ${accuracy.toFixed(1)}%`);
    console.log(`  📊 平均Token消耗: ${avgTokens.toFixed(0)}`);
    console.log();
  }

  /**
   * 语义检索测试
   */
  private async testSemanticSearch(): Promise<void> {
    console.log('🔍 3. 语义检索测试...');
    
    for (const query of TEST_QUERIES.semantic) {
      await this.testSingleQuery(query, 'semantic');
    }
    
    const semanticResults = this.results.filter(r => r.expectedLevel === 'semantic');
    const accuracy = semanticResults.filter(r => r.actualLevel === 'semantic').length / semanticResults.length * 100;
    const avgTokens = semanticResults.reduce((sum, r) => sum + r.tokensUsed, 0) / semanticResults.length;
    
    console.log(`  📊 语义检索准确率: ${accuracy.toFixed(1)}%`);
    console.log(`  📊 平均Token消耗: ${avgTokens.toFixed(0)}`);
    console.log();
  }

  /**
   * 复杂度评估测试
   */
  private async testComplexityEvaluation(): Promise<void> {
    console.log('🧠 4. 复杂度评估测试...');
    
    for (const query of TEST_QUERIES.complex) {
      await this.testSingleQuery(query, 'complex');
    }
    
    const complexResults = this.results.filter(r => r.expectedLevel === 'complex');
    const accuracy = complexResults.filter(r => r.actualLevel === 'complex').length / complexResults.length * 100;
    const avgTokens = complexResults.reduce((sum, r) => sum + r.tokensUsed, 0) / complexResults.length;
    
    console.log(`  📊 复杂查询准确率: ${accuracy.toFixed(1)}%`);
    console.log(`  📊 平均Token消耗: ${avgTokens.toFixed(0)}`);
    console.log();
  }

  /**
   * 性能基准测试
   */
  private async testPerformanceBenchmark(): Promise<void> {
    console.log('📈 5. 性能基准测试...');
    
    const benchmarkQueries = [
      ...TEST_QUERIES.direct.slice(0, 3),
      ...TEST_QUERIES.semantic.slice(0, 3),
      ...TEST_QUERIES.complex.slice(0, 2)
    ];

    const startTime = performance.now();
    
    for (const query of benchmarkQueries) {
      const queryStartTime = performance.now();
      
      try {
        await this.axios.post('/query', {
          query,
          conversationId: `benchmark_${Date.now()}`,
          userId: 1
        });
        
        const queryTime = performance.now() - queryStartTime;
        console.log(`  ⏱️ "${query}": ${queryTime.toFixed(0)}ms`);
      } catch (error) {
        console.log(`  ❌ "${query}": 失败`);
      }
    }
    
    const totalTime = performance.now() - startTime;
    console.log(`  📊 总耗时: ${totalTime.toFixed(0)}ms`);
    console.log(`  📊 平均耗时: ${(totalTime / benchmarkQueries.length).toFixed(0)}ms`);
    console.log();
  }

  /**
   * 错误处理测试
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🛡️ 6. 错误处理测试...');
    
    const errorTests = [
      { name: '空查询', data: { query: '', conversationId: 'test', userId: 1 } },
      { name: '超长查询', data: { query: 'a'.repeat(2000), conversationId: 'test', userId: 1 } },
      { name: '缺少参数', data: { query: '测试' } },
      { name: '无效用户ID', data: { query: '测试', conversationId: 'test', userId: -1 } }
    ];

    for (const test of errorTests) {
      try {
        const response = await this.axios.post('/query', test.data);
        console.log(`  ⚠️ ${test.name}: 应该失败但成功了`);
      } catch (error: any) {
        if (error.response && error.response.status >= 400) {
          console.log(`  ✅ ${test.name}: 正确处理错误 (${error.response.status})`);
        } else {
          console.log(`  ❌ ${test.name}: 未知错误`);
        }
      }
    }
    
    console.log();
  }

  /**
   * 测试单个查询
   */
  private async testSingleQuery(query: string, expectedLevel: string): Promise<void> {
    const startTime = performance.now();
    
    try {
      const response = await this.axios.post('/query', {
        query,
        conversationId: `test_${Date.now()}`,
        userId: 1
      });

      const processingTime = performance.now() - startTime;
      const data = response.data.data;
      const originalTokens = 3000; // 假设原始消耗
      const savingRate = ((originalTokens - data.tokensUsed) / originalTokens) * 100;

      const result: TestResult = {
        query,
        expectedLevel,
        actualLevel: data.level,
        tokensUsed: data.tokensUsed,
        tokensSaved: data.tokensSaved || (originalTokens - data.tokensUsed),
        processingTime: Math.round(processingTime),
        success: true,
        savingRate
      };

      this.results.push(result);

      const levelMatch = result.actualLevel === expectedLevel ? '✅' : '❌';
      console.log(`  ${levelMatch} "${query}": ${result.actualLevel} (${result.tokensUsed} tokens, ${result.processingTime}ms)`);

    } catch (error: any) {
      const processingTime = performance.now() - startTime;

      const result: TestResult = {
        query,
        expectedLevel,
        actualLevel: 'error',
        tokensUsed: 0,
        tokensSaved: 0,
        processingTime: Math.round(processingTime),
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
        savingRate: 0
      };

      this.results.push(result);
      console.log(`  ❌ "${query}": 失败 - ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 生成测试报告
   */
  private generateTestReport(): void {
    console.log('📊 AI助手优化全面测试报告');
    console.log('=' .repeat(60));
    console.log();

    const stats = this.calculateStats();

    // 总体统计
    console.log('📈 总体测试结果:');
    console.log(`  总测试数: ${stats.totalTests}`);
    console.log(`  成功数: ${stats.successCount}`);
    console.log(`  失败数: ${stats.failureCount}`);
    console.log(`  成功率: ${((stats.successCount / stats.totalTests) * 100).toFixed(1)}%`);
    console.log();

    // 性能统计
    console.log('⚡ 性能统计:');
    console.log(`  平均Token消耗: ${stats.averageTokensUsed.toFixed(0)}`);
    console.log(`  平均Token节省: ${stats.averageTokensSaved.toFixed(0)}`);
    console.log(`  平均节省率: ${stats.averageSavingRate.toFixed(1)}%`);
    console.log(`  平均响应时间: ${stats.averageProcessingTime.toFixed(0)}ms`);
    console.log();

    // 级别准确率
    console.log('🎯 级别识别准确率:');
    console.log(`  直接匹配: ${stats.levelAccuracy.direct.toFixed(1)}%`);
    console.log(`  语义检索: ${stats.levelAccuracy.semantic.toFixed(1)}%`);
    console.log(`  复杂分析: ${stats.levelAccuracy.complex.toFixed(1)}%`);
    console.log();

    // 优化目标达成情况
    console.log('✅ 优化目标达成情况:');
    console.log(`  Token节省率目标 (70-80%): ${stats.averageSavingRate >= 70 ? '✅' : '❌'} ${stats.averageSavingRate.toFixed(1)}%`);
    console.log(`  响应时间目标 (<1s): ${stats.averageProcessingTime < 1000 ? '✅' : '❌'} ${stats.averageProcessingTime.toFixed(0)}ms`);
    console.log(`  直接查询占比目标 (60%): ${stats.levelAccuracy.direct >= 60 ? '✅' : '❌'} ${stats.levelAccuracy.direct.toFixed(1)}%`);
    console.log();

    // 失败案例
    const failures = this.results.filter(r => !r.success);
    if (failures.length > 0) {
      console.log('❌ 失败案例:');
      failures.forEach(failure => {
        console.log(`  - "${failure.query}": ${failure.error}`);
      });
      console.log();
    }

    console.log('🎉 全面测试完成！');
  }

  /**
   * 计算测试统计
   */
  private calculateStats(): TestStats {
    const successResults = this.results.filter(r => r.success);
    
    const levelAccuracy = {
      direct: this.calculateLevelAccuracy('direct'),
      semantic: this.calculateLevelAccuracy('semantic'),
      complex: this.calculateLevelAccuracy('complex')
    };

    return {
      totalTests: this.results.length,
      successCount: successResults.length,
      failureCount: this.results.length - successResults.length,
      averageTokensUsed: successResults.reduce((sum, r) => sum + r.tokensUsed, 0) / successResults.length || 0,
      averageTokensSaved: successResults.reduce((sum, r) => sum + r.tokensSaved, 0) / successResults.length || 0,
      averageSavingRate: successResults.reduce((sum, r) => sum + r.savingRate, 0) / successResults.length || 0,
      averageProcessingTime: successResults.reduce((sum, r) => sum + r.processingTime, 0) / successResults.length || 0,
      levelAccuracy
    };
  }

  /**
   * 计算级别准确率
   */
  private calculateLevelAccuracy(level: string): number {
    const levelResults = this.results.filter(r => r.expectedLevel === level && r.success);
    if (levelResults.length === 0) return 0;
    
    const correctResults = levelResults.filter(r => r.actualLevel === level);
    return (correctResults.length / levelResults.length) * 100;
  }
}

// 运行测试
async function runTest() {
  try {
    const test = new ComprehensiveTest();
    await test.runComprehensiveTest();
  } catch (error) {
    console.error('❌ 测试运行失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runTest();
}

export { ComprehensiveTest };
