/**
 * 系统管理路由配置
 * 
 * 功能说明:
 * - 用户管理、角色管理、权限管理
 * - 系统日志、安全监控、系统备份
 * - 系统设置、AI模型配置
 * - 通知设置、维护调度
 * 
 * 权限说明:
 * - 需要系统管理权限 (SYSTEM_MANAGE)
 * - 各子模块有独立的权限控制
 */

import { RouteRecordRaw } from 'vue-router'

// 布局组件导入
const Layout = () => import('@/layouts/MainLayout.vue')

// 系统管理模块组件懒加载导入
const SystemUsers = () => import('@/pages/system/User.vue')
const SystemRoles = () => import('@/pages/system/Role.vue')
const SystemPermissions = () => import('@/pages/system/Permission.vue')
const SystemLogs = () => import('@/pages/system/Log.vue')
const SystemSecurity = () => import('@/pages/system/Security.vue')
const SystemBackup = () => import('@/pages/system/Backup.vue')
const SystemSettings = () => import('@/pages/system/settings/index.vue')
const AIModelConfig = () => import('@/pages/system/AIModelConfig.vue')

export const systemRoutes: RouteRecordRaw[] = [
  // 🔧 修复：所有系统管理路由都应该嵌套在 MainLayout 中
  {
    path: '/system',
    component: Layout,
    redirect: '/system/users',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true
    },
    children: [
      {
        path: 'users',
        name: 'UserManagement',
        component: SystemUsers,
        meta: {
          title: '用户管理',
          requiresAuth: true,
          permission: 'USER_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'roles',
        name: 'RoleManagement',
        component: SystemRoles,
        meta: {
          title: '角色管理',
          requiresAuth: true,
          permission: 'ROLE_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'permissions',
        name: 'PermissionManagement',
        component: SystemPermissions,
        meta: {
          title: '权限管理',
          requiresAuth: true,
          permission: 'PERMISSION_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'logs',
        name: 'SystemLogs',
        component: SystemLogs,
        meta: {
          title: '系统日志',
          requiresAuth: true,
          permission: 'SYSTEM_LOG_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'security',
        name: 'SecurityMonitoring',
        component: SystemSecurity,
        meta: {
          title: '安全监控',
          requiresAuth: true,
          permission: 'SECURITY_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'backup',
        name: 'SystemBackup',
        component: SystemBackup,
        meta: {
          title: '系统备份',
          requiresAuth: true,
          permission: 'SYSTEM_BACKUP_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: {
          title: '系统设置',
          requiresAuth: true,
          permission: 'SYSTEM_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'ai-model-config',
        name: 'AIModelConfig',
        component: AIModelConfig,
        meta: {
          title: 'AI模型配置',
          requiresAuth: true,
          permission: 'AI_MODEL_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'users/user-management',
        name: 'SystemUserManagement',
        component: () => import('@/pages/system/users/index.vue'),
        meta: {
          title: '系统用户管理',
          requiresAuth: true,
          permission: 'USER_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'roles/role-management',
        name: 'SystemRoleManagement',
        component: () => import('@/pages/system/roles/RoleManagement.vue'),
        meta: {
          title: '系统角色管理',
          requiresAuth: true,
          permission: 'ROLE_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'logs/system-logs',
        name: 'SystemLogsManagement',
        component: () => import('@/pages/system/Log.vue'),
        meta: {
          title: '系统日志管理',
          requiresAuth: true,
          permission: 'SYSTEM_LOG_VIEW',
          priority: 'low'
        }
      },
      {
        path: 'backup/backup-management',
        name: 'SystemBackupManagement',
        component: () => import('@/pages/system/backup/BackupManagement.vue'),
        meta: {
          title: '系统备份管理',
          requiresAuth: true,
          permission: 'SYSTEM_BACKUP_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'notifications/notification-settings',
        name: 'NotificationSettings',
        component: () => import('@/pages/system/notifications/NotificationSettings.vue'),
        meta: {
          title: '通知设置',
          requiresAuth: true,
          permission: 'NOTIFICATION_CONFIG_MANAGE',
          priority: 'low'
        }
      },
      {
        path: 'maintenance/maintenance-scheduler',
        name: 'MaintenanceScheduler',
        component: () => import('@/pages/system/maintenance/MaintenanceScheduler.vue'),
        meta: {
          title: '维护调度器',
          requiresAuth: true,
          permission: 'MAINTENANCE_SCHEDULE_MANAGE',
          priority: 'low'
        }
      }
    ]
  }
]

export default systemRoutes
