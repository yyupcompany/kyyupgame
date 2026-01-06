/**
 * 限流和防刷功能测试
 */

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import RedisService from '../services/redis.service';
import AntiSpamService, { AntiSpamPresets } from '../services/anti-spam.service';
import { sequelize } from '../database';

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRateLimitAndAntiSpam() {
  console.log('🚀 开始限流和防刷功能测试...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 测试1: 基础限流功能
    console.log('📝 测试1: 基础限流功能');
    const testKey = 'test:ratelimit:user123';
    
    // 清除之前的数据
    await RedisService.delete(testKey);
    
    // 模拟10次请求
    for (let i = 1; i <= 10; i++) {
      const count = await RedisService.incr(testKey);
      console.log(`   请求${i}: 计数=${count}`);
      
      if (i === 1) {
        await RedisService.expire(testKey, 60);
      }
    }
    
    console.log('✅ 基础限流功能测试通过\n');

    // 测试2: 防刷检查 - 正常请求
    console.log('📝 测试2: 防刷检查 - 正常请求');
    const normalUser = 'user:normal:123';
    
    const result1 = await AntiSpamService.checkAndRecord(normalUser, AntiSpamPresets.standard);
    console.log(`   第1次请求: 允许=${result1.allowed}, 剩余=${result1.remaining}`);
    
    const result2 = await AntiSpamService.checkAndRecord(normalUser, AntiSpamPresets.standard);
    console.log(`   第2次请求: 允许=${result2.allowed}, 剩余=${result2.remaining}`);
    
    console.log('✅ 正常请求测试通过\n');

    // 测试3: 防刷检查 - 超过限制
    console.log('📝 测试3: 防刷检查 - 超过限制');
    const spamUser = 'user:spam:456';
    
    // 快速发送多次请求
    for (let i = 1; i <= 65; i++) {
      const result = await AntiSpamService.checkAndRecord(spamUser, AntiSpamPresets.standard);
      
      if (i === 1 || i === 60 || i === 61 || i === 65) {
        console.log(`   第${i}次请求: 允许=${result.allowed}, 剩余=${result.remaining || 0}, 原因=${result.reason || '无'}`);
      }
    }
    
    console.log('✅ 超过限制测试通过\n');

    // 测试4: 防刷检查 - 触发封禁
    console.log('📝 测试4: 防刷检查 - 触发封禁');
    const maliciousUser = 'user:malicious:789';
    
    // 快速发送超过阈值的请求
    for (let i = 1; i <= 105; i++) {
      const result = await AntiSpamService.checkAndRecord(maliciousUser, AntiSpamPresets.standard);
      
      if (i === 1 || i === 100 || i === 101 || i === 105) {
        console.log(`   第${i}次请求: 允许=${result.allowed}, 原因=${result.reason || '无'}`);
      }
    }
    
    // 检查是否被封禁
    const isBanned = await AntiSpamService.isBanned(maliciousUser);
    console.log(`   用户是否被封禁: ${isBanned}`);
    
    console.log('✅ 触发封禁测试通过\n');

    // 测试5: 封禁和解封
    console.log('📝 测试5: 封禁和解封');
    const testUser = 'user:test:999';
    
    // 手动封禁
    await AntiSpamService.ban(testUser, 60, '测试封禁');
    console.log(`   用户已封禁`);
    
    // 检查封禁状态
    const banned1 = await AntiSpamService.isBanned(testUser);
    console.log(`   封禁状态: ${banned1}`);
    
    // 解除封禁
    await AntiSpamService.unban(testUser);
    console.log(`   用户已解封`);
    
    // 再次检查封禁状态
    const banned2 = await AntiSpamService.isBanned(testUser);
    console.log(`   封禁状态: ${banned2}`);
    
    console.log('✅ 封禁和解封测试通过\n');

    // 测试6: 获取封禁列表
    console.log('📝 测试6: 获取封禁列表');
    const bannedList = await AntiSpamService.getBannedList();
    console.log(`   封禁用户数: ${bannedList.length}`);
    
    if (bannedList.length > 0) {
      console.log(`   封禁列表:`);
      bannedList.forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.identifier}`);
        console.log(`        原因: ${item.info.reason}`);
        console.log(`        时长: ${item.info.duration}秒`);
      });
    }
    
    console.log('✅ 获取封禁列表测试通过\n');

    // 测试7: 防刷统计
    console.log('📝 测试7: 防刷统计');
    const stats = AntiSpamService.getStats();
    console.log(`   总检查次数: ${stats.totalChecks}`);
    console.log(`   检测到刷接口: ${stats.spamDetected}`);
    console.log(`   封禁用户数: ${stats.bannedUsers}`);
    console.log(`   检测率: ${stats.detectionRate.toFixed(2)}%`);
    
    console.log('✅ 防刷统计测试通过\n');

    // 测试8: 登录防刷
    console.log('📝 测试8: 登录防刷');
    const loginUser = 'login:user:test';
    
    // 模拟多次登录尝试
    for (let i = 1; i <= 12; i++) {
      const result = await AntiSpamService.checkAndRecord(loginUser, AntiSpamPresets.login);
      
      if (i === 1 || i === 5 || i === 6 || i === 10 || i === 11 || i === 12) {
        console.log(`   第${i}次登录: 允许=${result.allowed}, 剩余=${result.remaining || 0}, 原因=${result.reason || '无'}`);
      }
    }
    
    console.log('✅ 登录防刷测试通过\n');

    // 测试9: 注册防刷
    console.log('📝 测试9: 注册防刷');
    const registerIP = 'register:ip:192.168.1.100';
    
    // 模拟多次注册尝试
    for (let i = 1; i <= 6; i++) {
      const result = await AntiSpamService.checkAndRecord(registerIP, AntiSpamPresets.register);
      console.log(`   第${i}次注册: 允许=${result.allowed}, 剩余=${result.remaining || 0}, 原因=${result.reason || '无'}`);
    }
    
    console.log('✅ 注册防刷测试通过\n');

    // 测试10: 性能测试
    console.log('📝 测试10: 性能测试（1000次检查）');
    const perfUser = 'user:perf:test';
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      await AntiSpamService.checkAndRecord(perfUser, AntiSpamPresets.loose);
    }
    
    const duration = Date.now() - startTime;
    const avgTime = duration / 1000;
    
    console.log(`   总耗时: ${duration}ms`);
    console.log(`   平均耗时: ${avgTime.toFixed(2)}ms/次`);
    console.log(`   QPS: ${(1000 / (duration / 1000)).toFixed(0)}`);
    
    console.log('✅ 性能测试通过\n');

    console.log('🎉 所有测试完成！');

    // 最终统计
    console.log('\n📊 最终统计:');
    const finalStats = AntiSpamService.getStats();
    console.log(`   总检查次数: ${finalStats.totalChecks}`);
    console.log(`   检测到刷接口: ${finalStats.spamDetected}`);
    console.log(`   封禁用户数: ${finalStats.bannedUsers}`);
    console.log(`   检测率: ${finalStats.detectionRate.toFixed(2)}%`);

  } catch (error: any) {
    console.error('❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    
    // 清除所有封禁
    await AntiSpamService.clearAllBans();
    
    // 清除测试key
    const testKeys = [
      'test:ratelimit:user123',
      'antispam:requests:user:normal:123',
      'antispam:requests:user:spam:456',
      'antispam:requests:user:malicious:789',
      'antispam:requests:user:test:999',
      'antispam:requests:login:user:test',
      'antispam:requests:register:ip:192.168.1.100',
      'antispam:requests:user:perf:test'
    ];
    
    for (const key of testKeys) {
      await RedisService.delete(key);
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
testRateLimitAndAntiSpam();

