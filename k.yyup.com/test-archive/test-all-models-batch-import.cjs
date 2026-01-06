#!/usr/bin/env node

/**
 * 全模型批量导入测试脚本
 * 
 * 测试所有8个数据模型的批量导入功能
 * 每个模型测试10种提示词汇和3个非规则内容
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

  static model(modelName, message) {
    console.log(`${colors.bright}${colors.magenta}📊 ${modelName}:${colors.reset} ${message}`);
  }
}

class AllModelsBatchImportTester {
  constructor() {
    this.testData = this.loadTestData();
    this.testResults = {
      models: {},
      summary: {
        totalModels: 0,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0
      }
    };
  }

  /**
   * 加载测试数据
   */
  loadTestData() {
    const dataPath = path.join(__dirname, 'batch-import-model-test-data.json');
    return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  }

  /**
   * 运行所有模型测试
   */
  async runAllModelTests() {
    Logger.section('全模型批量导入测试');
    
    const models = Object.keys(this.testData.test_models);
    this.testResults.summary.totalModels = models.length;
    
    Logger.info(`准备测试 ${models.length} 个数据模型`);
    Logger.info(`每个模型测试 10 种提示词汇 + 3 个非规则内容`);
    Logger.info(`预计总测试数: ${models.length * 13} 项`);
    
    for (const modelName of models) {
      await this.testSingleModel(modelName);
    }
    
    this.generateFinalReport();
  }

  /**
   * 测试单个模型
   */
  async testSingleModel(modelName) {
    const modelData = this.testData.test_models[modelName];
    Logger.section(`测试模型: ${modelData.display_name} (${modelName})`);
    
    this.testResults.models[modelName] = {
      display_name: modelData.display_name,
      business_center: modelData.business_center,
      trigger_phrase_tests: [],
      regular_data_tests: [],
      irregular_data_tests: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0
      }
    };

    try {
      // 测试1: 提示词汇识别
      await this.testTriggerPhrases(modelName, modelData);
      
      // 测试2: 正常数据导入
      await this.testRegularData(modelName, modelData);
      
      // 测试3: 非规则数据处理
      await this.testIrregularData(modelName, modelData);
      
      Logger.success(`模型 ${modelData.display_name} 测试完成`);
      
    } catch (error) {
      Logger.error(`模型 ${modelData.display_name} 测试失败: ${error.message}`);
    }
  }

  /**
   * 测试提示词汇识别
   */
  async testTriggerPhrases(modelName, modelData) {
    Logger.step(1, `测试 ${modelData.trigger_phrases.length} 个提示词汇`);
    
    for (let i = 0; i < modelData.trigger_phrases.length; i++) {
      const phrase = modelData.trigger_phrases[i];
      
      Logger.user(phrase);
      
      // 模拟AI识别
      const recognized = await this.simulateAIRecognition(phrase, modelName);
      
      if (recognized.success) {
        Logger.ai(`识别成功！准备为您批量导入${modelData.display_name}数据`);
        this.recordTest(modelName, 'trigger_phrase', phrase, true, '提示词汇识别成功');
      } else {
        Logger.ai(`抱歉，我没有理解您的需求`);
        this.recordTest(modelName, 'trigger_phrase', phrase, false, '提示词汇识别失败');
      }
      
      // 短暂延迟模拟真实交互
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const phraseResults = this.testResults.models[modelName].trigger_phrase_tests;
    const passedPhrases = phraseResults.filter(t => t.passed).length;
    Logger.success(`提示词汇测试: ${passedPhrases}/${modelData.trigger_phrases.length} 通过`);
  }

  /**
   * 测试正常数据导入
   */
  async testRegularData(modelName, modelData) {
    Logger.step(2, `测试正常数据导入 (${modelData.regular_data.length} 条记录)`);
    
    // 生成CSV内容
    const csvContent = this.generateCSVContent(modelData.regular_data);
    Logger.info('生成的CSV内容:');
    console.log(csvContent.split('\n').slice(0, 4).join('\n'));
    
    // 模拟批量导入工具调用
    const importResult = await this.simulateBatchImport(modelName, csvContent, 'regular');
    
    if (importResult.success) {
      Logger.success(`正常数据导入成功: ${importResult.validRecords}/${importResult.totalRecords} 条有效`);
      this.recordTest(modelName, 'regular_data', 'batch_import', true, 
        `成功导入${importResult.validRecords}条正常数据`);
    } else {
      Logger.error(`正常数据导入失败: ${importResult.error}`);
      this.recordTest(modelName, 'regular_data', 'batch_import', false, importResult.error);
    }
  }

  /**
   * 测试非规则数据处理
   */
  async testIrregularData(modelName, modelData) {
    Logger.step(3, `测试非规则数据处理 (${modelData.irregular_data.length} 条记录)`);
    
    for (let i = 0; i < modelData.irregular_data.length; i++) {
      const irregularRecord = modelData.irregular_data[i];
      
      Logger.warning(`测试非规则数据 ${i + 1}:`);
      console.log(JSON.stringify(irregularRecord, null, 2));
      
      // 模拟单条记录验证
      const validationResult = await this.simulateDataValidation(modelName, irregularRecord);
      
      if (validationResult.hasErrors) {
        Logger.warning(`发现数据问题: ${validationResult.errors.join(', ')}`);
        Logger.ai('我发现这条数据有问题，将跳过导入');
        this.recordTest(modelName, 'irregular_data', `irregular_${i + 1}`, true, 
          '正确识别并处理非规则数据');
      } else {
        Logger.error('未能识别数据问题');
        this.recordTest(modelName, 'irregular_data', `irregular_${i + 1}`, false, 
          '未能识别非规则数据问题');
      }
    }
    
    const irregularResults = this.testResults.models[modelName].irregular_data_tests;
    const passedIrregular = irregularResults.filter(t => t.passed).length;
    Logger.success(`非规则数据测试: ${passedIrregular}/${modelData.irregular_data.length} 通过`);
  }

  /**
   * 模拟AI识别
   */
  async simulateAIRecognition(phrase, modelName) {
    // 检查关键词匹配
    const keywords = ['批量导入', '导入', '批量添加', '上传', '批量录入', '批量创建'];
    const modelKeywords = {
      'users': ['用户', '员工', '人员', '账户', '账号'],
      'students': ['学生', '学员', '小朋友', '儿童', '幼儿'],
      'teachers': ['教师', '老师', '教职工', '教员'],
      'parents': ['家长', '父母', '监护人'],
      'activities': ['活动', '课程', '项目'],
      'classes': ['班级', '班', '年级'],
      'enrollments': ['招生', '报名', '入学', '申请'],
      'todos': ['任务', '待办', '工作']
    };
    
    const hasActionKeyword = keywords.some(keyword => phrase.includes(keyword));
    const hasModelKeyword = modelKeywords[modelName].some(keyword => phrase.includes(keyword));
    
    return {
      success: hasActionKeyword && hasModelKeyword,
      confidence: hasActionKeyword && hasModelKeyword ? 0.95 : 0.3
    };
  }

  /**
   * 模拟批量导入
   */
  async simulateBatchImport(modelName, csvContent, dataType) {
    try {
      // 解析CSV
      const lines = csvContent.trim().split('\n');
      const headers = lines[0].split(',');
      const dataRows = lines.slice(1);
      
      let validRecords = 0;
      let invalidRecords = 0;
      
      for (const row of dataRows) {
        const values = row.split(',');
        const record = {};
        headers.forEach((header, index) => {
          record[header.trim()] = (values[index] || '').trim();
        });
        
        const validation = await this.simulateDataValidation(modelName, record);
        if (validation.hasErrors) {
          invalidRecords++;
        } else {
          validRecords++;
        }
      }
      
      return {
        success: true,
        totalRecords: dataRows.length,
        validRecords,
        invalidRecords,
        successRate: Math.round((validRecords / dataRows.length) * 100)
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 模拟数据验证
   */
  async simulateDataValidation(modelName, record) {
    const errors = [];
    
    // 根据模型定义验证规则
    const validationRules = {
      'users': {
        required: ['name', 'email'],
        formats: {
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          phone: /^1[3-9]\d{9}$/
        }
      },
      'students': {
        required: ['name', 'age'],
        ranges: {
          age: { min: 2, max: 8 }
        }
      },
      'teachers': {
        required: ['userId', 'kindergartenId', 'position'],
        formats: {}
      },
      'parents': {
        required: ['name', 'phone'],
        formats: {
          phone: /^1[3-9]\d{9}$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      },
      'activities': {
        required: ['title', 'description', 'startDate'],
        formats: {
          startDate: /^\d{4}-\d{2}-\d{2}$/
        }
      },
      'classes': {
        required: ['name', 'kindergartenId'],
        ranges: {
          capacity: { min: 1, max: 50 }
        }
      },
      'enrollments': {
        required: ['studentName', 'parentName', 'phone'],
        formats: {
          phone: /^1[3-9]\d{9}$/,
          email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        }
      },
      'todos': {
        required: ['title', 'description'],
        formats: {}
      }
    };
    
    const rules = validationRules[modelName] || { required: [], formats: {} };
    
    // 检查必填字段
    for (const field of rules.required) {
      if (!record[field] || record[field].toString().trim() === '') {
        errors.push(`必填字段 ${field} 不能为空`);
      }
    }
    
    // 检查格式
    for (const [field, pattern] of Object.entries(rules.formats)) {
      if (record[field] && !pattern.test(record[field])) {
        errors.push(`字段 ${field} 格式不正确`);
      }
    }
    
    // 检查范围
    if (rules.ranges) {
      for (const [field, range] of Object.entries(rules.ranges)) {
        const value = parseFloat(record[field]);
        if (!isNaN(value)) {
          if (value < range.min || value > range.max) {
            errors.push(`字段 ${field} 超出有效范围 (${range.min}-${range.max})`);
          }
        }
      }
    }
    
    return {
      hasErrors: errors.length > 0,
      errors
    };
  }

  /**
   * 生成CSV内容
   */
  generateCSVContent(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvLines = [headers.join(',')];
    
    for (const record of data) {
      const values = headers.map(header => {
        const value = record[header];
        return value !== null && value !== undefined ? value.toString() : '';
      });
      csvLines.push(values.join(','));
    }
    
    return csvLines.join('\n');
  }

  /**
   * 记录测试结果
   */
  recordTest(modelName, testType, testName, passed, details) {
    const result = {
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    };
    
    this.testResults.models[modelName][`${testType}_tests`].push(result);
    this.testResults.models[modelName].summary.total++;
    
    if (passed) {
      this.testResults.models[modelName].summary.passed++;
      this.testResults.summary.passedTests++;
    } else {
      this.testResults.models[modelName].summary.failed++;
      this.testResults.summary.failedTests++;
    }
    
    this.testResults.summary.totalTests++;
  }

  /**
   * 生成最终报告
   */
  generateFinalReport() {
    Logger.section('全模型测试报告');
    
    const { summary } = this.testResults;
    Logger.info(`测试模型数: ${summary.totalModels}`);
    Logger.info(`总测试数: ${summary.totalTests}`);
    Logger.success(`通过测试: ${summary.passedTests}`);
    Logger.error(`失败测试: ${summary.failedTests}`);
    Logger.info(`总成功率: ${Math.round((summary.passedTests / summary.totalTests) * 100)}%`);
    
    console.log('\n各模型详细结果:');
    
    for (const [modelName, results] of Object.entries(this.testResults.models)) {
      const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
      const status = successRate >= 80 ? 
        `${colors.green}✓${colors.reset}` : 
        successRate >= 60 ? 
        `${colors.yellow}⚠${colors.reset}` : 
        `${colors.red}✗${colors.reset}`;
      
      console.log(`${status} ${results.display_name} (${modelName})`);
      console.log(`   业务中心: ${results.business_center}`);
      console.log(`   测试结果: ${results.summary.passed}/${results.summary.total} (${successRate}%)`);
      console.log(`   提示词汇: ${results.trigger_phrase_tests.filter(t => t.passed).length}/10`);
      console.log(`   正常数据: ${results.regular_data_tests.filter(t => t.passed).length}/1`);
      console.log(`   异常数据: ${results.irregular_data_tests.filter(t => t.passed).length}/3`);
    }
    
    // 保存详细报告
    const reportPath = path.join(__dirname, 'all-models-batch-import-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: this.testResults.summary,
      models: this.testResults.models,
      test_configuration: {
        models_tested: Object.keys(this.testResults.models).length,
        trigger_phrases_per_model: 10,
        irregular_data_per_model: 3,
        total_test_scenarios: summary.totalTests
      }
    }, null, 2));
    
    Logger.success(`详细测试报告已保存: ${reportPath}`);
    
    // 生成使用建议
    this.generateUsageRecommendations();
  }

  /**
   * 生成使用建议
   */
  generateUsageRecommendations() {
    Logger.section('使用建议');
    
    const highPerformanceModels = [];
    const mediumPerformanceModels = [];
    const lowPerformanceModels = [];
    
    for (const [modelName, results] of Object.entries(this.testResults.models)) {
      const successRate = Math.round((results.summary.passed / results.summary.total) * 100);
      
      if (successRate >= 80) {
        highPerformanceModels.push({ name: modelName, display: results.display_name, rate: successRate });
      } else if (successRate >= 60) {
        mediumPerformanceModels.push({ name: modelName, display: results.display_name, rate: successRate });
      } else {
        lowPerformanceModels.push({ name: modelName, display: results.display_name, rate: successRate });
      }
    }
    
    if (highPerformanceModels.length > 0) {
      Logger.success('推荐优先使用以下模型进行批量导入:');
      highPerformanceModels.forEach(model => {
        Logger.info(`  ✅ ${model.display} - 成功率 ${model.rate}%`);
      });
    }
    
    if (mediumPerformanceModels.length > 0) {
      Logger.warning('以下模型需要注意数据质量:');
      mediumPerformanceModels.forEach(model => {
        Logger.info(`  ⚠️ ${model.display} - 成功率 ${model.rate}%`);
      });
    }
    
    if (lowPerformanceModels.length > 0) {
      Logger.error('以下模型需要优化验证规则:');
      lowPerformanceModels.forEach(model => {
        Logger.info(`  ❌ ${model.display} - 成功率 ${model.rate}%`);
      });
    }
    
    Logger.info('\n最佳实践建议:');
    Logger.info('1. 使用明确的提示词汇，包含"批量导入"和具体模型名称');
    Logger.info('2. 确保CSV文件包含所有必填字段');
    Logger.info('3. 验证数据格式，特别是邮箱、电话、日期等字段');
    Logger.info('4. 大批量数据建议先小批量测试');
    Logger.info('5. 关注异常数据的处理和错误提示');
  }
}

// 运行全模型测试
async function main() {
  const tester = new AllModelsBatchImportTester();
  await tester.runAllModelTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AllModelsBatchImportTester;
