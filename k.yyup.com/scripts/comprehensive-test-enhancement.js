#!/usr/bin/env node

/**
 * 综合测试增强脚本
 *
 * 这个脚本将：
 * 1. 扫描所有测试文件
 * 2. 为缺少控制台错误检测的文件添加检测
 * 3. 识别需要边界值测试的关键模块
 * 4. 生成测试增强报告
 * 5. 创建测试覆盖率改进计划
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

console.log('🚀 开始综合测试增强...');

// 配置
const TEST_PATTERNS = [
  'client/tests/unit/**/*.test.ts',
  'client/tests/integration/**/*.test.ts',
  'server/tests/unit/**/*.test.ts',
  'server/tests/integration/**/*.test.ts'
];

// 关键模块模式
const CRITICAL_MODULES = [
  'client/tests/unit/api/modules/*.test.ts',
  'client/tests/unit/components/*.test.ts',
  'client/tests/unit/utils/*.test.ts',
  'server/tests/unit/controllers/*.test.ts',
  'server/tests/unit/models/*.test.ts',
  'server/tests/unit/services/*.test.ts'
];

// 统计数据
const stats = {
  totalFiles: 0,
  filesWithConsoleMonitoring: 0,
  filesWithoutConsoleMonitoring: 0,
  criticalModules: 0,
  enhancedFiles: 0,
  boundaryTestCandidates: [],
  errorRecoveryCandidates: []
};

// 分析单个文件
function analyzeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(process.cwd(), filePath);

    stats.totalFiles++;

    const hasConsoleMonitoring = content.includes('startConsoleMonitoring') ||
                                 content.includes('expectNoConsoleErrors') ||
                                 content.includes('consoleMonitoring');

    if (hasConsoleMonitoring) {
      stats.filesWithConsoleMonitoring++;
    } else {
      stats.filesWithoutConsoleMonitoring++;
      console.log(`⚠️  缺少控制台错误检测: ${relativePath}`);
    }

    // 检查是否是关键模块
    const isCriticalModule = CRITICAL_MODULES.some(pattern =>
      filePath.includes(pattern.replace('**/', '').replace('*.test.ts', ''))
    );

    if (isCriticalModule) {
      stats.criticalModules++;

      // 检查是否需要边界值测试
      const needsBoundaryTest = !content.includes('boundary') &&
                                !content.includes('边界值') &&
                                !content.includes('edge case');

      if (needsBoundaryTest) {
        stats.boundaryTestCandidates.push(relativePath);
      }

      // 检查是否需要错误恢复测试
      const needsErrorRecovery = !content.includes('recovery') &&
                                 !content.includes('错误恢复') &&
                                 !content.includes('error handling');

      if (needsErrorRecovery) {
        stats.errorRecoveryCandidates.push(relativePath);
      }
    }

    const needsBoundaryTest = isCriticalModule &&
      !content.includes('boundary') &&
      !content.includes('边界值') &&
      !content.includes('edge case');

    const needsErrorRecovery = isCriticalModule &&
      !content.includes('recovery') &&
      !content.includes('错误恢复') &&
      !content.includes('error handling');

    return {
      path: relativePath,
      hasConsoleMonitoring,
      isCriticalModule,
      needsBoundaryTest,
      needsErrorRecovery
    };

  } catch (error) {
    console.log(`❌ 分析文件失败: ${filePath} - ${error.message}`);
    return null;
  }
}

