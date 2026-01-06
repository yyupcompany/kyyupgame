/**
 * 运行招生财务联动数据库迁移
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 开始运行招生财务联动数据库迁移...');

try {
  // 切换到server目录
  process.chdir('./server');
  
  console.log('📁 当前工作目录:', process.cwd());
  
  // 运行迁移
  console.log('🔄 执行数据库迁移...');
  const migrationResult = execSync('node -r ts-node/register ../server/src/migrations/20250621000000-add-enrollment-finance-fields.js', {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('✅ 数据库迁移执行完成');
  
  // 运行种子数据
  console.log('🌱 插入种子数据...');
  const seedResult = execSync('node -r ts-node/register ../server/src/seeders/20250621000000-fee-package-templates.js', {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('✅ 种子数据插入完成');
  
  console.log('🎉 招生财务联动功能数据库准备完成！');
  
} catch (error) {
  console.error('❌ 迁移过程中出现错误:', error.message);
  console.error('错误详情:', error);
  process.exit(1);
}
