const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 开始初始化页面说明文档...');

try {
  // 编译TypeScript
  console.log('🔧 编译TypeScript...');
  execSync('npx tsc', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit' 
  });

  // 运行种子数据
  console.log('🌱 运行页面说明文档种子数据...');
  execSync('node -e "require(\'./dist/services/page-guide-seed.service.js\').PageGuideSeedService.seedPageGuides().then(() => console.log(\'✅ 完成\')).catch(console.error)"', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  console.log('✅ 页面说明文档初始化完成！');
} catch (error) {
  console.error('❌ 初始化失败:', error.message);
  process.exit(1);
}
