#!/usr/bin/env node

/**
 * 404错误检测功能演示脚本
 * 
 * 这个脚本演示了控制台监控系统如何检测404和其他HTTP错误
 */

console.log('\n🎯 404错误检测功能演示\n');
console.log('='.repeat(60));

// 模拟网络错误数组
let networkErrors = [];

// 模拟console.error拦截器
function mockConsoleError(...args) {
  const errorMessage = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ');
  
  console.log(`\n📝 捕获到错误: ${errorMessage}`);
  
  // 检测404错误
  if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
    const urlMatch = errorMessage.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      networkErrors.push({
        url: urlMatch[0],
        status: 404,
        statusText: 'Not Found'
      });
      console.log('   ✅ 检测到404错误');
    }
  }
  
  // 检测其他HTTP错误
  const httpErrorMatch = errorMessage.match(/(\d{3})\s+([\w\s]+)/);
  if (httpErrorMatch && parseInt(httpErrorMatch[1]) >= 400) {
    networkErrors.push({
      url: errorMessage,
      status: parseInt(httpErrorMatch[1]),
      statusText: httpErrorMatch[2]
    });
    console.log(`   ✅ 检测到HTTP ${httpErrorMatch[1]}错误`);
  }
}

// 演示1: 检测404错误
console.log('\n\n📋 演示1: 检测404错误');
console.log('-'.repeat(60));

networkErrors = [];
mockConsoleError('404 Not Found: http://localhost:3000/api/users/999');
mockConsoleError('Failed to load resource: http://localhost:3000/api/not-found 404 Not Found');
mockConsoleError('GET http://localhost:3000/api/missing returned 404');

console.log('\n📊 检测结果:');
console.log(`   总错误数: ${networkErrors.length}`);
console.log(`   404错误数: ${networkErrors.filter(e => e.status === 404).length}`);
console.log('\n   详细信息:');
networkErrors.forEach((err, index) => {
  console.log(`   ${index + 1}. [${err.status}] ${err.statusText}`);
  console.log(`      URL: ${err.url}`);
});

// 演示2: 检测多种HTTP错误
console.log('\n\n📋 演示2: 检测多种HTTP错误');
console.log('-'.repeat(60));

networkErrors = [];
mockConsoleError('400 Bad Request: http://localhost:3000/api/invalid');
mockConsoleError('401 Unauthorized: http://localhost:3000/api/protected');
mockConsoleError('403 Forbidden: http://localhost:3000/api/admin');
mockConsoleError('404 Not Found: http://localhost:3000/api/missing');
mockConsoleError('500 Internal Server Error: http://localhost:3000/api/error');
mockConsoleError('503 Service Unavailable: http://localhost:3000/api/down');

console.log('\n📊 检测结果:');
console.log(`   总错误数: ${networkErrors.length}`);

const errors4xx = networkErrors.filter(e => e.status >= 400 && e.status < 500);
const errors5xx = networkErrors.filter(e => e.status >= 500);

console.log(`   4xx错误数: ${errors4xx.length}`);
console.log(`   5xx错误数: ${errors5xx.length}`);

console.log('\n   按状态码分类:');
const statusCounts = {};
networkErrors.forEach(err => {
  statusCounts[err.status] = (statusCounts[err.status] || 0) + 1;
});
Object.entries(statusCounts).forEach(([status, count]) => {
  console.log(`   ${status}: ${count}个`);
});

// 演示3: 错误过滤和查询
console.log('\n\n📋 演示3: 错误过滤和查询');
console.log('-'.repeat(60));

networkErrors = [];
mockConsoleError('404 Not Found: http://localhost:3000/api/users/1');
mockConsoleError('404 Not Found: http://localhost:3000/api/users/2');
mockConsoleError('404 Not Found: http://localhost:3000/api/posts/1');
mockConsoleError('500 Internal Server Error: http://localhost:3000/api/error');

console.log('\n📊 查询结果:');

// 查询所有404错误
const errors404 = networkErrors.filter(e => e.status === 404);
console.log(`\n   所有404错误 (${errors404.length}个):`);
errors404.forEach((err, index) => {
  console.log(`   ${index + 1}. ${err.url}`);
});

