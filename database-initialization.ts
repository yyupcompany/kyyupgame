/**
 * 数据库初始化脚本
 * 在应用启动时初始化共享连接池
 */

import { tenantDatabaseSharedPoolService } from './services/tenant-database-shared-pool.service';
import { logger } from './utils/logger';

/**
 * 初始化数据库连接池
 * 应该在应用启动时调用
 */
export async function initializeDatabasePool(): Promise<void> {
  try {
    logger.info('开始初始化数据库连接池...');

    // 初始化全局连接
    const connection = await tenantDatabaseSharedPoolService.initializeGlobalConnection();

    // 获取连接池统计信息
    const stats = await tenantDatabaseSharedPoolService.getPoolStats();
    logger.info('数据库连接池初始化完成', {
      poolSize: `${stats.poolSize.min}-${stats.poolSize.max}`,
      activeConnections: stats.activeConnections,
      idleConnections: stats.idleConnections
    });

    // 执行健康检查
    const isHealthy = await tenantDatabaseSharedPoolService.healthCheck();
    if (isHealthy) {
      logger.info('✅ 数据库连接池健康检查通过');
    } else {
      logger.warn('⚠️ 数据库连接池健康检查失败');
    }

    return connection;
  } catch (error) {
    logger.error('数据库连接池初始化失败', error);
    throw error;
  }
}

/**
 * 关闭数据库连接池
 * 应该在应用关闭时调用
 */
export async function closeDatabasePool(): Promise<void> {
  try {
    logger.info('关闭数据库连接池...');
    await tenantDatabaseSharedPoolService.closeGlobalConnection();
    logger.info('✅ 数据库连接池已关闭');
  } catch (error) {
    logger.error('关闭数据库连接池失败', error);
  }
}

/**
 * 应用启动示例
 */
export async function startApplication(): Promise<void> {
  try {
    // 1. 初始化数据库连接池
    await initializeDatabasePool();

    // 2. 启动Express服务器
    // app.listen(3000, () => {
    //   logger.info('服务器启动成功，监听端口 3000');
    // });

    // 3. 优雅关闭处理
    process.on('SIGTERM', async () => {
      logger.info('收到SIGTERM信号，开始优雅关闭...');
      await closeDatabasePool();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('收到SIGINT信号，开始优雅关闭...');
      await closeDatabasePool();
      process.exit(0);
    });

  } catch (error) {
    logger.error('应用启动失败', error);
    process.exit(1);
  }
}

