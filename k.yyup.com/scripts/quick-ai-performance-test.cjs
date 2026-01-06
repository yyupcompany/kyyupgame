#!/usr/bin/env node

/**
 * 快速AI模型性能对比测试脚本
 * 简化版本：每种复杂度只测试1个提示词，只运行1轮
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseURL: 'http://127.0.0.1:3000',
  testRounds: 1, // 只运行1轮
  timeout: 60000, // 1分钟超时
  outputFile: 'quick-ai-performance-results.json'
};

// 简化的测试用例
const TEST_CASES = {
  simple: {
    name: '简单查询',
    prompts: ['查询学生总数'] // 只测试1个
  },
  medium: {
    name: '中等复杂查询',
    prompts: ['统计各班级学生人数分布情况'] // 只测试1个
  },
  complex: {
    name: '复杂查询',
    prompts: ['生成详细的学生成长报告，包括学习进度、活动参与、健康状况等多维度分析'] // 只测试1个
  }
};

class QuickAIModelTester {
  constructor() {
    this.token = null;
    this.results = {
      timestamp: new Date().toISOString(),
      testConfig: CONFIG,
      models: {},
      summary: {}
    };
  }

  /**
   * 获取认证Token
   */
  async getAuthToken() {
    try {
      console.log('🔐 获取认证Token...');
      const response = await axios.post(`${CONFIG.baseURL}/api/auth/login`, {
        username: 'admin',
        password: 'admin123'
      });
      
      this.token = response.data.data.token;
      console.log('✅ Token获取成功');
      return this.token;
    } catch (error) {
      console.error('❌ Token获取失败:', error.message);
      throw error;
    }
  }

  /**
   * 获取数据库中的AI模型配置
   */
  async getAIModels() {
    try {
      console.log('📊 获取AI模型配置...');
      const response = await axios.get(`${CONFIG.baseURL}/api/system/ai-models`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      const models = response.data.data.items;
      console.log(`✅ 获取到 ${models.length} 个AI模型`);
      
      // 查找Thinking和Flash模型
      const thinkingModel = models.find(m => 
        m.modelName.includes('thinking') || m.modelName.includes('Thinking')
      );
      const flashModel = models.find(m => 
        m.modelName.includes('flash') || m.modelName.includes('Flash')
      );
      
      console.log('🧠 Thinking模型:', thinkingModel?.modelName || '未找到');
      console.log('⚡ Flash模型:', flashModel?.modelName || '未找到');
      
      return { thinkingModel, flashModel, allModels: models };
    } catch (error) {
      console.error('❌ 获取AI模型失败:', error.message);
      throw error;
    }
  }

  /**
   * 执行单个AI查询测试
   */
  async testSingleQuery(prompt, modelName, testType) {
    const startTime = Date.now();
    
    try {
      console.log(`  🔍 测试: ${prompt.substring(0, 40)}...`);
      
      const response = await axios.post(`${CONFIG.baseURL}/api/ai-query`, {
        query: prompt,
        context: `快速性能测试-${testType}-${modelName}`,
        preferredModel: modelName
      }, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: CONFIG.timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        success: true,
        duration,
        prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        responseSize: JSON.stringify(response.data).length,
        usedModel: response.data.metadata?.usedModel || modelName,
        timestamp: new Date().toISOString()
      };
      
      console.log(`    ✅ 完成 (${duration}ms)`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        success: false,
        duration,
        prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log(`    ❌ 失败 (${duration}ms): ${error.message}`);
      return result;
    }
  }

  /**
   * 测试特定模型的所有用例
   */
  async testModel(modelName, modelDisplayName) {
    console.log(`\n🤖 测试模型: ${modelDisplayName} (${modelName})`);
    
    const modelResults = {
      name: modelName,
      displayName: modelDisplayName,
      tests: {}
    };
    
    for (const [testType, testCase] of Object.entries(TEST_CASES)) {
      console.log(`\n📝 ${testCase.name} 测试:`);
      
      const testResults = {
        name: testCase.name,
        results: []
      };
      
      // 只测试第一个提示词
      const prompt = testCase.prompts[0];
      const result = await this.testSingleQuery(prompt, modelName, testType);
      testResults.results.push(result);
      
      // 计算测试类型的统计
      testResults.summary = {
        totalTests: 1,
        successfulTests: result.success ? 1 : 0,
        successRate: result.success ? 1 : 0,
        avgDuration: result.duration,
        minDuration: result.duration,
        maxDuration: result.duration
      };
      
      modelResults.tests[testType] = testResults;
      
      console.log(`    📊 ${testCase.name}耗时: ${result.duration}ms`);
      
      // 测试间隔，避免过于频繁的请求
      await this.sleep(2000);
    }
    
    // 计算模型的总体统计
    modelResults.summary = this.calculateModelSummary(modelResults.tests);
    
    return modelResults;
  }

  /**
   * 计算模型的总体统计
   */
  calculateModelSummary(tests) {
    const testSummaries = Object.values(tests).map(t => t.summary);
    
    return {
      totalTests: testSummaries.reduce((sum, s) => sum + s.totalTests, 0),
      successfulTests: testSummaries.reduce((sum, s) => sum + s.successfulTests, 0),
      overallSuccessRate: testSummaries.reduce((sum, s) => sum + s.successRate, 0) / testSummaries.length,
      avgDuration: Math.round(testSummaries.reduce((sum, s) => sum + s.avgDuration, 0) / testSummaries.length),
      simpleQueryAvg: tests.simple?.summary?.avgDuration || 0,
      mediumQueryAvg: tests.medium?.summary?.avgDuration || 0,
      complexQueryAvg: tests.complex?.summary?.avgDuration || 0
    };
  }

  /**
   * 生成对比分析
   */
  generateComparison(thinkingResults, flashResults) {
    if (!thinkingResults || !flashResults) {
      return { error: '缺少对比数据' };
    }
    
    const thinking = thinkingResults.summary;
    const flash = flashResults.summary;
    
    return {
      speedComparison: {
        simple: {
          thinking: thinking.simpleQueryAvg,
          flash: flash.simpleQueryAvg,
          improvement: ((thinking.simpleQueryAvg - flash.simpleQueryAvg) / thinking.simpleQueryAvg * 100).toFixed(1) + '%'
        },
        medium: {
          thinking: thinking.mediumQueryAvg,
          flash: flash.mediumQueryAvg,
          improvement: ((thinking.mediumQueryAvg - flash.mediumQueryAvg) / thinking.mediumQueryAvg * 100).toFixed(1) + '%'
        },
        complex: {
          thinking: thinking.complexQueryAvg,
          flash: flash.complexQueryAvg,
          improvement: ((thinking.complexQueryAvg - flash.complexQueryAvg) / thinking.complexQueryAvg * 100).toFixed(1) + '%'
        }
      },
      overallComparison: {
        thinkingAvg: thinking.avgDuration,
        flashAvg: flash.avgDuration,
        speedImprovement: ((thinking.avgDuration - flash.avgDuration) / thinking.avgDuration * 100).toFixed(1) + '%',
        thinkingSuccessRate: (thinking.overallSuccessRate * 100).toFixed(1) + '%',
        flashSuccessRate: (flash.overallSuccessRate * 100).toFixed(1) + '%'
      },
      recommendation: this.generateRecommendation(thinking, flash)
    };
  }

  /**
   * 生成使用建议
   */
  generateRecommendation(thinking, flash) {
    const speedDiff = ((thinking.avgDuration - flash.avgDuration) / thinking.avgDuration * 100);
    const accuracyDiff = (thinking.overallSuccessRate - flash.overallSuccessRate) * 100;
    
    if (speedDiff > 20 && accuracyDiff < 5) {
      return 'Flash模式在速度上有显著优势，且准确性相当，建议优先使用Flash模式';
    } else if (accuracyDiff > 10) {
      return 'Thinking模式在准确性上有明显优势，建议在复杂查询中使用Thinking模式';
    } else if (speedDiff > 10) {
      return 'Flash模式速度更快，建议在简单查询中使用Flash模式，复杂查询使用Thinking模式';
    } else {
      return '两种模式性能相近，可根据具体场景选择';
    }
  }

  /**
   * 休眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 保存结果到文件
   */
  saveResults() {
    const outputPath = path.join(__dirname, CONFIG.outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(this.results, null, 2), 'utf8');
    console.log(`\n💾 结果已保存到: ${outputPath}`);
  }

  /**
   * 打印结果摘要
   */
  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 快速AI模型性能对比测试结果');
    console.log('='.repeat(60));
    
    const { thinking, flash } = this.results.models;
    const comparison = this.results.summary;
    
    if (thinking && flash && comparison) {
      console.log('\n🏆 性能对比:');
      console.log(`简单查询: Thinking ${comparison.speedComparison.simple.thinking}ms vs Flash ${comparison.speedComparison.simple.flash}ms (${comparison.speedComparison.simple.improvement})`);
      console.log(`中等查询: Thinking ${comparison.speedComparison.medium.thinking}ms vs Flash ${comparison.speedComparison.medium.flash}ms (${comparison.speedComparison.medium.improvement})`);
      console.log(`复杂查询: Thinking ${comparison.speedComparison.complex.thinking}ms vs Flash ${comparison.speedComparison.complex.flash}ms (${comparison.speedComparison.complex.improvement})`);
      
      console.log('\n📈 总体表现:');
      console.log(`平均响应时间: Thinking ${comparison.overallComparison.thinkingAvg}ms vs Flash ${comparison.overallComparison.flashAvg}ms`);
      console.log(`速度提升: ${comparison.overallComparison.speedImprovement}`);
      console.log(`成功率: Thinking ${comparison.overallComparison.thinkingSuccessRate} vs Flash ${comparison.overallComparison.flashSuccessRate}`);
      
      console.log('\n💡 使用建议:');
      console.log(comparison.recommendation);
    }
    
    console.log('\n' + '='.repeat(60));
  }

  /**
   * 运行快速测试
   */
  async run() {
    try {
      console.log('🚀 开始快速AI模型性能对比测试');
      console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
      console.log(`🔄 测试轮数: ${CONFIG.testRounds} (简化版)`);
      console.log(`⏱️  超时时间: ${CONFIG.timeout/1000}秒`);
      console.log(`📝 测试用例: 每种复杂度1个提示词`);
      
      // 获取认证Token
      await this.getAuthToken();
      
      // 获取AI模型配置
      const { thinkingModel, flashModel, allModels } = await this.getAIModels();
      
      this.results.availableModels = allModels.map(m => ({
        name: m.modelName,
        displayName: m.displayName,
        provider: m.provider,
        modelType: m.capabilities,
        status: m.isActive ? 'active' : 'inactive'
      }));
      
      // 测试Thinking模型
      if (thinkingModel) {
        const thinkingResults = await this.testModel(thinkingModel.modelName, thinkingModel.displayName);
        this.results.models.thinking = thinkingResults;
      } else {
        console.log('⚠️  未找到Thinking模型，跳过测试');
      }
      
      // 测试Flash模型
      if (flashModel) {
        const flashResults = await this.testModel(flashModel.modelName, flashModel.displayName);
        this.results.models.flash = flashResults;
      } else {
        console.log('⚠️  未找到Flash模型，跳过测试');
      }
      
      // 生成对比分析
      if (this.results.models.thinking && this.results.models.flash) {
        this.results.summary = this.generateComparison(
          this.results.models.thinking,
          this.results.models.flash
        );
      }
      
      // 保存和显示结果
      this.saveResults();
      this.printSummary();
      
      console.log('\n✅ 快速测试完成!');
      
    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new QuickAIModelTester();
  tester.run();
}

module.exports = QuickAIModelTester;
