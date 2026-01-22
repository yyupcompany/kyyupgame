#!/usr/bin/env node

/**
 * 统一组件转换工具
 * 自动批量转换所有页面文件使用UnifiedIcon和设计令牌
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

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
    'client/src/pages/teacher-center/interactive-curriculum.vue',
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
    'client/src/pages/mobile/finance/types/index.vue',
    'client/src/pages/mobile/quick-actions/index.vue',
    'client/src/pages/mobile/more/index.vue',
    'client/src/pages/mobile/global-search/index.vue',
    'client/src/pages/mobile/login/index.vue',
  ],
};

// 图标映射表
const ICON_MAPPINGS = {
  'Plus': 'plus',
  'Search': 'search',
  'Edit': 'edit',
  'Delete': 'delete',
  'Close': 'close',
  'Check': 'check',
  'ArrowLeft': 'arrow-left',
  'ArrowRight': 'arrow-right',
  'ArrowUp': 'arrow-up',
  'ArrowDown': 'arrow-down',
  'User': 'user',
  'Lock': 'lock',
  'Phone': 'phone',
  'Calendar': 'calendar',
  'Clock': 'clock',
  'Setting': 'settings',
  'Menu': 'menu',
  'Home': 'home',
  'Star': 'star',
  'Download': 'download',
  'Upload': 'upload',
  'Refresh': 'refresh',
  'View': 'view',
  'Hide': 'hide',
  'Filter': 'filter',
  'Sort': 'sort',
  'More': 'more',
  'Share': 'share',
  'Copy': 'copy',
  'Print': 'print',
  'Message': 'message',
  'Notification': 'notification',
  'Warning': 'warning',
  'Info': 'info',
  'Success': 'success',
  'Error': 'error',
  'Question': 'question',
  'Back': 'back',
  'Forward': 'forward',
};

// 颜色映射表
const COLOR_REPLACEMENTS = [
  { pattern: /#409eff/g, token: 'var(--primary-color)' },
  { pattern: /#67c23a/g, token: 'var(--success-color)' },
  { pattern: /#e6a23c/g, token: 'var(--warning-color)' },
  { pattern: /#f56c6c/g, token: 'var(--danger-color)' },
  { pattern: /#909399/g, token: 'var(--info-color)' },
  { pattern: /#2c3e50/g, token: 'var(--text-primary)' },
  { pattern: /#5a6c7d/g, token: 'var(--text-secondary)' },
  { pattern: /#8492a6/g, token: 'var(--text-tertiary)' },
  { pattern: /#ffffff/g, token: 'var(--bg-color)' },
  { pattern: /#f7f8fa/g, token: 'var(--bg-page)' },
  { pattern: /#dcdfe6/g, token: 'var(--border-color)' },
];

// 间距映射表
const SPACING_REPLACEMENTS = [
  { pattern: /:\s*(\d+)px\s*;/g, transform: (match, pixels) => {
    const num = parseInt(pixels);
    if (num <= 4) return `: var(--spacing-xs);`;
    if (num <= 8) return `: var(--spacing-sm);`;
    if (num <= 12) return `: var(--spacing-md);`;
    if (num <= 16) return `: var(--spacing-lg);`;
    if (num <= 20) return `: var(--spacing-xl);`;
    if (num <= 24) return `: var(--spacing-2xl);`;
    return match; // Keep original if too large
  }},
];

// 字体大小映射表
const FONT_SIZE_REPLACEMENTS = [
  { pattern: /font-size:\s*(\d+)px/g, transform: (match, pixels) => {
    const num = parseInt(pixels);
    if (num <= 12) return `font-size: var(--text-xs)`;
    if (num <= 14) return `font-size: var(--text-sm)`;
    if (num <= 16) return `font-size: var(--text-base)`;
    if (num <= 18) return `font-size: var(--text-lg)`;
    if (num <= 20) return `font-size: var(--text-xl)`;
    if (num <= 24) return `font-size: var(--text-2xl)`;
    return match;
  }},
];

/**
 * 转换单个文件
 */
