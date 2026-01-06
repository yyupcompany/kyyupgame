const fs = require('fs');

// 读取mobile/centers/index.vue，提取所有path
const centerIndexContent = fs.readFileSync('src/pages/mobile/centers/index.vue', 'utf-8');

// 提取菜单配置中的path
const pathMatches = centerIndexContent.match(/path: '\/mobile\/centers\/[^']+'/g) || [];
const requiredPaths = pathMatches.map(m => m.match(/'([^']+)'/)[1]);

console.log('📋 centers/index.vue中的按钮路径:');
requiredPaths.forEach(p => console.log('  -', p));

// 读取mobile-routes.ts
const routesContent = fs.readFileSync('src/router/mobile-routes.ts', 'utf-8');

// 检查每个路径是否在路由中
console.log('\n✅ 路由检查结果:');
const missing = [];
requiredPaths.forEach(path => {
  if (routesContent.includes(`path: '${path}'`)) {
    console.log('  ✅', path);
  } else {
    console.log('  ❌', path, '- 缺失！');
    missing.push(path);
  }
});

if (missing.length > 0) {
  console.log('\n⚠️ 缺少', missing.length, '个路由配置');
} else {
  console.log('\n🎉 所有路由都已配置！');
}
