#!/usr/bin/env node

/**
 * 运行全面回归测试并生成错误报告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('🧪 开始全面回归测试');
console.log('========================================\n');

// 确保截图目录存在
const screenshotDir = path.join(__dirname, '../client/tests/e2e/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

// 运行Playwright测试
console.log('📋 运行Playwright E2E测试...\n');

try {
  // 运行测试并捕获输出
  const testOutput = execSync(
    'cd client && npx playwright test tests/e2e/regression-test-all-pages.spec.ts --reporter=json',
    { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer
      stdio: 'pipe'
    }
  );
  
  console.log('✅ 测试执行完成\n');
  
  // 解析测试结果
  const reportPath = path.join(__dirname, '../client/test-results.json');
  if (fs.existsSync(reportPath)) {
    const testResults = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));
    generateErrorReport(testResults);
  } else {
    console.log('⚠️  未找到测试结果文件，生成基础报告...\n');
    generateBasicReport();
  }
  
} catch (error) {
  console.error('❌ 测试执行失败:', error.message);
  
  // 即使测试失败也生成报告
  generateBasicReport();
}

function generateErrorReport(testResults) {
  console.log('\n========================================');
  console.log('📊 生成错误报告');
  console.log('========================================\n');
  
  const errors = [];
  const warnings = [];
  const passed = [];
  
  // 分析测试结果
  if (testResults.suites) {
    testResults.suites.forEach(suite => {
      suite.specs.forEach(spec => {
        spec.tests.forEach(test => {
          const testInfo = {
            name: spec.title,
            status: test.status,
            duration: test.results[0]?.duration || 0,
            error: test.results[0]?.error?.message || null
          };
          
          if (test.status === 'failed') {
            errors.push(testInfo);
          } else if (test.status === 'skipped') {
            warnings.push(testInfo);
          } else if (test.status === 'passed') {
            passed.push(testInfo);
          }
        });
      });
    });
  }
  
  // 生成Markdown报告
  const reportContent = generateMarkdownReport(errors, warnings, passed);
  
  // 保存报告
  const reportPath = path.join(__dirname, '../错误记录文档001.md');
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  
  console.log(`\n✅ 错误报告已生成: ${reportPath}`);
  console.log(`\n📊 测试统计:`);
  console.log(`   通过: ${passed.length}`);
  console.log(`   失败: ${errors.length}`);
  console.log(`   跳过: ${warnings.length}`);
  console.log(`   总计: ${passed.length + errors.length + warnings.length}\n`);
}

function generateBasicReport() {
  console.log('\n========================================');
  console.log('📊 生成基础错误报告');
  console.log('========================================\n');
  
  const reportContent = `# 幼儿园管理系统 - 回归测试错误记录

## 测试信息

- **测试日期**: ${new Date().toLocaleString('zh-CN')}
- **测试类型**: 全面回归测试
- **测试范围**: 所有侧边栏页面 + CRUD功能
- **测试工具**: Playwright E2E

## 测试执行状态

⚠️ 测试执行过程中遇到问题，请查看详细日志。

## 建议

1. 检查服务是否正常运行 (\`npm run status\`)
2. 确保数据库连接正常
3. 查看浏览器控制台错误
4. 重新运行测试: \`npm run test:regression\`

## 下一步

- [ ] 修复测试环境问题
- [ ] 重新运行完整测试
- [ ] 分析错误日志
- [ ] 修复发现的问题

---

*报告生成时间: ${new Date().toISOString()}*
`;
  
  const reportPath = path.join(__dirname, '../错误记录文档001.md');
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  
  console.log(`\n✅ 基础报告已生成: ${reportPath}\n`);
}

function generateMarkdownReport(errors, warnings, passed) {
  const totalTests = errors.length + warnings.length + passed.length;
  const passRate = totalTests > 0 ? ((passed.length / totalTests) * 100).toFixed(2) : 0;
  
  let report = `# 幼儿园管理系统 - 回归测试错误记录

## 📋 测试概览

- **测试日期**: ${new Date().toLocaleString('zh-CN')}
- **测试类型**: 全面回归测试
- **测试范围**: 所有侧边栏页面 + CRUD功能
- **测试工具**: Playwright E2E

## 📊 测试统计

| 指标 | 数量 | 百分比 |
|------|------|--------|
| ✅ 通过 | ${passed.length} | ${passRate}% |
| ❌ 失败 | ${errors.length} | ${totalTests > 0 ? ((errors.length / totalTests) * 100).toFixed(2) : 0}% |
| ⚠️ 跳过 | ${warnings.length} | ${totalTests > 0 ? ((warnings.length / totalTests) * 100).toFixed(2) : 0}% |
| 📝 总计 | ${totalTests} | 100% |

## 🎯 测试结果评级

`;

  if (passRate >= 95) {
    report += `**评级**: 🌟🌟🌟🌟🌟 优秀 (${passRate}%)\n\n`;
  } else if (passRate >= 85) {
    report += `**评级**: 🌟🌟🌟🌟 良好 (${passRate}%)\n\n`;
  } else if (passRate >= 70) {
    report += `**评级**: 🌟🌟🌟 中等 (${passRate}%)\n\n`;
  } else if (passRate >= 50) {
    report += `**评级**: 🌟🌟 较差 (${passRate}%)\n\n`;
  } else {
    report += `**评级**: 🌟 需要改进 (${passRate}%)\n\n`;
  }

  // 错误详情
  if (errors.length > 0) {
    report += `## ❌ 失败的测试 (${errors.length})\n\n`;
    
    // 按类别分组
    const errorsByCategory = {};
    errors.forEach(error => {
      const category = error.name.split(':')[0].trim();
      if (!errorsByCategory[category]) {
        errorsByCategory[category] = [];
      }
      errorsByCategory[category].push(error);
    });
    
    Object.keys(errorsByCategory).forEach(category => {
      report += `### ${category}\n\n`;
      errorsByCategory[category].forEach((error, index) => {
        report += `#### ${index + 1}. ${error.name}\n\n`;
        report += `- **状态**: ❌ 失败\n`;
        report += `- **耗时**: ${error.duration}ms\n`;
        if (error.error) {
          report += `- **错误信息**:\n\`\`\`\n${error.error}\n\`\`\`\n\n`;
        }
      });
    });
  }

  // 警告详情
  if (warnings.length > 0) {
    report += `## ⚠️ 跳过的测试 (${warnings.length})\n\n`;
    warnings.forEach((warning, index) => {
      report += `${index + 1}. ${warning.name}\n`;
    });
    report += `\n`;
  }

  // 通过的测试摘要
  if (passed.length > 0) {
    report += `## ✅ 通过的测试 (${passed.length})\n\n`;
    
    // 按类别统计
    const passedByCategory = {};
    passed.forEach(test => {
      const category = test.name.split(':')[0].trim();
      if (!passedByCategory[category]) {
        passedByCategory[category] = 0;
      }
      passedByCategory[category]++;
    });
    
    Object.keys(passedByCategory).forEach(category => {
      report += `- **${category}**: ${passedByCategory[category]} 个测试通过\n`;
    });
    report += `\n`;
  }

  // 问题分类统计
  report += `## 📈 问题分类统计\n\n`;
  
  const issueCategories = {
    '页面访问': 0,
    '页面加载': 0,
    'CRUD功能': 0,
    '控制台错误': 0,
    '其他': 0
  };
  
  errors.forEach(error => {
    let categorized = false;
    Object.keys(issueCategories).forEach(category => {
      if (error.name.includes(category)) {
        issueCategories[category]++;
        categorized = true;
      }
    });
    if (!categorized) {
      issueCategories['其他']++;
    }
  });
  
  report += `| 问题类型 | 数量 |\n`;
  report += `|---------|------|\n`;
  Object.keys(issueCategories).forEach(category => {
    if (issueCategories[category] > 0) {
      report += `| ${category} | ${issueCategories[category]} |\n`;
    }
  });
  report += `\n`;

  // 建议和下一步
  report += `## 💡 修复建议\n\n`;
  
  if (errors.length > 0) {
    report += `### 优先级排序\n\n`;
    report += `1. **Critical (严重)**: 页面无法访问、登录失败\n`;
    report += `2. **High (高)**: CRUD功能缺失、页面加载超时\n`;
    report += `3. **Medium (中)**: 控制台错误、UI问题\n`;
    report += `4. **Low (低)**: 样式问题、性能优化\n\n`;
    
    report += `### 具体建议\n\n`;
    
    if (issueCategories['页面访问'] > 0) {
      report += `- 🔴 **页面访问问题**: 检查路由配置和权限设置\n`;
    }
    if (issueCategories['CRUD功能'] > 0) {
      report += `- 🟠 **CRUD功能问题**: 检查按钮配置和API接口\n`;
    }
    if (issueCategories['控制台错误'] > 0) {
      report += `- 🟡 **控制台错误**: 检查JavaScript错误和API调用\n`;
    }
    
    report += `\n`;
  }

  report += `## 📝 下一步行动\n\n`;
  report += `- [ ] 修复所有Critical级别的问题\n`;
  report += `- [ ] 修复所有High级别的问题\n`;
  report += `- [ ] 重新运行回归测试验证修复\n`;
  report += `- [ ] 更新测试用例覆盖新功能\n`;
  report += `- [ ] 优化测试执行时间\n\n`;

  report += `## 📸 测试截图\n\n`;
  report += `测试截图保存在: \`client/tests/e2e/screenshots/\`\n\n`;

  report += `---\n\n`;
  report += `*报告生成时间: ${new Date().toISOString()}*\n`;
  report += `*测试工具: Playwright ${require('playwright').version || 'latest'}*\n`;

  return report;
}

console.log('\n✅ 回归测试脚本执行完成\n');

