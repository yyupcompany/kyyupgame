/**
 * 综合监控系统 - 包含页面子功能和CRUD操作测试
 * Comprehensive Monitoring System - Including Sub-functions and CRUD Operations Testing
 * 
 * 功能：
 * 1. 无头浏览器动态错误监测
 * 2. 页面子功能测试 (模态框、标签页、下拉菜单、分页、搜索、筛选)
 * 3. CRUD操作完整性测试
 * 4. API对齐检测和修复建议
 * 5. 统一的错误记录和报告生成
 */

const DynamicErrorMonitor = require('./dynamic-error-monitor.cjs');
const ApiAlignmentDetector = require('./api-alignment-detector.cjs');
const fs = require('fs');
const path = require('path');

class ComprehensiveMonitor {
  constructor() {
    this.errorMonitor = new DynamicErrorMonitor();
    this.apiDetector = new ApiAlignmentDetector();
    this.results = {
      timestamp: new Date().toISOString(),
      browserTests: null,
      apiAlignment: null,
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        totalIssues: 0,
        criticalIssues: 0,
        crudOperationsCovered: 0,
        subFunctionsCovered: 0
      },
      recommendations: []
    };
  }

  /**
   * 运行完整监控测试
   */
  async runComprehensiveTest() {
    console.log('🚀 开始综合监控测试...');
    console.log('包含：页面子功能测试 + CRUD操作测试 + API对齐检测');
    
    try {
      // 第一步：运行无头浏览器测试
      console.log('\n📍 步骤1: 运行无头浏览器动态错误监测...');
      this.results.browserTests = await this.errorMonitor.runFullTest();
      console.log('✅ 无头浏览器测试完成');

      // 第二步：运行API对齐检测
      console.log('\n📍 步骤2: 运行API对齐检测...');
      this.results.apiAlignment = await this.apiDetector.runFullDetection();
      console.log('✅ API对齐检测完成');

      // 第三步：分析结果并生成综合报告
      console.log('\n📍 步骤3: 分析结果并生成综合报告...');
      await this.analyzeResults();
      await this.generateComprehensiveReport();
      console.log('✅ 综合报告生成完成');

      // 第四步：输出摘要
      this.printSummary();

      return this.results;

    } catch (error) {
      console.error('❌ 综合监控测试失败:', error);
      throw error;
    }
  }

  /**
   * 分析测试结果
   */
  async analyzeResults() {
    // 分析浏览器测试结果
    if (this.results.browserTests) {
      const browserResults = this.results.browserTests;
      
      this.results.summary.totalTests += browserResults.summary.totalPages;
      this.results.summary.passedTests += browserResults.summary.successfulPages;
      this.results.summary.failedTests += browserResults.summary.failedPages;
      this.results.summary.totalIssues += browserResults.summary.totalErrors;

      // 统计CRUD操作覆盖
      browserResults.pageResults.forEach(page => {
        const crudIssues = page.dataIssues.filter(issue => 
          issue.type.includes('create-operation') || 
          issue.type.includes('read-operation') || 
          issue.type.includes('update-operation') || 
          issue.type.includes('delete-operation')
        );
        this.results.summary.crudOperationsCovered += crudIssues.length;

        // 统计子功能覆盖
        const subFunctionIssues = page.dataIssues.filter(issue => 
          issue.type.includes('modal-function') || 
          issue.type.includes('tab-function') || 
          issue.type.includes('dropdown-function') || 
          issue.type.includes('pagination-function') || 
          issue.type.includes('search-function') || 
          issue.type.includes('filter-function')
        );
        this.results.summary.subFunctionsCovered += subFunctionIssues.length;
      });
    }

    // 分析API对齐结果
    if (this.results.apiAlignment) {
      const apiResults = this.results.apiAlignment;
      
      this.results.summary.totalTests += apiResults.totalEndpoints;
      this.results.summary.passedTests += apiResults.summary.success;
      this.results.summary.failedTests += apiResults.summary.failed;
      this.results.summary.totalIssues += apiResults.summary.totalIssues;
      this.results.summary.criticalIssues += apiResults.summary.criticalIssues;
    }

    // 生成综合建议
    this.generateComprehensiveRecommendations();
  }

  /**
   * 生成综合建议
   */
  generateComprehensiveRecommendations() {
    const recommendations = [];

    // 基于浏览器测试结果的建议
    if (this.results.browserTests) {
      const browserRecommendations = this.results.browserTests.recommendations;
      recommendations.push(...browserRecommendations.map(rec => ({
        ...rec,
        source: 'browser-test'
      })));
    }

    // 基于API对齐结果的建议
    if (this.results.apiAlignment) {
      const apiRecommendations = this.results.apiAlignment.fixes;
      recommendations.push(...apiRecommendations.map(fix => ({
        type: 'api-alignment',
        priority: 'high',
        issue: fix.description,
        suggestion: fix.code,
        source: 'api-alignment'
      })));
    }

    // 添加CRUD操作建议
    if (this.results.summary.crudOperationsCovered < 10) {
      recommendations.push({
        type: 'crud-operations',
        priority: 'medium',
        issue: 'CRUD操作覆盖不足',
        suggestion: '增加创建、读取、更新、删除操作的测试覆盖',
        source: 'comprehensive-analysis'
      });
    }

    // 添加子功能建议
    if (this.results.summary.subFunctionsCovered < 15) {
      recommendations.push({
        type: 'sub-functions',
        priority: 'medium',
        issue: '页面子功能覆盖不足',
        suggestion: '增加模态框、标签页、下拉菜单、分页、搜索、筛选功能的测试覆盖',
        source: 'comprehensive-analysis'
      });
    }

    // 优先级排序
    this.results.recommendations = recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * 生成综合报告
   */
  async generateComprehensiveReport() {
    const reportDir = '/home/devbox/project/client/tests/reports';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `comprehensive-monitor-report-${timestamp}.json`;
    const filepath = path.join(reportDir, filename);

    // 确保目录存在
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // 保存JSON报告
    fs.writeFileSync(filepath, JSON.stringify(this.results, null, 2));

    // 生成HTML报告
    const htmlReport = this.generateHtmlReport();
    const htmlFilepath = filepath.replace('.json', '.html');
    fs.writeFileSync(htmlFilepath, htmlReport);

    // 生成修复脚本
    const fixScript = this.generateFixScript();
    const fixFilepath = filepath.replace('.json', '-fixes.js');
    fs.writeFileSync(fixFilepath, fixScript);

    console.log(`📊 综合监控报告已保存:`);
    console.log(`- JSON报告: ${filepath}`);
    console.log(`- HTML报告: ${htmlFilepath}`);
    console.log(`- 修复脚本: ${fixFilepath}`);
  }

  /**
   * 生成HTML报告
   */
  generateHtmlReport() {
    const summary = this.results.summary;
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>综合监控报告 - 页面子功能与CRUD操作测试</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .metric h3 { margin: 0; font-size: 2em; }
        .metric p { margin: 5px 0 0 0; opacity: 0.9; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .test-result { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #28a745; }
        .test-result.failed { border-left-color: #dc3545; }
        .test-result.warning { border-left-color: #ffc107; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; }
        .recommendation { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #2196f3; }
        .recommendation.high { border-left-color: #f44336; }
        .recommendation.medium { border-left-color: #ff9800; }
        .recommendation.low { border-left-color: #4caf50; }
        .code-block { background: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap; }
        .progress-bar { background: #e0e0e0; height: 20px; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { background: linear-gradient(90deg, #4caf50, #8bc34a); height: 100%; transition: width 0.3s ease; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; color: white; margin: 2px; }
        .badge.success { background: #4caf50; }
        .badge.error { background: #f44336; }
        .badge.warning { background: #ff9800; }
        .badge.info { background: #2196f3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 综合监控报告</h1>
            <p>页面子功能与CRUD操作测试</p>
            <p>生成时间: ${this.results.timestamp}</p>
        </div>

        <div class="summary">
            <div class="metric">
                <h3>${summary.totalTests}</h3>
                <p>总测试数</p>
            </div>
            <div class="metric">
                <h3>${summary.passedTests}</h3>
                <p>通过测试</p>
            </div>
            <div class="metric">
                <h3>${summary.failedTests}</h3>
                <p>失败测试</p>
            </div>
            <div class="metric">
                <h3>${summary.totalIssues}</h3>
                <p>总问题数</p>
            </div>
            <div class="metric">
                <h3>${summary.crudOperationsCovered}</h3>
                <p>CRUD操作覆盖</p>
            </div>
            <div class="metric">
                <h3>${summary.subFunctionsCovered}</h3>
                <p>子功能覆盖</p>
            </div>
        </div>

        <div class="section">
            <h2>📊 测试覆盖率</h2>
            <div>
                <p>总体成功率: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%"></div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>🔧 浏览器测试结果</h2>
            ${this.results.browserTests ? `
                <div class="test-result">
                    <h3>页面测试概览</h3>
                    <p><span class="badge success">成功页面: ${this.results.browserTests.summary.successfulPages}</span></p>
                    <p><span class="badge error">失败页面: ${this.results.browserTests.summary.failedPages}</span></p>
                    <p><span class="badge warning">总错误: ${this.results.browserTests.summary.totalErrors}</span></p>
                    <p><span class="badge info">API调用: ${this.results.browserTests.summary.totalApiCalls}</span></p>
                </div>
            ` : '<p>无浏览器测试结果</p>'}
        </div>

        <div class="section">
            <h2>🔗 API对齐检测结果</h2>
            ${this.results.apiAlignment ? `
                <div class="test-result">
                    <h3>API对齐概览</h3>
                    <p><span class="badge success">成功端点: ${this.results.apiAlignment.summary.success}</span></p>
                    <p><span class="badge error">失败端点: ${this.results.apiAlignment.summary.failed}</span></p>
                    <p><span class="badge warning">严重问题: ${this.results.apiAlignment.summary.criticalIssues}</span></p>
                    <p><span class="badge info">修复建议: ${this.results.apiAlignment.fixes.length}</span></p>
                </div>
            ` : '<p>无API对齐检测结果</p>'}
        </div>

        <div class="recommendations">
            <h2>💡 综合修复建议</h2>
            ${this.results.recommendations.slice(0, 10).map((rec, index) => `
                <div class="recommendation ${rec.priority}">
                    <h4>${index + 1}. ${rec.issue}</h4>
                    <p><strong>建议:</strong> ${rec.suggestion}</p>
                    <p><strong>优先级:</strong> ${rec.priority}</p>
                    <p><strong>来源:</strong> ${rec.source}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>📈 CRUD操作分析</h2>
            <div class="test-result">
                <h3>CRUD操作覆盖情况</h3>
                <p>总覆盖数: ${summary.crudOperationsCovered}</p>
                <p>包含: 创建(Create)、读取(Read)、更新(Update)、删除(Delete)操作测试</p>
                ${summary.crudOperationsCovered < 10 ? '<p class="badge warning">建议增加CRUD操作测试覆盖</p>' : '<p class="badge success">CRUD操作覆盖良好</p>'}
            </div>
        </div>

        <div class="section">
            <h2>🎛️ 页面子功能分析</h2>
            <div class="test-result">
                <h3>页面子功能覆盖情况</h3>
                <p>总覆盖数: ${summary.subFunctionsCovered}</p>
                <p>包含: 模态框、标签页、下拉菜单、分页、搜索、筛选功能测试</p>
                ${summary.subFunctionsCovered < 15 ? '<p class="badge warning">建议增加页面子功能测试覆盖</p>' : '<p class="badge success">页面子功能覆盖良好</p>'}
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * 生成修复脚本
   */
  generateFixScript() {
    const fixes = this.results.recommendations.filter(rec => rec.source === 'api-alignment');
    
    return `
/**
 * 综合监控修复脚本
 * 生成时间: ${this.results.timestamp}
 * 
 * 使用方法:
 * 1. 复制对应的修复代码到相应文件
 * 2. 测试修复效果
 * 3. 重新运行监控脚本验证
 */

// ==================== API对齐修复 ====================

${fixes.map((fix, index) => `
// 修复 ${index + 1}: ${fix.issue}
${fix.suggestion}
`).join('\n')}

// ==================== CRUD操作优化建议 ====================

/*
建议在以下文件中增加CRUD操作测试:

1. 用户管理 (client/src/pages/system/users/index.vue)
   - 测试用户创建、编辑、删除功能
   - 验证用户状态更新功能
   - 检查用户权限分配功能

2. 学生管理 (client/src/pages/student/index.vue)
   - 测试学生信息录入功能
   - 验证学生信息修改功能
   - 检查学生档案删除功能

3. 教师管理 (client/src/pages/teacher/index.vue)
   - 测试教师信息管理功能
   - 验证教师权限分配功能
   - 检查教师课程安排功能

4. 班级管理 (client/src/pages/class/index.vue)
   - 测试班级创建功能
   - 验证班级信息修改功能
   - 检查班级解散功能
*/

// ==================== 页面子功能优化建议 ====================

/*
建议在以下页面增加子功能测试:

1. 模态框功能测试:
   - 添加数据测试ID: data-testid="modal-trigger"
   - 确保模态框正确打开和关闭
   - 验证模态框内容正确加载

2. 标签页功能测试:
   - 添加标签页切换测试
   - 验证标签页内容正确更新
   - 检查标签页状态保持

3. 分页功能测试:
   - 测试分页导航功能
   - 验证分页数据加载
   - 检查分页状态同步

4. 搜索功能测试:
   - 测试搜索关键词功能
   - 验证搜索结果正确性
   - 检查搜索历史记录

5. 筛选功能测试:
   - 测试多条件筛选
   - 验证筛选结果准确性
   - 检查筛选状态重置
*/

// ==================== 使用示例 ====================

/*
// 在Vue组件中添加测试友好的属性
<template>
  <div>
    <el-button 
      data-testid="add-user-btn"
      @click="openAddDialog"
      type="primary"
    >
      添加用户
    </el-button>
    
    <el-dialog
      data-testid="user-dialog"
      v-model="dialogVisible"
      title="用户管理"
    >
      <el-form data-testid="user-form">
        <!-- 表单内容 -->
      </el-form>
      <template #footer>
        <el-button data-testid="cancel-btn" @click="dialogVisible = false">取消</el-button>
        <el-button data-testid="confirm-btn" type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>
*/
    `.trim();
  }

  /**
   * 打印摘要
   */
  printSummary() {
    const summary = this.results.summary;
    
    console.log('\n🎯 综合监控测试摘要:');
    console.log('==========================================');
    console.log(`总测试数: ${summary.totalTests}`);
    console.log(`通过测试: ${summary.passedTests}`);
    console.log(`失败测试: ${summary.failedTests}`);
    console.log(`成功率: ${((summary.passedTests / summary.totalTests) * 100).toFixed(1)}%`);
    console.log(`总问题数: ${summary.totalIssues}`);
    console.log(`严重问题: ${summary.criticalIssues}`);
    console.log(`CRUD操作覆盖: ${summary.crudOperationsCovered}`);
    console.log(`页面子功能覆盖: ${summary.subFunctionsCovered}`);
    console.log(`修复建议数: ${this.results.recommendations.length}`);
    console.log('==========================================');
    
    // 输出关键建议
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 关键修复建议:');
      this.results.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.priority}] ${rec.issue}`);
        console.log(`   来源: ${rec.source}`);
      });
    }
  }

  /**
   * 清理资源
   */
  async cleanup() {
    if (this.errorMonitor) {
      await this.errorMonitor.cleanup();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const monitor = new ComprehensiveMonitor();
  
  monitor.runComprehensiveTest()
    .then(() => {
      console.log('\n✅ 综合监控测试完成');
      console.log('📊 详细报告已保存到 client/tests/reports/ 目录');
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('\n❌ 综合监控测试失败:', error);
      await monitor.cleanup();
      process.exit(1);
    });
}

module.exports = ComprehensiveMonitor;