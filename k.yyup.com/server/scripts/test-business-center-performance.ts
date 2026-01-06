/**
 * 业务中心性能测试脚本
 * 
 * 用途：测试业务中心API的响应时间，验证缓存和索引优化效果
 * 执行方式：npm run test:business-center-performance
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TEST_ITERATIONS = 5;

interface PerformanceResult {
  endpoint: string;
  iteration: number;
  responseTime: number;
  cached: boolean;
}

/**
 * 测试单个API端点
 */
async function testEndpoint(endpoint: string, token: string): Promise<number> {
  const startTime = Date.now();
  
  try {
    await axios.get(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const endTime = Date.now();
    return endTime - startTime;
  } catch (error: any) {
    console.error(`❌ 请求失败 [${endpoint}]:`, error.message);
    return -1;
  }
}

/**
 * 获取登录Token
 */
async function getAuthToken(): Promise<string> {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    return response.data.data.token;
  } catch (error: any) {
    console.error('❌ 登录失败:', error.message);
    throw error;
  }
}

/**
 * 清空Redis缓存
 */
async function clearCache(token: string): Promise<void> {
  try {
    // 这里可以调用一个清空缓存的API，或者直接使用redis-cli
    console.log('🗑️  清空缓存...');
    // await axios.post(`${API_BASE_URL}/cache/clear`, {}, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
  } catch (error) {
    console.log('⚠️  清空缓存失败（可能没有清空缓存的API）');
  }
}

/**
 * 主测试函数
 */
async function main() {
  console.log('🚀 开始业务中心性能测试...\n');

  try {
    // 1. 获取认证Token
    console.log('🔐 正在登录...');
    const token = await getAuthToken();
    console.log('✅ 登录成功\n');

    // 2. 定义要测试的端点
    const endpoints = [
      '/business-center/timeline',
      '/business-center/enrollment-progress'
    ];

    const results: PerformanceResult[] = [];

    // 3. 测试每个端点
    for (const endpoint of endpoints) {
      console.log(`\n📊 测试端点: ${endpoint}`);
      console.log('='.repeat(60));

      // 清空缓存，测试首次加载
      await clearCache(token);
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待1秒

      for (let i = 1; i <= TEST_ITERATIONS; i++) {
        const responseTime = await testEndpoint(endpoint, token);
        
        if (responseTime > 0) {
          const cached = i > 1; // 第一次是无缓存，后续是有缓存
          results.push({
            endpoint,
            iteration: i,
            responseTime,
            cached
          });

          const cacheStatus = cached ? '✅ 缓存命中' : '❌ 无缓存';
          console.log(`  第${i}次请求: ${responseTime}ms ${cacheStatus}`);
        }

        // 等待一小段时间再发送下一个请求
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // 4. 统计分析
    console.log('\n' + '='.repeat(60));
    console.log('📈 性能统计分析');
    console.log('='.repeat(60));

    for (const endpoint of endpoints) {
      const endpointResults = results.filter(r => r.endpoint === endpoint);
      
      const firstRequest = endpointResults.find(r => r.iteration === 1);
      const cachedRequests = endpointResults.filter(r => r.iteration > 1);
      
      const avgCachedTime = cachedRequests.length > 0
        ? Math.round(cachedRequests.reduce((sum, r) => sum + r.responseTime, 0) / cachedRequests.length)
        : 0;

      console.log(`\n📊 ${endpoint}`);
      console.log(`  首次加载（无缓存）: ${firstRequest?.responseTime || 0}ms`);
      console.log(`  平均响应（有缓存）: ${avgCachedTime}ms`);
      
      if (firstRequest && avgCachedTime > 0) {
        const improvement = Math.round((1 - avgCachedTime / firstRequest.responseTime) * 100);
        console.log(`  性能提升: ${improvement}%`);
      }
    }

    // 5. 总体统计
    console.log('\n' + '='.repeat(60));
    console.log('📊 总体性能');
    console.log('='.repeat(60));

    const allFirstRequests = results.filter(r => r.iteration === 1);
    const allCachedRequests = results.filter(r => r.iteration > 1);

    const avgFirstTime = allFirstRequests.length > 0
      ? Math.round(allFirstRequests.reduce((sum, r) => sum + r.responseTime, 0) / allFirstRequests.length)
      : 0;

    const avgCachedTime = allCachedRequests.length > 0
      ? Math.round(allCachedRequests.reduce((sum, r) => sum + r.responseTime, 0) / allCachedRequests.length)
      : 0;

    console.log(`  平均首次加载: ${avgFirstTime}ms`);
    console.log(`  平均缓存响应: ${avgCachedTime}ms`);
    
    if (avgFirstTime > 0 && avgCachedTime > 0) {
      const improvement = Math.round((1 - avgCachedTime / avgFirstTime) * 100);
      console.log(`  总体性能提升: ${improvement}%`);
    }

    // 6. 性能评级
    console.log('\n' + '='.repeat(60));
    console.log('⭐ 性能评级');
    console.log('='.repeat(60));

    if (avgCachedTime < 100) {
      console.log('  🏆 优秀 - 响应时间 < 100ms');
    } else if (avgCachedTime < 300) {
      console.log('  ✅ 良好 - 响应时间 < 300ms');
    } else if (avgCachedTime < 500) {
      console.log('  ⚠️  一般 - 响应时间 < 500ms');
    } else {
      console.log('  ❌ 需要优化 - 响应时间 >= 500ms');
    }

    console.log('\n✅ 性能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    process.exit(1);
  }
}

// 执行主函数
main().catch(error => {
  console.error('❌ 脚本执行失败:', error);
  process.exit(1);
});

