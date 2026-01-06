#!/usr/bin/env node

/**
 * 全面检测项目中的图标使用情况
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 全面检测项目中的图标使用情况...\n');

// 读取UnifiedIcon组件中可用的图标
const unifiedIconPath = './client/src/components/icons/UnifiedIcon.vue';
let availableIcons = [];

if (fs.existsSync(unifiedIconPath)) {
  const unifiedIconContent = fs.readFileSync(unifiedIconPath, 'utf8');
  const iconMatches = unifiedIconContent.match(/'([^']+)': {/g);
  availableIcons = iconMatches ? iconMatches.map(match => match.match(/'([^']+)': {/)[1]) : [];
  console.log(`✅ UnifiedIcon 中找到 ${availableIcons.length} 个可用图标`);
  console.log('📋 可用图标:', availableIcons.join(', '), '\n');
}

// 搜索所有Vue文件中的图标使用
const vueFiles = [];
function findVueFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findVueFiles(filePath);
    } else if (file.endsWith('.vue')) {
      vueFiles.push(filePath);
    }
  }
}

findVueFiles('./client/src');

console.log(`📁 找到 ${vueFiles.length} 个 Vue 文件\n`);

// 统计不同的图标使用模式
const iconUsageStats = {
  unifiedIcon: 0,      // 使用UnifiedIcon的文件
  otherIconComponents: 0, // 使用其他图标组件的文件
  iconFonts: 0,        // 使用图标字体的文件
  svgIcons: 0,         // 使用SVG图标的文件
  noIcons: 0           // 没有使用图标的文件
};

const filesWithIssues = [];

console.log('🔍 分析图标使用情况...\n');

for (const filePath of vueFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative('./client/src', filePath);

  const hasUnifiedIcon = content.includes('UnifiedIcon') || content.includes('unified-icon');
  const hasLucideIcon = content.includes('LucideIcon') || content.includes('lucide-icon');
  const hasIconFont = content.includes('fa-') || content.includes('icon-') || content.includes('mdi-');
  const hasSvgIcon = content.includes('<svg') || content.includes('<i class=');

  if (hasUnifiedIcon) {
    iconUsageStats.unifiedIcon++;
  } else if (hasLucideIcon) {
    iconUsageStats.otherIconComponents++;
    filesWithIssues.push({ file: relativePath, issue: '使用LucideIcon而非UnifiedIcon' });
  } else if (hasIconFont) {
    iconUsageStats.iconFonts++;
    filesWithIssues.push({ file: relativePath, issue: '使用图标字体而非UnifiedIcon' });
  } else if (hasSvgIcon) {
    iconUsageStats.svgIcons++;
    filesWithIssues.push({ file: relativePath, issue: '使用SVG图标而非UnifiedIcon' });
  } else {
    iconUsageStats.noIcons++;
  }
}

console.log('📊 图标使用统计:');
console.log(`✅ 使用UnifiedIcon: ${iconUsageStats.unifiedIcon} 个文件`);
console.log(`⚠️  使用其他图标组件: ${iconUsageStats.otherIconComponents} 个文件`);
console.log(`⚠️  使用图标字体: ${iconUsageStats.iconFonts} 个文件`);
console.log(`⚠️  使用SVG图标: ${iconUsageStats.svgIcons} 个文件`);
console.log(`ℹ️  无图标: ${iconUsageStats.noIcons} 个文件`);

if (filesWithIssues.length > 0) {
  console.log('\n❌ 需要修复的文件:');
  filesWithIssues.forEach(({ file, issue }) => {
    console.log(`  • ${file}: ${issue}`);
  });
}

// 检查具体的图标调用模式
console.log('\n🔍 检查图标调用模式...');

const unifiedIconUsage = [];
const otherIconUsage = [];

for (const filePath of vueFiles) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative('./client/src', filePath);

  // 查找UnifiedIcon的使用
  const unifiedMatches = content.match(/<UnifiedIcon[^>]*name="([^"]*)"[^>]*>/g);
  if (unifiedMatches) {
    unifiedMatches.forEach(match => {
      const nameMatch = match.match(/name="([^"]*)"/);
      if (nameMatch) {
        const iconName = nameMatch[1];
        if (!availableIcons.includes(iconName)) {
          filesWithIssues.push({
            file: relativePath,
            issue: `使用不存在的UnifiedIcon: ${iconName}`
          });
        }
      }
    });
  }

  // 查找其他图标组件的使用
  if (content.includes('LucideIcon')) {
    const lucideMatches = content.match(/<LucideIcon[^>]*name="([^"]*)"[^>]*>/g);
    if (lucideMatches) {
      lucideMatches.forEach(match => {
        const nameMatch = match.match(/name="([^"]*)"/);
        if (nameMatch) {
          otherIconUsage.push({ file: relativePath, icon: nameMatch[1], component: 'LucideIcon' });
        }
      });
    }
  }
}

console.log('\n📋 非UnifiedIcon使用情况:');
if (otherIconUsage.length > 0) {
  otherIconUsage.forEach(({ file, icon, component }) => {
    console.log(`  • ${file}: ${component} name="${icon}"`);
  });
} else {
  console.log('  ✅ 没有发现其他图标组件的使用');
}

console.log('\n🎯 图标检测完成！');
console.log(`📊 总计: ${vueFiles.length} 个文件，${filesWithIssues.length} 个需要修复`);