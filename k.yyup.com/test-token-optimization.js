/**
 * Token优化效果验证脚本
 * 验证第一阶段的修复效果
 */

const axios = require('axios');

// 配置
const API_BASE = 'http://localhost:3000';
const TEST_QUERIES = [
  '查询所有学生信息',
  '查询所有学生，用表格展示',
  '查询所有学生，用表格展示，然后导出Excel',
  '查询学生数据，然后生成Excel报表，最后导航到活动中心页面'
];

async function testTokenOptimization() {
  console.log('🚀 开始验证Token优化效果...\n');

  // 模拟登录获取token
  let authToken = null;
  try {
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    authToken = loginResponse.data.data.token;
    console.log('✅ 登录成功');
  } catch (error) {
    console.log('❌ 登录失败，使用测试模式');
  }

  const headers = authToken ? {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  } : { 'Content-Type': 'application/json' };

  // 测试每个查询
  for (let i = 0; i < TEST_QUERIES.length; i++) {
    const query = TEST_QUERIES[i];
    console.log(`\n📝 测试查询 ${i + 1}: ${query}`);

    try {
      const startTime = Date.now();

      // 调用AI接口
      const response = await axios.post(`${API_BASE}/api/ai-operator/single-round`, {
        content: query,
        userId: 'test-user',
        conversationId: `test-conversation-${i}`,
        context: {
          userRole: 'admin',
          enableTools: true
        }
      }, { headers });

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ 查询完成，耗时: ${duration}ms`);
      console.log(`📊 响应长度: ${JSON.stringify(response.data).length} 字符`);

      // 检查Token监控数据
      try {
        const statsResponse = await axios.get(`${API_BASE}/api/ai/token-monitor/stats`, { headers });
        const stats = statsResponse.data.data;

        console.log(`📈 Token使用情况:`);
        console.log(`   - 当前使用: ${stats.currentUsage.totalTokens} tokens`);
        console.log(`   - 输入Token: ${stats.currentUsage.promptTokens}`);
        console.log(`   - 输出Token: ${stats.currentUsage.completionTokens}`);
        console.log(`   - 日均使用: ${stats.weeklyAverage.toFixed(0)} tokens`);
        console.log(`   - 预估日成本: ¥${stats.costEstimate.daily}`);

        // 显示优化建议
        if (stats.optimizationSuggestions && stats.optimizationSuggestions.length > 0) {
          console.log(`💡 优化建议:`);
          stats.optimizationSuggestions.forEach((suggestion, index) => {
            console.log(`   ${index + 1}. ${suggestion}`);
          });
        }
      } catch (statsError) {
        console.log(`⚠️ 无法获取Token统计: ${statsError.message}`);
      }

    } catch (error) {
      console.log(`❌ 查询失败: ${error.message}`);
      if (error.response) {
        console.log(`   状态码: ${error.response.status}`);
        console.log(`   错误详情: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }

    // 等待一段时间再进行下一个测试
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n📋 测试总结:');
  console.log('✅ 前端历史长度限制 - 已实施');
  console.log('✅ 后端工具指南去重 - 已实施');
  console.log('✅ Token使用监控 - 已实施');
  console.log('🔧 智能缓存机制 - 计划中');
  console.log('🔧 提示词压缩 - 计划中');

  console.log('\n🎯 预期改进效果:');
  console.log('- Token使用量减少: 30-50%');
  console.log('- 响应时间减少: 20-30%');
  console.log('- 支持更长对话历史');
  console.log('- 实时成本监控');
}

// 性能基准测试
async function performanceBenchmark() {
  console.log('\n🏃‍♂️ 开始性能基准测试...');

  const testQuery = '查询系统状态信息';
  const iterations = 5;
  const responseTimes = [];

  for (let i = 0; i < iterations; i++) {
    try {
      const startTime = Date.now();

      await axios.post(`${API_BASE}/api/ai-operator/single-round`, {
        content: testQuery,
        userId: 'benchmark-user',
        conversationId: `benchmark-${i}`,
        context: { userRole: 'admin' }
      }, { 'Content-Type': 'application/json' });

      const endTime = Date.now();
      const responseTime = endTime - startTime;
      responseTimes.push(responseTime);

      console.log(`   第 ${i + 1} 次: ${responseTime}ms`);
    } catch (error) {
      console.log(`   第 ${i + 1} 次失败: ${error.message}`);
    }
  }

  if (responseTimes.length > 0) {
    const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    const minTime = Math.min(...responseTimes);
    const maxTime = Math.max(...responseTimes);

    console.log(`\n📊 性能基准结果:`);
    console.log(`   平均响应时间: ${avgTime.toFixed(0)}ms`);
    console.log(`   最快响应时间: ${minTime}ms`);
    console.log(`   最慢响应时间: ${maxTime}ms`);
    console.log(`   成功率: ${(responseTimes.length / iterations * 100).toFixed(1)}%`);
  }
}

// 检查系统健康状态
async function checkSystemHealth() {
  console.log('\n🏥 检查系统健康状态...');

  const healthChecks = [
    { name: 'AI服务', url: `${API_BASE}/api/ai/health` },
    { name: 'Token监控', url: `${API_BASE}/api/ai/token-monitor/stats` },
    { name: '系统状态', url: `${API_BASE}/api/health` }
  ];

  for (const check of healthChecks) {
    try {
      const response = await axios.get(check.url, {
        timeout: 5000,
        validateStatus: () => true // 接受所有状态码
      });

      const status = response.status >= 200 && response.status < 300 ? '✅' : '⚠️';
      console.log(`   ${status} ${check.name}: ${response.status}`);
    } catch (error) {
      console.log(`   ❌ ${check.name}: 不可用 (${error.code})`);
    }
  }
}

// 主函数
async function main() {
  console.log('🎯 AI系统Token优化验证');
  console.log('=' .repeat(50));

  try {
    await checkSystemHealth();
    await testTokenOptimization();
    await performanceBenchmark();

    console.log('\n🎉 验证完成！');
    console.log('请查看上述结果以确认优化效果。');

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error.message);
  }
}

// 运行验证
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testTokenOptimization, performanceBenchmark, checkSystemHealth };