function convertFile(filePath) {
  console.log(`处理文件: ${filePath}`);

  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`  ❌ 文件不存在，跳过`);
    return { success: false, reason: '文件不存在' };
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;
  const issues = [];

  // 1. 替换 Element Plus 图标
  let hasIconChanges = false;
  const iconImports = [];

  for (const [elIcon, unifiedIcon] of Object.entries(ICON_MAPPINGS)) {
    // 替换 <el-icon><IconName /></el-icon>
    const iconPattern1 = new RegExp(`<el-icon>\\s*<${elIcon}\\s*/>\\s*</el-icon>`, 'g');
    if (iconPattern1.test(content)) {
      content = content.replace(iconPattern1, `<UnifiedIcon name="${unifiedIcon}" />`);
      hasIconChanges = true;
      if (!iconImports.includes(elIcon)) {
        iconImports.push(elIcon);
      }
    }

    // 替换 <el-icon :size="20"><IconName /></el-icon>
    const iconPattern2 = new RegExp(`<el-icon[^>]*>\\s*<${elIcon}\\s*/>\\s*</el-icon>`, 'g');
    if (iconPattern2.test(content)) {
      content = content.replace(iconPattern2, `<UnifiedIcon name="${unifiedIcon}" />`);
      hasIconChanges = true;
      if (!iconImports.includes(elIcon)) {
        iconImports.push(elIcon);
      }
    }

    // 替换独立的图标组件 <IconName />
    const standaloneIconPattern = new RegExp(`<${elIcon}\\s*/>`, 'g');
    if (standaloneIconPattern.test(content)) {
      content = content.replace(standaloneIconPattern, `<UnifiedIcon name="${unifiedIcon}" />`);
      hasIconChanges = true;
      if (!iconImports.includes(elIcon)) {
        iconImports.push(elIcon);
      }
    }
  }

  if (hasIconChanges) {
    // 移除 Element Plus 图标导入
    for (const iconImport of iconImports) {
      const importPattern = new RegExp(`import\\s+${iconImport}\\s+from\\s+['"]@element-plus/icons-vue['"]\\s*\\n`, 'g');
      content = content.replace(importPattern, '');
    }

    // 检查是否已导入 UnifiedIcon
    if (!content.includes("import UnifiedIcon from")) {
      // 查找第一个 import 语句并在其后添加 UnifiedIcon 导入
      const firstImportIndex = content.indexOf('import');
      if (firstImportIndex !== -1) {
        const firstImportEnd = content.indexOf('\n', firstImportIndex);
        content = content.slice(0, firstImportEnd + 1) +
                  `import UnifiedIcon from '@/components/icons/UnifiedIcon.vue'\n` +
                  content.slice(firstImportEnd + 1);
      }
    }

    // 移除不再使用的组件声明（如果有）
    content = content.replace(/components:\s*{[\s\S]*?}\n*/g, (match) => {
      const cleaned = match.replace(new RegExp(iconImports.join('|'), 'g'), '');
      if (cleaned.includes('components:') && cleaned.replace(/\s/g, '').length > 12) {
        return cleaned;
      }
      return '';
    });
  }

  // 2. 替换硬编码颜色
  let colorReplacements = 0;
  for (const { pattern, token } of COLOR_REPLACEMENTS) {
    const matches = content.match(pattern);
    if (matches) {
      colorReplacements += matches.length;
      content = content.replace(pattern, token);
    }
  }
  if (colorReplacements === 0) {
    // 检查是否还有硬编码颜色
    const hexColorPattern = /#[0-9a-fA-F]{3,6}/g;
    const remainingColors = content.match(hexColorPattern);
    if (remainingColors) {
      issues.push(`仍有 ${remainingColors.length} 个未替换的硬编码颜色`);
    }
  }

  // 3. 替换硬编码间距
  let spacingReplacements = 0;
  // 只替换明确的 padding/margin/gap 值
  const spacingPattern = /(?:padding|margin|gap):\s*(\d+)px/g;
  let match;
  while ((match = spacingPattern.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (num <= 24) {
      spacingReplacements++;
    }
  }
  for (const { pattern, transform } of SPACING_REPLACEMENTS) {
    content = content.replace(pattern, transform);
  }

  // 4. 替换硬编码字体大小
  let fontSizeReplacements = 0;
  const fontSizePattern = /font-size:\s*(\d+)px/g;
  while ((match = fontSizePattern.exec(content)) !== null) {
    const num = parseInt(match[1]);
    if (num <= 24) {
      fontSizeReplacements++;
    }
  }
  for (const { pattern, transform } of FONT_SIZE_REPLACEMENTS) {
    content = content.replace(pattern, transform);
  }

  // 5. 添加暗色模式支持（如果没有）
  if (!content.includes('@media (prefers-color-scheme: dark)') && !content.includes('html[data-theme="dark"]')) {
    // 检查是否使用了设计令牌
    if (content.includes('var(--')) {
      // 在样式块末尾添加暗色模式支持
      const styleEndIndex = content.lastIndexOf('</style>');
      if (styleEndIndex !== -1) {
        const darkModeSupport = `
/* ==================== 暗色模式支持 ==================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* 设计令牌会自动适配暗色模式 */
  }
}
`;
        content = content.slice(0, styleEndIndex) + darkModeSupport + content.slice(styleEndIndex);
      }
    }
  }

  // 检查是否有变化
  if (content !== originalContent) {
    // 备份原文件
    fs.writeFileSync(fullPath + '.backup', originalContent);
    // 写入转换后的文件
    fs.writeFileSync(fullPath, content);
    console.log(`  ✅ 转换完成`);
    return {
      success: true,
      iconChanges: hasIconChanges,
      colorReplacements,
      spacingReplacements,
      fontSizeReplacements,
      issues: issues.length > 0 ? issues : undefined
    };
  } else {
    console.log(`  ℹ️  无需转换`);
    return { success: true, noChanges: true };
  }
}

