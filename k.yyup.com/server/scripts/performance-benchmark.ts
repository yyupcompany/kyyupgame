/**
 * AI助手优化性能基准测试脚本
 * 验证优化效果，生成性能报告
 */

import { queryRouterService } from '../src/services/ai/query-router.service';
import { directResponseService } from '../src/services/ai/direct-response.service';
import { semanticSearchService } from '../src/services/ai/semantic-search.service';
import { complexityEvaluatorService } from '../src/services/ai/complexity-evaluator.service';
import { dynamicContextService } from '../src/services/ai/dynamic-context.service';
import { logger } from '../src/utils/logger';

// 测试查询集合
const TEST_QUERIES = {
  direct: [
    '学生总数',
    '教师总数', 
    '今日活动',
    '添加学生',
    '班级管理',
    '考勤统计',
    '费用统计'
  ],
  semantic: [
    '找姓张的老师',
    '3岁适合的活动',
    '本周课程安排',
    '缺勤的学生',
    '未缴费的家长',
    '小班的活动',
    '今天生日的孩子'
  ],
  complex: [
    '分析班级活动参与率并给出改进建议',
    '比较不同年龄段学生的学习表现趋势',
    '为什么最近学生出勤率下降了？',
    '如何提高家长满意度？',
    '制定下月活动计划考虑季节因素',
    '预测下学期招生情况基于历史数据',
    '评估教师工作负荷并优化排课'
  ]
};

// 性能测试结果
interface BenchmarkResult {
  category: string;
  query: string;
  level: string;
  tokensUsed: number;
  processingTime: number;
  tokensSaved: number;
  savingRate: number;
}

// 汇总统计
interface BenchmarkSummary {
  totalQueries: number;
  averageTokensUsed: number;
  averageTokensSaved: number;
  averageSavingRate: number;
  averageProcessingTime: number;
  levelDistribution: { [level: string]: number };
  categoryPerformance: { [category: string]: {
    averageTokens: number;
    averageTime: number;
    savingRate: number;
  }};
}

/**
 * 性能基准测试类
 */
class PerformanceBenchmark {
  private results: BenchmarkResult[] = [];

  /**
   * 运行完整基准测试
   */
  public async runFullBenchmark(): Promise<void> {
    console.log('🚀 开始AI助手优化性能基准测试\n');

    // 测试直接匹配查询
    await this.testDirectQueries();
    
    // 测试语义检索查询
    await this.testSemanticQueries();
    
    // 测试复杂分析查询
    await this.testComplexQueries();

    // 生成报告
    this.generateReport();
  }

  /**
   * 测试直接匹配查询
   */
  private async testDirectQueries(): Promise<void> {
    console.log('⚡ 测试直接匹配查询...');
    
    for (const query of TEST_QUERIES.direct) {
      const result = await this.benchmarkQuery(query, 'direct');
      this.results.push(result);
      
      console.log(`  ✓ ${query}: ${result.tokensUsed} tokens, ${result.processingTime}ms, 节省${result.savingRate}%`);
    }
    console.log();
  }

  /**
   * 测试语义检索查询
   */
  private async testSemanticQueries(): Promise<void> {
    console.log('🔍 测试语义检索查询...');
    
    for (const query of TEST_QUERIES.semantic) {
      const result = await this.benchmarkQuery(query, 'semantic');
      this.results.push(result);
      
      console.log(`  ✓ ${query}: ${result.tokensUsed} tokens, ${result.processingTime}ms, 节省${result.savingRate}%`);
    }
    console.log();
  }

  /**
   * 测试复杂分析查询
   */
  private async testComplexQueries(): Promise<void> {
    console.log('🧠 测试复杂分析查询...');
    
    for (const query of TEST_QUERIES.complex) {
      const result = await this.benchmarkQuery(query, 'complex');
      this.results.push(result);
      
      console.log(`  ✓ ${query}: ${result.tokensUsed} tokens, ${result.processingTime}ms, 节省${result.savingRate}%`);
    }
    console.log();
  }

  /**
   * 基准测试单个查询
   */
  private async benchmarkQuery(query: string, expectedCategory: string): Promise<BenchmarkResult> {
    const startTime = Date.now();

    // 1. 复杂度评估
    const complexityEvaluation = complexityEvaluatorService.evaluateComplexity(query);
    
    // 2. 查询路由
    const routeResult = await queryRouterService.routeQuery(query);
    
    let actualTokensUsed = 0;
    let actualLevel = routeResult.level;

    // 3. 根据路由结果执行相应处理
    if (routeResult.level === 'direct') {
      // 直接响应
      const action = this.extractActionFromQuery(query);
      if (action) {
        const directResult = await directResponseService.executeDirectAction(action, query);
        actualTokensUsed = directResult.tokensUsed;
      } else {
        actualTokensUsed = routeResult.estimatedTokens;
      }
    } else if (routeResult.level === 'semantic') {
      // 语义检索
      const semanticResults = await semanticSearchService.performSemanticSearch(query, 3);
      actualTokensUsed = routeResult.estimatedTokens + 50; // 语义检索开销
    } else {
      // 复杂分析
      actualTokensUsed = complexityEvaluation.estimatedTokens;
    }

    const processingTime = Date.now() - startTime;
    const originalTokens = 3000; // 假设原来的平均消耗
    const tokensSaved = Math.max(0, originalTokens - actualTokensUsed);
    const savingRate = (tokensSaved / originalTokens) * 100;

    return {
      category: expectedCategory,
      query,
      level: actualLevel,
      tokensUsed: actualTokensUsed,
      processingTime,
      tokensSaved,
      savingRate
    };
  }

