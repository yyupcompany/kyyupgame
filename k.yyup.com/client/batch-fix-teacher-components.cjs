const fs = require('fs');
const path = require('path');

// 需要修复的高优先级组件列表
const componentsToFix = [
  'src/components/ai/OperationPanel-fixed.vue',
  'src/components/ai/OperationPanel.vue',
  'src/components/ai-assistant/core/AIAssistantCore.vue',
  'src/components/centers/activity/ActivityAnalytics.vue',
  'src/components/class/ClassDetailView.vue',
  'src/components/common/LazyDataTable.vue',
  'src/components/common/MarkdownRenderer.vue',
  'src/components/customer/CustomerBatchImportPreview.vue',
  'src/components/examples/AsyncDataExample.vue',
  'src/components/student/StudentDetail.vue',
  'src/components/system/RoleList.vue',
  'src/components/system/UserList.vue',
  'src/components/system/UserLogs.vue',
  'src/pages/activity/analytics/intelligent-analysis.vue',
  'src/pages/advertisement/index.vue',
  'src/pages/ai/analytics/real-time-analytics.vue',
  'src/pages/teacher-center/activities/components/ActivityDetail.vue',
  'src/pages/teacher-center/attendance/components/AttendanceHistory.vue',
  'src/pages/teacher-center/customer-tracking/components/ConversionFunnel.vue'
];

// 优化样式导入语句
const importStatement = '// 引入列表组件优化样式\n@import "@/styles/list-components-optimization.scss";';

// 修复单个组件
function fixComponent(filePath) {
  try {
    const fullPath = path.join(__dirname, filePath);

    // 检查文件是否存在
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  文件不存在: ${filePath}`);
      return false;
    }

    // 读取文件内容
    let content = fs.readFileSync(fullPath, 'utf8');

    // 检查是否已经包含优化样式
    if (content.includes('list-components-optimization.scss')) {
      console.log(`✅ 已包含优化样式: ${filePath}`);
      return true;
    }

    // 查找<style>标签
    const styleRegex = /<style[^>]*lang="scss"[^>]*>/gi;
    const styleMatch = content.match(styleRegex);

    if (!styleMatch) {
      console.log(`⚠️  未找到SCSS样式标签: ${filePath}`);
      return false;
    }

    // 在第一个<style>标签后添加import
    const firstStyleTag = styleMatch[0];
    const insertPosition = content.indexOf(firstStyleTag) + firstStyleTag.length;

    // 插入import语句
    const newContent = content.slice(0, insertPosition) +
                      '\n' + importStatement +
                      content.slice(insertPosition);

    // 写回文件
    fs.writeFileSync(fullPath, newContent, 'utf8');
    console.log(`✅ 已修复: ${filePath}`);
    return true;

  } catch (error) {
    console.error(`❌ 修复失败 ${filePath}:`, error.message);
    return false;
  }
}

// 批量修复
function batchFix() {
  console.log('🚀 开始批量修复教师相关组件...\n');

  let fixedCount = 0;
  let totalCount = componentsToFix.length;

  componentsToFix.forEach(filePath => {
    if (fixComponent(filePath)) {
      fixedCount++;
    }
  });

  console.log(`\n📊 批量修复完成！`);
  console.log(`✅ 成功修复: ${fixedCount}/${totalCount} 个组件`);
  console.log(`📁 已将优化样式导入到高优先级组件中`);
}

// 运行批量修复
batchFix();