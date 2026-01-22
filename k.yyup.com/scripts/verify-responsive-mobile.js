#!/usr/bin/env node

/**
 * 移动端响应式样式验证工具
 *
 * 验证所有移动端页面是否包含响应式样式
 *
 * 使用方法:
 * node scripts/verify-responsive-mobile.js
 */

const fs = require('fs');
const path = require('path');

// 需要验证的页面列表
const pagesToVerify = [
  // 移动端中心页面
  'client/src/pages/mobile/centers/Placeholder.vue',
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
  'client/src/pages/mobile/centers/index.vue',
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

// 验证单个文件的响应式样式
function verifyResponsiveStyles(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      file: filePath,
      status: 'missing',
      hasImport: false,
      hasMediaQuery: false,
      hasMixin: false,
      issues: ['文件不存在']
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  const hasImport = content.includes('@import') && content.includes('responsive-mobile');
  const hasMediaQuery = content.includes('@media') || content.includes('@include mobile-');
  const hasMixin = content.includes('@include mobile-');
  const hasScss = content.includes('lang="scss"') || content.includes("lang='scss'");

  const issues = [];
  if (!hasImport) {
    issues.push('缺少响应式样式导入');
  }
  if (!hasScss) {
    issues.push('不是SCSS格式');
  }
  if (!hasMixin && !hasMediaQuery) {
    issues.push('未使用响应式Mixin或媒体查询');
  }

  const status = issues.length === 0 ? 'pass' : (hasImport ? 'partial' : 'fail');

  return {
    file: filePath,
    status,
    hasImport,
    hasMediaQuery,
    hasMixin,
    isScss: hasScss,
    issues
  };
}

// 主函数
function main() {
  console.log('🔍 开始验证移动端响应式样式...\n');

  const results = pagesToVerify.map(filePath => verifyResponsiveStyles(filePath));

  // 统计结果
  const stats = {
    pass: results.filter(r => r.status === 'pass').length,
    partial: results.filter(r => r.status === 'partial').length,
    fail: results.filter(r => r.status === 'fail').length,
    missing: results.filter(r => r.status === 'missing').length,
    total: results.length
  };

  // 打印结果
  console.log('📊 验证结果统计:');
  console.log(`   ✅ 通过: ${stats.pass} 个文件`);
  console.log(`   ⚠️  部分: ${stats.partial} 个文件`);
  console.log(`   ❌ 失败: ${stats.fail} 个文件`);
  console.log(`   💥 缺失: ${stats.missing} 个文件`);
  console.log(`   📁 总计: ${stats.total} 个文件\n`);

  // 打印失败的文件
  const failedFiles = results.filter(r => r.status === 'fail' || r.status === 'missing');
  if (failedFiles.length > 0) {
    console.log('❌ 需要修复的文件:');
    failedFiles.forEach(result => {
      console.log(`   ${result.file}`);
      result.issues.forEach(issue => {
        console.log(`     - ${issue}`);
      });
    });
    console.log('');
  }

  // 打印部分的文件
  const partialFiles = results.filter(r => r.status === 'partial');
  if (partialFiles.length > 0) {
    console.log('⚠️  部分完成的文件:');
    partialFiles.forEach(result => {
      console.log(`   ${result.file}`);
      result.issues.forEach(issue => {
        console.log(`     - ${issue}`);
      });
    });
    console.log('');
  }

  // 打印通过率
  const passRate = ((stats.pass + stats.partial) / stats.total * 100).toFixed(1);
  console.log(`📈 完成率: ${passRate}%`);

  // 生成详细报告
  const reportPath = path.resolve(__dirname, '../RESPONSIVE_VERIFICATION_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    stats,
    results
  }, null, 2));
  console.log(`📄 详细报告已保存到: ${reportPath}`);

  // 返回退出码
  if (stats.fail > 0 || stats.missing > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { verifyResponsiveStyles };
