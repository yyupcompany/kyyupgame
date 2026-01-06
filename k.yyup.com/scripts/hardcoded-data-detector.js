#!/usr/bin/env node

/**
 * 硬编码数据检测脚本
 * 识别Vue组件中的硬编码数据模式
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

class HardcodedDataDetector {
  constructor() {
    this.components = [];
    this.hardcodedPatterns = [
      // 静态数组数据
      {
        name: 'Static Array Data',
        pattern: /const\s+\w+\s*=\s*\[(\s*\{[^}]+\}\s*,?\s*)+\]/gm,
        severity: 'high'
      },
      // 硬编码选项列表
      {
        name: 'Hardcoded Options',
        pattern: /\[\s*\{\s*label\s*:\s*['"`][^'"`]+['"`]\s*,\s*value\s*:\s*['"`][^'"`]+['"`]/g,
        severity: 'high'
      },
      // 固定统计数据
      {
        name: 'Fixed Statistics',
        pattern: /\{\s*(total|count|stats)\s*:\s*\d+/gi,
        severity: 'medium'
      },
      // 模拟API调用
      {
        name: 'Mock API Calls',
        pattern: /\/\/.*模拟.*API|mock.*data|setTimeout.*resolve/gi,
        severity: 'high'
      },
      // 写死的配置信息
      {
        name: 'Hardcoded Config',
        pattern: /(const|let|var)\s+\w+\s*=\s*\{[^}]*apiUrl[^}]*\}|localhost|127\.0\.0\.1/gi,
        severity: 'medium'
      }
    ];
  }

  async detectComponents() {
    console.log('🔍 开始检测Vue组件中的硬编码数据...\n');

    // 查找所有Vue组件
    const vueFiles = glob.sync('client/src/components/**/*.vue');

    for (const file of vueFiles) {
      await this.analyzeFile(file);
    }

    this.generateReport();
  }

  async analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);

      const componentIssues = {
        file: relativePath,
        issues: []
      };

      // 检测每种硬编码模式
      for (const pattern of this.hardcodedPatterns) {
        const matches = content.match(pattern.pattern);
        if (matches) {
          componentIssues.issues.push({
            type: pattern.name,
            severity: pattern.severity,
            count: matches.length,
            samples: matches.slice(0, 3) // 只显示前3个样本
          });
        }
      }

      // 特殊检测：硬编码角色数据
      if (content.includes('roleOptions') && content.includes('模拟数据')) {
        componentIssues.issues.push({
          type: 'Hardcoded Role Options',
          severity: 'high',
          count: 1,
          samples: ['模拟角色选项数据']
        });
      }

      // 特殊检测：硬编码统计数据
      if (content.includes('stat-card') || content.includes('totalUsers') || content.includes('activeUsers')) {
        const fixedStats = content.match(/\d{2,}/g);
        if (fixedStats && fixedStats.length > 5) {
          componentIssues.issues.push({
            type: 'Hardcoded Statistics',
            severity: 'medium',
            count: fixedStats.length,
            samples: fixedStats.slice(0, 3)
          });
        }
      }

      if (componentIssues.issues.length > 0) {
        this.components.push(componentIssues);
      }
    } catch (error) {
      console.error(`分析文件失败: ${filePath}`, error.message);
    }
  }

  generateReport() {
    console.log('📊 硬编码数据检测报告');
    console.log('='.repeat(50));

    const totalComponents = this.components.length;
    const totalIssues = this.components.reduce((sum, comp) => sum + comp.issues.length, 0);
    const highSeverityIssues = this.components.reduce((sum, comp) =>
      sum + comp.issues.filter(issue => issue.severity === 'high').length, 0);

    console.log(`\n📈 检测统计:`);
    console.log(`- 检测组件总数: ${totalComponents}`);
    console.log(`- 发现问题总数: ${totalIssues}`);
    console.log(`- 高危问题数量: ${highSeverityIssues}`);
    console.log(`- 中危问题数量: ${totalIssues - highSeverityIssues}`);

    // 按严重程度分类
    console.log(`\n🚨 高危问题 (需要立即修复):`);
    this.components.forEach(component => {
      const highIssues = component.issues.filter(issue => issue.severity === 'high');
      if (highIssues.length > 0) {
        console.log(`\n📁 ${component.file}`);
        highIssues.forEach(issue => {
          console.log(`  ❌ ${issue.type}: ${issue.count} 处`);
          issue.samples.forEach(sample => {
            console.log(`     示例: ${sample.substring(0, 80)}...`);
          });
        });
      }
    });

    console.log(`\n⚠️  中危问题 (建议修复):`);
    this.components.forEach(component => {
      const mediumIssues = component.issues.filter(issue => issue.severity === 'medium');
      if (mediumIssues.length > 0) {
        console.log(`\n📁 ${component.file}`);
        mediumIssues.forEach(issue => {
          console.log(`  ⚡ ${issue.type}: ${issue.count} 处`);
        });
      }
    });

    // 生成改造建议
    console.log(`\n💡 改造建议:`);
    console.log('1. 创建统一的API数据获取Composable');
    console.log('2. 将硬编码数据替换为真实API调用');
    console.log('3. 添加加载状态和错误处理');
    console.log('4. 更新测试用例以支持真实API调用');

    // 保存详细报告
    const reportPath = 'HARDCODED_DATA_DETECTION_REPORT.md';
    this.saveDetailedReport(reportPath);
    console.log(`\n📄 详细报告已保存至: ${reportPath}`);
  }

  saveDetailedReport(filePath) {
    let report = `# 硬编码数据检测报告\n\n`;
    report += `生成时间: ${new Date().toISOString()}\n\n`;
    report += `## 检测统计\n\n`;
    report += `- 检测组件总数: ${this.components.length}\n`;
    report += `- 发现问题总数: ${this.components.reduce((sum, comp) => sum + comp.issues.length, 0)}\n\n`;

    report += `## 问题详情\n\n`;

    this.components.forEach(component => {
      report += `### ${component.file}\n\n`;
      component.issues.forEach(issue => {
        report += `- **${issue.type}** (${issue.severity}): ${issue.count} 处\n`;
        issue.samples.forEach(sample => {
          report += `  \`\`\`javascript\n  ${sample}\n  \`\`\`\n`;
        });
        report += '\n';
      });
    });

    fs.writeFileSync(filePath, report, 'utf8');
  }
}

// 运行检测
const detector = new HardcodedDataDetector();
detector.detectComponents().catch(console.error);