// 查询特定URL的错误
const userErrors = networkErrors.filter(e => e.url.includes('/users/'));
console.log(`\n   /users/ 相关错误 (${userErrors.length}个):`);
userErrors.forEach((err, index) => {
  console.log(`   ${index + 1}. [${err.status}] ${err.url}`);
});

// 演示4: 错误统计报告
console.log('\n\n📋 演示4: 生成错误统计报告');
console.log('-'.repeat(60));

networkErrors = [];
// 模拟一批错误
const testErrors = [
  '404 Not Found: http://localhost:3000/api/endpoint1',
  '404 Not Found: http://localhost:3000/api/endpoint2',
  '404 Not Found: http://localhost:3000/api/endpoint3',
  '403 Forbidden: http://localhost:3000/api/admin',
  '500 Internal Server Error: http://localhost:3000/api/error1',
  '500 Internal Server Error: http://localhost:3000/api/error2',
  '503 Service Unavailable: http://localhost:3000/api/down',
];

testErrors.forEach(err => mockConsoleError(err));

console.log('\n📊 错误统计报告:');
console.log(`
   总错误数: ${networkErrors.length}
   
   按类型分类:
   - 4xx (客户端错误): ${networkErrors.filter(e => e.status >= 400 && e.status < 500).length}
   - 5xx (服务器错误): ${networkErrors.filter(e => e.status >= 500).length}
   
   按状态码分类:
   - 404 (Not Found): ${networkErrors.filter(e => e.status === 404).length}
   - 403 (Forbidden): ${networkErrors.filter(e => e.status === 403).length}
   - 500 (Internal Server Error): ${networkErrors.filter(e => e.status === 500).length}
   - 503 (Service Unavailable): ${networkErrors.filter(e => e.status === 503).length}
`);

// 演示5: 实际使用场景
console.log('\n\n📋 演示5: 实际使用场景');
console.log('-'.repeat(60));

console.log('\n场景1: 页面加载检测');
console.log('   模拟页面加载过程...');
networkErrors = [];
mockConsoleError('404 Not Found: http://localhost:3000/static/missing-image.png');
mockConsoleError('404 Not Found: http://localhost:3000/static/missing-script.js');

if (networkErrors.length > 0) {
  console.log(`   ❌ 页面加载失败: 发现 ${networkErrors.length} 个404错误`);
  networkErrors.forEach(err => {
    console.log(`      - ${err.url}`);
  });
} else {
  console.log('   ✅ 页面加载成功: 没有404错误');
}

console.log('\n场景2: API调用检测');
console.log('   模拟API调用...');
networkErrors = [];
// 模拟成功的API调用（没有错误）

if (networkErrors.length > 0) {
  console.log(`   ❌ API调用失败: 发现 ${networkErrors.length} 个错误`);
} else {
  console.log('   ✅ API调用成功: 没有HTTP错误');
}

console.log('\n场景3: 资源加载检测');
console.log('   模拟资源加载...');
networkErrors = [];
mockConsoleError('404 Not Found: http://localhost:3000/images/logo.png');

if (networkErrors.filter(e => e.status === 404).length > 0) {
  console.log('   ❌ 资源加载失败: 发现404错误');
  console.log('   建议: 检查资源路径是否正确');
} else {
  console.log('   ✅ 资源加载成功');
}

// 总结
console.log('\n\n' + '='.repeat(60));
console.log('✅ 演示完成！');
console.log('\n📚 功能总结:');
console.log('   1. ✅ 自动检测404错误');
console.log('   2. ✅ 检测所有HTTP错误 (4xx, 5xx)');
console.log('   3. ✅ 提取URL和状态码信息');
console.log('   4. ✅ 支持错误过滤和查询');
console.log('   5. ✅ 生成详细的错误报告');
console.log('   6. ✅ 适用于多种实际场景');

console.log('\n💡 使用建议:');
console.log('   - 在测试中使用 expectNo404Errors() 确保没有404错误');
console.log('   - 在 afterEach 中统一检查HTTP错误');
console.log('   - 使用 get404Errors() 获取详细错误信息');
console.log('   - 使用 clearNetworkErrors() 清除预期的错误');

console.log('\n📖 详细文档:');
console.log('   client/tests/404-DETECTION-DEMO.md');
console.log('   client/tests/setup/console-monitoring.ts');
console.log('   client/tests/unit/console-monitoring/404-detection.test.ts');

console.log('\n' + '='.repeat(60) + '\n');

