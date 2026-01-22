#!/usr/bin/env node

/**
 * 移动端响应式样式添加工具
 *
 * 自动为移动端页面添加响应式样式支持
 *
 * 使用方法:
 * node scripts/add-responsive-mobile.js
 */

const fs = require('fs');
const path = require('path');

// 需要处理的页面列表
const pagesToProcess = [
  // 移动端中心页面
  'client/src/pages/mobile/centers/activity-center/index.vue',
  'client/src/pages/mobile/centers/ai-billing-center/index.vue',
  'client/src/pages/mobile/centers/ai-center/index.vue',
  'client/src/pages/mobile/centers/analytics-hub/index.vue',
  'client/src/pages/mobile/centers/assessment-center/index.vue',
  'client/src/pages/mobile/centers/business-hub/index.vue',
  'client/src/pages/mobile/centers/customer-pool-center/index.vue',
  'client/src/pages/mobile/centers/document-center/index.vue',
  'client/src/pages/mobile/centers/document-editor/index.vue',
  'client/src/pages/mobile/centers/document-template-center/index.vue',
  'client/src/pages/mobile/centers/document-template-center/use.vue',
  'client/src/pages/mobile/centers/enrollment-center/index.vue',
  'client/src/pages/mobile/centers/group-center/index.vue',
  'client/src/pages/mobile/centers/inspection-center/index.vue',
  'client/src/pages/mobile/centers/marketing-center/index.vue',
  'client/src/pages/mobile/centers/media-center/index.vue',
  'client/src/pages/mobile/centers/my-task-center/index.vue',
  'client/src/pages/mobile/centers/notification-center/index.vue',
  'client/src/pages/mobile/centers/permission-center/index.vue',
  'client/src/pages/mobile/centers/personnel-center/teacher-detail.vue',
  'client/src/pages/mobile/centers/photo-album-center/index.vue',
  'client/src/pages/mobile/centers/principal-center/index.vue',
  'client/src/pages/mobile/centers/schedule-center/index.vue',
  'client/src/pages/mobile/centers/settings-center/index.vue',
  'client/src/pages/mobile/centers/student-center/index.vue',
  'client/src/pages/mobile/centers/student-management/detail.vue',
  'client/src/pages/mobile/centers/student-management/index.vue',
  'client/src/pages/mobile/centers/system-center/index.vue',
  'client/src/pages/mobile/centers/system-log-center/index.vue',
  'client/src/pages/mobile/centers/teacher-center/index.vue',
  'client/src/pages/mobile/centers/teaching-center/index.vue',
  'client/src/pages/mobile/centers/usage-center/index.vue',
  'client/src/pages/mobile/centers/user-center/index.vue',
  // 移动端教师页面
  'client/src/pages/mobile/teacher-center/class-contacts/index.vue',
  'client/src/pages/mobile/teacher-center/creative-curriculum/index.vue',
  'client/src/pages/mobile/teacher-center/dashboard/index.vue',
  'client/src/pages/mobile/teacher-center/performance-rewards/index.vue',
  'client/src/pages/mobile/teacher-center/task-detail/index.vue',
  // 移动端家长页面
  'client/src/pages/mobile/parent-center/children/add.vue',
  'client/src/pages/mobile/parent-center/communication/index.vue'
];

// 响应式样式模板
const responsiveStyleTemplate = `
<style scoped lang="scss">
@import '@/styles/mixins/responsive-mobile.scss';

// 页面容器
.page-container {
  @include mobile-layout;
  min-height: 100vh;
  background: var(--van-background-2, #f5f5f5);
}

// 响应式卡片
.responsive-card {
  @include mobile-card;
}

// 响应式列表项
.list-item {
  @include mobile-list-item;
}

// 响应式按钮
.action-button {
  @include mobile-button;
}

// 响应式标题
.page-title {
  @include mobile-title;
}

// 响应式文本
.content-text {
  @include mobile-text;
}
</style>
`;

// 检查文件是否已包含响应式样式
function hasResponsiveStyles(content) {
  return content.includes('@import') &&
         content.includes('responsive-mobile') ||
         content.includes('@media') ||
         content.includes('mobile-layout');
}

// 添加响应式样式到Vue文件
function addResponsiveStyles(filePath) {
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

  // 检查是否有<style>标签
  const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);

  if (!styleMatch) {
    // 如果没有<style>标签,添加一个新的
    const newContent = content.replace(
      /<\/template>/,
      '</template>\n' + responsiveStyleTemplate
    );
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✨ 添加响应式样式: ${filePath} (新增style标签)`);
    return true;
  }

  // 如果已有<style>标签,检查是否是lang="scss"
  const hasScss = styleMatch[0].includes('lang="scss"') ||
                  styleMatch[0].includes("lang='scss'");

  if (hasScss) {
    // 如果已经是scss,添加import
    const importStatement = "@import '@/styles/mixins/responsive-mobile.scss';\n\n";
    const newStyle = styleMatch[0].replace(
      /<style[^>]*>/,
      (match) => match + '\n' + importStatement
    );
    const newContent = content.replace(styleMatch[0], newStyle);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✨ 添加响应式样式导入: ${filePath} (SCSS)`);
    return true;
  } else {
    // 如果不是scss,将lang="scss"添加到style标签
    const newStyleTag = styleMatch[0].replace(
      /<style/,
      '<style scoped lang="scss"'
    ).replace(
      /<style\s+scoped/,
      '<style scoped lang="scss"'
    );

    const importStatement = "@import '@/styles/mixins/responsive-mobile.scss';\n\n";
    const newStyle = newStyleTag.replace(
      /<style[^>]*>/,
      (match) => match + '\n' + importStatement
    );

    const newContent = content.replace(styleMatch[0], newStyle);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    console.log(`✨ 添加响应式样式导入: ${filePath} (转换为SCSS)`);
    return true;
  }
}

// 主函数
function main() {
  console.log('🚀 开始为移动端页面添加响应式样式...\n');

  let processedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  pagesToProcess.forEach(filePath => {
    try {
      const result = addResponsiveStyles(filePath);
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
  console.log(`   📁 总计: ${pagesToProcess.length} 个文件`);

  if (processedCount > 0) {
    console.log('\n💡 提示: 使用以下Mixin来添加响应式样式:');
    console.log('   - @include mobile-layout       // 基础布局');
    console.log('   - @include mobile-card         // 卡片样式');
    console.log('   - @include mobile-list-item    // 列表项');
    console.log('   - @include mobile-button       // 按钮样式');
    console.log('   - @include mobile-title        // 标题样式');
    console.log('   - @include mobile-text         // 文本样式');
    console.log('   - @include mobile-xs/md/lg     // 媒体查询');
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { addResponsiveStyles, hasResponsiveStyles };
