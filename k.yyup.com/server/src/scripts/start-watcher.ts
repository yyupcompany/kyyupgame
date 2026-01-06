/**
 * 权限变更监听服务启动脚本
 * 用于手动启动权限变更监听服务
 */

import { PermissionWatcherService } from '../services/permission-watcher.service';
import { RouteCacheService } from '../services/route-cache.service';

async function startWatcher() {
  try {
    console.log('🔄 正在启动权限变更监听服务...');
    
    // 首先确保缓存系统是健康的
    if (!RouteCacheService.isHealthy()) {
      console.log('🔧 缓存系统不健康，正在重新初始化...');
      await RouteCacheService.refreshCache();
    }
    
    // 启动权限变更监听
    PermissionWatcherService.startWatching();
    
    // 获取状态
    const watcherStatus = PermissionWatcherService.getWatcherStatus();
    const cacheStatus = RouteCacheService.getCacheStatus();
    
    console.log('📊 系统状态:');
    console.log(`   - 缓存健康状态: ${cacheStatus.isHealthy ? '✅ 健康' : '❌ 异常'}`);
    console.log(`   - 路由数量: ${cacheStatus.routeCount}`);
    console.log(`   - 监听状态: ${watcherStatus.isWatching ? '✅ 运行中' : '❌ 未运行'}`);
    console.log(`   - 变更事件: ${watcherStatus.eventCount} 条`);
    
    if (watcherStatus.isWatching && cacheStatus.isHealthy) {
      console.log('🎉 权限缓存系统完全启动成功！');
      return true;
    } else {
      console.error('❌ 权限缓存系统启动不完整');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 启动权限变更监听失败:', error);
    return false;
  }
}

export { startWatcher };

// 如果直接运行此脚本
if (require.main === module) {
  startWatcher().then((success) => {
    process.exit(success ? 0 : 1);
  });
}