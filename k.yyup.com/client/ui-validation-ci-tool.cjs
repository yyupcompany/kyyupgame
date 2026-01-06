#!/usr/bin/env node

/**
 * UI组件验证CI工具
 * 用于在CI/CD流程中自动验证UI组件质量
 */

const fs = require('fs');
const path = require('path');

class CIValidationTool {
  constructor() {
    this.thresholds = {
      // 质量阈值设置
      overallScore: 70,        // 整体最低得分
      passRate: 80,            // 最低通过率
      criticalCategoryScore: 65, // 关键类别最低得分
      maxCriticalIssues: 3     // 最多关键问题数量
    };

    this.criticalCategories = ['center', 'system']; // 关键业务类别
  }

  /**
   * 运行CI验证
   */
  async runCIValidation() {
    console.log('🚀 开始CI/CD UI组件验证...\n');

    const reportPath = path.resolve('ui-component-validation-report.json');

    if (!fs.existsSync(reportPath)) {
      console.log('❌ 未找到验证报告，正在生成...');

      // 运行验证
      const { spawn } = require('child_process');
      await new Promise((resolve, reject) => {
        const process = spawn('node', ['validate-ui-components.cjs'], {
          stdio: 'inherit'
        });

        process.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`验证脚本执行失败，退出码: ${code}`));
          }
        });
      });
    }

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    const result = this.evaluateCIResults(report);

    this.generateCIReport(result);

    if (result.passed) {
      console.log('\n✅ CI验证通过！');
      process.exit(0);
    } else {
      console.log('\n❌ CI验证失败！');
      console.log('请修复上述问题后重新提交。');
      process.exit(1);
    }
  }

  /**
   * 评估CI结果
   */
  evaluateCIResults(report) {
    const result = {
      passed: true,
      overallScore: report.summary.overallScore,
      passRate: report.summary.passRate,
      issues: [],
      categoryStats: report.categoryStats,
      criticalIssues: []
    };

    // 检查整体得分
    if (result.overallScore < this.thresholds.overallScore) {
      result.passed = false;
      result.issues.push({
        type: 'score',
        severity: 'high',
        message: `整体得分 ${result.overallScore} 低于阈值 ${this.thresholds.overallScore}`
      });
    }

    // 检查通过率
    if (result.passRate < this.thresholds.passRate) {
      result.passed = false;
      result.issues.push({
        type: 'passRate',
        severity: 'high',
        message: `通过率 ${result.passRate}% 低于阈值 ${this.thresholds.passRate}%`
      });
    }

    // 检查关键类别得分
    for (const category of this.criticalCategories) {
      if (result.categoryStats && result.categoryStats[category]) {
        const score = result.categoryStats[category].avgScore;
        if (score < this.thresholds.criticalCategoryScore) {
          result.passed = false;
          result.issues.push({
            type: 'categoryScore',
            severity: 'high',
            category,
            message: `${category}组件平均得分 ${score} 低于阈值 ${this.thresholds.criticalCategoryScore}`
          });
        }
      }
    }

    // 检查关键问题组件
    const criticalComponents = report.components.filter(c =>
      c.score < 50 && this.criticalCategories.includes(c.category)
    );

    if (criticalComponents.length > this.thresholds.maxCriticalIssues) {
      result.passed = false;
      result.criticalIssues = criticalComponents.map(c => ({
        path: c.path,
        score: c.score,
        issues: c.issues
      }));

      result.issues.push({
        type: 'criticalComponents',
        severity: 'critical',
        message: `发现 ${criticalComponents.length} 个严重问题组件，超过阈值 ${this.thresholds.maxCriticalIssues}`
      });
    }

    return result;
  }

  /**
   * 生成CI报告
   */
  generateCIReport(result) {
    console.log('\n' + '='.repeat(60));
    console.log('🔍 CI/CD UI组件验证报告');
    console.log('='.repeat(60));

    // 基本指标
    console.log(`\n📊 质量指标:`);
    console.log(`   整体得分: ${result.overallScore}/100 (阈值: ${this.thresholds.overallScore})`);
    console.log(`   通过率: ${result.passRate}% (阈值: ${this.thresholds.passRate}%)`);

    // 类别得分
    console.log(`\n📋 分类得分:`);
    Object.entries(result.categoryStats).forEach(([category, stats]) => {
      const categoryNames = {
        center: '中心组件',
        system: '系统组件',
        activity: '活动组件'
      };

      const isCritical = this.criticalCategories.includes(category);
      const threshold = this.thresholds.criticalCategoryScore;
      const status = stats.avgScore >= threshold ? '✅' : '❌';

      console.log(`   ${status} ${categoryNames[category]}: ${stats.avgScore}/100${isCritical ? ` (阈值: ${threshold})` : ''}`);
    });

    // 问题列表
    if (result.issues.length > 0) {
      console.log(`\n⚠️  发现的问题 (${result.issues.length}个):`);

      result.issues.forEach((issue, index) => {
        const severityIcons = {
          critical: '🚨',
          high: '❌',
          medium: '⚠️',
          low: 'ℹ️'
        };

        console.log(`\n   ${severityIcons[issue.severity]} ${index + 1}. ${issue.message}`);

        if (issue.category) {
          console.log(`      类别: ${issue.category}`);
        }
      });
    }

    // 严重问题组件详情
    if (result.criticalIssues.length > 0) {
      console.log(`\n🚨 严重问题组件详情:`);

      result.criticalIssues.forEach(component => {
        console.log(`\n   📁 ${component.path} (得分: ${component.score})`);
        component.issues.forEach(issue => {
          console.log(`      • ${issue}`);
        });
      });
    }

    // 质量评级
    let qualityGrade = '';
    if (result.overallScore >= 90) qualityGrade = 'A+ 🏆';
    else if (result.overallScore >= 85) qualityGrade = 'A 👍';
    else if (result.overallScore >= 80) qualityGrade = 'B+ ✅';
    else if (result.overallScore >= 70) qualityGrade = 'B ⚠️';
    else if (result.overallScore >= 60) qualityGrade = 'C ⚠️';
    else qualityGrade = 'D ❌';

    console.log(`\n🎯 质量评级: ${qualityGrade}`);
    console.log(`   CI状态: ${result.passed ? '✅ 通过' : '❌ 失败'}`);

    // 生成CI输出文件
    this.generateCIOutput(result);
  }

  /**
   * 生成CI输出文件
   */
  generateCIOutput(result) {
    // GitHub Actions输出
    const githubOutput = {
      summary: {
        title: 'UI组件验证结果',
        overallScore: result.overallScore,
        passRate: result.passRate,
        qualityGrade: result.overallScore >= 90 ? 'A+' :
                     result.overallScore >= 85 ? 'A' :
                     result.overallScore >= 80 ? 'B+' :
                     result.overallScore >= 70 ? 'B' :
                     result.overallScore >= 60 ? 'C' : 'D',
        status: result.passed ? 'passed' : 'failed'
      },
      metrics: {
        'ui-components-score': result.overallScore,
        'ui-components-pass-rate': result.passRate,
        'center-components-score': result.categoryStats.center?.avgScore || 0,
        'system-components-score': result.categoryStats.system?.avgScore || 0,
        'activity-components-score': result.categoryStats.activity?.avgScore || 0
      },
      issues: result.issues,
      criticalComponents: result.criticalIssues
    };

    // 写入GitHub Actions输出
    fs.writeFileSync('ui-validation-github-output.json', JSON.stringify(githubOutput, null, 2));

    // 生成Markdown报告
    const markdownReport = this.generateMarkdownReport(result);
    fs.writeFileSync('ui-validation-report.md', markdownReport);

    console.log(`\n📄 报告文件已生成:`);
    console.log(`   • GitHub Actions: ui-validation-github-output.json`);
    console.log(`   • Markdown报告: ui-validation-report.md`);
  }

  /**
   * 生成Markdown报告
   */
  generateMarkdownReport(result) {
    const timestamp = new Date().toLocaleString('zh-CN');

    let markdown = `# UI组件验证报告\n\n`;
    markdown += `**生成时间**: ${timestamp}\n\n`;
    markdown += `## 📊 质量概览\n\n`;
    markdown += `- **整体得分**: ${result.overallScore}/100\n`;
    markdown += `- **通过率**: ${result.passRate}%\n`;
    markdown += `- **验证状态**: ${result.passed ? '✅ 通过' : '❌ 失败'}\n\n`;

    markdown += `## 📋 分类得分\n\n`;
    markdown += `| 类别 | 平均分 | 总数 | 通过 | 状态 |\n`;
    markdown += `|------|--------|------|------|------|\n`;

    Object.entries(result.categoryStats).forEach(([category, stats]) => {
      const categoryNames = {
        center: '中心组件',
        system: '系统组件',
        activity: '活动组件'
      };

      const isCritical = this.criticalCategories.includes(category);
      const threshold = this.thresholds.criticalCategoryScore;
      const status = stats.avgScore >= threshold ? '✅' : '❌';

      markdown += `| ${categoryNames[category]} | ${stats.avgScore}/100 | ${stats.total} | ${stats.passed} | ${status}${isCritical ? ` (≥${threshold})` : ''} |\n`;
    });

    if (result.issues.length > 0) {
      markdown += `\n## ⚠️ 发现的问题\n\n`;
      result.issues.forEach((issue, index) => {
        const severityEmojis = {
          critical: '🚨',
          high: '❌',
          medium: '⚠️',
          low: 'ℹ️'
        };
        markdown += `### ${index + 1}. ${severityEmojis[issue.severity]} ${issue.message}\n\n`;

        if (issue.category) {
          markdown += `- **类别**: ${issue.category}\n`;
        }
        markdown += `- **严重程度**: ${issue.severity}\n\n`;
      });
    }

    if (result.criticalIssues.length > 0) {
      markdown += `\n## 🚨 严重问题组件\n\n`;
      result.criticalIssues.forEach(component => {
        markdown += `### ${component.path}\n\n`;
        markdown += `- **得分**: ${component.score}/100\n`;
        markdown += `- **问题**:\n`;
        component.issues.forEach(issue => {
          markdown += `  - ${issue}\n`;
        });
        markdown += `\n`;
      });
    }

    markdown += `\n---\n*报告由自动化工具生成*`;

    return markdown;
  }

  /**
   * 更新质量阈值
   */
  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  /**
   * 添加关键类别
   */
  addCriticalCategory(category) {
    if (!this.criticalCategories.includes(category)) {
      this.criticalCategories.push(category);
    }
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  const tool = new CIValidationTool();

  // 解析命令行参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--threshold-score') {
      tool.updateThresholds({ overallScore: parseInt(args[++i]) });
    } else if (arg === '--threshold-pass-rate') {
      tool.updateThresholds({ passRate: parseInt(args[++i]) });
    } else if (arg === '--critical-category') {
      tool.addCriticalCategory(args[++i]);
    } else if (arg === '--help') {
      console.log(`
UI组件验证CI工具

用法: node ui-validation-ci-tool.cjs [选项]

选项:
  --threshold-score <数字>     设置整体得分阈值 (默认: 70)
  --threshold-pass-rate <数字> 设置通过率阈值 (默认: 80)
  --critical-category <名称>   添加关键类别 (默认: center,system)
  --help                       显示帮助信息

示例:
  node ui-validation-ci-tool.cjs
  node ui-validation-ci-tool.cjs --threshold-score 80 --critical-category activity
      `);
      process.exit(0);
    }
  }

  await tool.runCIValidation();
}

if (require.main === module) {
  main().catch(error => {
    console.error('CI验证失败:', error.message);
    process.exit(1);
  });
}

module.exports = CIValidationTool;