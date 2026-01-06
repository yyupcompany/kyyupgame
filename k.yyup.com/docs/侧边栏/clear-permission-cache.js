/**
 * 清除权限缓存
 * 用于解决禁用中心后仍然显示的问题
 */

const redis = require('redis');
require('dotenv').config();

async function clearPermissionCache() {
  let client;

  try {
    // 创建Redis连接
    client = redis.createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      },
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB || '0')
    });

    await client.connect();
    console.log('✅ Redis连接成功\n');

    // 查找所有权限相关的缓存键
    console.log('🔍 查找权限缓存键...\n');
    
    const patterns = [
      'permission:*',
      'user:*:permissions',
      'route:*',
      'menu:*'
    ];

    let totalDeleted = 0;

    for (const pattern of patterns) {
      console.log(`📋 查找模式: ${pattern}`);
      const keys = await client.keys(pattern);

      if (keys.length > 0) {
        console.log(`   找到 ${keys.length} 个缓存键`);

        // 删除这些键
        const deleted = await client.del(keys);
        totalDeleted += deleted;

        console.log(`   ✅ 已删除 ${deleted} 个缓存键\n`);
      } else {
        console.log(`   ℹ️  没有找到匹配的缓存键\n`);
      }
    }

    console.log(`\n📊 总计删除 ${totalDeleted} 个缓存键`);

    // 验证缓存已清除
    console.log('\n🔍 验证缓存清除结果...\n');

    for (const pattern of patterns) {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        console.log(`⚠️  模式 ${pattern} 仍有 ${keys.length} 个键`);
      } else {
        console.log(`✅ 模式 ${pattern} 已清空`);
      }
    }

    console.log('\n✅ 权限缓存清除完成！');
    console.log('\n💡 提示：');
    console.log('   1. 请刷新浏览器页面');
    console.log('   2. 如果问题仍然存在，请清除浏览器缓存');
    console.log('   3. 确保已重启后端服务器');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Redis连接失败，请检查：');
      console.error('   1. Redis服务是否正在运行');
      console.error('   2. .env文件中的Redis配置是否正确');
      console.error('   3. Redis端口和密码是否正确');
    }
    
    throw error;
  } finally {
    if (client) {
      await client.quit();
      console.log('\n✅ Redis连接已关闭');
    }
  }
}

// 执行清除
clearPermissionCache().catch(console.error);

