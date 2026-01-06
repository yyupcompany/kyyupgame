#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 批量修复CSS导入问题...');

const clientDir = path.join(__dirname, 'client/src');
const stylesDir = path.join(clientDir, 'styles');

// 需要修复的文件列表
const filesToFix = [
  'components/system/UserList.vue',
  'components/system/UserLogs.vue',
  'components/system/RoleForm.vue',
  'components/class/ClassDetailView.vue',
  'components/system/settings/SecuritySettings.vue',
  'components/class/ClassActions.vue',
  'components/class/ClassTypeTag.vue',
  'components/system/settings/BasicSettings.vue',
  'components/class/ClassStatusTag.vue',
  'components/system/settings/EmailSettings.vue',
  'components/system/settings/StorageSettings.vue',
  'components/student/StudentDetail.vue',
  'components/system/UserForm.vue',
  'components/system/RoleList.vue',
  'components/system/UserRoles.vue',
  'components/enrollment/QuotaStatistics.vue',
  'components/enrollment/EnrollmentPlanStatusTag.vue',
  'components/layout/SidebarItem.vue',
  'components/layout/Breadcrumb.vue',
  'components/application/ApplicationStatusTag.vue',
  'components/common/LoadingState.vue',
  'components/application/ApplicationReviewForm.vue',
  'components/common/ErrorBoundary.vue',
  'components/common/GlobalLoading.vue',
  'components/performance/PerformanceRulesList.vue',
  'components/common/LoadingSpinner.vue',
  'components/performance/PerformanceRuleForm.vue',
  'components/common/PageHeader.vue',
  'components/ai/AIChatContainer.vue',
  'components/ai/ChatSettings.vue',
  'components/ai/memory/MemorySearch.vue',
  'components/ai/model/ModelManagement.vue',
  'components/ai/memory/MemoryCard.vue',
  'components/ai/memory/MemoryVisualization.vue'
];

let fixedCount = 0;
let errorCount = 0;

filesToFix.forEach(relativeFilePath => {
  try {
    const fullPath = path.join(clientDir, relativeFilePath);

    if (fs.existsSync(fullPath)) {
      console.log(`🔍 修复: ${relativeFilePath}`);

      let content = fs.readFileSync(fullPath, 'utf8');

      // 替换 @/styles/index.scss 为 @/styles/design-tokens.scss
      const oldImport = "@use '@/styles/index.scss' as *;";
      const newImport = "@use '@/styles/design-tokens.scss' as *;";

      if (content.includes(oldImport)) {
        content = content.replace(oldImport, newImport);
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✅ 已修复`);
        fixedCount++;
      } else {
        console.log(`  ⚪ 无需修复`);
      }
    } else {
      console.log(`  ❌ 文件不存在: ${fullPath}`);
      errorCount++;
    }
  } catch (error) {
    console.log(`  ❌ 修复失败: ${error.message}`);
    errorCount++;
  }
});

console.log(`\n📊 修复完成统计:`);
console.log(`  ✅ 成功修复: ${fixedCount} 个文件`);
console.log(`  ❌ 修复失败: ${errorCount} 个文件`);

// 检查 design-tokens.scss 是否存在
const designTokensPath = path.join(stylesDir, 'design-tokens.scss');
if (fs.existsSync(designTokensPath)) {
  console.log(`  ✅ design-tokens.scss 文件存在`);
} else {
  console.log(`  ❌ design-tokens.scss 文件不存在`);
}

console.log(`\n🎯 建议:`);
console.log(`  1. 重启前端开发服务器以应用更改`);
console.log(`  2. 运行测试验证网络错误是否已解决`);
console.log(`  3. 检查浏览器开发者工具网络面板确认CSS文件加载正常`);