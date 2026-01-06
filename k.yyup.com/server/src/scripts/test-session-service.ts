/**
 * 会话管理服务测试脚本
 * 
 * 测试会话管理服务的所有功能
 */

// 加载环境变量
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import RedisService from '../services/redis.service';
import SessionService, { UserSession } from '../services/session.service';
import { sequelize } from '../database';

async function testSessionService() {
  console.log('🚀 开始测试会话管理服务...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 准备测试数据
    const testSession1: UserSession = {
      userId: 1,
      username: 'admin',
      role: 'admin',
      token: 'test_token_1_' + Date.now(),
      loginTime: Date.now(),
      lastActiveTime: Date.now(),
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0',
      deviceId: 'device_1'
    };

    const testSession2: UserSession = {
      userId: 1,
      username: 'admin',
      role: 'admin',
      token: 'test_token_2_' + Date.now(),
      loginTime: Date.now(),
      lastActiveTime: Date.now(),
      ip: '192.168.1.101',
      userAgent: 'Chrome/120.0',
      deviceId: 'device_2'
    };

    const testSession3: UserSession = {
      userId: 2,
      username: 'teacher',
      role: 'teacher',
      token: 'test_token_3_' + Date.now(),
      loginTime: Date.now(),
      lastActiveTime: Date.now(),
      ip: '192.168.1.102',
      userAgent: 'Safari/17.0',
      deviceId: 'device_3'
    };

    // 测试1: Token黑名单
    console.log('📝 测试1: Token黑名单管理');
    
    console.log('   1.1 添加Token到黑名单');
    const blacklistResult = await SessionService.addToBlacklist(testSession1.token, 3600);
    console.log(`   ✅ 添加结果: ${blacklistResult}`);
    
    console.log('   1.2 检查Token是否在黑名单中');
    const isBlacklisted1 = await SessionService.isBlacklisted(testSession1.token);
    console.log(`   ✅ Token在黑名单中: ${isBlacklisted1}`);
    
    console.log('   1.3 检查不在黑名单中的Token');
    const isBlacklisted2 = await SessionService.isBlacklisted('non_existent_token');
    console.log(`   ✅ Token不在黑名单中: ${!isBlacklisted2}\n`);

    // 测试2: 创建会话
    console.log('📝 测试2: 创建用户会话');
    
    console.log('   2.1 创建用户1的第一个会话');
    const createResult1 = await SessionService.createSession(testSession1, false);
    console.log(`   ✅ 创建结果: ${createResult1}`);
    
    console.log('   2.2 创建用户1的第二个会话');
    const createResult2 = await SessionService.createSession(testSession2, false);
    console.log(`   ✅ 创建结果: ${createResult2}`);
    
    console.log('   2.3 创建用户2的会话');
    const createResult3 = await SessionService.createSession(testSession3, false);
    console.log(`   ✅ 创建结果: ${createResult3}\n`);

    // 测试3: 获取会话
    console.log('📝 测试3: 获取用户会话');
    
    console.log('   3.1 获取用户1的单个会话');
    const session1 = await SessionService.getUserSession(1, testSession1.token);
    console.log(`   ✅ 会话信息: 用户=${(session1 as UserSession)?.username}, Token=${(session1 as UserSession)?.token.substring(0, 20)}...`);
    
    console.log('   3.2 获取用户1的所有会话');
    const sessions1 = await SessionService.getUserSession(1);
    console.log(`   ✅ 会话数量: ${Array.isArray(sessions1) ? sessions1.length : 0}`);
    
    console.log('   3.3 获取用户2的所有会话');
    const sessions2 = await SessionService.getUserSession(2);
    console.log(`   ✅ 会话数量: ${Array.isArray(sessions2) ? sessions2.length : 0}\n`);

    // 测试4: 更新会话活跃时间
    console.log('📝 测试4: 更新会话活跃时间');
    
    console.log('   4.1 等待1秒...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('   4.2 更新会话活跃时间');
    const updateResult = await SessionService.updateSessionActivity(1, testSession1.token);
    console.log(`   ✅ 更新结果: ${updateResult}`);
    
    console.log('   4.3 验证活跃时间已更新');
    const updatedSession = await SessionService.getUserSession(1, testSession1.token) as UserSession;
    const timeDiff = updatedSession.lastActiveTime - updatedSession.loginTime;
    console.log(`   ✅ 活跃时间差: ${timeDiff}ms (应该 >= 1000ms)\n`);

    // 测试5: 在线用户
    console.log('📝 测试5: 在线用户管理');
    
    console.log('   5.1 获取在线用户列表');
    const onlineUsers = await SessionService.getOnlineUsers();
    console.log(`   ✅ 在线用户: ${onlineUsers.join(', ')}`);
    console.log(`   ✅ 在线用户数: ${onlineUsers.length}\n`);

    // 测试6: 会话统计
    console.log('📝 测试6: 会话统计');
    
    const stats = await SessionService.getSessionStats();
    console.log('   ✅ 会话统计:');
    console.log(`      总在线用户数: ${stats.totalOnlineUsers}`);
    console.log(`      总会话数: ${stats.totalSessions}`);
    console.log(`      黑名单Token数: ${stats.blacklistedTokens}`);
    console.log(`      按角色统计: ${JSON.stringify(stats.sessionsByRole)}\n`);

    // 测试7: 单点登录（踢出其他会话）
    console.log('📝 测试7: 单点登录（踢出其他会话）');
    
    console.log('   7.1 创建用户1的新会话（启用SSO）');
    const newSession: UserSession = {
      userId: 1,
      username: 'admin',
      role: 'admin',
      token: 'test_token_sso_' + Date.now(),
      loginTime: Date.now(),
      lastActiveTime: Date.now(),
      ip: '192.168.1.103',
      userAgent: 'Firefox/120.0',
      deviceId: 'device_sso'
    };
    
    const ssoResult = await SessionService.createSession(newSession, true);
    console.log(`   ✅ SSO会话创建结果: ${ssoResult}`);
    
    console.log('   7.2 验证旧会话已被踢出');
    const oldSession1 = await SessionService.getUserSession(1, testSession1.token);
    const oldSession2 = await SessionService.getUserSession(1, testSession2.token);
    console.log(`   ✅ 旧会话1存在: ${oldSession1 !== null}`);
    console.log(`   ✅ 旧会话2存在: ${oldSession2 !== null}`);
    
    console.log('   7.3 验证新会话存在');
    const newSessionCheck = await SessionService.getUserSession(1, newSession.token);
    console.log(`   ✅ 新会话存在: ${newSessionCheck !== null}`);
    
    console.log('   7.4 验证旧Token已加入黑名单');
    const isOldTokenBlacklisted = await SessionService.isBlacklisted(testSession1.token);
    console.log(`   ✅ 旧Token在黑名单中: ${isOldTokenBlacklisted}\n`);

    // 测试8: 手动踢出会话
    console.log('📝 测试8: 手动踢出用户会话');
    
    console.log('   8.1 为用户2创建多个会话');
    const user2Session2: UserSession = {
      userId: 2,
      username: 'teacher',
      role: 'teacher',
      token: 'test_token_4_' + Date.now(),
      loginTime: Date.now(),
      lastActiveTime: Date.now(),
      ip: '192.168.1.104',
      userAgent: 'Edge/120.0',
      deviceId: 'device_4'
    };
    await SessionService.createSession(user2Session2, false);
    
    console.log('   8.2 踢出用户2的所有会话');
    const kickedCount = await SessionService.kickoutUserSessions(2);
    console.log(`   ✅ 踢出会话数: ${kickedCount}`);
    
    console.log('   8.3 验证用户2的会话已清空');
    const user2Sessions = await SessionService.getUserSession(2);
    console.log(`   ✅ 用户2剩余会话数: ${Array.isArray(user2Sessions) ? user2Sessions.length : 0}\n`);

    // 测试9: 删除会话（登出）
    console.log('📝 测试9: 删除会话（登出）');
    
    console.log('   9.1 删除用户1的会话');
    const deleteResult = await SessionService.deleteSession(1, newSession.token);
    console.log(`   ✅ 删除结果: ${deleteResult}`);
    
    console.log('   9.2 验证会话已删除');
    const deletedSession = await SessionService.getUserSession(1, newSession.token);
    console.log(`   ✅ 会话已删除: ${deletedSession === null}`);
    
    console.log('   9.3 验证用户1已从在线用户列表移除');
    const finalOnlineUsers = await SessionService.getOnlineUsers();
    console.log(`   ✅ 在线用户: ${finalOnlineUsers.join(', ')}`);
    console.log(`   ✅ 用户1在线: ${finalOnlineUsers.includes(1)}\n`);

    // 最终统计
    console.log('📝 测试10: 最终会话统计');
    const finalStats = await SessionService.getSessionStats();
    console.log('✅ 最终统计:');
    console.log(`   总在线用户数: ${finalStats.totalOnlineUsers}`);
    console.log(`   总会话数: ${finalStats.totalSessions}`);
    console.log(`   黑名单Token数: ${finalStats.blacklistedTokens}`);
    console.log(`   按角色统计: ${JSON.stringify(finalStats.sessionsByRole)}\n`);

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清理所有测试Token
    const testTokenPattern = 'test_token_*';
    const testKeys = await RedisService.keys(testTokenPattern);
    for (const key of testKeys) {
      await RedisService.del(key);
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
    
    const blacklistPattern = 'token:blacklist:*';
    const blacklistKeys = await RedisService.keys(blacklistPattern);
    for (const key of blacklistKeys) {
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
testSessionService();

