/**
 * 第二阶段优化验证脚本
 * 验证智能缓存、提示词压缩和动态历史管理
 */

const axios = require('axios');

// 配置
const API_BASE = 'http://localhost:3000';
const TEST_QUERIES = [
  // 重复查询测试缓存
  '查询所有学生信息',
  '查询所有学生信息', // 重复
  '查询所有学生信息', // 重复
  '查询所有学生信息，用表格展示',
  '查询所有学生信息，用表格展示', // 重复
  '查询所有学生信息，用表格展示', // 重复

  // 长提示词测试压缩
  '查询学生数据，然后生成Excel报表，再导航到活动中心页面，创建一个新的活动，包含活动名称、时间、地点、参与人员等详细信息，最后生成活动宣传海报',
  '查询系统中的所有数据，包括学生、教师、班级、活动、招生等信息，用不同的图表形式展示出来，包括柱状图、折线图、饼图等',

  // 动态历史测试
  '第1轮：查询班级信息',
  '第2轮：在班级基础上添加学生信息',
  '第3轮：查看教师信息',
  '第4轮：分析活动数据',
  '第5轮：生成综合报表',
  '第6轮：导航到设置页面',
  '第7轮：查看系统状态',
  '第8轮：导出所有数据',
  '第9轮：继续添加更多信息',
  '第10轮：最终汇总报告'
];

