/**
 * Redis服务测试脚本
 *
 * 测试RedisService的所有功能
 */

// 加载环境变量
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成');
console.log('📍 REDIS_HOST:', process.env.REDIS_HOST);
console.log('📍 REDIS_PORT:', process.env.REDIS_PORT);
console.log('📍 REDIS_PASSWORD:', process.env.REDIS_PASSWORD ? '***已设置***' : '未设置');
console.log('');

import RedisService from '../services/redis.service';

async function testRedisService() {
  console.log('🚀 开始测试Redis服务...\n');

  try {
    // 1. 测试连接
    console.log('📝 测试1: 连接Redis');
    await RedisService.connect();
    const pingResult = await RedisService.ping();
    console.log(`✅ Ping测试: ${pingResult ? '成功' : '失败'}\n`);

    // 2. 测试基础操作
    console.log('📝 测试2: 基础操作 (GET/SET/DEL)');
    await RedisService.set('test:string', 'Hello Redis', 60);
    const stringValue = await RedisService.get('test:string');
    console.log(`✅ SET/GET字符串: ${stringValue}`);

    await RedisService.set('test:json', { name: '张三', age: 25 }, 60);
    const jsonValue = await RedisService.get('test:json');
    console.log(`✅ SET/GET JSON:`, jsonValue);

    const exists = await RedisService.exists('test:string');
    console.log(`✅ EXISTS: ${exists}`);

    const ttl = await RedisService.ttl('test:string');
    console.log(`✅ TTL: ${ttl}秒\n`);

    // 3. 测试Hash操作
    console.log('📝 测试3: Hash操作');
    await RedisService.hset('test:user:1', 'name', '李四');
    await RedisService.hset('test:user:1', 'age', 30);
    await RedisService.hset('test:user:1', 'email', 'lisi@example.com');
    
    const userName = await RedisService.hget('test:user:1', 'name');
    console.log(`✅ HGET name: ${userName}`);

    const userAll = await RedisService.hgetall('test:user:1');
    console.log(`✅ HGETALL:`, userAll);

    await RedisService.hdel('test:user:1', 'email');
    console.log(`✅ HDEL email: 成功\n`);

    // 4. 测试Set操作
    console.log('📝 测试4: Set操作');
    await RedisService.sadd('test:tags', 'javascript', 'typescript', 'nodejs');
    const tags = await RedisService.smembers('test:tags');
    console.log(`✅ SMEMBERS:`, tags);

    const isMember = await RedisService.sismember('test:tags', 'typescript');
    console.log(`✅ SISMEMBER typescript: ${isMember}`);

    const tagCount = await RedisService.scard('test:tags');
    console.log(`✅ SCARD: ${tagCount}\n`);

    // 5. 测试计数器
    console.log('📝 测试5: 计数器操作');
    await RedisService.set('test:counter', 0);
    await RedisService.incr('test:counter');
    await RedisService.incr('test:counter');
    await RedisService.incrby('test:counter', 5);
    const counter = await RedisService.get('test:counter');
    console.log(`✅ 计数器值: ${counter}\n`);

    // 6. 测试分布式锁
    console.log('📝 测试6: 分布式锁');
    const lockAcquired = await RedisService.acquireLock('test:resource', 10);
    console.log(`✅ 获取锁: ${lockAcquired ? '成功' : '失败'}`);

    if (lockAcquired) {
      console.log('⏳ 持有锁3秒...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const lockReleased = await RedisService.releaseLock('test:resource');
      console.log(`✅ 释放锁: ${lockReleased ? '成功' : '失败'}\n`);
    }

    // 7. 测试批量操作
    console.log('📝 测试7: 批量操作');
    await RedisService.mset({
      'test:batch:1': 'value1',
      'test:batch:2': 'value2',
      'test:batch:3': 'value3'
    });
    const batchValues = await RedisService.mget(['test:batch:1', 'test:batch:2', 'test:batch:3']);
    console.log(`✅ MGET:`, batchValues);

    const deletedCount = await RedisService.del(['test:batch:1', 'test:batch:2', 'test:batch:3']);
    console.log(`✅ 批量删除: ${deletedCount}个键\n`);

    // 8. 测试Sorted Set
    console.log('📝 测试8: Sorted Set操作');
    await RedisService.zadd('test:ranking', 100, 'user1');
    await RedisService.zadd('test:ranking', 200, 'user2');
    await RedisService.zadd('test:ranking', 150, 'user3');
    
    const ranking = await RedisService.zrange('test:ranking', 0, -1, true);
    console.log(`✅ 排行榜:`, ranking);

    // 9. 测试模式匹配
    console.log('\n📝 测试9: 模式匹配');
    const testKeys = await RedisService.keys('test:*');
    console.log(`✅ 找到 ${testKeys.length} 个测试键`);

    // 10. 清理测试数据
    console.log('\n📝 测试10: 清理测试数据');
    const cleanedCount = await RedisService.delPattern('test:*');
    console.log(`✅ 清理了 ${cleanedCount} 个测试键\n`);

    // 11. 获取Redis信息
    console.log('📝 测试11: Redis信息');
    const info = await RedisService.info('server');
    const lines = info.split('\n').filter(line => line && !line.startsWith('#')).slice(0, 5);
    console.log(`✅ Redis服务器信息:`);
    lines.forEach(line => console.log(`   ${line}`));

    console.log('\n🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 断开连接
    await RedisService.disconnect();
    console.log('\n👋 Redis连接已关闭');
    process.exit(0);
  }
}

// 运行测试
testRedisService();

