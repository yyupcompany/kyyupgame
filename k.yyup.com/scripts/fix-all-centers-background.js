#!/usr/bin/env node

/**
 * 统一所有中心页面的背景色
 * 以活动中心为标准模板
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const centersDir = path.join(__dirname, '../client/src/pages/centers');

// 活动中心的标准背景样式
const STANDARD_BACKGROUND_STYLE = `  background: var(--bg-secondary, #f5f7fa);`;

// 需要检查的中心页面
const centerPages = [
  'PersonnelCenter.vue',
  'EnrollmentCenter.vue',
  'TeachingCenter.vue',
  'MarketingCenter.vue',
  'SystemCenter.vue',
  'AICenter.vue',
  'CustomerPoolCenter.vue',
  'AttendanceCenter.vue',
  'BusinessCenter.vue',
  'TaskCenter.vue',
  'InspectionCenter.vue',
  'ScriptCenter.vue',
  'AnalyticsCenter.vue',
  'FinanceCenter.vue'
];

const results = {
  checked: 0,
  hasBackground: [],
  noBackground: [],
  errors: []
};

console.log('🔍 开始检查所有中心页面的背景色设置...\n');

centerPages.forEach(filename => {
  const filePath = path.join(centersDir, filename);
  
  if (!fs.existsSync(filePath)) {
    results.errors.push(`${filename} - 文件不存在`);
    return;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    results.checked++;
    
    // 查找样式部分
    const styleMatch = content.match(/<style[^>]*scoped[^>]*lang="scss">([\s\S]*?)<\/style>/);
    
    if (!styleMatch) {
      results.noBackground.push(`${filename} - 没有scoped样式`);
      return;
    }
    
    const styleContent = styleMatch[1];
    
    // 查找主容器类名
    const templateMatch = content.match(/<div class="center-container ([^"]+)">/);
    if (!templateMatch) {
      results.noBackground.push(`${filename} - 没有找到center-container`);
      return;
    }
    
    const containerClass = templateMatch[1];
    
    // 检查是否有background设置
    const classStyleRegex = new RegExp(`\\.${containerClass}\\s*\\{([^}]*?)\\}`, 's');
    const classStyleMatch = styleContent.match(classStyleRegex);
    
    if (!classStyleMatch) {
      results.noBackground.push(`${filename} - 没有.${containerClass}样式定义`);
      return;
    }
    
    const classStyle = classStyleMatch[1];
    
    // 检查是否有background设置
    if (classStyle.includes('background:') || classStyle.includes('background ')) {
      // 检查是否是正确的背景色
      if (classStyle.includes('var(--bg-secondary')) {
        results.hasBackground.push(`${filename} - ✅ 已有正确的背景色`);
      } else if (classStyle.includes('transparent')) {
        results.noBackground.push(`${filename} - ❌ 背景色为transparent`);
      } else {
        results.noBackground.push(`${filename} - ⚠️  背景色不标准`);
      }
    } else {
      results.noBackground.push(`${filename} - ❌ 没有设置背景色`);
    }
    
  } catch (error) {
    results.errors.push(`${filename} - 错误: ${error.message}`);
  }
});

console.log('📊 检查结果:\n');
console.log(`总共检查: ${results.checked} 个文件\n`);

if (results.hasBackground.length > 0) {
  console.log('✅ 已有正确背景色的页面:');
  results.hasBackground.forEach(item => console.log(`  ${item}`));
  console.log('');
}

if (results.noBackground.length > 0) {
  console.log('❌ 需要修复的页面:');
  results.noBackground.forEach(item => console.log(`  ${item}`));
  console.log('');
}

if (results.errors.length > 0) {
  console.log('⚠️  错误:');
  results.errors.forEach(item => console.log(`  ${item}`));
  console.log('');
}

// 生成修复报告
const report = `# 中心页面背景色检查报告

**检查时间**: ${new Date().toLocaleString()}

## 📊 统计

- 总共检查: ${results.checked} 个文件
- 已有正确背景: ${results.hasBackground.length} 个
- 需要修复: ${results.noBackground.length} 个
- 错误: ${results.errors.length} 个

## ✅ 已有正确背景色的页面

${results.hasBackground.map(item => `- ${item}`).join('\n')}

## ❌ 需要修复的页面

${results.noBackground.map(item => `- ${item}`).join('\n')}

## ⚠️ 错误

${results.errors.map(item => `- ${item}`).join('\n')}

## 🔧 修复建议

对于需要修复的页面，在主容器类的样式中添加：

\`\`\`scss
.your-center-class {
  background: var(--bg-secondary, #f5f7fa);
  // 其他样式...
}
\`\`\`

参考活动中心的实现：

\`\`\`scss
.activity-center-timeline {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--bg-secondary, #f5f7fa);  // ✅ 关键
}
\`\`\`
`;

fs.writeFileSync('CENTER_BACKGROUND_CHECK_REPORT.md', report, 'utf-8');
console.log('📄 详细报告已保存到: CENTER_BACKGROUND_CHECK_REPORT.md\n');

console.log('💡 下一步:');
console.log('   1. 查看报告了解哪些页面需要修复');
console.log('   2. 手动修复每个页面，添加 background: var(--bg-secondary, #f5f7fa)');
console.log('   3. 参考活动中心的样式结构\n');

