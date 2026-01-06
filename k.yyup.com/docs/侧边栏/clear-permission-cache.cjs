/**
 * 清除Redis权限缓存
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../server/.env') });
const Redis = require('../../server/node_modules/ioredis');

async function clearPermissionCache() {
  let redis;
  
  try {
    // 创建Redis连接
    redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB || 0
    });

    console.log('✅ Redis连接成功\n');

    // 清除所有权限相关的缓存
    const patterns = [
      'routes:cache*',
      'permissions:*',
      'user:permissions:*',
      'role:permissions:*',
      'menu:*'
    ];

    let totalDeleted = 0;

    for (const pattern of patterns) {
      console.log(`🔍 查找缓存键: ${pattern}`);
      const keys = await redis.keys(pattern);
      
      if (keys.length > 0) {
        console.log(`   找到 ${keys.length} 个键:`);
        keys.forEach(key => console.log(`   - ${key}`));
        
        const deleted = await redis.del(...keys);
        console.log(`   ✅ 删除了 ${deleted} 个键\n`);
        totalDeleted += deleted;
      } else {
        console.log(`   没有找到匹配的键\n`);
      }
    }

    console.log(`\n📊 总计删除了 ${totalDeleted} 个缓存键`);
    console.log('\n✅ 权限缓存清除完成！');
    console.log('\n下一步：');
    console.log('1. 重启后端服务器');
    console.log('2. 清除浏览器缓存（Ctrl+Shift+Delete）');
    console.log('3. 强制刷新页面（Ctrl+F5）');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (redis) {
      await redis.quit();
      console.log('\n🔌 Redis连接已关闭');
    }
  }
}

// 执行清除
clearPermissionCache();

