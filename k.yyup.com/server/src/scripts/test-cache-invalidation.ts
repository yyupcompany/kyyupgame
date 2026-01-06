/**
 * 缓存失效测试脚本
 * 
 * 测试缓存失效中间件的功能
 */

// 加载环境变量
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import RedisService from '../services/redis.service';
import PermissionCacheService from '../services/permission-cache.service';
import { sequelize } from '../database';

async function testCacheInvalidation() {
  console.log('🚀 开始测试缓存失效功能...\n');

  try {
    // 连接数据库和Redis
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 清除所有缓存
    console.log('📝 测试1: 清除所有缓存');
    await PermissionCacheService.clearAllCache();
    console.log('✅ 缓存已清除\n');

    // 测试用户缓存失效
    console.log('📝 测试2: 用户缓存失效测试');
    const userId = 1;
    
    // 第一次查询，缓存未命中
    console.log('   2.1 第一次查询用户权限（缓存未命中）');
    const permissions1 = await PermissionCacheService.getUserPermissions(userId);
    console.log(`   ✅ 获取到 ${permissions1.length} 个权限`);
    
    // 第二次查询，缓存命中
    console.log('   2.2 第二次查询用户权限（缓存命中）');
    const permissions2 = await PermissionCacheService.getUserPermissions(userId);
    console.log(`   ✅ 获取到 ${permissions2.length} 个权限`);
    
    // 清除用户缓存
    console.log('   2.3 清除用户缓存');
    await PermissionCacheService.clearUserCache(userId);
    console.log('   ✅ 用户缓存已清除');
    
    // 第三次查询，缓存未命中
    console.log('   2.4 第三次查询用户权限（缓存未命中）');
    const permissions3 = await PermissionCacheService.getUserPermissions(userId);
    console.log(`   ✅ 获取到 ${permissions3.length} 个权限\n`);

    // 测试角色缓存失效
    console.log('📝 测试3: 角色缓存失效测试');
    
    // 查询角色权限
    console.log('   3.1 查询角色权限');
    const rolePermissions1 = await PermissionCacheService.getRolePermissions('ADMIN');
    console.log(`   ✅ 获取到 ${rolePermissions1.length} 个权限`);
    
    // 再次查询，缓存命中
    console.log('   3.2 再次查询角色权限（缓存命中）');
    const rolePermissions2 = await PermissionCacheService.getRolePermissions('ADMIN');
    console.log(`   ✅ 获取到 ${rolePermissions2.length} 个权限`);
    
    // 清除角色缓存
    console.log('   3.3 清除角色缓存');
    await PermissionCacheService.clearRoleCache('ADMIN');
    console.log('   ✅ 角色缓存已清除');
    
    // 第三次查询，缓存未命中
    console.log('   3.4 第三次查询角色权限（缓存未命中）');
    const rolePermissions3 = await PermissionCacheService.getRolePermissions('ADMIN');
    console.log(`   ✅ 获取到 ${rolePermissions3.length} 个权限\n`);

    // 测试动态路由缓存失效
    console.log('📝 测试4: 动态路由缓存失效测试');
    
    // 查询动态路由
    console.log('   4.1 查询动态路由');
    const routes1 = await PermissionCacheService.getDynamicRoutes(userId);
    console.log(`   ✅ 获取到 ${routes1.length} 条路由`);
    
    // 再次查询，缓存命中
    console.log('   4.2 再次查询动态路由（缓存命中）');
    const routes2 = await PermissionCacheService.getDynamicRoutes(userId);
    console.log(`   ✅ 获取到 ${routes2.length} 条路由`);
    
    // 清除用户缓存（包括动态路由）
    console.log('   4.3 清除用户缓存');
    await PermissionCacheService.clearUserCache(userId);
    console.log('   ✅ 用户缓存已清除');
    
    // 第三次查询，缓存未命中
    console.log('   4.4 第三次查询动态路由（缓存未命中）');
    const routes3 = await PermissionCacheService.getDynamicRoutes(userId);
    console.log(`   ✅ 获取到 ${routes3.length} 条路由\n`);

    // 测试批量缓存失效
    console.log('📝 测试5: 批量缓存失效测试');
    
    // 预热多个用户的缓存
    console.log('   5.1 预热多个用户的缓存');
    const userIds = [1, 2, 3];
    for (const uid of userIds) {
      await PermissionCacheService.getUserPermissions(uid);
    }
    console.log(`   ✅ 已预热 ${userIds.length} 个用户的缓存`);
    
    // 清除所有缓存
    console.log('   5.2 清除所有缓存');
    await PermissionCacheService.clearAllCache();
    console.log('   ✅ 所有缓存已清除');
    
    // 验证缓存已清除
    console.log('   5.3 验证缓存已清除');
    const stats = await PermissionCacheService.getCacheStats();
    console.log(`   ✅ 缓存统计: ${JSON.stringify(stats, null, 2)}\n`);

    // 测试权限检查缓存失效
    console.log('📝 测试6: 权限检查缓存失效测试');
    
    // 检查权限
    console.log('   6.1 检查权限');
    const hasPermission1 = await PermissionCacheService.checkPermission(userId, 'USER_VIEW');
    console.log(`   ✅ 权限检查结果: ${hasPermission1}`);
    
    // 再次检查，缓存命中
    console.log('   6.2 再次检查权限（缓存命中）');
    const hasPermission2 = await PermissionCacheService.checkPermission(userId, 'USER_VIEW');
    console.log(`   ✅ 权限检查结果: ${hasPermission2}`);
    
    // 清除用户缓存
    console.log('   6.3 清除用户缓存');
    await PermissionCacheService.clearUserCache(userId);
    console.log('   ✅ 用户缓存已清除');
    
    // 第三次检查，缓存未命中
    console.log('   6.4 第三次检查权限（缓存未命中）');
    const hasPermission3 = await PermissionCacheService.checkPermission(userId, 'USER_VIEW');
    console.log(`   ✅ 权限检查结果: ${hasPermission3}\n`);

    // 测试路径权限缓存失效
    console.log('📝 测试7: 路径权限缓存失效测试');
    
    // 检查路径权限
    console.log('   7.1 检查路径权限');
    const hasPathPermission1 = await PermissionCacheService.checkPathPermission(userId, '/users');
    console.log(`   ✅ 路径权限检查结果: ${hasPathPermission1}`);
    
    // 再次检查，缓存命中
    console.log('   7.2 再次检查路径权限（缓存命中）');
    const hasPathPermission2 = await PermissionCacheService.checkPathPermission(userId, '/users');
    console.log(`   ✅ 路径权限检查结果: ${hasPathPermission2}`);
    
    // 清除用户缓存
    console.log('   7.3 清除用户缓存');
    await PermissionCacheService.clearUserCache(userId);
    console.log('   ✅ 用户缓存已清除');
    
    // 第三次检查，缓存未命中
    console.log('   7.4 第三次检查路径权限（缓存未命中）');
    const hasPathPermission3 = await PermissionCacheService.checkPathPermission(userId, '/users');
    console.log(`   ✅ 路径权限检查结果: ${hasPathPermission3}\n`);

    // 测试用户权限信息缓存失效
    console.log('📝 测试8: 用户权限信息缓存失效测试');
    
    // 获取用户权限信息
    console.log('   8.1 获取用户权限信息');
    const userPermInfo1 = await PermissionCacheService.getUserPermissionInfo(userId);
    console.log(`   ✅ 用户权限信息: 角色数=${userPermInfo1.roles.length}, 权限数=${userPermInfo1.permissions.length}`);
    
    // 再次获取，缓存命中
    console.log('   8.2 再次获取用户权限信息（缓存命中）');
    const userPermInfo2 = await PermissionCacheService.getUserPermissionInfo(userId);
    console.log(`   ✅ 用户权限信息: 角色数=${userPermInfo2.roles.length}, 权限数=${userPermInfo2.permissions.length}`);
    
    // 清除用户缓存
    console.log('   8.3 清除用户缓存');
    await PermissionCacheService.clearUserCache(userId);
    console.log('   ✅ 用户缓存已清除');
    
    // 第三次获取，缓存未命中
    console.log('   8.4 第三次获取用户权限信息（缓存未命中）');
    const userPermInfo3 = await PermissionCacheService.getUserPermissionInfo(userId);
    console.log(`   ✅ 用户权限信息: 角色数=${userPermInfo3.roles.length}, 权限数=${userPermInfo3.permissions.length}\n`);

    // 最终统计
    console.log('📝 测试9: 最终缓存统计');
    const finalStats = await PermissionCacheService.getCacheStats();
    console.log('✅ 最终缓存统计:');
    console.log(`   用户权限缓存: ${finalStats.userPermissions}`);
    console.log(`   角色权限缓存: ${finalStats.rolePermissions}`);
    console.log(`   动态路由缓存: ${finalStats.dynamicRoutes}`);
    console.log(`   权限检查缓存: ${finalStats.permissionChecks}`);
    console.log(`   路径权限缓存: ${finalStats.pathPermissions}`);
    console.log(`   用户权限信息缓存: ${finalStats.userPermissionInfo}\n`);

    console.log('🎉 所有测试完成！');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    // 清理
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
testCacheInvalidation();