// 生成测试增强报告
function generateReport() {
  const report = `
# 幼儿园管理系统 - 测试增强报告

## 📊 当前状态概览

### 文件统计
- **总测试文件数**: ${stats.totalFiles}
- **已有控制台错误检测**: ${stats.filesWithConsoleMonitoring}
- **缺少控制台错误检测**: ${stats.filesWithoutConsoleMonitoring}
- **关键模块数**: ${stats.criticalModules}

### 控制台错误检测覆盖率
- **覆盖率**: ${((stats.filesWithConsoleMonitoring / stats.totalFiles) * 100).toFixed(1)}%
- **目标**: 100%
- **差距**: ${stats.filesWithoutConsoleMonitoring} 个文件需要增强

## 🎯 测试增强优先级

### P0级: 控制台错误检测覆盖 (立即执行)
需要为以下文件添加控制台错误检测：
${stats.filesWithoutConsoleMonitoring > 0 ?
  stats.filesWithoutConsoleMonitoring + ' 个文件' :
  '✅ 所有文件都已覆盖'
}

### P1级: 边界值测试补充
以下关键模块需要边界值测试：
${stats.boundaryTestCandidates.length > 0 ?
  stats.boundaryTestCandidates.slice(0, 10).map(f => `- ${f}`).join('\n') +
  (stats.boundaryTestCandidates.length > 10 ? `\n... 还有 ${stats.boundaryTestCandidates.length - 10} 个文件` : '') :
  '✅ 所有关键模块都有边界值测试'
}

### P2级: 错误恢复机制测试
以下模块需要错误恢复测试：
${stats.errorRecoveryCandidates.length > 0 ?
  stats.errorRecoveryCandidates.slice(0, 10).map(f => `- ${f}`).join('\n') +
  (stats.errorRecoveryCandidates.length > 10 ? `\n... 还有 ${stats.errorRecoveryCandidates.length - 10} 个文件` : '') :
  '✅ 所有关键模块都有错误恢复测试'
}

## 🛠️ 自动化工具

### 1. 批量添加控制台错误检测
\`\`\`bash
node scripts/add-console-monitoring.js "pattern"
\`\`\`

### 2. 使用边界值测试模板
复制 \`templates/boundary-test-template.ts\` 到新测试文件

### 3. 使用错误恢复测试模板
复制 \`templates/error-recovery-test-template.ts\` 到新测试文件

## 📈 预期改进效果

实施这些增强后，预期达到：
- **控制台错误检测覆盖率**: 100%
- **边界值测试覆盖**: 所有关键模块
- **错误恢复测试覆盖**: 所有关键模块
- **整体测试质量**: 显著提升
- **生产环境稳定性**: 大幅改善

## 🚀 下一步行动计划

1. **立即执行**: 使用脚本为所有文件添加控制台错误检测
2. **本周内**: 为关键模块添加边界值测试
3. **下周内**: 实施错误恢复机制测试
4. **持续监控**: 定期检查测试覆盖率和质量

---

*报告生成时间: ${new Date().toLocaleString()}*
*生成工具: 综合测试增强脚本*
`;

  return report;
}

// 生成测试增强计划
function generateEnhancementPlan() {
  const plan = {
    consoleMonitoring: {
      priority: 'P0',
      files: stats.filesWithoutConsoleMonitoring,
      estimatedHours: stats.filesWithoutConsoleMonitoring * 0.5,
      tooling: 'scripts/add-console-monitoring.js'
    },
    boundaryTesting: {
      priority: 'P1',
      files: stats.boundaryTestCandidates.length,
      estimatedHours: stats.boundaryTestCandidates.length * 2,
      template: 'templates/boundary-test-template.ts'
    },
    errorRecovery: {
      priority: 'P2',
      files: stats.errorRecoveryCandidates.length,
      estimatedHours: stats.errorRecoveryCandidates.length * 3,
      template: 'templates/error-recovery-test-template.ts'
    }
  };

  const totalEstimatedHours = Object.values(plan).reduce((sum, item) => sum + item.estimatedHours, 0);

  const planContent = `
# 测试增强实施计划

## 📋 工作量估算

| 任务类型 | 优先级 | 文件数量 | 预估工时 | 工具/模板 |
|---------|--------|----------|----------|----------|
| 控制台错误检测 | P0 | ${plan.consoleMonitoring.files} | ${plan.consoleMonitoring.estimatedHours}h | ${plan.consoleMonitoring.tooling} |
| 边界值测试 | P1 | ${plan.boundaryTesting.files} | ${plan.boundaryTesting.estimatedHours}h | ${plan.boundaryTesting.template} |
| 错误恢复测试 | P2 | ${plan.errorRecovery.files} | ${plan.errorRecovery.estimatedHours}h | ${plan.errorRecovery.template} |
| **总计** | - | **${plan.consoleMonitoring.files + plan.boundaryTesting.files + plan.errorRecovery.files}** | **${totalEstimatedHours}h** | - |

## ⏰ 时间线建议

### 第1周：控制台错误检测覆盖 (P0)
- ${plan.consoleMonitoring.files} 个文件 × 0.5小时 = ${plan.consoleMonitoring.estimatedHours}小时
- 自动化脚本执行
- 验证和测试

### 第2-3周：边界值测试实施 (P1)
- ${plan.boundaryTesting.files} 个关键模块 × 2小时 = ${plan.boundaryTesting.estimatedHours}小时
- 使用模板创建边界值测试
- 重点关注API和组件模块

### 第4-5周：错误恢复测试实施 (P2)
- ${plan.errorRecovery.files} 个模块 × 3小时 = ${plan.errorRecovery.estimatedHours}小时
- 使用模板创建错误恢复测试
- 重点关注网络和数据处理模块

## 🎯 成功指标

### 量化指标
- 控制台错误检测覆盖率：从 ${((stats.filesWithConsoleMonitoring / stats.totalFiles) * 100).toFixed(1)}% 提升到 100%
- 边界值测试覆盖：${plan.boundaryTesting.files} 个关键模块
- 错误恢复测试：${plan.errorRecovery.files} 个模块
- 总体测试工时：${totalEstimatedHours}小时

### 质量指标
- 零控制台错误
- 完整的边界值覆盖
- 强大的错误恢复能力
- 生产环境稳定性提升

## 🛠️ 执行步骤

1. **备份现有测试**：确保有回滚点
2. **P0任务执行**：立即开始控制台错误检测
3. **模板定制**：根据项目需求调整模板
4. **分批实施**：避免影响开发进度
5. **持续验证**：每次修改后运行测试
6. **文档更新**：更新测试文档和规范

## 🔄 持续改进

实施完成后，建立以下机制：
- 新测试文件必须包含控制台错误检测
- 关键模块必须包含边界值测试
- 定期检查测试覆盖率
- 持续优化测试策略
`;

  return { plan, totalEstimatedHours, planContent };
}

