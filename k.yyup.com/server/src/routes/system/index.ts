/**
 * 系统管理模块路由聚合文件
 * 统一管理所有系统配置、日志、安全相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有系统相关路由
import systemRoutes from '../system.routes';
import systemAiModelsRoutes from '../system-ai-models.routes';
import systemBackupRoutes from '../system-backup.routes';
import systemConfigsRoutes from '../system-configs.routes';
import systemLogsRoutes from '../system-logs.routes';
import operationLogsRoutes from '../operation-logs.routes';
import securityRoutes from '../security.routes';
import databaseMetadataRoutes from '../database-metadata.routes';
import organizationStatusRoutes from '../organization-status.routes';
import notificationCenterRoutes from '../notification-center.routes';
import notificationsRoutes from '../notifications.routes';
import schedulesRoutes from '../schedules.routes';
import sessionRoutes from '../session.routes';
import tokenBlacklistRoutes from '../token-blacklist.routes';
import migrationRoutes from '../migration.routes';
import callCenterRoutes from '../call-center.routes';

/**
 * 系统管理模块路由配置
 */
const systemModuleRoutes = (router: Router) => {
  // 🔹 基础系统功能
  router.use('/system', systemRoutes);
  router.use('/system/permissions', systemRoutes);
  router.use('/system/roles', systemRoutes);

  // 🔹 AI 模型管理
  router.use('/system/ai-models', systemAiModelsRoutes);

  // 🔹 备份和配置
  router.use('/system-backup', systemBackupRoutes);
  router.use('/system/backups', systemBackupRoutes); // 别名
  router.use('/system-configs', systemConfigsRoutes);
  router.use('/system/settings', systemConfigsRoutes); // 别名

  // 🔹 日志管理
  router.use('/system-logs', systemLogsRoutes);
  router.use('/logs', systemLogsRoutes); // 别名
  router.use('/operation-logs', operationLogsRoutes);

  // 🔹 安全监控
  router.use('/security', securityRoutes);

  // 🔹 数据库和组织
  router.use('/database', databaseMetadataRoutes);
  router.use('/organization-status', organizationStatusRoutes);

  // 🔹 通知管理
  router.use('/notification-center', notificationCenterRoutes);
  router.use('/notifications', notificationsRoutes);
  router.use('/principal/notifications', notificationCenterRoutes); // 园长通知中心专用路径

  // 🔹 日程和会话
  router.use('/schedules', schedulesRoutes);
  router.use('/schedule', schedulesRoutes); // 别名
  router.use('/session', sessionRoutes);
  router.use('/token-blacklist', tokenBlacklistRoutes);

  // 🔹 迁移和呼叫
  router.use('/migration', migrationRoutes);
  router.use('/call-center', callCenterRoutes);

  console.log('✅ 系统管理模块路由已注册 (15+ 个路由)');
};

export default systemModuleRoutes;

