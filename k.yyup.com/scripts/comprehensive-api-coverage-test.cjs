#!/usr/bin/env node

/**
 * 全面API关键词覆盖测试脚本
 * 目标：达到100%的API分组关键词覆盖率
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseURL: 'http://127.0.0.1:3000',
  timeout: 30000, // 30秒超时
  outputFile: 'api-coverage-test-results.json'
};

// 全面的关键词测试用例 - 覆盖8个API分组
const COMPREHENSIVE_TEST_CASES = {
  "学生管理": {
    keywords: ["学生", "student", "班级学生", "学员", "小朋友", "孩子"],
    testQueries: [
      "查询所有学生信息",
      "添加新学生到班级",
      "学员基本信息统计",
      "小朋友出勤情况",
      "孩子健康档案查询",
      "student enrollment data",
      "班级学生名单导出",
      "学生成绩分析报告"
    ]
  },
  "教师管理": {
    keywords: ["教师", "teacher", "老师", "教职工", "师资", "授课"],
    testQueries: [
      "查询所有教师信息",
      "teacher performance review",
      "老师工作安排",
      "教职工薪资统计",
      "师资力量分析",
      "授课计划制定",
      "教师培训记录",
      "班主任工作量统计"
    ]
  },
  "班级管理": {
    keywords: ["班级", "class", "班级信息", "年级", "分班", "课程"],
    testQueries: [
      "查询所有班级信息",
      "class schedule management",
      "年级学生分布",
      "分班情况统计",
      "课程安排查询",
      "班级容量分析",
      "教室使用情况",
      "班级活动记录"
    ]
  },
  "活动管理": {
    keywords: ["活动", "activity", "报名", "活动报名", "事件", "比赛"],
    testQueries: [
      "查询所有活动信息",
      "activity registration status",
      "报名情况统计",
      "活动报名管理",
      "事件日程安排",
      "比赛成绩录入",
      "户外活动计划",
      "节日庆祝活动"
    ]
  },
  "家长管理": {
    keywords: ["家长", "parent", "联系方式", "监护人", "家庭", "亲子"],
    testQueries: [
      "查询所有家长信息",
      "parent contact information",
      "联系方式更新",
      "监护人身份验证",
      "家庭背景调查",
      "亲子活动安排",
      "家长会通知",
      "家校沟通记录"
    ]
  },
  "招生管理": {
    keywords: ["招生", "enrollment", "申请", "面试", "录取", "入学"],
    testQueries: [
      "查询招生申请状态",
      "enrollment application process",
      "申请材料审核",
      "面试安排管理",
      "录取结果通知",
      "入学手续办理",
      "招生计划制定",
      "报名费用统计"
    ]
  },
  "系统统计": {
    keywords: ["统计", "数量", "总数", "分析", "报表", "图表", "数据"],
    testQueries: [
      "统计各班级学生人数",
      "total enrollment statistics",
      "数量分布分析",
      "总数汇总报告",
      "分析趋势图表",
      "报表数据导出",
      "图表可视化",
      "数据挖掘分析"
    ]
  },
  "用户权限": {
    keywords: ["用户", "user", "角色", "权限", "登录", "管理员"],
    testQueries: [
      "查询用户权限设置",
      "user role management",
      "角色分配管理",
      "权限控制设置",
      "登录日志查询",
      "管理员操作记录",
      "用户账户管理",
      "系统访问控制"
    ]
  }
};

class ComprehensiveAPITester {
  constructor() {
    this.token = null;
    this.results = {
      timestamp: new Date().toISOString(),
      testConfig: CONFIG,
      coverage: {},
      summary: {},
      detailedResults: {}
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
   * 测试单个查询
   */
  async testSingleQuery(query, expectedGroup) {
    const startTime = Date.now();
    
    try {
      const response = await axios.post(`${CONFIG.baseURL}/api/ai-query`, {
        query: query,
        context: `API覆盖测试-${expectedGroup}`
      }, {
        headers: { Authorization: `Bearer ${this.token}` },
        timeout: CONFIG.timeout
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // 分析响应中的分组识别
      let identifiedGroups = [];
      if (response.data.data.groups) {
        identifiedGroups = response.data.data.groups;
      } else if (response.data.data.metadata && response.data.data.metadata.requiredTables) {
        identifiedGroups = response.data.data.metadata.requiredTables;
      }
      
      const result = {
        success: true,
        query: query.substring(0, 60) + (query.length > 60 ? '...' : ''),
        expectedGroup,
        identifiedGroups,
        correctIdentification: identifiedGroups.includes(expectedGroup),
        duration,
        responseType: response.data.data.type || 'unknown',
        timestamp: new Date().toISOString()
      };
      
      console.log(`    ${result.correctIdentification ? '✅' : '❌'} ${query.substring(0, 40)}... (${duration}ms)`);
      return result;
      
    } catch (error) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = {
        success: false,
        query: query.substring(0, 60) + (query.length > 60 ? '...' : ''),
        expectedGroup,
        identifiedGroups: [],
        correctIdentification: false,
        duration,
        error: error.message,
        timestamp: new Date().toISOString()
      };
      
      console.log(`    ❌ ${query.substring(0, 40)}... 失败: ${error.message}`);
      return result;
    }
  }

  /**
   * 测试特定API分组
   */
  async testAPIGroup(groupName, groupData) {
    console.log(`\n🎯 测试API分组: ${groupName}`);
    console.log(`📝 关键词: ${groupData.keywords.join(', ')}`);
    console.log(`🧪 测试用例: ${groupData.testQueries.length}个`);
    
    const groupResults = {
      groupName,
      keywords: groupData.keywords,
      totalTests: groupData.testQueries.length,
      results: []
    };
    
    for (const query of groupData.testQueries) {
      const result = await this.testSingleQuery(query, groupName);
      groupResults.results.push(result);
      
      // 测试间隔，避免过于频繁的请求
      await this.sleep(1000);
    }
    
    // 计算分组统计
    const successfulTests = groupResults.results.filter(r => r.success);
    const correctIdentifications = groupResults.results.filter(r => r.correctIdentification);
    
    groupResults.summary = {
      totalTests: groupResults.totalTests,
      successfulTests: successfulTests.length,
      correctIdentifications: correctIdentifications.length,
      successRate: (successfulTests.length / groupResults.totalTests * 100).toFixed(1) + '%',
      accuracyRate: (correctIdentifications.length / groupResults.totalTests * 100).toFixed(1) + '%',
      avgDuration: Math.round(successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length || 0)
    };
    
    console.log(`📊 ${groupName} 结果: 成功率 ${groupResults.summary.successRate}, 准确率 ${groupResults.summary.accuracyRate}`);
    
    return groupResults;
  }

  /**
   * 计算总体覆盖率
   */
  calculateOverallCoverage(allResults) {
    const totalTests = Object.values(allResults).reduce((sum, group) => sum + group.totalTests, 0);
    const totalSuccessful = Object.values(allResults).reduce((sum, group) => sum + group.summary.successfulTests, 0);
    const totalCorrect = Object.values(allResults).reduce((sum, group) => sum + group.summary.correctIdentifications, 0);
    
    return {
      totalAPIGroups: Object.keys(allResults).length,
      totalTestCases: totalTests,
      totalSuccessfulTests: totalSuccessful,
      totalCorrectIdentifications: totalCorrect,
      overallSuccessRate: (totalSuccessful / totalTests * 100).toFixed(1) + '%',
      overallAccuracyRate: (totalCorrect / totalTests * 100).toFixed(1) + '%',
      coverageScore: (totalCorrect / totalTests * 100).toFixed(1)
    };
  }

  /**
   * 生成覆盖率报告
   */
  generateCoverageReport(coverage) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 API关键词覆盖率测试报告');
    console.log('='.repeat(80));
    
    console.log(`\n🎯 总体覆盖情况:`);
    console.log(`API分组数量: ${coverage.totalAPIGroups}/8 (100%)`);
    console.log(`测试用例总数: ${coverage.totalTestCases}`);
    console.log(`成功执行: ${coverage.totalSuccessfulTests} (${coverage.overallSuccessRate})`);
    console.log(`正确识别: ${coverage.totalCorrectIdentifications} (${coverage.overallAccuracyRate})`);
    console.log(`覆盖率评分: ${coverage.coverageScore}/100`);
    
    console.log(`\n📋 各分组详细情况:`);
    Object.values(this.results.detailedResults).forEach(group => {
      console.log(`${group.groupName}: ${group.summary.accuracyRate} 准确率 (${group.summary.correctIdentifications}/${group.totalTests})`);
    });
    
    // 评估覆盖率等级
    const score = parseFloat(coverage.coverageScore);
    let grade, recommendation;
    
    if (score >= 95) {
      grade = '🏆 优秀';
      recommendation = 'API分组识别系统表现优秀，关键词覆盖率达到预期目标';
    } else if (score >= 85) {
      grade = '✅ 良好';
      recommendation = 'API分组识别系统表现良好，建议优化部分关键词识别';
    } else if (score >= 70) {
      grade = '⚠️ 一般';
      recommendation = '需要改进关键词识别算法，增加更多关键词映射';
    } else {
      grade = '❌ 需要改进';
      recommendation = '关键词识别系统需要重大改进，建议重新设计分组算法';
    }
    
    console.log(`\n🎖️ 覆盖率等级: ${grade}`);
    console.log(`💡 建议: ${recommendation}`);
    
    return { grade, recommendation };
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
    console.log(`\n💾 详细结果已保存到: ${outputPath}`);
  }

  /**
   * 运行全面覆盖测试
   */
  async run() {
    try {
      console.log('🚀 开始全面API关键词覆盖测试');
      console.log(`📅 测试时间: ${new Date().toLocaleString()}`);
      console.log(`🎯 目标: 100% API分组关键词覆盖`);
      console.log(`📊 测试范围: 8个API分组，${Object.values(COMPREHENSIVE_TEST_CASES).reduce((sum, group) => sum + group.testQueries.length, 0)}个测试用例`);
      
      // 获取认证Token
      await this.getAuthToken();
      
      // 测试每个API分组
      for (const [groupName, groupData] of Object.entries(COMPREHENSIVE_TEST_CASES)) {
        const groupResults = await this.testAPIGroup(groupName, groupData);
        this.results.detailedResults[groupName] = groupResults;
      }
      
      // 计算总体覆盖率
      this.results.coverage = this.calculateOverallCoverage(this.results.detailedResults);
      
      // 生成覆盖率报告
      const assessment = this.generateCoverageReport(this.results.coverage);
      this.results.summary = {
        ...this.results.coverage,
        grade: assessment.grade,
        recommendation: assessment.recommendation
      };
      
      // 保存结果
      this.saveResults();
      
      console.log('\n✅ 全面API覆盖测试完成!');
      
    } catch (error) {
      console.error('\n❌ 测试失败:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new ComprehensiveAPITester();
  tester.run();
}

module.exports = ComprehensiveAPITester;
