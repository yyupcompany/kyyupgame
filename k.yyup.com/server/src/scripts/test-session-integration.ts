/**
 * 会话管理集成测试
 * 
 * 测试登录、登出、Token黑名单、会话管理等完整流程
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import axios from 'axios';
import RedisService from '../services/redis.service';
import SessionService from '../services/session.service';
import { sequelize } from '../database';

const API_BASE_URL = 'http://localhost:3000/api';

// 测试用户凭据
const testUser = {
  username: 'admin',
  password: 'admin123'
};

async function testSessionIntegration() {
  console.log('🚀 开始会话管理集成测试...\n');

  let token1: string = '';
  let token2: string = '';
  let refreshToken: string = '';

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 测试1: 用户登录（第一次）
    console.log('📝 测试1: 用户登录（第一次）');
    try {
      const loginResponse1 = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
      
      if (loginResponse1.data.success) {
        token1 = loginResponse1.data.data.token;
        refreshToken = loginResponse1.data.data.refreshToken;
        console.log(`✅ 登录成功，Token: ${token1.substring(0, 20)}...`);
        console.log(`✅ RefreshToken: ${refreshToken.substring(0, 20)}...`);
      } else {
        console.log('❌ 登录失败:', loginResponse1.data.message);
      }
    } catch (error: any) {
      console.log('❌ 登录请求失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试2: 验证会话已创建
    console.log('📝 测试2: 验证会话已创建');
    const stats1 = await SessionService.getSessionStats();
    console.log(`✅ 在线用户数: ${stats1.totalOnlineUsers}`);
    console.log(`✅ 总会话数: ${stats1.totalSessions}`);
    console.log('');

    // 测试3: 用户再次登录（单点登录，应踢出第一个会话）
    console.log('📝 测试3: 用户再次登录（单点登录）');
    try {
      const loginResponse2 = await axios.post(`${API_BASE_URL}/auth/login`, testUser);
      
      if (loginResponse2.data.success) {
        token2 = loginResponse2.data.data.token;
        console.log(`✅ 第二次登录成功，Token: ${token2.substring(0, 20)}...`);
      }
    } catch (error: any) {
      console.log('❌ 第二次登录失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试4: 验证第一个Token已被加入黑名单
    console.log('📝 测试4: 验证第一个Token已被加入黑名单');
    const isBlacklisted = await SessionService.isBlacklisted(token1);
    console.log(`✅ 第一个Token在黑名单中: ${isBlacklisted}`);
    console.log('');

    // 测试5: 使用第一个Token访问API（应失败）
    console.log('📝 测试5: 使用第一个Token访问API（应失败）');
    try {
      await axios.get(`${API_BASE_URL}/sessions/my`, {
        headers: { Authorization: `Bearer ${token1}` }
      });
      console.log('❌ 应该失败但成功了');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(`✅ 正确拒绝了黑名单Token: ${error.response.data.message}`);
      } else {
        console.log('❌ 错误类型不对:', error.response?.data || error.message);
      }
    }
    console.log('');

    // 测试6: 使用第二个Token访问API（应成功）
    console.log('📝 测试6: 使用第二个Token访问API（应成功）');
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/my`, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      
      if (response.data.success) {
        console.log(`✅ 获取会话成功，会话数: ${response.data.data.count}`);
      }
    } catch (error: any) {
      console.log('❌ 获取会话失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试7: 获取会话统计（管理员）
    console.log('📝 测试7: 获取会话统计');
    try {
      const response = await axios.get(`${API_BASE_URL}/sessions/stats`, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      
      if (response.data.success) {
        const stats = response.data.data;
        console.log('✅ 会话统计:');
        console.log(`   总在线用户数: ${stats.totalOnlineUsers}`);
        console.log(`   总会话数: ${stats.totalSessions}`);
        console.log(`   黑名单Token数: ${stats.blacklistedTokens}`);
        console.log(`   按角色统计: ${JSON.stringify(stats.sessionsByRole)}`);
      }
    } catch (error: any) {
      console.log('❌ 获取统计失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试8: 更新会话活跃时间
    console.log('📝 测试8: 更新会话活跃时间');
    try {
      const response = await axios.put(`${API_BASE_URL}/sessions/activity`, {}, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      
      if (response.data.success) {
        console.log('✅ 会话活跃时间已更新');
      }
    } catch (error: any) {
      console.log('❌ 更新活跃时间失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试9: 用户登出
    console.log('📝 测试9: 用户登出');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      
      if (response.data.success) {
        console.log('✅ 登出成功');
      }
    } catch (error: any) {
      console.log('❌ 登出失败:', error.response?.data || error.message);
    }
    console.log('');

    // 测试10: 验证登出后Token已加入黑名单
    console.log('📝 测试10: 验证登出后Token已加入黑名单');
    const isBlacklisted2 = await SessionService.isBlacklisted(token2);
    console.log(`✅ 第二个Token在黑名单中: ${isBlacklisted2}`);
    console.log('');

    // 测试11: 使用登出的Token访问API（应失败）
    console.log('📝 测试11: 使用登出的Token访问API（应失败）');
    try {
      await axios.get(`${API_BASE_URL}/sessions/my`, {
        headers: { Authorization: `Bearer ${token2}` }
      });
      console.log('❌ 应该失败但成功了');
    } catch (error: any) {
      if (error.response?.status === 401) {
        console.log(`✅ 正确拒绝了登出的Token: ${error.response.data.message}`);
      } else {
        console.log('❌ 错误类型不对:', error.response?.data || error.message);
      }
    }
    console.log('');

    // 测试12: 最终会话统计
    console.log('📝 测试12: 最终会话统计');
    const finalStats = await SessionService.getSessionStats();
    console.log('✅ 最终统计:');
    console.log(`   总在线用户数: ${finalStats.totalOnlineUsers}`);
    console.log(`   总会话数: ${finalStats.totalSessions}`);
    console.log(`   黑名单Token数: ${finalStats.blacklistedTokens}`);
    console.log('');

    console.log('🎉 所有集成测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清理黑名单Token
    if (token1) {
      const key1 = `token:blacklist:${token1}`;
      await RedisService.del(key1);
    }
    if (token2) {
      const key2 = `token:blacklist:${token2}`;
      await RedisService.del(key2);
    }
    
    // 清理会话数据
    await RedisService.del('online:users');
    const sessionPattern = 'user:session:*';
    const sessionKeys = await RedisService.keys(sessionPattern);
    for (const key of sessionKeys) {
      await RedisService.del(key);
    }
    
    const tokenPattern = 'session:token:*';
    const tokenKeys = await RedisService.keys(tokenPattern);
    for (const key of tokenKeys) {
      await RedisService.del(key);
    }
    
    console.log('✅ 测试数据已清理');
    
    // 断开连接
    await RedisService.disconnect();
    await sequelize.close();
    console.log('👋 连接已关闭');
    process.exit(0);
  }
}

// 运行测试
testSessionIntegration();

