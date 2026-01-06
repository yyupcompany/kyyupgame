#!/usr/bin/env node

/**
 * 修复剩余间距问题
 * Fix Remaining Spacing Issues
 */

import fs from 'fs';

// 剩余问题文件列表
const PROBLEM_FILES = [
  'src/pages/activity/analytics/intelligent-analysis.vue',
  'src/pages/customer/lifecycle/intelligent-management.vue',
  'src/pages/centers/components/InspectionReportPrintTemplate.vue',
  'src/pages/demo/SmartExpertDemo.vue',
  'src/pages/ai/ExpertConsultationPage.vue',
  'src/pages/principal/decision-support/intelligent-dashboard.vue',
  'src/pages/parent-center/games/index.vue',
  'src/layouts/MainLayout.vue',
  'src/pages/principal/BasicInfo.vue',
  'src/pages/enrollment/personalized-strategy.vue',
  'src/pages/centers/components/InspectionRectificationPrintTemplate.vue',
  'src/pages/centers/components/InspectionRecordPrintTemplate.vue',
  'src/components/ai-assistant/chat/ChatContainer.vue'
];

// 间距映射表
const SPACING_MAPPINGS = {
  '0': 'var(--spacing-none)',
  '1': 'var(--spacing-xs)',
  '2': 'var(--spacing-sm)',
  '3': 'var(--spacing-2xs)',
  '4': 'var(--spacing-md)',
  '5': 'var(--spacing-base)',
  '6': 'var(--spacing-lg)',
  '7': 'var(--spacing-2lg)',
  '8': 'var(--spacing-xl)',
  '9': 'var(--spacing-2xl)',
  '10': 'var(--spacing-2xl)',
  '11': 'var(--spacing-3xl)',
  '12': 'var(--spacing-3xl)',
  '14': 'var(--spacing-4xl)',
  '15': 'var(--spacing-4xl)',
  '16': 'var(--spacing-4xl)',
  '18': 'var(--spacing-5xl)',
  '20': 'var(--spacing-5xl)',
  '22': 'var(--spacing-6xl)',
  '24': 'var(--spacing-6xl)',
  '25': 'var(--spacing-6xl)',
  '26': 'var(--spacing-7xl)',
  '28': 'var(--spacing-7xl)',
  '30': 'var(--spacing-8xl)',
  '32': 'var(--spacing-8xl)',
  '36': 'var(--spacing-9xl)',
  '40': 'var(--spacing-10xl)',
  '44': 'var(--spacing-11xl)',
  '48': 'var(--spacing-12xl)',
  '52': 'var(--spacing-13xl)',
  '56': 'var(--spacing-14xl)',
  '60': 'var(--spacing-15xl)',
  '64': 'var(--spacing-16xl)',
  '72': 'var(--spacing-18xl)',
  '80': 'var(--spacing-20xl)',
  '84': 'var(--spacing-21xl)',
  '96': 'var(--spacing-24xl)',
  '100': 'var(--spacing-25xl)',
  '120': 'var(--spacing-30xl)',
  '128': 'var(--spacing-32xl)',
  '144': 'var(--spacing-36xl)'
};

// 修复单个文件
function fixFileSpacing(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    const originalContent = content;

    // 修复所有间距相关属性
    const spacingPatterns = [
      // 复合间距值
      /margin:\s*([^;]*\b(\d+)px[^;]*)/g,
      /padding:\s*([^;]*\b(\d+)px[^;]*)/g,
      // 单一间距值
      /margin-top:\s*(\d+)px/g,
      /margin-right:\s*(\d+)px/g,
      /margin-bottom:\s*(\d+)px/g,
      /margin-left:\s*(\d+)px/g,
      /padding-top:\s*(\d+)px/g,
      /padding-right:\s*(\d+)px/g,
      /padding-bottom:\s*(\d+)px/g,
      /padding-left:\s*(\d+)px/g,
      /gap:\s*(\d+)px/g,
      /row-gap:\s*(\d+)px/g,
      /column-gap:\s*(\d+)px/g
    ];

    spacingPatterns.forEach(pattern => {
      content = content.replace(pattern, (match, fullMatch, size) => {
        if (!size) {
          // 处理复合间距值
          size = fullMatch;
        }
        const replacement = SPACING_MAPPINGS[size] || match;
        if (replacement !== match) {
          modified = true;
          replacements++;
          return match.replace(size + 'px', replacement);
        }
        return match;
      });
    });

    // 修复内联样式中的间距
    content = content.replace(/style="([^"]*(?:margin|padding):\s*(\d+)px[^"]*)"/g, (match, styleContent, size) => {
      const replacement = SPACING_MAPPINGS[size] || `${size}px`;
      if (replacement !== `${size}px`) {
        modified = true;
        replacements++;
        return `style="${styleContent.replace(new RegExp(`(margin|padding):\\s*${size}px`, 'g'), `$1: ${replacement}`)}"`;
      }
      return match;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return {
        success: true,
        filePath,
        replacements,
        originalSize: originalContent.length,
        newSize: content.length
      };
    }

    return {
      success: false,
      filePath,
      replacements: 0,
      message: 'No spacing issues found'
    };

  } catch (error) {
    console.error(`❌ 修复文件失败: ${filePath}`, error.message);
    return {
      success: false,
      filePath,
      error: error.message
    };
  }
}

// 主函数
async function main() {
  console.log('🔧 开始修复剩余间距问题...\n');

  let totalReplacements = 0;
  let successCount = 0;
  let failCount = 0;

  for (const file of PROBLEM_FILES) {
    if (fs.existsSync(file)) {
      const result = fixFileSpacing(file);
      
      if (result.success) {
        successCount++;
        totalReplacements += result.replacements;
        console.log(`✅ ${file}: ${result.replacements} 个替换`);
      } else if (result.error) {
        failCount++;
        console.log(`❌ ${file}: ${result.error}`);
      } else {
        console.log(`⚪ ${file}: 无需修复`);
      }
    } else {
      console.log(`⚠️ 文件不存在: ${file}`);
    }
  }

  console.log(`\n📊 修复完成:`);
  console.log(`   成功: ${successCount} 个文件`);
  console.log(`   失败: ${failCount} 个文件`);
  console.log(`   总替换: ${totalReplacements} 个`);

  // 验证修复结果
  console.log('\n🔍 验证修复结果...');
  const { execSync } = await import('child_process');
  
  try {
    execSync('node scripts/scan-all-spacing-fixed.js | grep "总问题数"', { 
      stdio: 'pipe',
      cwd: process.cwd()
    });
    console.log('✅ 验证完成');
  } catch (error) {
    console.log('⚠️ 验证失败');
  }
}

// 运行主函数
main();
