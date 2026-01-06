#!/usr/bin/env node

/**
 * 扩展关键词测试脚本
 * 测试所有新增的同义词和扩展关键词
 */

const axios = require('axios');

// 配置
const CONFIG = {
  baseURL: 'http://127.0.0.1:3000',
  timeout: 30000
};

// 扩展关键词测试用例
const EXTENDED_KEYWORD_TESTS = [
  // 学生管理扩展词汇
  { query: "查看娃娃们今天的表现", expectedGroup: "学生管理", category: "学生管理-亲切称呼" },
  { query: "小宝贝们的出勤情况", expectedGroup: "学生管理", category: "学生管理-亲切称呼" },
  { query: "小天使的健康档案", expectedGroup: "学生管理", category: "学生管理-亲切称呼" },
  { query: "小同学们的成绩如何", expectedGroup: "学生管理", category: "学生管理-亲切称呼" },
  { query: "幼儿的疫苗接种记录", expectedGroup: "学生管理", category: "学生管理-正式称呼" },
  
  // 教师管理扩展词汇
  { query: "幼师的培训计划", expectedGroup: "教师管理", category: "教师管理-职业称呼" },
  { query: "保育员的工作安排", expectedGroup: "教师管理", category: "教师管理-职业称呼" },
  { query: "班主任的工作量统计", expectedGroup: "教师管理", category: "教师管理-职业称呼" },
  { query: "园长的管理职责", expectedGroup: "教师管理", category: "教师管理-职业称呼" },
  { query: "主班老师的课表", expectedGroup: "教师管理", category: "教师管理-职业称呼" },
  
  // 班级管理扩展词汇
  { query: "大班的课程安排", expectedGroup: "班级管理", category: "班级管理-年龄分班" },
  { query: "中班人数统计", expectedGroup: "班级管理", category: "班级管理-年龄分班" },
  { query: "小班教师配置", expectedGroup: "班级管理", category: "班级管理-年龄分班" },
  { query: "蒙氏班特色介绍", expectedGroup: "班级管理", category: "班级管理-特色班级" },
  { query: "双语班师资情况", expectedGroup: "班级管理", category: "班级管理-特色班级" },
  { query: "艺术班活动安排", expectedGroup: "班级管理", category: "班级管理-特色班级" },
  
  // 活动管理扩展词汇
  { query: "春游报名情况", expectedGroup: "活动管理", category: "活动管理-季节活动" },
  { query: "运动会安排", expectedGroup: "活动管理", category: "活动管理-体育活动" },
  { query: "艺术节表演", expectedGroup: "活动管理", category: "活动管理-文艺活动" },
  { query: "亲子活动通知", expectedGroup: "活动管理", category: "活动管理-家庭活动" },
  { query: "生日会策划", expectedGroup: "活动管理", category: "活动管理-庆祝活动" },
  { query: "手工活动材料", expectedGroup: "活动管理", category: "活动管理-教学活动" },
  
  // 家长管理扩展词汇
  { query: "爸爸妈妈的联系方式", expectedGroup: "家长管理", category: "家长管理-亲属称呼" },
  { query: "爷爷奶奶接送权限", expectedGroup: "家长管理", category: "家长管理-亲属称呼" },
  { query: "监护人身份验证", expectedGroup: "家长管理", category: "家长管理-法律称呼" },
  { query: "家庭教育指导", expectedGroup: "家长管理", category: "家长管理-教育服务" },
  
  // 招生管理扩展词汇
  { query: "春季招生计划", expectedGroup: "招生管理", category: "招生管理-季节招生" },
  { query: "新生入园流程", expectedGroup: "招生管理", category: "招生管理-入园管理" },
  { query: "插班生申请", expectedGroup: "招生管理", category: "招生管理-特殊招生" },
  { query: "学费缴纳情况", expectedGroup: "招生管理", category: "招生管理-费用管理" },
  
  // 系统统计扩展词汇
  { query: "月度报表生成", expectedGroup: "系统统计", category: "系统统计-报表功能" },
  { query: "实时监控数据", expectedGroup: "系统统计", category: "系统统计-监控功能" },
  { query: "可视化图表展示", expectedGroup: "系统统计", category: "系统统计-展示功能" },
  { query: "人数增长趋势", expectedGroup: "系统统计", category: "系统统计-趋势分析" }
];