// 主函数
async function main() {
  try {
    console.log('📊 分析测试文件...');

    const allFiles = [];
    for (const pattern of TEST_PATTERNS) {
      const files = await glob(pattern);
      allFiles.push(...files);
    }

    console.log(`📁 找到 ${allFiles.length} 个测试文件`);

    // 分析所有文件
    const analysisResults = allFiles.map(analyzeFile).filter(Boolean);

    console.log('\n📈 生成报告...');

    // 生成报告
    const report = generateReport();
    const { plan, totalEstimatedHours, planContent } = generateEnhancementPlan();

    // 保存报告
    fs.writeFileSync('TEST_ENHANCEMENT_REPORT.md', report, 'utf8');
    fs.writeFileSync('TEST_ENHANCEMENT_PLAN.md', planContent, 'utf8');

    console.log('\n✅ 报告已生成:');
    console.log('   📄 TEST_ENHANCEMENT_REPORT.md - 详细分析报告');
    console.log('   📋 TEST_ENHANCEMENT_PLAN.md - 实施计划');
    console.log('   📊 总预估工时:', totalEstimatedHours, '小时');

    // 输出关键统计
    console.log('\n📊 关键统计:');
    console.log(`   总文件数: ${stats.totalFiles}`);
    console.log(`   已有控制台检测: ${stats.filesWithConsoleMonitoring} (${((stats.filesWithConsoleMonitoring / stats.totalFiles) * 100).toFixed(1)}%)`);
    console.log(`   需要添加控制台检测: ${stats.filesWithoutConsoleMonitoring}`);
    console.log(`   关键模块: ${stats.criticalModules}`);
    console.log(`   需要边界值测试: ${stats.boundaryTestCandidates.length}`);
    console.log(`   需要错误恢复测试: ${stats.errorRecoveryCandidates.length}`);

    console.log('\n🚀 建议立即执行:');
    if (stats.filesWithoutConsoleMonitoring > 0) {
      console.log('   1. 运行 node scripts/add-console-monitoring.js 添加控制台错误检测');
    }
    if (stats.boundaryTestCandidates.length > 0) {
      console.log('   2. 使用 templates/boundary-test-template.ts 创建边界值测试');
    }
    if (stats.errorRecoveryCandidates.length > 0) {
      console.log('   3. 使用 templates/error-recovery-test-template.ts 创建错误恢复测试');
    }

  } catch (error) {
    console.error('❌ 执行失败:', error);
    process.exit(1);
  }
}

// 检查依赖
if (!fs.existsSync('node_modules/glob')) {
  console.log('📦 安装依赖...');
  require('child_process').execSync('npm install glob', { stdio: 'inherit' });
}

main();