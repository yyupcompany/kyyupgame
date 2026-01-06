/**
 * 权限缓存服务测试脚本
 * 
 * 测试PermissionCacheService的所有功能
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
import PermissionCacheService from '../services/permission-cache.service';
import { sequelize } from '../database';

async function testPermissionCache() {
  console.log('🚀 开始测试权限缓存服务...\n');

  try {
    // 连接数据库
    console.log('📝 测试0: 连接数据库');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 连接Redis
    console.log('📝 测试1: 连接Redis');
    await RedisService.connect();
    const pingResult = await RedisService.ping();
    console.log(`✅ Redis连接: ${pingResult ? '成功' : '失败'}\n`);

    // 清除所有权限缓存
    console.log('📝 测试2: 清除所有权限缓存');
    await PermissionCacheService.clearAllCache();
    console.log('✅ 缓存已清除\n');

    // 测试用户ID（假设存在）
    const testUserId = 1;

    // 测试获取用户权限
    console.log('📝 测试3: 获取用户权限（第一次 - 从数据库）');
    const startTime1 = Date.now();
    const permissions1 = await PermissionCacheService.getUserPermissions(testUserId);
    const time1 = Date.now() - startTime1;
    console.log(`✅ 获取到 ${permissions1.length} 个权限, 耗时: ${time1}ms`);
    console.log(`   前5个权限: ${permissions1.slice(0, 5).join(', ')}\n`);

    // 测试缓存命中
    console.log('📝 测试4: 获取用户权限（第二次 - 从缓存）');
    const startTime2 = Date.now();
    const permissions2 = await PermissionCacheService.getUserPermissions(testUserId);
    const time2 = Date.now() - startTime2;
    console.log(`✅ 获取到 ${permissions2.length} 个权限, 耗时: ${time2}ms`);
    console.log(`   性能提升: ${((time1 - time2) / time1 * 100).toFixed(1)}%\n`);

    // 测试获取动态路由
    console.log('📝 测试5: 获取动态路由（第一次 - 从数据库）');
    const startTime3 = Date.now();
    const routes1 = await PermissionCacheService.getDynamicRoutes(testUserId);
    const time3 = Date.now() - startTime3;
    console.log(`✅ 获取到 ${routes1.length} 条路由, 耗时: ${time3}ms`);
    if (routes1.length > 0) {
      console.log(`   第一条路由: ${routes1[0].name} (${routes1[0].path})\n`);
    }

    // 测试动态路由缓存命中
    console.log('📝 测试6: 获取动态路由（第二次 - 从缓存）');
    const startTime4 = Date.now();
    const routes2 = await PermissionCacheService.getDynamicRoutes(testUserId);
    const time4 = Date.now() - startTime4;
    console.log(`✅ 获取到 ${routes2.length} 条路由, 耗时: ${time4}ms`);
    console.log(`   性能提升: ${((time3 - time4) / time3 * 100).toFixed(1)}%\n`);

    // 测试权限检查
    if (permissions1.length > 0) {
      const testPermission = permissions1[0];
      console.log('📝 测试7: 检查单个权限');
      const hasPermission = await PermissionCacheService.checkPermission(testUserId, testPermission);
      console.log(`✅ 权限检查: ${testPermission} = ${hasPermission}\n`);

      // 测试批量权限检查
      console.log('📝 测试8: 批量权限检查');
      const testPermissions = permissions1.slice(0, 5);
      const permissionResults = await PermissionCacheService.checkPermissions(testUserId, testPermissions);
      console.log(`✅ 批量检查 ${testPermissions.length} 个权限:`);
      Object.entries(permissionResults).forEach(([code, has]) => {
        console.log(`   ${code}: ${has}`);
      });
      console.log('');
    }

    // 测试路径权限检查
    if (routes1.length > 0) {
      const testPath = routes1[0].path;
      console.log('📝 测试9: 检查路径权限');
      const hasPathPermission = await PermissionCacheService.checkPathPermission(testUserId, testPath);
      console.log(`✅ 路径权限检查: ${testPath} = ${hasPathPermission}\n`);
    }

    // 测试获取用户权限信息
    console.log('📝 测试10: 获取用户完整权限信息');
    const userInfo = await PermissionCacheService.getUserPermissionInfo(testUserId);
    console.log(`✅ 用户权限信息:`);
    console.log(`   权限数量: ${userInfo.permissions.length}`);
    console.log(`   角色: ${userInfo.roles.join(', ')}`);
    console.log(`   是否管理员: ${userInfo.isAdmin}\n`);

    // 测试角色权限
    if (userInfo.roles.length > 0) {
      const testRole = userInfo.roles[0];
      console.log('📝 测试11: 获取角色权限');
      const rolePermissions = await PermissionCacheService.getRolePermissions(testRole);
      console.log(`✅ 角色 ${testRole} 有 ${rolePermissions.length} 个权限\n`);
    }

    // 测试缓存统计
    console.log('📝 测试12: 获取缓存统计');
    const stats = await PermissionCacheService.getCacheStats();
    console.log(`✅ 缓存统计:`);
    console.log(`   用户权限缓存: ${stats.userPermissions} 个`);
    console.log(`   角色权限缓存: ${stats.rolePermissions} 个`);
    console.log(`   动态路由缓存: ${stats.dynamicRoutes} 个`);
    console.log(`   权限检查缓存: ${stats.permissionChecks} 个`);
    console.log(`   路径权限缓存: ${stats.pathPermissions} 个`);
    console.log(`   总计: ${Object.values(stats).reduce((a, b) => a + b, 0)} 个缓存键\n`);

    // 测试清除用户缓存
    console.log('📝 测试13: 清除用户缓存');
    await PermissionCacheService.clearUserCache(testUserId);
    const statsAfterClear = await PermissionCacheService.getCacheStats();
    console.log(`✅ 清除后缓存统计:`);
    console.log(`   用户权限缓存: ${statsAfterClear.userPermissions} 个`);
    console.log(`   动态路由缓存: ${statsAfterClear.dynamicRoutes} 个\n`);

    // 测试性能对比
    console.log('📝 测试14: 性能对比测试');
    console.log('   清除缓存后重新查询...');
    
    const dbStartTime = Date.now();
    await PermissionCacheService.getUserPermissions(testUserId);
    const dbTime = Date.now() - dbStartTime;
    
    const cacheStartTime = Date.now();
    await PermissionCacheService.getUserPermissions(testUserId);
    const cacheTime = Date.now() - cacheStartTime;
    
    console.log(`✅ 性能对比:`);
    console.log(`   数据库查询: ${dbTime}ms`);
    console.log(`   缓存查询: ${cacheTime}ms`);
    console.log(`   性能提升: ${((dbTime - cacheTime) / dbTime * 100).toFixed(1)}%`);
    console.log(`   加速倍数: ${(dbTime / cacheTime).toFixed(1)}x\n`);

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理测试数据
    console.log('\n📝 清理测试数据...');
    await PermissionCacheService.clearAllCache();
    
    // 断开连接
    await RedisService.disconnect();
    await sequelize.close();
    console.log('👋 连接已关闭');
    process.exit(0);
  }
}

// 运行测试
testPermissionCache();

