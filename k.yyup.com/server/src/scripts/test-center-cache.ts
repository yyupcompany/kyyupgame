/**
 * 中心缓存服务测试脚本
 * 
 * 测试中心缓存服务的所有功能
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import RedisService from '../services/redis.service';
import CenterCacheService from '../services/center-cache.service';
import { sequelize } from '../database';

async function testCenterCache() {
  console.log('🚀 开始测试中心缓存服务...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 测试用户
    const testUserId = 121; // admin用户
    const testUserRole = 'admin';

    // 测试1: 获取Dashboard数据（首次，从数据库）
    console.log('📝 测试1: 获取Dashboard数据（首次，从数据库）');
    const startTime1 = Date.now();
    const dashboardData1 = await CenterCacheService.getCenterData(
      'dashboard',
      testUserId,
      testUserRole
    );
    const time1 = Date.now() - startTime1;
    
    console.log(`✅ Dashboard数据获取成功`);
    console.log(`   从缓存: ${dashboardData1.meta?.fromCache}`);
    console.log(`   响应时间: ${time1}ms`);
    console.log(`   统计数据: ${JSON.stringify(dashboardData1.statistics).substring(0, 100)}...`);
    console.log('');

    // 测试2: 再次获取Dashboard数据（从缓存）
    console.log('📝 测试2: 再次获取Dashboard数据（从缓存）');
    const startTime2 = Date.now();
    const dashboardData2 = await CenterCacheService.getCenterData(
      'dashboard',
      testUserId,
      testUserRole
    );
    const time2 = Date.now() - startTime2;
    
    console.log(`✅ Dashboard数据获取成功`);
    console.log(`   从缓存: ${dashboardData2.meta?.fromCache}`);
    console.log(`   响应时间: ${time2}ms`);
    console.log(`   性能提升: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
    console.log('');

    // 测试3: 强制刷新Dashboard数据
    console.log('📝 测试3: 强制刷新Dashboard数据');
    const startTime3 = Date.now();
    const dashboardData3 = await CenterCacheService.getCenterData(
      'dashboard',
      testUserId,
      testUserRole,
      { forceRefresh: true }
    );
    const time3 = Date.now() - startTime3;
    
    console.log(`✅ Dashboard数据强制刷新成功`);
    console.log(`   从缓存: ${dashboardData3.meta?.fromCache}`);
    console.log(`   响应时间: ${time3}ms`);
    console.log('');

    // 测试4: 获取缓存统计
    console.log('📝 测试4: 获取缓存统计');
    const stats = CenterCacheService.getCacheStats('dashboard');
    console.log('✅ Dashboard缓存统计:');
    console.log(`   总请求数: ${stats.totalRequests}`);
    console.log(`   缓存命中: ${stats.cacheHits}`);
    console.log(`   缓存未命中: ${stats.cacheMisses}`);
    console.log(`   缓存命中率: ${stats.cacheHitRate.toFixed(2)}%`);
    console.log('');

    // 测试5: 测试不同用户的缓存隔离
    console.log('📝 测试5: 测试不同用户的缓存隔离');
    const testUserId2 = 122;
    const startTime5 = Date.now();
    const dashboardData5 = await CenterCacheService.getCenterData(
      'dashboard',
      testUserId2,
      testUserRole
    );
    const time5 = Date.now() - startTime5;
    
    console.log(`✅ 用户${testUserId2}的Dashboard数据获取成功`);
    console.log(`   从缓存: ${dashboardData5.meta?.fromCache}`);
    console.log(`   响应时间: ${time5}ms`);
    console.log(`   说明: 用户专属数据独立缓存，公共统计数据共享`);
    console.log('');

    // 测试6: 清除特定用户的缓存
    console.log('📝 测试6: 清除特定用户的缓存');
    await CenterCacheService.clearCenterCache('dashboard', testUserId, testUserRole);
    console.log(`✅ 用户${testUserId}的Dashboard缓存已清除`);
    
    const startTime6 = Date.now();
    const dashboardData6 = await CenterCacheService.getCenterData(
      'dashboard',
      testUserId,
      testUserRole
    );
    const time6 = Date.now() - startTime6;
    
    console.log(`✅ 清除后重新获取Dashboard数据`);
    console.log(`   从缓存: ${dashboardData6.meta?.fromCache}`);
    console.log(`   响应时间: ${time6}ms`);
    console.log('');

    // 测试7: 清除所有Dashboard缓存
    console.log('📝 测试7: 清除所有Dashboard缓存');
    await CenterCacheService.clearCenterCache('dashboard');
    console.log('✅ 所有Dashboard缓存已清除');
    console.log('');

    // 测试8: 性能对比测试（10次请求）
    console.log('📝 测试8: 性能对比测试（10次请求）');
    
    // 清除缓存
    await CenterCacheService.clearCenterCache('dashboard');
    
    // 第一次请求（从数据库）
    const dbStartTime = Date.now();
    await CenterCacheService.getCenterData('dashboard', testUserId, testUserRole);
    const dbTime = Date.now() - dbStartTime;
    
    // 后续9次请求（从缓存）
    const cacheTimes: number[] = [];
    for (let i = 0; i < 9; i++) {
      const cacheStartTime = Date.now();
      await CenterCacheService.getCenterData('dashboard', testUserId, testUserRole);
      cacheTimes.push(Date.now() - cacheStartTime);
    }
    
    const avgCacheTime = cacheTimes.reduce((a, b) => a + b, 0) / cacheTimes.length;
    const speedup = dbTime / avgCacheTime;
    
    console.log('✅ 性能对比结果:');
    console.log(`   数据库查询时间: ${dbTime}ms`);
    console.log(`   缓存平均响应时间: ${avgCacheTime.toFixed(2)}ms`);
    console.log(`   性能提升: ${((dbTime - avgCacheTime) / dbTime * 100).toFixed(2)}%`);
    console.log(`   加速倍数: ${speedup.toFixed(2)}x`);
    console.log('');

    // 测试9: 最终缓存统计
    console.log('📝 测试9: 最终缓存统计');
    const finalStats = CenterCacheService.getCacheStats('dashboard');
    console.log('✅ Dashboard最终统计:');
    console.log(`   总请求数: ${finalStats.totalRequests}`);
    console.log(`   缓存命中: ${finalStats.cacheHits}`);
    console.log(`   缓存未命中: ${finalStats.cacheMisses}`);
    console.log(`   缓存命中率: ${finalStats.cacheHitRate.toFixed(2)}%`);
    console.log('');

    // 测试10: 所有中心的缓存统计
    console.log('📝 测试10: 所有中心的缓存统计');
    const allStats = CenterCacheService.getCacheStats();
    console.log('✅ 所有中心缓存统计:');
    for (const [centerName, stats] of Object.entries(allStats)) {
      console.log(`   ${centerName}:`);
      console.log(`     总请求: ${stats.totalRequests}, 命中: ${stats.cacheHits}, 未命中: ${stats.cacheMisses}, 命中率: ${stats.cacheHitRate.toFixed(2)}%`);
    }
    console.log('');

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清理所有中心缓存
    await CenterCacheService.clearCenterCache('dashboard');
    
    console.log('✅ 测试数据已清理');
    
    // 断开连接
    await RedisService.disconnect();
    await sequelize.close();
    console.log('👋 连接已关闭');
    process.exit(0);
  }
}

// 运行测试
testCenterCache();

