/**
 * 权限Controller测试脚本
 * 
 * 测试改造后的权限Controller功能
 */

// 加载环境变量
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('🔧 环境变量加载完成\n');

import express, { Request, Response } from 'express';
import RedisService from '../services/redis.service';
import PermissionCacheService from '../services/permission-cache.service';
import { sequelize } from '../database';
import { getDynamicRoutes, getUserPermissions, getCacheStats, clearPermissionCache } from '../controllers/permissions.controller';

async function testPermissionController() {
  console.log('🚀 开始测试权限Controller...\n');

  try {
    // 连接数据库
    console.log('📝 测试0: 连接数据库和Redis');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    await RedisService.connect();
    console.log('✅ Redis连接成功\n');

    // 清除缓存
    console.log('📝 测试1: 清除所有缓存');
    await PermissionCacheService.clearAllCache();
    console.log('✅ 缓存已清除\n');

    // 创建模拟的Express请求和响应对象
    const createMockReqRes = (userId: number, userRole: string) => {
      const req = {
        user: { id: userId, role: userRole }
      } as any as Request;

      let responseData: any = null;
      let statusCode = 200;

      const res = {
        status: (code: number) => {
          statusCode = code;
          return res;
        },
        json: (data: any) => {
          responseData = data;
          return res;
        },
        getStatus: () => statusCode,
        getData: () => responseData
      } as any as Response;

      return { req, res };
    };

    // 测试getUserPermissions
    console.log('📝 测试2: 获取用户权限（第一次 - 从数据库）');
    const { req: req1, res: res1 } = createMockReqRes(1, 'admin');
    await getUserPermissions(req1, res1);
    const result1 = (res1 as any).getData();
    console.log(`✅ 响应状态: ${(res1 as any).getStatus()}`);
    console.log(`   权限数量: ${result1.data.length}`);
    console.log(`   从缓存: ${result1.meta.fromCache}`);
    console.log(`   响应时间: ${result1.meta.responseTime}ms`);
    console.log(`   缓存命中率: ${result1.meta.cacheHitRate.toFixed(2)}%\n`);

    // 测试缓存命中
    console.log('📝 测试3: 获取用户权限（第二次 - 从缓存）');
    const { req: req2, res: res2 } = createMockReqRes(1, 'admin');
    await getUserPermissions(req2, res2);
    const result2 = (res2 as any).getData();
    console.log(`✅ 响应状态: ${(res2 as any).getStatus()}`);
    console.log(`   权限数量: ${result2.data.length}`);
    console.log(`   从缓存: ${result2.meta.fromCache}`);
    console.log(`   响应时间: ${result2.meta.responseTime}ms`);
    console.log(`   缓存命中率: ${result2.meta.cacheHitRate.toFixed(2)}%`);
    console.log(`   性能提升: ${((result1.meta.responseTime - result2.meta.responseTime) / result1.meta.responseTime * 100).toFixed(2)}%\n`);

    // 测试getDynamicRoutes
    console.log('📝 测试4: 获取动态路由（第一次 - 从数据库）');
    const { req: req3, res: res3 } = createMockReqRes(1, 'admin');
    await getDynamicRoutes(req3, res3, () => {});
    const result3 = (res3 as any).getData();
    console.log(`✅ 响应状态: ${(res3 as any).getStatus()}`);
    console.log(`   权限数量: ${result3.data.permissions.length}`);
    console.log(`   路由数量: ${result3.data.routes.length}`);
    console.log(`   从缓存: ${result3.meta.fromCache}`);
    console.log(`   响应时间: ${result3.meta.responseTime}ms\n`);

    // 测试动态路由缓存命中
    console.log('📝 测试5: 获取动态路由（第二次 - 从缓存）');
    const { req: req4, res: res4 } = createMockReqRes(1, 'admin');
    await getDynamicRoutes(req4, res4, () => {});
    const result4 = (res4 as any).getData();
    console.log(`✅ 响应状态: ${(res4 as any).getStatus()}`);
    console.log(`   权限数量: ${result4.data.permissions.length}`);
    console.log(`   路由数量: ${result4.data.routes.length}`);
    console.log(`   从缓存: ${result4.meta.fromCache}`);
    console.log(`   响应时间: ${result4.meta.responseTime}ms`);
    console.log(`   性能提升: ${((result3.meta.responseTime - result4.meta.responseTime) / result3.meta.responseTime * 100).toFixed(2)}%\n`);

    // 测试getCacheStats
    console.log('📝 测试6: 获取缓存统计');
    const { req: req5, res: res5 } = createMockReqRes(1, 'admin');
    await getCacheStats(req5, res5);
    const result5 = (res5 as any).getData();
    console.log(`✅ 缓存统计:`);
    console.log(`   总请求数: ${result5.data.performance.totalRequests}`);
    console.log(`   缓存命中: ${result5.data.performance.cacheHits}`);
    console.log(`   缓存未命中: ${result5.data.performance.cacheMisses}`);
    console.log(`   缓存命中率: ${result5.data.performance.cacheHitRate}`);
    console.log(`   平均响应时间: ${result5.data.performance.avgResponseTime}`);
    console.log(`   平均缓存响应时间: ${result5.data.performance.avgCacheResponseTime}`);
    console.log(`   平均数据库响应时间: ${result5.data.performance.avgDbResponseTime}`);
    console.log(`   性能提升: ${result5.data.performance.performanceImprovement}\n`);

    // 测试clearPermissionCache
    console.log('📝 测试7: 清除用户缓存');
    const { req: req6, res: res6 } = createMockReqRes(1, 'admin');
    (req6 as any).body = { userId: 1 };
    await clearPermissionCache(req6, res6);
    const result6 = (res6 as any).getData();
    console.log(`✅ ${result6.message}\n`);

    // 测试清除后重新查询
    console.log('📝 测试8: 清除缓存后重新查询');
    const { req: req7, res: res7 } = createMockReqRes(1, 'admin');
    await getUserPermissions(req7, res7);
    const result7 = (res7 as any).getData();
    console.log(`✅ 响应状态: ${(res7 as any).getStatus()}`);
    console.log(`   从缓存: ${result7.meta.fromCache}`);
    console.log(`   响应时间: ${result7.meta.responseTime}ms\n`);

    // 性能对比测试
    console.log('📝 测试9: 性能对比测试（10次请求）');
    const performanceResults = {
      cache: [] as number[],
      db: [] as number[]
    };

    // 预热缓存
    const { req: warmupReq, res: warmupRes } = createMockReqRes(1, 'admin');
    await getUserPermissions(warmupReq, warmupRes);

    // 测试缓存性能
    for (let i = 0; i < 10; i++) {
      const { req, res } = createMockReqRes(1, 'admin');
      await getUserPermissions(req, res);
      const result = (res as any).getData();
      performanceResults.cache.push(result.meta.responseTime);
    }

    // 清除缓存
    await PermissionCacheService.clearUserCache(1);

    // 测试数据库性能
    for (let i = 0; i < 10; i++) {
      const { req, res } = createMockReqRes(1, 'admin');
      await getUserPermissions(req, res);
      const result = (res as any).getData();
      performanceResults.db.push(result.meta.responseTime);
      
      // 清除缓存以确保每次都从数据库查询
      await PermissionCacheService.clearUserCache(1);
    }

    const avgCache = performanceResults.cache.reduce((a, b) => a + b, 0) / performanceResults.cache.length;
    const avgDb = performanceResults.db.reduce((a, b) => a + b, 0) / performanceResults.db.length;

    console.log(`✅ 性能对比结果:`);
    console.log(`   缓存平均响应时间: ${avgCache.toFixed(2)}ms`);
    console.log(`   数据库平均响应时间: ${avgDb.toFixed(2)}ms`);
    console.log(`   性能提升: ${((avgDb - avgCache) / avgDb * 100).toFixed(2)}%`);
    console.log(`   加速倍数: ${(avgDb / avgCache).toFixed(2)}x\n`);

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
testPermissionController();

