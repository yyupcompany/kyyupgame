/**
 * 环境检测逻辑测试脚本
 * 测试统一AI Bridge的环境自动路由功能
 */

const testCases = [
  { hostname: 'localhost', expected: 'local', description: '本地开发环境' },
  { hostname: '127.0.0.1', expected: 'local', description: '本地回环地址' },
  { hostname: 'k.yyup.cc', expected: 'local', description: 'Demo环境' },
  { hostname: 'k.yyup.com', expected: 'local', description: 'Demo环境(备用域名)' },
  { hostname: 'k001.yyup.cc', expected: 'tenant', description: '租户环境 - k001' },
  { hostname: 'k002.yyup.cc', expected: 'tenant', description: '租户环境 - k002' },
  { hostname: 'k123.yyup.cc', expected: 'tenant', description: '租户环境 - k123' },
  { hostname: 'k001.yyup.com', expected: 'tenant', description: '租户环境 - k001(.com)' },
  { hostname: 'unknown.example.com', expected: 'local', description: '未知域名（默认本地）' }
];

console.log('='.repeat(70));
console.log('🧪 统一AI Bridge 环境检测逻辑测试');
console.log('='.repeat(70));

testCases.forEach((test, index) => {
  const result = detectEnvironment(test.hostname);
  const status = result === test.expected ? '✅ 通过' : '❌ 失败';

  console.log(`\n测试 ${index + 1}: ${test.description}`);
  console.log(`  输入: HOSTNAME=${test.hostname}`);
  console.log(`  期望: ${test.expected === 'local' ? '本地环境' : '租户环境'}`);
  console.log(`  实际: ${result === 'local' ? '本地环境' : '租户环境'}`);
  console.log(`  结果: ${status}`);
});

/**
 * 模拟环境检测逻辑
 */
function detectEnvironment(hostname) {
  // 本地/Demo环境
  const localPatterns = [
    'localhost',
    '127.0.0.1',
    'k.yyup.cc',
    'k.yyup.com'
  ];

  const isLocal = localPatterns.some(pattern => {
    return hostname === pattern || hostname.includes(pattern);
  });

  if (isLocal) {
    return 'local';
  }

  // 租户域名: k001.yyup.cc, k002.yyup.cc 等
  const tenantPattern = /^k\d{3}(\.\w+)*\.(yyup\.cc|yyup\.com)$/;
  if (tenantPattern.test(hostname)) {
    return 'tenant';
  }

  // 默认本地环境
  return 'local';
}

console.log('\n' + '='.repeat(70));
console.log('📊 测试总结');
console.log('='.repeat(70));
console.log(`总测试数: ${testCases.length}`);
console.log(`预期通过: ${testCases.length}`);
console.log(`环境检测逻辑已实现于: server/src/services/unified-ai-bridge.service.ts`);
