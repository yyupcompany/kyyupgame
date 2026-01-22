#!/usr/bin/env node

/**
 * 统一组件转换审计工具
 * 手动检查每个文件的转换状态
 */

const fs = require('fs');
const path = require('path');

// 页面列表配置
const PAGE_BATCHES = {
  batchA: [ // PC Parent-Center
    'client/src/pages/parent-center/profile/index.vue',
    'client/src/pages/parent-center/children/Growth.vue',
    'client/src/pages/parent-center/children/FollowUp.vue',
    'client/src/pages/parent-center/assessment/Report.vue',
    'client/src/pages/parent-center/ai-assistant/index.vue',
    'client/src/pages/parent-center/activities/index.vue',
    'client/src/pages/parent-center/games/index.vue',
    'client/src/pages/parent-center/photo-album/index.vue',
    'client/src/pages/parent-center/communication/index.vue',
  ],
  batchB: [ // PC Teacher-Center
    'client/src/pages/teacher-center/dashboard/index.vue',
    'client/src/pages/teacher-center/attendance/index.vue',
    'client/src/pages/teacher-center/tasks/index.vue',
    'client/src/pages/teacher-center/activities/index.vue',
    'client/src/pages/teacher-center/customer-pool/index.vue',
    'client/src/pages/teacher-center/customer-tracking/index.vue',
    'client/src/pages/teacher-center/enrollment/index.vue',
    'client/src/pages/teacher-center/teaching/index.vue',
    'client/src/pages/teacher-center/notifications/index.vue',
    'client/src/pages/teacher-center/performance-rewards/index.vue',
    'client/src/pages/teacher-center/student-assessment/index.vue',
    'client/src/pages/teacher-center/creative-curriculum/index.vue',
  ],
  batchC: [ // Mobile Parent-Center
    'client/src/pages/mobile/parent-center/index.vue',
    'client/src/pages/mobile/parent-center/activities/detail.vue',
    'client/src/pages/mobile/parent-center/activities/registration.vue',
    'client/src/pages/mobile/parent-center/children/add.vue',
    'client/src/pages/mobile/parent-center/children/edit.vue',
    'client/src/pages/mobile/parent-center/children/followup.vue',
    'client/src/pages/mobile/parent-center/children/growth.vue',
    'client/src/pages/mobile/parent-center/assessment/doing.vue',
    'client/src/pages/mobile/parent-center/assessment/growth-trajectory.vue',
    'client/src/pages/mobile/parent-center/assessment/report.vue',
    'client/src/pages/mobile/parent-center/games/achievements.vue',
    'client/src/pages/mobile/parent-center/games/records.vue',
    'client/src/pages/mobile/parent-center/communication/smart-hub.vue',
    'client/src/pages/mobile/parent-center/notifications/detail.vue',
    'client/src/pages/mobile/parent-center/profile/index.vue',
    'client/src/pages/mobile/parent-center/promotion-center/index.vue',
    'client/src/pages/mobile/parent-center/share-stats/index.vue',
  ],
  batchD: [ // Mobile Teacher-Center
    'client/src/pages/mobile/teacher-center/tasks/create.vue',
    'client/src/pages/mobile/teacher-center/tasks/detail.vue',
    'client/src/pages/mobile/teacher-center/tasks/edit.vue',
    'client/src/pages/mobile/teacher-center/activities/index.vue',
    'client/src/pages/mobile/teacher-center/customer-pool/index.vue',
    'client/src/pages/mobile/teacher-center/customer-tracking/index.vue',
    'client/src/pages/mobile/teacher-center/enrollment/index.vue',
    'client/src/pages/mobile/teacher-center/teaching/index.vue',
    'client/src/pages/mobile/teacher-center/notifications/index.vue',
    'client/src/pages/mobile/teacher-center/performance-rewards/index.vue',
    'client/src/pages/mobile/teacher-center/appointment-management/index.vue',
    'client/src/pages/mobile/teacher-center/creative-curriculum/create.vue',
    'client/src/pages/mobile/teacher-center/creative-curriculum/preview.vue',
  ],
  batchE: [ // Other Mobile
    'client/src/pages/mobile/quick-actions/index.vue',
    'client/src/pages/mobile/more/index.vue',
    'client/src/pages/mobile/global-search/index.vue',
    'client/src/pages/mobile/login/index.vue',
  ],
};