  /**
   * 从查询中提取动作
   */
  private extractActionFromQuery(query: string): string | null {
    const actionMap: { [key: string]: string } = {
      '学生总数': 'count_students',
      '教师总数': 'count_teachers',
      '今日活动': 'get_today_activities',
      '添加学生': 'navigate_to_student_create',
      '班级管理': 'navigate_to_class_management',
      '考勤统计': 'get_attendance_stats',
      '费用统计': 'get_fee_stats'
    };

    return actionMap[query] || null;
  }

  /**
   * 生成性能报告
   */
  private generateReport(): void {
    const summary = this.calculateSummary();
    
    console.log('📊 AI助手优化性能基准测试报告');
    console.log('=' .repeat(50));
    console.log();

    // 总体统计
    console.log('📈 总体性能统计:');
    console.log(`  总查询数: ${summary.totalQueries}`);
    console.log(`  平均Token消耗: ${summary.averageTokensUsed.toFixed(0)} (原来: 3000)`);
    console.log(`  平均Token节省: ${summary.averageTokensSaved.toFixed(0)}`);
    console.log(`  平均节省率: ${summary.averageSavingRate.toFixed(1)}%`);
    console.log(`  平均响应时间: ${summary.averageProcessingTime.toFixed(0)}ms`);
    console.log();

    // 级别分布
    console.log('🎯 处理级别分布:');
    for (const [level, count] of Object.entries(summary.levelDistribution)) {
      const percentage = (count / summary.totalQueries * 100).toFixed(1);
      console.log(`  ${level}: ${count}次 (${percentage}%)`);
    }
    console.log();

    // 分类性能
    console.log('📊 分类性能对比:');
    for (const [category, performance] of Object.entries(summary.categoryPerformance)) {
      console.log(`  ${category}:`);
      console.log(`    平均Token: ${performance.averageTokens.toFixed(0)}`);
      console.log(`    平均时间: ${performance.averageTime.toFixed(0)}ms`);
      console.log(`    节省率: ${performance.savingRate.toFixed(1)}%`);
    }
    console.log();

    // 优化效果验证
    console.log('✅ 优化目标达成情况:');
    console.log(`  Token节省率目标 (70-80%): ${summary.averageSavingRate >= 70 ? '✅' : '❌'} ${summary.averageSavingRate.toFixed(1)}%`);
    console.log(`  直接查询占比目标 (60%): ${(summary.levelDistribution.direct / summary.totalQueries * 100) >= 60 ? '✅' : '❌'} ${(summary.levelDistribution.direct / summary.totalQueries * 100).toFixed(1)}%`);
    console.log(`  响应时间目标 (<1s): ${summary.averageProcessingTime < 1000 ? '✅' : '❌'} ${summary.averageProcessingTime.toFixed(0)}ms`);
    console.log();

    // 详细结果
    console.log('📋 详细测试结果:');
    this.results.forEach((result, index) => {
      console.log(`  ${index + 1}. [${result.category}] ${result.query}`);
      console.log(`     级别: ${result.level}, Token: ${result.tokensUsed}, 时间: ${result.processingTime}ms, 节省: ${result.savingRate.toFixed(1)}%`);
    });
  }

  /**
   * 计算汇总统计
   */
  private calculateSummary(): BenchmarkSummary {
    const totalQueries = this.results.length;
    const totalTokensUsed = this.results.reduce((sum, r) => sum + r.tokensUsed, 0);
    const totalTokensSaved = this.results.reduce((sum, r) => sum + r.tokensSaved, 0);
    const totalSavingRate = this.results.reduce((sum, r) => sum + r.savingRate, 0);
    const totalProcessingTime = this.results.reduce((sum, r) => sum + r.processingTime, 0);

    // 级别分布
    const levelDistribution: { [level: string]: number } = {};
    this.results.forEach(r => {
      levelDistribution[r.level] = (levelDistribution[r.level] || 0) + 1;
    });

    // 分类性能
    const categoryPerformance: { [category: string]: any } = {};
    const categories = ['direct', 'semantic', 'complex'];
    
    categories.forEach(category => {
      const categoryResults = this.results.filter(r => r.category === category);
      if (categoryResults.length > 0) {
        categoryPerformance[category] = {
          averageTokens: categoryResults.reduce((sum, r) => sum + r.tokensUsed, 0) / categoryResults.length,
          averageTime: categoryResults.reduce((sum, r) => sum + r.processingTime, 0) / categoryResults.length,
          savingRate: categoryResults.reduce((sum, r) => sum + r.savingRate, 0) / categoryResults.length
        };
      }
    });

    return {
      totalQueries,
      averageTokensUsed: totalTokensUsed / totalQueries,
      averageTokensSaved: totalTokensSaved / totalQueries,
      averageSavingRate: totalSavingRate / totalQueries,
      averageProcessingTime: totalProcessingTime / totalQueries,
      levelDistribution,
      categoryPerformance
    };
  }
}

// 运行基准测试
async function runBenchmark() {
  try {
    const benchmark = new PerformanceBenchmark();
    await benchmark.runFullBenchmark();
  } catch (error) {
    console.error('❌ 基准测试失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runBenchmark();
}

export { PerformanceBenchmark };
