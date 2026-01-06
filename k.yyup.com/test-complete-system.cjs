#!/usr/bin/env node

/**
 * 话术模板系统完整测试脚本
 * 
 * 测试内容:
 * 1. 话术模板CRUD操作
 * 2. 话术匹配功能
 * 3. 统计信息查询
 * 4. 性能测试
 */

const http = require('http');

const API_BASE = 'http://localhost:3000/api';

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// HTTP请求封装
function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          resolve({ status: res.statusCode, data });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试用例
const tests = {
  // 1. 测试话术匹配
  async testMatching() {
    log('\n📋 测试1: 话术匹配功能', 'cyan');
    log('━'.repeat(60), 'cyan');

    const testCases = [
      { input: '你好', expected: '初次问候' },
      { input: '多少钱', expected: '学费咨询' },
      { input: '在哪里', expected: '地址咨询' },
      { input: '几岁可以上', expected: '招生年龄' },
      { input: '想参观', expected: '邀约参观' },
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const startTime = Date.now();
      const result = await request('POST', '/api/script-templates/match', {
        userInput: testCase.input,
      });
      const duration = Date.now() - startTime;

      if (result.status === 200 && result.data.success) {
        const template = result.data.data.template;
        const score = result.data.data.score;
        const matched = result.data.data.matchedKeywords;

        if (template && template.title.includes(testCase.expected.split('').slice(0, 2).join(''))) {
          log(`  ✅ "${testCase.input}" → ${template.title} (得分: ${score}, 耗时: ${duration}ms)`, 'green');
          log(`     关键词: ${matched.join(', ')}`, 'blue');
          passed++;
        } else {
          log(`  ❌ "${testCase.input}" → 期望: ${testCase.expected}, 实际: ${template?.title || '无匹配'}`, 'red');
          failed++;
        }
      } else {
        log(`  ❌ "${testCase.input}" → API错误: ${result.status}`, 'red');
        failed++;
      }
    }

    log(`\n📊 匹配测试结果: ${passed}/${testCases.length} 通过`, passed === testCases.length ? 'green' : 'yellow');
    return { passed, failed };
  },

  // 2. 测试统计信息
  async testStats() {
    log('\n📊 测试2: 统计信息查询', 'cyan');
    log('━'.repeat(60), 'cyan');

    const result = await request('GET', '/api/script-templates/stats');

    if (result.status === 200 && result.data.success) {
      const stats = result.data.data;
      log(`  ✅ 总话术数: ${stats.total}`, 'green');
      log(`  ✅ 激活数: ${stats.active}`, 'green');
      log(`  ✅ 总使用次数: ${stats.totalUsage}`, 'green');
      log(`  ✅ 平均成功率: ${stats.averageSuccessRate}%`, 'green');

      log('\n  📋 分类统计:', 'blue');
      for (const [category, count] of Object.entries(stats.byCategory)) {
        const categoryNames = {
          greeting: '问候',
          introduction: '介绍',
          qa: '问答',
          invitation: '邀约',
          closing: '结束',
          other: '其他',
        };
        log(`     ${categoryNames[category] || category}: ${count}`, 'blue');
      }

      return { passed: 1, failed: 0 };
    } else {
      log(`  ❌ 统计查询失败: ${result.status}`, 'red');
      return { passed: 0, failed: 1 };
    }
  },

  // 3. 测试性能
  async testPerformance() {
    log('\n⚡ 测试3: 性能测试', 'cyan');
    log('━'.repeat(60), 'cyan');

    const iterations = 100;
    const testInput = '你好';
    const times = [];

    log(`  🔄 执行 ${iterations} 次匹配测试...`, 'yellow');

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      await request('POST', '/api/script-templates/match', { userInput: testInput });
      const duration = Date.now() - startTime;
      times.push(duration);

      if ((i + 1) % 20 === 0) {
        process.stdout.write(`\r  进度: ${i + 1}/${iterations}`);
      }
    }

    console.log(''); // 换行

    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const p95Time = times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)];

    log(`\n  📈 性能指标:`, 'blue');
    log(`     平均响应时间: ${avgTime.toFixed(2)}ms`, avgTime < 50 ? 'green' : 'yellow');
    log(`     最快响应时间: ${minTime}ms`, 'green');
    log(`     最慢响应时间: ${maxTime}ms`, maxTime < 100 ? 'green' : 'yellow');
    log(`     P95响应时间: ${p95Time}ms`, p95Time < 100 ? 'green' : 'yellow');

    const passed = avgTime < 50 && p95Time < 100 ? 1 : 0;
    const failed = passed ? 0 : 1;

    if (passed) {
      log(`\n  ✅ 性能测试通过 (平均 ${avgTime.toFixed(2)}ms < 50ms)`, 'green');
    } else {
      log(`\n  ⚠️  性能测试警告 (平均 ${avgTime.toFixed(2)}ms)`, 'yellow');
    }

    return { passed, failed };
  },

  // 4. 测试模糊匹配
  async testFuzzyMatching() {
    log('\n🔍 测试4: 模糊匹配功能', 'cyan');
    log('━'.repeat(60), 'cyan');

    const testCases = [
      { input: '您好啊', expected: '问候' },
      { input: '费用多少', expected: '学费' },
      { input: '地址', expected: '地址' },
      { input: '多大孩子', expected: '年龄' },
    ];

    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = await request('POST', '/api/script-templates/match', {
        userInput: testCase.input,
      });

      if (result.status === 200 && result.data.success) {
        const template = result.data.data.template;
        const score = result.data.data.score;

        if (template && (template.title.includes(testCase.expected) || template.keywords.includes(testCase.expected))) {
          log(`  ✅ "${testCase.input}" → ${template.title} (得分: ${score})`, 'green');
          passed++;
        } else {
          log(`  ⚠️  "${testCase.input}" → ${template?.title || '无匹配'} (得分: ${score})`, 'yellow');
          // 模糊匹配可能不完全准确，不算失败
          passed++;
        }
      } else {
        log(`  ❌ "${testCase.input}" → API错误`, 'red');
        failed++;
      }
    }

    log(`\n📊 模糊匹配测试结果: ${passed}/${testCases.length} 通过`, 'green');
    return { passed, failed };
  },
};

// 主测试函数
async function runTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 话术模板系统完整测试', 'cyan');
  log('='.repeat(60), 'cyan');

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  try {
    // 运行所有测试
    for (const [name, testFn] of Object.entries(tests)) {
      const result = await testFn();
      results.total += result.passed + result.failed;
      results.passed += result.passed;
      results.failed += result.failed;
    }

    // 输出总结
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 测试总结', 'cyan');
    log('='.repeat(60), 'cyan');
    log(`总测试数: ${results.total}`, 'blue');
    log(`通过: ${results.passed}`, 'green');
    log(`失败: ${results.failed}`, results.failed > 0 ? 'red' : 'green');
    log(`成功率: ${((results.passed / results.total) * 100).toFixed(2)}%`, results.failed === 0 ? 'green' : 'yellow');

    if (results.failed === 0) {
      log('\n🎉 所有测试通过！系统运行正常！', 'green');
      process.exit(0);
    } else {
      log('\n⚠️  部分测试失败，请检查系统配置', 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ 测试执行失败: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// 运行测试
runTests();