class ExtendedKeywordTester {
  constructor() {
    this.token = null;
    this.results = {
      timestamp: new Date().toISOString(),
      totalTests: EXTENDED_KEYWORD_TESTS.length,
      categories: {},
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
   * 测试单个关键词
   */
  async testKeyword(testCase) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${CONFIG.baseURL}/api/ai-query`, {
        query: testCase.query,
        context: `扩展关键词测试-${testCase.category}`
      }, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: CONFIG.timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 分析响应中的分组识别
      let identifiedGroups = [];
      if (response.data.data.metadata && response.data.data.metadata.requiredTables) {
        identifiedGroups = response.data.data.metadata.requiredTables;
      }
      
      const isCorrect = identifiedGroups.includes(testCase.expectedGroup);
      
      const result = {
        query: testCase.query,
        expectedGroup: testCase.expectedGroup,
        identifiedGroups,
        isCorrect,
        duration,
        category: testCase.category,
        confidence: response.data.data.metadata?.queryAnalysis?.confidence || 0,
        keywords: response.data.data.metadata?.queryAnalysis?.keywords || [],
        timestamp: new Date().toISOString()
      };
      
      console.log(`  ${isCorrect ? '✅' : '❌'} ${testCase.query} → ${identifiedGroups.join(', ')} (${duration}ms)`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        query: testCase.query,
        expectedGroup: testCase.expectedGroup,
        identifiedGroups: [],
        isCorrect: false,
        duration,
        category: testCase.category,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log(`  ❌ ${testCase.query} 失败: ${error.message}`);
      return result;
    }
  }

  /**
   * 运行所有测试
   */
  async runAllTests() {
    console.log(`\n🧪 开始扩展关键词测试 (${EXTENDED_KEYWORD_TESTS.length}个测试用例)`);
    
    for (const testCase of EXTENDED_KEYWORD_TESTS) {
      const result = await this.testKeyword(testCase);
      
      // 按类别分组结果
      if (!this.results.categories[testCase.category]) {
        this.results.categories[testCase.category] = {
          tests: [],
          summary: { total: 0, correct: 0, avgDuration: 0 }
        };
      }
      
      this.results.categories[testCase.category].tests.push(result);
      
      // 测试间隔
      await this.sleep(1000);
    }
    
    // 计算统计信息
    this.calculateSummary();
  }

  /**
   * 计算统计信息
   */
  calculateSummary() {
    let totalTests = 0;
    let totalCorrect = 0;
    let totalDuration = 0;
    
    // 计算每个类别的统计
    Object.keys(this.results.categories).forEach(category => {
      const categoryData = this.results.categories[category];
      const tests = categoryData.tests;
      
      categoryData.summary = {
        total: tests.length,
        correct: tests.filter(t => t.isCorrect).length,
        accuracy: (tests.filter(t => t.isCorrect).length / tests.length * 100).toFixed(1) + '%',
        avgDuration: Math.round(tests.reduce((sum, t) => sum + t.duration, 0) / tests.length)
      };
      
      totalTests += tests.length;
      totalCorrect += tests.filter(t => t.isCorrect).length;
      totalDuration += tests.reduce((sum, t) => sum + t.duration, 0);
    });
    
    // 计算总体统计
    this.results.summary = {
      totalTests,
      totalCorrect,
      totalFailed: totalTests - totalCorrect,
      overallAccuracy: (totalCorrect / totalTests * 100).toFixed(1) + '%',
      avgDuration: Math.round(totalDuration / totalTests),
      categoriesCount: Object.keys(this.results.categories).length
    };
  }

  /**
   * 打印测试结果
   */
  printResults() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 扩展关键词测试结果报告');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 总体结果:`);
    console.log(`测试用例总数: ${this.results.summary.totalTests}`);
    console.log(`识别正确: ${this.results.summary.totalCorrect}`);
    console.log(`识别错误: ${this.results.summary.totalFailed}`);
    console.log(`总体准确率: ${this.results.summary.overallAccuracy}`);
    console.log(`平均响应时间: ${this.results.summary.avgDuration}ms`);
    
    console.log(`\n📋 分类别结果:`);
    Object.entries(this.results.categories).forEach(([category, data]) => {
      console.log(`${category}: ${data.summary.accuracy} (${data.summary.correct}/${data.summary.total})`);
    });
    
    // 评估结果
    const accuracy = parseFloat(this.results.summary.overallAccuracy);
    let grade, recommendation;
    
    if (accuracy >= 95) {
      grade = '🏆 优秀';
      recommendation = '扩展关键词识别效果优秀，系统智能化水平很高';
    } else if (accuracy >= 85) {
      grade = '✅ 良好';
      recommendation = '扩展关键词识别效果良好，可以继续优化部分词汇';
    } else if (accuracy >= 70) {
      grade = '⚠️ 一般';
      recommendation = '需要进一步优化关键词映射和权重算法';
    } else {
      grade = '❌ 需要改进';
      recommendation = '扩展关键词识别效果不理想，需要重新设计算法';
    }
    
    console.log(`\n🎖️ 测试评级: ${grade}`);
    console.log(`💡 建议: ${recommendation}`);
    
    console.log('\n' + '='.repeat(80));
  }

  /**
   * 休眠函数
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 运行完整测试
   */
  async run() {
    try {
      console.log('🚀 开始扩展关键词测试');
      console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
      
      // 获取认证Token
      await this.getAuthToken();
      
      // 运行所有测试
      await this.runAllTests();
      
      // 打印结果
      this.printResults();
      
      console.log('\n✅ 扩展关键词测试完成!');
      
    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new ExtendedKeywordTester();
  tester.run();
}

module.exports = ExtendedKeywordTester;
