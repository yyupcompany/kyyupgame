#!/usr/bin/env node

/**
 * 自动化修复脚本
 * 基于验证结果自动修复组件问题
 */

const fs = require('fs');
const path = require('path');

const componentsToFix = [
  "src/components/business-center/QuickActionDialog.vue",
  "src/components/centers/FormModal.vue",
  "src/components/centers/SimpleFormModal.vue",
  "src/components/activity/ActivityActions.vue",
  "src/components/activity/ActivityStatusTag.vue",
  "src/pages/activity/analytics/intelligent-analysis.vue"
];

// 修复规则
const fixRules = {
  // 添加样式导入
  addImports: (content) => {
    if (!content.includes('@import "@/styles/design-tokens.scss"')) {
      content = content.replace(
        /<style lang="scss" scoped>/,
        '<style lang="scss" scoped>\n@import "@/styles/design-tokens.scss";\n@import "@/styles/list-components-optimization.scss";\n'
      );
    }
    return content;
  },

  // 替换颜色值
  replaceColors: (content) => {
    const colorMap = {
      '#ffffff': 'var(--bg-color)',
      '#f5f7fa': 'var(--bg-color-page)',
      '#303133': 'var(--text-color-primary)',
      '#606266': 'var(--text-color-secondary)',
      '#909399': 'var(--text-color-regular)',
      '#e4e7ed': 'var(--border-color-light)',
      '#409eff': 'var(--color-primary)',
      '#67c23a': 'var(--color-success)',
      '#e6a23c': 'var(--color-warning)',
      '#f56c6c': 'var(--color-danger)'
    };

    Object.entries(colorMap).forEach(([hex, variable]) => {
      const regex = new RegExp(`(?<!var\\()\\${hex}\\b`, 'g');
      content = content.replace(regex, variable);
    });

    return content;
  },

  // 替换尺寸值
  replaceSizes: (content) => {
    const sizeMap = {
      '4px': 'var(--border-radius-base)',
      '6px': 'var(--border-radius-small)',
      '8px': 'var(--border-radius-round)',
      '12px': 'var(--spacing-md)',
      '16px': 'var(--spacing-lg)',
      '20px': 'var(--spacing-xl)',
      '24px': 'var(--spacing-xxl)'
    };

    Object.entries(sizeMap).forEach(([size, variable]) => {
      const regex = new RegExp(`\\b${size}\\b`, 'g');
      content = content.replace(regex, variable);
    });

    return content;
  }
};

// 执行修复
componentsToFix.forEach(componentPath => {
  const fullPath = path.resolve(componentPath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  文件不存在: ${fullPath}`);
    return;
  }

  console.log(`🔧 修复组件: ${componentPath}`);

  let content = fs.readFileSync(fullPath, 'utf-8');
  const originalContent = content;

  // 应用修复规则
  content = fixRules.addImports(content);
  content = fixRules.replaceColors(content);
  content = fixRules.replaceSizes(content);

  // 保存修复后的文件
  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content);
    console.log(`   ✅ 已修复`);
  } else {
    console.log(`   ℹ️  无需修复`);
  }
});

console.log('\n🎉 自动修复完成！');
