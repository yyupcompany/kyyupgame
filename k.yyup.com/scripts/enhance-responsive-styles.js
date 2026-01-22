#!/usr/bin/env node

/**
 * 移动端响应式样式增强工具
 *
 * 为现有样式添加响应式媒体查询和断点支持
 *
 * 使用方法:
 * node scripts/enhance-responsive-styles.js
 */

const fs = require('fs');
const path = require('path');

// 需要增强的页面列表
const pagesToEnhance = [
  'client/src/pages/mobile/centers/activity-center/index.vue',
  'client/src/pages/mobile/centers/ai-center/index.vue',
  'client/src/pages/mobile/centers/analytics-center/index.vue',
  'client/src/pages/mobile/centers/assessment-center/index.vue',
  'client/src/pages/mobile/centers/finance-center/index.vue',
  'client/src/pages/mobile/centers/enrollment-center/index.vue',
  'client/src/pages/mobile/centers/marketing-center/index.vue',
  'client/src/pages/mobile/centers/student-center/index.vue',
  'client/src/pages/mobile/centers/teacher-center/index.vue',
  'client/src/pages/mobile/teacher-center/dashboard/index.vue'
];

// 响应式增强规则
const enhancementRules = [
  {
    // 为padding添加响应式
    selector: /\.\w+[\w-]*\s*\{[^}]*padding:\s*(\d+)px;/g,
    replacement: (match, padding) => {
      const base = parseInt(padding);
      return match.replace(
        `padding: ${padding}px;`,
        `padding: ${padding}px;\n  @include mobile-sm { padding: ${Math.round(base * 1.25)}px; }\n  @include mobile-lg { padding: ${Math.round(base * 1.5)}px; }`
      );
    }
  },
  {
    // 为font-size添加响应式
    selector: /\.\w+[\w-]*\s*\{[^}]*font-size:\s*(\d+)px;/g,
    replacement: (match, fontSize) => {
      const base = parseInt(fontSize);
      if (base < 14) return match; // 跳过过小字体
      return match.replace(
        `font-size: ${fontSize}px;`,
        `font-size: ${fontSize}px;\n  @include mobile-sm { font-size: ${Math.round(base * 1.1)}px; }\n  @include mobile-md { font-size: ${Math.round(base * 1.2)}px; }`
      );
    }
  },
  {
    // 为margin-bottom添加响应式
    selector: /\.\w+[\w-]*\s*\{[^}]*margin-bottom:\s*(\d+)px;/g,
    replacement: (match, margin) => {
      const base = parseInt(margin);
      return match.replace(
        `margin-bottom: ${margin}px;`,
        `margin-bottom: ${margin}px;\n  @include mobile-sm { margin-bottom: ${Math.round(base * 1.25)}px; }\n  @include mobile-lg { margin-bottom: ${Math.round(base * 1.5)}px; }`
      );
    }
  },
  {
    // 为border-radius添加响应式
    selector: /\.\w+[\w-]*\s*\{[^}]*border-radius:\s*(\d+)px;/g,
    replacement: (match, radius) => {
      const base = parseInt(radius);
      if (base < 8) return match; // 跳过过小圆角
      return match.replace(
        `border-radius: ${radius}px;`,
        `border-radius: ${radius}px;\n  @include mobile-lg { border-radius: ${Math.round(base * 1.2)}px; }`
      );
    }
  },
  {
    // 为gap添加响应式 (Flexbox/Grid)
    selector: /\.\w+[\w-]*\s*\{[^}]*gap:\s*(\d+)px;/g,
    replacement: (match, gap) => {
      const base = parseInt(gap);
      return match.replace(
        `gap: ${gap}px;`,
        `gap: ${gap}px;\n  @include mobile-sm { gap: ${Math.round(base * 1.25)}px; }\n  @include mobile-lg { gap: ${Math.round(base * 1.5)}px; }`
      );
    }
  }
];

// 检查文件是否已包含响应式样式
function hasResponsiveStyles(content) {
  return content.includes('@include mobile-') ||
         content.includes('@media (min-width:');
}

// 添加响应式样式增强
function enhanceResponsiveStyles(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${filePath}`);
    return false;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // 检查是否已包含响应式样式
  if (hasResponsiveStyles(content)) {
    console.log(`✅ 已包含响应式样式: ${filePath}`);
    return false;
  }

  let enhancedContent = content;
  let modificationCount = 0;

  // 应用增强规则
  enhancementRules.forEach(rule => {
    const matches = content.match(rule.selector);
    if (matches) {
      matches.forEach(match => {
        const enhanced = rule.replacement(match, match.match(/\d+/)?.[0]);
        if (enhanced !== match) {
          enhancedContent = enhancedContent.replace(match, enhanced);
          modificationCount++;
        }
      });
    }
  });

  if (modificationCount > 0) {
    fs.writeFileSync(fullPath, enhancedContent, 'utf-8');
    console.log(`✨ 增强响应式样式: ${filePath} (${modificationCount}处修改)`);
    return true;
  } else {
    console.log(`ℹ️  无需增强: ${filePath}`);
    return false;
  }
}

// 主函数
function main() {
  console.log('🚀 开始增强移动端页面响应式样式...\n');

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  pagesToEnhance.forEach(filePath => {
    try {
      const result = enhanceResponsiveStyles(filePath);
      if (result) {
        processedCount++;
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ 处理失败: ${filePath}`, error.message);
      errorCount++;
    }
  });

  console.log('\n📊 处理完成统计:');
  console.log(`   ✅ 已处理: ${processedCount} 个文件`);
  console.log(`   ⏭️  已跳过: ${skippedCount} 个文件`);
  console.log(`   ❌ 错误: ${errorCount} 个文件`);
  console.log(`   📁 总计: ${pagesToEnhance.length} 个文件`);
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { enhanceResponsiveStyles };
