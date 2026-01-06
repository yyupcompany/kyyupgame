#!/usr/bin/env node

/**
 * CI/CD API规范检查工具
 * 用于在持续集成流程中检查API规范合规性
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CIAPIStandardsCheck {
  constructor(options = {}) {
    this.options = {
      strict: options.strict || false,
      outputFormat: options.outputFormat || 'console', // console, json, github
      failThreshold: options.failThreshold || 10 // 允许的硬编码API数量阈值
    };

    this.results = {
      hardcodedAPIs: {
        high: 0,
        medium: 0,
        low: 0,
        total: 0,
        files: []
      },
      endpointConsistency: {
        issues: [],
        total: 0
      },
      typeSafety: {
        issues: [],
        total: 0
      },
      summary: {
        passed: true,
        score: 0,
        recommendations: []
      }
    };
  }

  async run() {
    console.log('🔍 CI/CD API规范检查开始...\n');

    try {
      // 1. 检查硬编码API
      await this.checkHardcodedAPIs();

      // 2. 检查端点一致性
      await this.checkEndpointConsistency();

      // 3. 检查类型安全
      await this.checkTypeSafety();

      // 4. 生成综合评分
      this.calculateScore();

      // 5. 输出结果
      this.outputResults();

      // 6. 返回检查是否通过
      return this.results.summary.passed;

    } catch (error) {
      console.error('❌ CI检查过程中出错:', error.message);
      this.results.summary.passed = false;
      return false;
    }
  }

  /**
   * 检查硬编码API
   */
  async checkHardcodedAPIs() {
    console.log('📡 检查硬编码API...');

    // 使用已有的扫描工具
    try {
      const scanner = require('./api-hardcoded-scanner.js');
      const scanResults = await this.runScanner();

      this.results.hardcodedAPIs.total = scanResults.totalIssues;
      this.results.hardcodedAPIs.files = scanResults.details || [];

      // 按严重程度分类
      scanResults.details?.forEach(file => {
        file.issues?.forEach(issue => {
          switch (issue.severity) {
            case 'high':
              this.results.hardcodedAPIs.high++;
              break;
            case 'medium':
              this.results.hardcodedAPIs.medium++;
              break;
            case 'low':
              this.results.hardcodedAPIs.low++;
              break;
          }
        });
      });

      console.log(`  发现 ${this.results.hardcodedAPIs.total} 个硬编码API问题`);

    } catch (error) {
      console.warn('⚠️ 硬编码API检查失败:', error.message);
    }
  }

  /**
   * 运行扫描工具
   */
  async runScanner() {
    return new Promise((resolve) => {
      try {
        const output = execSync('node scripts/api-hardcoded-scanner.js', {
          encoding: 'utf8',
          cwd: process.cwd()
        });

        // 解析输出结果（简化版）
        const totalMatch = output.match(/总问题数: (\d+)/);
        const totalIssues = totalMatch ? parseInt(totalMatch[1]) : 0;

        resolve({
          totalIssues,
          details: []
        });
      } catch (error) {
        resolve({
          totalIssues: 0,
          details: []
        });
      }
    });
  }

  /**
   * 检查端点一致性
   */
  async checkEndpointConsistency() {
    console.log('🔄 检查端点一致性...');

    try {
      const endpointFiles = [
        'client/src/api/endpoints/auth.ts',
        'client/src/api/endpoints/activity.ts',
        'client/src/api/endpoints/marketing.ts',
        'client/src/api/endpoints/user.ts'
      ];

      for (const file of endpointFiles) {
        await this.checkEndpointFile(file);
      }

      console.log(`  发现 ${this.results.endpointConsistency.total} 个端点一致性问题`);

    } catch (error) {
      console.warn('⚠️ 端点一致性检查失败:', error.message);
    }
  }

  /**
   * 检查单个端点文件
   */
  async checkEndpointFile(filePath) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      this.results.endpointConsistency.issues.push({
        file: filePath,
        issue: '端点文件不存在',
        severity: 'high'
      });
      this.results.endpointConsistency.total++;
      return;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      // 检查基本结构
      if (!content.includes('export const')) {
        this.results.endpointConsistency.issues.push({
          file: filePath,
          issue: '缺少端点导出',
          severity: 'high'
        });
        this.results.endpointConsistency.total++;
      }

      // 检查API_PREFIX定义
      if (!content.includes('API_PREFIX')) {
        this.results.endpointConsistency.issues.push({
          file: filePath,
          issue: '缺少API_PREFIX定义',
          severity: 'medium'
        });
        this.results.endpointConsistency.total++;
      }

      // 检查类型定义
      if (!content.includes('as const')) {
        this.results.endpointConsistency.issues.push({
          file: filePath,
          issue: '缺少类型定义',
          severity: 'medium'
        });
        this.results.endpointConsistency.total++;
      }

    } catch (error) {
      this.results.endpointConsistency.issues.push({
        file: filePath,
        issue: `读取文件失败: ${error.message}`,
        severity: 'high'
      });
      this.results.endpointConsistency.total++;
    }
  }

  /**
   * 检查类型安全
   */
  async checkTypeSafety() {
    console.log('🔒 检查类型安全...');

    try {
      // 检查是否有TypeScript类型定义
      const apiTypes = [
        'client/src/api/types/common.ts',
        'client/src/api/types/auth.ts',
        'client/src/api/types/activity.ts',
        'client/src/api/types/marketing.ts'
      ];

      for (const typeFile of apiTypes) {
        await this.checkTypeFile(typeFile);
      }

      console.log(`  发现 ${this.results.typeSafety.total} 个类型安全问题`);

    } catch (error) {
      console.warn('⚠️ 类型安全检查失败:', error.message);
    }
  }

  /**
   * 检查类型文件
   */
  async checkTypeFile(filePath) {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
      this.results.typeSafety.issues.push({
        file: filePath,
        issue: '类型定义文件不存在',
        severity: 'medium'
      });
      this.results.typeSafety.total++;
      return;
    }

    try {
      const content = fs.readFileSync(fullPath, 'utf8');

      // 检查基本类型定义
      if (!content.includes('interface') && !content.includes('type')) {
        this.results.typeSafety.issues.push({
          file: filePath,
          issue: '缺少类型定义',
          severity: 'medium'
        });
        this.results.typeSafety.total++;
      }

      // 检查导出
      if (!content.includes('export')) {
        this.results.typeSafety.issues.push({
          file: filePath,
          issue: '缺少类型导出',
          severity: 'low'
        });
        this.results.typeSafety.total++;
      }

    } catch (error) {
      this.results.typeSafety.issues.push({
        file: filePath,
        issue: `读取类型文件失败: ${error.message}`,
        severity: 'medium'
      });
      this.results.typeSafety.total++;
    }
  }

  /**
   * 计算综合评分
   */
  calculateScore() {
    let score = 100;

    // 硬编码API扣分
    score -= Math.min(this.results.hardcodedAPIs.total * 2, 40);

    // 端点一致性扣分
    score -= Math.min(this.results.endpointConsistency.total * 5, 30);

    // 类型安全扣分
    score -= Math.min(this.results.typeSafety.total * 3, 20);

    // 高严重性问题额外扣分
    score -= this.results.hardcodedAPIs.high * 5;
    score -= this.results.endpointConsistency.issues.filter(i => i.severity === 'high').length * 10;

    this.results.summary.score = Math.max(0, Math.round(score));

    // 检查是否通过
    const aboveThreshold = this.results.hardcodedAPIs.total <= this.options.failThreshold;
    const noHighSeverity = this.results.hardcodedAPIs.high === 0;
    const scoreAboveMinimum = this.results.summary.score >= 70;

    this.results.summary.passed = aboveThreshold && noHighSeverity && scoreAboveMinimum;

    // 生成建议
    this.generateRecommendations();
  }

  /**
   * 生成改进建议
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.results.hardcodedAPIs.total > 0) {
      recommendations.push('使用 `npm run api:hardcode:fix:apply` 修复硬编码API');
    }

    if (this.results.hardcodedAPIs.high > 0) {
      recommendations.push('优先修复高严重性的硬编码API问题');
    }

    if (this.results.endpointConsistency.total > 0) {
      recommendations.push('完善端点配置文件，确保一致性和类型安全');
    }

    if (this.results.typeSafety.total > 0) {
      recommendations.push('补充API类型定义，提高类型安全性');
    }

    if (this.results.summary.score < 80) {
      recommendations.push('建立代码审查流程，防止新的硬编码API');
    }

    this.results.summary.recommendations = recommendations;
  }

  /**
   * 输出检查结果
   */
  outputResults() {
    console.log('\n📊 API规范检查结果:');
    console.log('='.repeat(50));

    // 基本统计
    console.log(`🔢 综合评分: ${this.results.summary.score}/100`);
    console.log(`📡 硬编码API: ${this.results.hardcodedAPIs.total} 个 (高: ${this.results.hardcodedAPIs.high}, 中: ${this.results.hardcodedAPIs.medium}, 低: ${this.results.hardcodedAPIs.low})`);
    console.log(`🔄 端点一致性: ${this.results.endpointConsistency.total} 个问题`);
    console.log(`🔒 类型安全: ${this.results.typeSafety.total} 个问题`);

    // 检查结果
    const status = this.results.summary.passed ? '✅ 通过' : '❌ 失败';
    console.log(`\n${status} API规范检查${this.results.summary.passed ? '通过' : '未通过'}`);

    // 详细问题
    if (this.results.hardcodedAPIs.high > 0) {
      console.log('\n🚨 高严重性问题:');
      this.results.hardcodedAPIs.files.slice(0, 5).forEach(file => {
        const highIssues = file.issues?.filter(i => i.severity === 'high') || [];
        if (highIssues.length > 0) {
          console.log(`  ${file.file}: ${highIssues.length} 个高严重性问题`);
        }
      });
    }

    // 改进建议
    if (this.results.summary.recommendations.length > 0) {
      console.log('\n💡 改进建议:');
      this.results.summary.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    // GitHub Actions输出格式
    if (this.options.outputFormat === 'github') {
      this.outputGitHubFormat();
    }

    // JSON格式输出
    if (this.options.outputFormat === 'json') {
      console.log('\n📄 详细结果 (JSON):');
      console.log(JSON.stringify(this.results, null, 2));
    }
  }

  /**
   * GitHub Actions格式输出
   */
  outputGitHubFormat() {
    console.log('\n🔧 GitHub Actions输出:');

    // 输出评分
    console.log(`::set-output name=score::${this.results.summary.score}`);
    console.log(`::set-output name=passed::${this.results.summary.passed}`);
    console.log(`::set-output name=hardcoded-apis::${this.results.hardcodedAPIs.total}`);

    // 输出问题注释
    if (!this.results.summary.passed) {
      console.log('::error::API规范检查未通过，请查看详细报告');
    }

    // 输出警告
    if (this.results.hardcodedAPIs.total > 0 && this.results.hardcodedAPIs.total <= this.options.failThreshold) {
      console.log(`::warning::发现 ${this.results.hardcodedAPIs.total} 个硬编码API，建议修复`);
    }
  }
}

// 命令行接口
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    strict: args.includes('--strict'),
    outputFormat: args.includes('--json') ? 'json' : (args.includes('--github') ? 'github' : 'console'),
    failThreshold: parseInt(args.find(arg => arg.startsWith('--threshold='))?.split('=')[1]) || 10
  };

  const checker = new CIAPIStandardsCheck(options);
  checker.run()
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ CI检查失败:', error);
      process.exit(1);
    });
}

module.exports = CIAPIStandardsCheck;