/**
 * Dashboard缓存集成测试
 * 
 * 测试Dashboard Controller与CenterCacheService的集成
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import axios from 'axios';
import RedisService from '../services/redis.service';
import CenterCacheService from '../services/center-cache.service';
import { sequelize } from '../database';

const API_BASE_URL = 'http://localhost:3000/api';

// 测试用户Token（需要先登录获取）
let testToken: string = '';

async function login() {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    if (response.data.success) {
      testToken = response.data.data.token;
      console.log('✅ 登录成功\n');
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('❌ 登录失败:', error.response?.data || error.message);
    return false;
  }
}

async function testDashboardCacheIntegration() {
  console.log('🚀 开始Dashboard缓存集成测试...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 登录获取Token
    console.log('📝 测试1: 用户登录');
    const loginSuccess = await login();
    if (!loginSuccess) {
      throw new Error('登录失败');
    }

    // 清除所有Dashboard缓存
    console.log('📝 测试2: 清除所有Dashboard缓存');
    await CenterCacheService.clearCenterCache('dashboard');
    console.log('✅ 缓存已清除\n');

    // 测试3: 首次获取Dashboard数据（从数据库）
    console.log('📝 测试3: 首次获取Dashboard数据（从数据库）');
    const startTime1 = Date.now();
    const response1 = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const time1 = Date.now() - startTime1;
    
    if (response1.data.success) {
      console.log('✅ Dashboard数据获取成功');
      console.log(`   从缓存: ${response1.data.meta?.fromCache}`);
      console.log(`   响应时间: ${time1}ms`);
      console.log(`   用户数: ${response1.data.data.userCount}`);
      console.log(`   学生数: ${response1.data.data.studentCount}`);
      console.log(`   教师数: ${response1.data.data.teacherCount}`);
      console.log(`   班级数: ${response1.data.data.classCount}`);
      console.log(`   活动数: ${response1.data.data.activityCount}`);
    }
    console.log('');

    // 测试4: 再次获取Dashboard数据（从缓存）
    console.log('📝 测试4: 再次获取Dashboard数据（从缓存）');
    const startTime2 = Date.now();
    const response2 = await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const time2 = Date.now() - startTime2;
    
    if (response2.data.success) {
      console.log('✅ Dashboard数据获取成功');
      console.log(`   从缓存: ${response2.data.meta?.fromCache}`);
      console.log(`   响应时间: ${time2}ms`);
      console.log(`   性能提升: ${((time1 - time2) / time1 * 100).toFixed(2)}%`);
      console.log(`   缓存命中率: ${response2.data.meta?.cacheHitRate}`);
    }
    console.log('');

    // 测试5: 强制刷新Dashboard数据
    console.log('📝 测试5: 强制刷新Dashboard数据');
    const startTime3 = Date.now();
    const response3 = await axios.get(`${API_BASE_URL}/dashboard/stats?forceRefresh=true`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const time3 = Date.now() - startTime3;
    
    if (response3.data.success) {
      console.log('✅ Dashboard数据强制刷新成功');
      console.log(`   从缓存: ${response3.data.meta?.fromCache}`);
      console.log(`   响应时间: ${time3}ms`);
    }
    console.log('');

    // 测试6: 获取缓存统计
    console.log('📝 测试6: 获取缓存统计');
    const statsResponse = await axios.get(`${API_BASE_URL}/dashboard/cache/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    if (statsResponse.data.success) {
      console.log('✅ 缓存统计:');
      console.log(`   Controller统计:`);
      console.log(`     总请求: ${statsResponse.data.data.controller.totalRequests}`);
      console.log(`     缓存命中: ${statsResponse.data.data.controller.cacheHits}`);
      console.log(`     缓存未命中: ${statsResponse.data.data.controller.cacheMisses}`);
      console.log(`     缓存命中率: ${statsResponse.data.data.controller.cacheHitRate.toFixed(2)}%`);
      console.log(`   Service统计:`);
      console.log(`     总请求: ${statsResponse.data.data.service.totalRequests}`);
      console.log(`     缓存命中: ${statsResponse.data.data.service.cacheHits}`);
      console.log(`     缓存未命中: ${statsResponse.data.data.service.cacheMisses}`);
      console.log(`     缓存命中率: ${statsResponse.data.data.service.cacheHitRate.toFixed(2)}%`);
    }
    console.log('');

    // 测试7: 性能对比测试（10次请求）
    console.log('📝 测试7: 性能对比测试（10次请求）');
    
    // 清除缓存
    await axios.post(`${API_BASE_URL}/dashboard/cache/clear?clearAll=true`, {}, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    // 第一次请求（从数据库）
    const dbStartTime = Date.now();
    await axios.get(`${API_BASE_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    const dbTime = Date.now() - dbStartTime;
    
    // 后续9次请求（从缓存）
    const cacheTimes: number[] = [];
    for (let i = 0; i < 9; i++) {
      const cacheStartTime = Date.now();
      await axios.get(`${API_BASE_URL}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${testToken}` }
      });
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

    // 测试8: 清除用户缓存
    console.log('📝 测试8: 清除用户缓存');
    const clearResponse = await axios.post(`${API_BASE_URL}/dashboard/cache/clear`, {}, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    if (clearResponse.data.success) {
      console.log(`✅ ${clearResponse.data.message}`);
    }
    console.log('');

    // 测试9: 最终缓存统计
    console.log('📝 测试9: 最终缓存统计');
    const finalStatsResponse = await axios.get(`${API_BASE_URL}/dashboard/cache/stats`, {
      headers: { Authorization: `Bearer ${testToken}` }
    });
    
    if (finalStatsResponse.data.success) {
      console.log('✅ 最终统计:');
      console.log(`   总请求: ${finalStatsResponse.data.data.controller.totalRequests}`);
      console.log(`   缓存命中: ${finalStatsResponse.data.data.controller.cacheHits}`);
      console.log(`   缓存未命中: ${finalStatsResponse.data.data.controller.cacheMisses}`);
      console.log(`   缓存命中率: ${finalStatsResponse.data.data.controller.cacheHitRate.toFixed(2)}%`);
    }
    console.log('');

    console.log('🎉 所有集成测试完成！');

  } catch (error: any) {
    console.error('❌ 测试失败:', error.response?.data || error.message);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清理Dashboard缓存
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
testDashboardCacheIntegration();