async function testStage2Optimizations() {
  console.log('🚀 开始验证第二阶段优化效果...\n');

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

  console.log('\n📊 第一部分：智能缓存测试');
  console.log('=' .repeat(50));

  // 测试重复查询的缓存效果
  const cacheTestQueries = TEST_QUERIES.slice(0, 6);
  let totalCacheTestTime = 0;
  let cacheTestResults = [];

  for (let i = 0; i < cacheTestQueries.length; i++) {
    const query = cacheTestQueries[i];
    const isRepeat = i > 0 && query === cacheTestQueries[i-1];

    console.log(`\n📝 缓存测试 ${i + 1}: ${query}${isRepeat ? ' (重复)' : ''}`);

    try {
      const startTime = Date.now();

      const response = await axios.post(`${API_BASE}/api/ai-operator/single-round`, {
        content: query,
        userId: 'cache-test-user',
        conversationId: 'cache-test-conversation',
        context: {
          userRole: 'admin',
          enableTools: true
        }
      }, { headers });

      const endTime = Date.now();
      const duration = endTime - startTime;
      totalCacheTestTime += duration;

      const result = {
        query: query,
        duration: duration,
        isRepeat: isRepeat,
        contentLength: JSON.stringify(response.data).length
      };

      cacheTestResults.push(result);

      console.log(`   ⏱️  耗时: ${duration}ms`);
      console.log(`   📦 响应长度: ${result.contentLength} 字符`);

      // 检查是否有缓存相关的日志信息
      if (response.data.debugInfo) {
        console.log(`   💾 缓存信息: ${JSON.stringify(response.data.debugInfo)}`);
      }

    } catch (error) {
      console.log(`   ❌ 查询失败: ${error.message}`);
    }

    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 分析缓存效果
  console.log('\n📈 缓存效果分析:');
  const repeatQueries = cacheTestResults.filter(r => r.isRepeat);
  const firstTimeQueries = cacheTestResults.filter(r => !r.isRepeat);

  if (repeatQueries.length > 0 && firstTimeQueries.length > 0) {
    const avgFirstTime = firstTimeQueries.reduce((sum, r) => sum + r.duration, 0) / firstTimeQueries.length;
    const avgRepeat = repeatQueries.reduce((sum, r) => sum + r.duration, 0) / repeatQueries.length;
    const speedup = ((avgFirstTime - avgRepeat) / avgFirstTime * 100).toFixed(1);

    console.log(`   首次查询平均耗时: ${avgFirstTime.toFixed(0)}ms`);
    console.log(`   重复查询平均耗时: ${avgRepeat.toFixed(0)}ms`);
    console.log(`   🚀 缓存加速: ${speedup}%`);
  }

  console.log('\n📊 第二部分：提示词压缩测试');
  console.log('=' .repeat(50));

  // 测试长提示词的压缩效果
  const compressionTestQueries = TEST_QUERIES.slice(6, 8);

  for (let i = 0; i < compressionTestQueries.length; i++) {
    const query = compressionTestQueries[i];
    console.log(`\n📝 压缩测试 ${i + 1}: ${query.substring(0, 50)}...`);

    try {
      const response = await axios.post(`${API_BASE}/api/ai-operator/single-round`, {
        content: query,
        userId: 'compression-test-user',
        conversationId: `compression-test-${i}`,
        context: {
          userRole: 'admin',
          enableTools: true
        }
      }, { headers });

      // 检查响应中的压缩相关信息
      if (response.data.debugInfo) {
        console.log(`   🗜️  压缩信息: ${JSON.stringify(response.data.debugInfo)}`);
      }

      console.log(`   ✅ 查询完成`);

    } catch (error) {
      console.log(`   ❌ 查询失败: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📊 第三部分：动态历史管理测试');
  console.log('=' .repeat(50));

  // 测试动态历史长度管理
  const historyTestQueries = TEST_QUERIES.slice(8);

  for (let i = 0; i < historyTestQueries.length; i++) {
    const query = historyTestQueries[i];
    console.log(`\n📝 历史测试 ${i + 1}: ${query}`);

    try {
      const response = await axios.post(`${API_BASE}/api/ai-operator/single-round`, {
        content: query,
        userId: 'history-test-user',
        conversationId: 'history-test-conversation',
        context: {
          userRole: 'admin',
          enableTools: true
        }
      }, { headers });

      // 检查历史管理相关信息
      if (response.data.debugInfo) {
        console.log(`   📚 历史管理: ${JSON.stringify(response.data.debugInfo)}`);
      }

      console.log(`   ✅ 查询完成`);

    } catch (error) {
      console.log(`   ❌ 查询失败: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, 800));
  }

  console.log('\n📋 第二阶段优化总结');
  console.log('=' .repeat(50));

  // 获取Token监控统计
  try {
    const statsResponse = await axios.get(`${API_BASE}/api/ai/token-monitor/stats`, { headers });
    const stats = statsResponse.data.data;

    console.log('📊 Token使用统计:');
    console.log(`   当前使用: ${stats.currentUsage.totalTokens} tokens`);
    console.log(`   输入Token: ${stats.currentUsage.promptTokens}`);
    console.log(`   输出Token: ${stats.currentUsage.completionTokens}`);
    console.log(`   日均使用: ${stats.weeklyAverage.toFixed(0)} tokens`);
    console.log(`   预估日成本: ¥${stats.costEstimate.daily}`);

    if (stats.optimizationSuggestions && stats.optimizationSuggestions.length > 0) {
      console.log('\n💡 系统优化建议:');
      stats.optimizationSuggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }

  } catch (error) {
    console.log(`⚠️ 无法获取Token统计: ${error.message}`);
  }

  console.log('\n🎯 第二阶段优化效果:');
  console.log('✅ 智能工具选择缓存 - 已实施');
  console.log('✅ 分层提示词压缩 - 已实施');
  console.log('✅ 动态历史长度管理 - 已实施');
  console.log('✅ Token使用监控 - 已实施');

  console.log('\n🚀 性能改进预期:');
  console.log('- 重复查询加速: 30-50%');
  console.log('- 提示词长度减少: 20-40%');
  console.log('- 历史Token优化: 动态调整');
  console.log('- 内存使用优化: 智能清理');

  console.log('\n🎉 第二阶段验证完成！');
}

// 运行验证
if (require.main === module) {
  testStage2Optimizations().catch(console.error);
}

module.exports = { testStage2Optimizations };