/**
 * 审计单个文件
 */
function auditFile(filePath) {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      status: 'FILE_NOT_FOUND',
      iconCoverage: null,
      colorTokenCoverage: null,
      spacingTokenCoverage: null,
      typographyCoverage: null,
      darkModeSupport: null,
      importStatements: null,
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // 1. 检查图标覆盖
  const hasElIcon = /<el-icon/i.test(content);
  const hasUnifiedIcon = /<UnifiedIcon/i.test(content);
  const hasUnifiedIconImport = /import\s+UnifiedIcon\s+from/i.test(content);
  const hasElementPlusIconsImport = /from\s+['"]@element-plus\/icons-vue['"]/.test(content);

  const iconCoverage = {
    hasElIcon,
    hasUnifiedIcon,
    hasUnifiedIconImport,
    hasElementPlusIconsImport,
    score: calculateIconScore(hasElIcon, hasUnifiedIcon, hasUnifiedIconImport, hasElementPlusIconsImport),
  };

  // 2. 检查颜色令牌覆盖
  const hexColorMatches = content.match(/#[0-9a-fA-F]{3,6}/g) || [];
  const designTokenColors = (content.match(/var\(--[a-z-]+color\)/gi) || []).length;
  const elColorVars = (content.match(/var\(--el-color-/gi) || []).length;

  const colorTokenCoverage = {
    hexColorCount: hexColorMatches.length,
    designTokenColorCount: designTokenColors,
    elColorVarCount: elColorVars,
    score: calculateColorScore(hexColorMatches.length, designTokenColors, elColorVars),
  };

  // 3. 检查间距令牌覆盖
  const hardcodedSpacing = (content.match(/(?:padding|margin|gap):\s*\d+px/gi) || []).length;
  const spacingTokens = (content.match(/var\(--spacing-[a-z]+/gi) || []).length;

  const spacingTokenCoverage = {
    hardcodedCount: hardcodedSpacing,
    tokenCount: spacingTokens,
    score: calculateSpacingScore(hardcodedSpacing, spacingTokens),
  };

  // 4. 检查字体令牌覆盖
  const hardcodedFontSizes = (content.match(/font-size:\s*\d+px/gi) || []).length;
  const fontTokens = (content.match(/var\(--text-[a-z0-9]+/gi) || []).length;

  const typographyCoverage = {
    hardcodedCount: hardcodedFontSizes,
    tokenCount: fontTokens,
    score: calculateTypographyScore(hardcodedFontSizes, fontTokens),
  };

  // 5. 检查暗色模式支持
  const hasDarkModeMediaQuery = /@media.*prefers-color-scheme:\s*dark/i.test(content);
  const hasDarkThemeAttribute = /html\[data-theme=["']dark["']\]/i.test(content);
  const hasDesignTokens = /var\(--/i.test(content);

  const darkModeSupport = {
    hasMediaQuery: hasDarkModeMediaQuery,
    hasThemeAttribute: hasDarkThemeAttribute,
    hasDesignTokens,
    score: calculateDarkModeScore(hasDarkModeMediaQuery, hasDarkThemeAttribute, hasDesignTokens),
  };

  // 6. 检查导入语句
  const importStatements = {
    hasUnifiedIconImport: hasUnifiedIconImport,
    hasElementPlusIconsImport: hasElementPlusIconsImport,
    unusedImports: findUnusedImports(content),
  };

  // 计算总体状态
  const overallScore = (
    iconCoverage.score * 0.2 +
    colorTokenCoverage.score * 0.3 +
    spacingTokenCoverage.score * 0.15 +
    typographyCoverage.score * 0.15 +
    darkModeSupport.score * 0.2
  );

  const status = overallScore >= 90 ? 'PASS' : overallScore >= 70 ? 'ACCEPTABLE' : 'FAIL';

  return {
    status,
    iconCoverage,
    colorTokenCoverage,
    spacingTokenCoverage,
    typographyCoverage,
    darkModeSupport,
    importStatements,
    overallScore: Math.round(overallScore),
  };
}

/**
 * 计算图标得分
 */
function calculateIconScore(hasElIcon, hasUnifiedIcon, hasUnifiedIconImport, hasElementPlusIconsImport) {
  if (hasElIcon) return 0; // 有 el-icon 直接 0 分
  if (!hasUnifiedIcon && !hasUnifiedIconImport) return 100; // 没有使用图标，满分
  if (hasUnifiedIcon && hasUnifiedIconImport && !hasElementPlusIconsImport) return 100; // 完美
  if (hasUnifiedIcon && hasUnifiedIconImport) return 80; // 有 UnifiedIcon 但仍有 Element Plus 导入
  return 50;
}

/**
 * 计算颜色得分
 */
function calculateColorScore(hexColorCount, designTokenColors, elColorVars) {
  const totalColors = hexColorCount + designTokenColors + elColorVars;
  if (totalColors === 0) return 100; // 没有颜色使用

  const tokenPercentage = ((designTokenColors + elColorVars) / totalColors) * 100;
  const hexDeduction = Math.min(hexColorCount * 2, 20); // 每个硬编码颜色扣 2 分，最多扣 20 分

  return Math.max(0, Math.min(100, tokenPercentage - hexDeduction + (hexColorCount === 0 ? 10 : 0)));
}

/**
 * 计算间距得分
 */
function calculateSpacingScore(hardcodedSpacing, spacingTokens) {
  const totalSpacing = hardcodedSpacing + spacingTokens;
  if (totalSpacing === 0) return 100;

  const tokenPercentage = (spacingTokens / totalSpacing) * 100;
  const hardcodedDeduction = Math.min(hardcodedSpacing * 1.5, 15);

  return Math.max(0, Math.min(100, tokenPercentage - hardcodedDeduction + (hardcodedSpacing === 0 ? 5 : 0)));
}

/**
 * 计算字体得分
 */
function calculateTypographyScore(hardcodedFontSizes, fontTokens) {
  const totalFonts = hardcodedFontSizes + fontTokens;
  if (totalFonts === 0) return 100;

  const tokenPercentage = (fontTokens / totalFonts) * 100;
  const hardcodedDeduction = Math.min(hardcodedFontSizes * 2, 20);

  return Math.max(0, Math.min(100, tokenPercentage - hardcodedDeduction + (hardcodedFontSizes === 0 ? 5 : 0)));
}

/**
 * 计算暗色模式得分
 */
function calculateDarkModeScore(hasMediaQuery, hasThemeAttribute, hasDesignTokens) {
  if (!hasDesignTokens) return 50; // 没有设计令牌，无法自动适配

  if (hasMediaQuery || hasThemeAttribute) return 100; // 有暗色模式支持
  return 70; // 有设计令牌但无显式暗色模式支持（会自动适配）
}

/**
 * 查找未使用的导入
 */
function findUnusedImports(content) {
  const unused = [];
  const importPattern = /import\s+{\s*([^}]+)\s*}\s+from\s+['"]@element-plus\/icons-vue['"]/g;
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    const imports = match[1].split(',').map(s => s.trim());
    for (const imp of imports) {
      const regex = new RegExp(`<${imp}\\s`, 'g');
      if (!regex.test(content)) {
        unused.push(imp);
      }
    }
  }

  return unused;
}

/**
 * 审计批次
 */
function auditBatch(batchName, batchFiles) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`审计批次: ${batchName} (${batchFiles.length} 个文件)`);
  console.log(`${'='.repeat(80)}\n`);

  const results = [];
  let passCount = 0;
  let acceptableCount = 0;
  let failCount = 0;

  for (const filePath of batchFiles) {
    const audit = auditFile(filePath);

    if (audit.status === 'PASS') {
      passCount++;
      console.log(`✅ PASS (${audit.overallScore}%) - ${filePath}`);
    } else if (audit.status === 'ACCEPTABLE') {
      acceptableCount++;
      console.log(`⚠️  ACCEPTABLE (${audit.overallScore}%) - ${filePath}`);
    } else if (audit.status === 'FILE_NOT_FOUND') {
      failCount++;
      console.log(`❌ FILE_NOT_FOUND - ${filePath}`);
    } else {
      failCount++;
      console.log(`❌ FAIL (${audit.overallScore}%) - ${filePath}`);

      // 显示问题详情
      if (audit.iconCoverage.hasElIcon) {
        console.log(`   - 仍有 <el-icon> 使用`);
      }
      if (audit.colorTokenCoverage.hexColorCount > 5) {
        console.log(`   - 有 ${audit.colorTokenCoverage.hexColorCount} 个硬编码颜色`);
      }
      if (audit.spacingTokenCoverage.hardcodedCount > 10) {
        console.log(`   - 有 ${audit.spacingTokenCoverage.hardcodedCount} 个硬编码间距`);
      }
      if (audit.typographyCoverage.hardcodedCount > 5) {
        console.log(`   - 有 ${audit.typographyCoverage.hardcodedCount} 个硬编码字体大小`);
      }
    }

    results.push({ filePath, audit });
  }

  console.log(`\n批次 ${batchName} 汇总:`);
  console.log(`  PASS: ${passCount}`);
  console.log(`  ACCEPTABLE: ${acceptableCount}`);
  console.log(`  FAIL: ${failCount}`);
  console.log(`  通过率: ${((passCount + acceptableCount) / batchFiles.length * 100).toFixed(2)}%`);

  return {
    batch: batchName,
    total: batchFiles.length,
    pass: passCount,
    acceptable: acceptableCount,
    fail: failCount,
    passRate: ((passCount + acceptableCount) / batchFiles.length * 100).toFixed(2),
    results,
  };
}

/**
 * 生成审计报告
 */
function generateAuditReport(allResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      totalPass: 0,
      totalAcceptable: 0,
      totalFail: 0,
      overallPassRate: 0,
    },
    batches: {},
    detailedResults: {},
    issues: [],
    recommendations: [],
  };

  for (const batchResult of allResults) {
    report.summary.totalFiles += batchResult.total;
    report.summary.totalPass += batchResult.pass;
    report.summary.totalAcceptable += batchResult.acceptable;
    report.summary.totalFail += batchResult.fail;

    report.batches[batchResult.batch] = {
      total: batchResult.total,
      pass: batchResult.pass,
      acceptable: batchResult.acceptable,
      fail: batchResult.fail,
      passRate: batchResult.passRate,
    };

    // 收集详细结果和问题
    for (const { filePath, audit } of batchResult.results) {
      report.detailedResults[filePath] = audit;

      if (audit.status === 'FAIL' || audit.status === 'ACCEPTABLE') {
        if (audit.iconCoverage && audit.iconCoverage.hasElIcon) {
          report.issues.push({ file: filePath, type: 'icon', message: '仍在使用 <el-icon>' });
        }
        if (audit.colorTokenCoverage && audit.colorTokenCoverage.hexColorCount > 5) {
          report.issues.push({
            file: filePath,
            type: 'color',
            message: `有 ${audit.colorTokenCoverage.hexColorCount} 个硬编码颜色`
          });
        }
        if (audit.spacingTokenCoverage && audit.spacingTokenCoverage.hardcodedCount > 10) {
          report.issues.push({
            file: filePath,
            type: 'spacing',
            message: `有 ${audit.spacingTokenCoverage.hardcodedCount} 个硬编码间距`
          });
        }
      }
    }
  }

  report.summary.overallPassRate = (
    ((report.summary.totalPass + report.summary.totalAcceptable) / report.summary.totalFiles) * 100
  ).toFixed(2);

  // 生成建议
  if (report.summary.totalFail > 0) {
    report.recommendations.push('优先修复 FAIL 状态的文件');
  }
  if (report.issues.filter(i => i.type === 'icon').length > 0) {
    report.recommendations.push('批量替换所有 <el-icon> 为 <UnifiedIcon>');
  }
  if (report.issues.filter(i => i.type === 'color').length > 10) {
    report.recommendations.push('需要系统性替换硬编码颜色为设计令牌');
  }

  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🔍 统一组件转换审计工具启动\n');

  const allResults = [];

  for (const [batchName, batchFiles] of Object.entries(PAGE_BATCHES)) {
    const result = auditBatch(batchName, batchFiles);
    allResults.push(result);
  }

  // 生成完整报告
  console.log(`\n${'='.repeat(80)}`);
  console.log('生成完整审计报告...');
  console.log('='.repeat(80));

  const report = generateAuditReport(allResults);

  // 保存 JSON 报告
  const jsonReportPath = path.join(process.cwd(), 'STYLE_OPTIMIZATION_AUDIT_REPORT.json');
  fs.writeFileSync(jsonReportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 JSON 报告已保存: ${jsonReportPath}`);

  // 生成 Markdown 报告
  const markdownReport = generateMarkdownReport(report);
  const mdReportPath = path.join(process.cwd(), 'STYLE_OPTIMIZATION_AUDIT_REPORT.md');
  fs.writeFileSync(mdReportPath, markdownReport);
  console.log(`📄 Markdown 报告已保存: ${mdReportPath}`);

  // 打印摘要
  console.log('\n' + '='.repeat(80));
  console.log('📈 审计摘要');
  console.log('='.repeat(80));
  console.log(`  总文件数: ${report.summary.totalFiles}`);
  console.log(`  PASS: ${report.summary.totalPass} (${(report.summary.totalPass / report.summary.totalFiles * 100).toFixed(2)}%)`);
  console.log(`  ACCEPTABLE: ${report.summary.totalAcceptable} (${(report.summary.totalAcceptable / report.summary.totalFiles * 100).toFixed(2)}%)`);
  console.log(`  FAIL: ${report.summary.totalFail} (${(report.summary.totalFail / report.summary.totalFiles * 100).toFixed(2)}%)`);
  console.log(`  总体通过率: ${report.summary.overallPassRate}%`);
  console.log(`  问题总数: ${report.issues.length}`);
  console.log('\n✅ 审计完成！');
}

/**
 * 生成 Markdown 报告
 */
function generateMarkdownReport(report) {
  let md = '# Style Optimization Accuracy Audit Report\n\n';
  md += `**Generated**: ${new Date(report.timestamp).toLocaleString('zh-CN')}\n\n`;

  md += '## Overall Statistics\n\n';
  md += `- **Total Pages Audited**: ${report.summary.totalFiles}\n`;
  md += `- **Pages Passed**: ${report.summary.totalPass} (${(report.summary.totalPass / report.summary.totalFiles * 100).toFixed(2)}%)\n`;
  md += `- **Pages Acceptable**: ${report.summary.totalAcceptable} (${(report.summary.totalAcceptable / report.summary.totalFiles * 100).toFixed(2)}%)\n`;
  md += `- **Pages Failed**: ${report.summary.totalFail} (${(report.summary.totalFail / report.summary.totalFiles * 100).toFixed(2)}%)\n`;
  md += `- **Overall Pass Rate**: ${report.summary.overallPassRate}%\n`;
  md += `- **Total Issues**: ${report.issues.length}\n\n`;

  md += '## Detailed Results by Batch\n\n';

  for (const [batchName, batchData] of Object.entries(report.batches)) {
    md += `### ${batchName}\n\n`;
    md += `- Total: ${batchData.total}\n`;
    md += `- Pass: ${batchData.pass}\n`;
    md += `- Acceptable: ${batchData.acceptable}\n`;
    md += `- Fail: ${batchData.fail}\n`;
    md += `- Pass Rate: ${batchData.passRate}%\n\n`;
  }

  if (report.issues.length > 0) {
    md += '## Issues Found\n\n';
    report.issues.slice(0, 50).forEach((issue, index) => {
      md += `${index + 1}. **[${issue.type.toUpperCase()}]** ${issue.file}\n`;
      md += `   - ${issue.message}\n\n`;
    });
    if (report.issues.length > 50) {
      md += `... 还有 ${report.issues.length - 50} 个问题，详见 JSON 报告\n\n`;
    }
  }

  if (report.recommendations.length > 0) {
    md += '## Recommendations\n\n';
    report.recommendations.forEach((rec, index) => {
      md += `${index + 1}. ${rec}\n`;
    });
  }

  return md;
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { auditFile, auditBatch, generateAuditReport };
