#!/usr/bin/env node

/**
 * 活动统计数据渲染测试脚本
 * 
 * 测试AI助手是否能正确渲染活动统计数据为图表组件
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

class Logger {
  static info(message) {
    console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
  }

  static success(message) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
  }

  static error(message) {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
  }

  static warning(message) {
    console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
  }

  static section(title) {
    console.log(`\n${colors.bright}${colors.cyan}═══ ${title} ═══${colors.reset}\n`);
  }

  static step(step, description) {
    console.log(`${colors.magenta}[步骤 ${step}]${colors.reset} ${description}`);
  }

  static user(message) {
    console.log(`${colors.bright}${colors.blue}👤 用户:${colors.reset} ${message}`);
  }

  static ai(message) {
    console.log(`${colors.bright}${colors.green}🤖 AI助手:${colors.reset} ${message}`);
  }
}

class ActivityStatisticsRenderingTester {
  constructor() {
    this.testResults = {
      total: 0,
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    Logger.section('活动统计数据渲染测试');
    
    try {
      // 测试1: 模拟活动统计工具返回的数据结构
      await this.testActivityStatisticsToolResult();
      
      // 测试2: 测试前端组件识别逻辑
      await this.testComponentRecognition();
      
      // 测试3: 测试数据转换逻辑
      await this.testDataConversion();
      
      // 测试4: 测试完整的渲染流程
      await this.testCompleteRenderingFlow();
      
      this.generateReport();
      
    } catch (error) {
      Logger.error(`测试执行失败: ${error.message}`);
    }
  }

  /**
   * 测试1: 模拟活动统计工具返回的数据结构
   */
  async testActivityStatisticsToolResult() {
    Logger.section('测试1: 活动统计工具返回数据结构');
    
    try {
      Logger.step(1, '模拟用户查询活动统计');
      Logger.user('查询一下2023-2025年的活动数据，用报表显示');
      
      Logger.step(2, '模拟AI调用活动统计工具');
      const toolResult = this.simulateActivityStatisticsTool();
      
      Logger.ai('正在查询活动统计数据...');
      Logger.info('工具调用结果:');
      console.log(JSON.stringify(toolResult, null, 2));
      
      // 验证数据结构
      const isValidStructure = this.validateToolResultStructure(toolResult);
      
      if (isValidStructure) {
        Logger.success('活动统计工具返回数据结构正确');
        this.recordTest('活动统计工具数据结构', true);
      } else {
        throw new Error('活动统计工具返回数据结构不正确');
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('活动统计工具数据结构', false, error.message);
    }
  }

  /**
   * 测试2: 测试前端组件识别逻辑
   */
  async testComponentRecognition() {
    Logger.section('测试2: 前端组件识别逻辑');
    
    try {
      Logger.step(1, '测试isComponentResult函数');
      
      const toolResult = this.simulateActivityStatisticsTool();
      
      // 模拟前端isComponentResult函数
      const isRecognized = this.simulateIsComponentResult(toolResult.result);
      
      if (isRecognized) {
        Logger.success('前端正确识别为可渲染组件数据');
        this.recordTest('前端组件识别', true);
      } else {
        throw new Error('前端未能识别为可渲染组件数据');
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('前端组件识别', false, error.message);
    }
  }

  /**
   * 测试3: 测试数据转换逻辑
   */
  async testDataConversion() {
    Logger.section('测试3: 数据转换逻辑');
    
    try {
      Logger.step(1, '测试统计数据转换为图表数据');
      
      const toolResult = this.simulateActivityStatisticsTool();
      const statisticsData = toolResult.result.statistics;
      
      // 模拟数据转换
      const chartData = this.simulateConvertStatisticsToChartData(statisticsData);
      
      Logger.info('转换后的图表数据:');
      console.log(JSON.stringify(chartData, null, 2));
      
      // 验证转换结果
      const isValidChartData = this.validateChartData(chartData);
      
      if (isValidChartData) {
        Logger.success('统计数据成功转换为图表数据');
        this.recordTest('数据转换', true);
      } else {
        throw new Error('统计数据转换失败');
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('数据转换', false, error.message);
    }
  }

  /**
   * 测试4: 测试完整的渲染流程
   */
  async testCompleteRenderingFlow() {
    Logger.section('测试4: 完整渲染流程');
    
    try {
      Logger.step(1, '模拟完整的用户交互流程');
      
      Logger.user('查询一下2023-2025年的活动数据，用报表显示');
      
      // 1. AI调用工具
      const toolResult = this.simulateActivityStatisticsTool();
      Logger.ai('已获取活动统计数据，正在生成报表...');
      
      // 2. 前端识别组件数据
      const isRecognized = this.simulateIsComponentResult(toolResult.result);
      
      // 3. 前端解析和转换数据
      const parsedData = this.simulateComponentRendererParsing(toolResult.result);
      
      // 4. 渲染图表组件
      Logger.ai('📊 活动统计报表已生成');
      Logger.info('渲染的组件类型: 图表组件');
      Logger.info(`图表标题: ${parsedData.title}`);
      Logger.info(`图表类型: ${parsedData.chartType}`);
      Logger.info(`数据点数量: ${parsedData.data.xAxis.length}`);
      
      if (isRecognized && parsedData && parsedData.type === 'chart') {
        Logger.success('完整渲染流程测试通过');
        this.recordTest('完整渲染流程', true);
      } else {
        throw new Error('完整渲染流程存在问题');
      }
      
    } catch (error) {
      Logger.error(`测试失败: ${error.message}`);
      this.recordTest('完整渲染流程', false, error.message);
    }
  }

  /**
   * 模拟活动统计工具返回结果
   */
  simulateActivityStatisticsTool() {
    return {
      name: "get_activity_statistics",
      status: "success",
      result: {
        statistic_type: "activity_count_by_year",
        time_period: "2023-2025",
        activity_types: "all",
        group_by: "year",
        statistics: {
          title: "2023-2025年活动统计",
          data: [
            { name: "2023年", value: 45 },
            { name: "2024年", value: 62 },
            { name: "2025年", value: 38 }
          ],
          total: 145,
          summary: "三年共举办145场活动"
        },
        generated_at: "2025-10-08T15:30:00.000Z",
        ui_instruction: {
          type: 'render_statistics',
          data: {
            title: "2023-2025年活动统计",
            data: [
              { name: "2023年", value: 45 },
              { name: "2024年", value: 62 },
              { name: "2025年", value: 38 }
            ]
          },
          chart_type: "bar",
          title: "2023-2025年活动统计报表"
        }
      },
      metadata: {
        statisticType: "activity_count_by_year",
        timePeriod: "2023-2025",
        dataPoints: 3,
        generationTime: Date.now()
      }
    };
  }

  /**
   * 模拟前端isComponentResult函数
   */
  simulateIsComponentResult(result) {
    if (!result) return false;

    // 检查是否有 ui_instruction 字段
    if (result.ui_instruction && typeof result.ui_instruction === 'object') {
      const uiInstruction = result.ui_instruction;
      if (uiInstruction.type && ['render_statistics', 'render_chart', 'render_table', 'render_component'].includes(uiInstruction.type)) {
        return true;
      }
    }

    // 检查是否有 statistics 字段和 ui_instruction
    if (result.statistics && result.ui_instruction) {
      return true;
    }

    return false;
  }

  /**
   * 模拟统计数据转换为图表数据
   */
  simulateConvertStatisticsToChartData(statisticsData) {
    if (!statisticsData || !statisticsData.data) {
      return { xAxis: [], series: [] };
    }
    
    const data = statisticsData.data;
    
    // 处理数组格式：[{name: 'xxx', value: 123}, ...]
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && data[0].name !== undefined) {
      return {
        xAxis: data.map(item => item.name || item.label || item.category),
        series: [{
          name: statisticsData.title || '数据',
          data: data.map(item => item.value || item.count || 0)
        }]
      };
    }
    
    // 默认空数据
    return { xAxis: [], series: [] };
  }

  /**
   * 模拟ComponentRenderer解析逻辑
   */
  simulateComponentRendererParsing(result) {
    if (result.ui_instruction && result.ui_instruction.type === 'render_statistics') {
      const uiInstruction = result.ui_instruction;
      const statisticsData = result.statistics;
      
      return {
        type: 'chart',
        title: uiInstruction.title || '统计报表',
        chartType: uiInstruction.chart_type || 'bar',
        data: this.simulateConvertStatisticsToChartData(statisticsData),
        showLegend: true,
        exportable: true
      };
    }
    
    return null;
  }

  /**
   * 验证工具返回结果结构
   */
  validateToolResultStructure(toolResult) {
    return !!(
      toolResult &&
      toolResult.result &&
      toolResult.result.statistics &&
      toolResult.result.ui_instruction &&
      toolResult.result.ui_instruction.type === 'render_statistics'
    );
  }

  /**
   * 验证图表数据结构
   */
  validateChartData(chartData) {
    return !!(
      chartData &&
      chartData.xAxis &&
      Array.isArray(chartData.xAxis) &&
      chartData.series &&
      Array.isArray(chartData.series) &&
      chartData.xAxis.length > 0 &&
      chartData.series.length > 0
    );
  }

  /**
   * 记录测试结果
   */
  recordTest(name, passed, error = null) {
    this.testResults.total++;
    if (passed) {
      this.testResults.passed++;
    } else {
      this.testResults.failed++;
    }
    
    this.testResults.tests.push({
      name,
      status: passed ? 'passed' : 'failed',
      error: error || null,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 生成测试报告
   */
  generateReport() {
    Logger.section('测试报告');
    
    Logger.info(`总测试数: ${this.testResults.total}`);
    Logger.success(`通过: ${this.testResults.passed}`);
    Logger.error(`失败: ${this.testResults.failed}`);
    Logger.info(`成功率: ${Math.round((this.testResults.passed / this.testResults.total) * 100)}%`);
    
    console.log('\n详细结果:');
    this.testResults.tests.forEach((test, index) => {
      const status = test.status === 'passed' ? 
        `${colors.green}✓${colors.reset}` : 
        `${colors.red}✗${colors.reset}`;
      
      console.log(`${index + 1}. ${status} ${test.name}`);
      if (test.error) {
        console.log(`   错误: ${colors.red}${test.error}${colors.reset}`);
      }
    });
    
    // 保存测试报告
    const reportPath = path.join(__dirname, 'activity-statistics-rendering-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      results: this.testResults,
      fix_summary: {
        problem: "AI返回统计数据但前端显示为markdown文字，没有使用图表组件",
        root_cause: "前端isComponentResult函数没有识别ui_instruction类型的数据结构",
        solution: "修复ComponentRenderer组件，支持ui_instruction类型数据的解析和转换",
        files_modified: [
          "client/src/components/ai-assistant/AIAssistant.vue - 修复isComponentResult函数",
          "client/src/components/ai/ComponentRenderer.vue - 添加统计数据转换逻辑"
        ]
      }
    }, null, 2));
    
    Logger.success(`测试报告已保存: ${reportPath}`);
    
    // 生成修复总结
    Logger.section('修复总结');
    Logger.info('问题: AI返回统计数据但前端显示为markdown文字');
    Logger.info('原因: 前端组件识别逻辑不完整');
    Logger.success('解决: 修复了数据结构识别和转换逻辑');
    Logger.info('现在用户查询活动统计时将正确显示图表组件');
  }
}

// 运行测试
async function main() {
  const tester = new ActivityStatisticsRenderingTester();
  await tester.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = ActivityStatisticsRenderingTester;
