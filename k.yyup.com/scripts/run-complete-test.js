const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始四角色完整测试（所有99个页面）\n');

async function runTest() {
  try {
    console.log('正在运行测试...\n');
    
    const output = execSync(
      'cd client/tests/comprehensive-e2e && npx playwright test all-pages-test.spec.ts --reporter=list 2>&1',
      { encoding: 'utf-8', timeout: 600000 }
    );
    
    console.log('\n✅ 测试完成！');
    console.log('\n📊 查看测试报告:');
    console.log('  - 综合报告: client/tests/comprehensive-e2e/reports/all-pages-test-report.md');
    console.log('  - Admin报告: client/tests/comprehensive-e2e/reports/admin-test-report.md');
    console.log('  - 问题报告: client/tests/comprehensive-e2e/reports/comprehensive-issues-report.md');
    
    return true;
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    return false;
  }
}

runTest().then(success => {
  process.exit(success ? 0 : 1);
}).catch(err => {
  console.error('运行错误:', err);
  process.exit(1);
});
