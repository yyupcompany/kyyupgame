/**
 * 认证和权限模块路由聚合文件
 * 统一管理所有认证、权限、角色相关的路由功能
 */

import { Router } from 'express';
import { verifyToken } from '../../middlewares/auth.middleware';

// ✅ 导入所有认证权限相关路由
import authRoutes from '../auth.routes';
// import authPermissionsRoutes from '../auth-permissions.routes'; // 暂时禁用
// 注意：租户管理功能应该在统一租户中心 (unified-tenant-system/)
// import permissionRoutes from '../permission.routes'; // 暂时禁用
// import permissionsRoutes from '../permissions.routes'; // 暂时禁用
// import pagePermissionsRoutes from '../page-permissions.routes'; // 暂时禁用
// import roleRoutes from '../role.routes'; // 暂时禁用
// import rolePermissionRoutes from '../role-permission.routes'; // 暂时禁用

// 🔹 导入OSS租户隔离相关路由 (暂时禁用)
// import ossTenantRoutes from '../oss-tenant.routes';

// 🔹 导入阿里云CLI相关路由 (暂时禁用)
// import aliyunCliRoutes from '../aliyun-cli.routes';

/**
 * 认证和权限模块路由配置
 */
const authModuleRoutes = (router: Router) => {
  // 🔹 基础认证
  router.use('/auth', authRoutes);

  // 🔹 权限相关 (暂时禁用)
  // router.use('/permissions', permissionsRoutes);
  // router.use('/auth-permissions', authPermissionsRoutes);
  // router.use('/page-permissions', pagePermissionsRoutes);
  // router.use('/permission', permissionRoutes);

  // 🔹 角色相关 (暂时禁用)
  // router.use('/roles', roleRoutes);
  // router.use('/role-permissions', rolePermissionRoutes);
  // router.use('/role-permission', rolePermissionRoutes);

  // 🔹 系统角色路由别名 (暂时禁用)
  // router.use('/system/permissions', permissionRoutes);
  // router.use('/system/roles', roleRoutes);

  // 🔹 OSS租户隔离相关路由 (暂时禁用)
  // router.use('/oss-tenant', ossTenantRoutes);

  // 🔹 阿里云CLI相关路由 (暂时禁用)
  // router.use('/aliyun-cli', aliyunCliRoutes);

  console.log('✅ 基础认证模块路由已注册');
};

export default authModuleRoutes;