/**
 * 转换批次
 */
function convertBatch(batchName, batchFiles) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`开始转换批次: ${batchName} (${batchFiles.length} 个文件)`);
  console.log(`${'='.repeat(60)}`);

  const results = {
    batch: batchName,
    total: batchFiles.length,
    converted: 0,
    skipped: 0,
    failed: 0,
    details: []
  };

  for (const filePath of batchFiles) {
    try {
      const result = convertFile(filePath);
      results.details.push({ filePath, result });

      if (result.success) {
        if (result.noChanges) {
          results.skipped++;
        } else {
          results.converted++;
        }
      } else {
        results.failed++;
      }
    } catch (error) {
      console.error(`  ❌ 转换失败: ${error.message}`);
      results.failed++;
      results.details.push({
        filePath,
        result: { success: false, reason: error.message }
      });
    }
  }

  return results;
}

/**
 * 生成审计报告
 */
function generateAuditReport(allResults) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: 0,
      totalConverted: 0,
      totalSkipped: 0,
      totalFailed: 0,
      successRate: 0
    },
    batches: {},
    issues: []
  };

  for (const batchResult of allResults) {
    report.summary.totalFiles += batchResult.total;
    report.summary.totalConverted += batchResult.converted;
    report.summary.totalSkipped += batchResult.skipped;
    report.summary.totalFailed += batchResult.failed;

    report.batches[batchResult.batch] = {
      total: batchResult.total,
      converted: batchResult.converted,
      skipped: batchResult.skipped,
      failed: batchResult.failed,
      details: batchResult.details
    };

    // 收集问题
    for (const detail of batchResult.details) {
      if (detail.result.issues) {
        report.issues.push(...detail.result.issues.map(issue => ({
          file: detail.filePath,
          issue
        })));
      }
    }
  }

  report.summary.successRate = ((report.summary.totalConverted / report.summary.totalFiles) * 100).toFixed(2);

  return report;
}

/**
 * 主函数
 */
function main() {
  console.log('🚀 统一组件转换工具启动\n');

  const args = process.argv.slice(2);
  const targetBatch = args[0] || 'all';

  const allResults = [];

  if (targetBatch === 'all') {
    // 转换所有批次
    for (const [batchName, batchFiles] of Object.entries(PAGE_BATCHES)) {
      const result = convertBatch(batchName, batchFiles);
      allResults.push(result);
    }
  } else if (PAGE_BATCHES[targetBatch]) {
    // 转换指定批次
    const result = convertBatch(targetBatch, PAGE_BATCHES[targetBatch]);
    allResults.push(result);
  } else {
    console.error(`❌ 未知的批次: ${targetBatch}`);
    console.log('可用批次: batchA, batchB, batchC, batchD, batchE, all');
    process.exit(1);
  }

  // 生成审计报告
  console.log('\n' + '='.repeat(60));
  console.log('生成审计报告...');
  console.log('='.repeat(60));

  const report = generateAuditReport(allResults);

  // 保存报告
  const reportPath = path.join(process.cwd(), 'UNIFIED_COMPONENT_CONVERSION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📊 报告已保存: ${reportPath}`);

  // 打印摘要
  console.log('\n📈 转换摘要:');
  console.log(`  总文件数: ${report.summary.totalFiles}`);
  console.log(`  已转换: ${report.summary.totalConverted}`);
  console.log(`  已跳过: ${report.summary.totalSkipped}`);
  console.log(`  失败: ${report.summary.totalFailed}`);
  console.log(`  成功率: ${report.summary.successRate}%`);

  if (report.issues.length > 0) {
    console.log(`\n⚠️  发现 ${report.issues.length} 个问题:`);
    report.issues.slice(0, 10).forEach(({ file, issue }) => {
      console.log(`  - ${file}: ${issue}`);
    });
    if (report.issues.length > 10) {
      console.log(`  ... 还有 ${report.issues.length - 10} 个问题，详见报告文件`);
    }
  }

  console.log('\n✅ 转换完成！');
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { convertFile, convertBatch, generateAuditReport };
