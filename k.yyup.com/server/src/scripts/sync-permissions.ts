/**
 * 同步权限脚本
 * 将前端页面配置与数据库权限配置进行同步
 */

import { Sequelize, DataTypes } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';
import fs from 'fs';
import path from 'path';

// 数据库连接
const dbConfig = getDatabaseConfig();
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone,
  logging: console.log,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions
});

// 定义临时模型用于操作
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  path: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  component: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  permission: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
});

// 基于CLAUDE.md Domain Models的三级目录权限配置
const menuStructure = [
  // 一级分类：工作台 (Dashboard)
  {
    name: '工作台',
    code: 'DASHBOARD_CATEGORY',
    type: 'category',
    path: '#dashboard',
    icon: 'dashboard',
    sort: 10,
    roles: ['admin', 'principal', 'teacher'], // 添加角色分配
    children: [
      {
        name: '仪表板',
        code: 'DASHBOARD',
        type: 'menu',
        path: '/dashboard',
        component: 'dashboard/index.vue',
        icon: 'dashboard',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '校园概览', code: 'DASHBOARD_CAMPUS_OVERVIEW', type: 'menu', path: '/dashboard/campus-overview', component: 'dashboard/CampusOverview.vue', icon: 'dashboard', sort: 10, roles: ['admin', 'principal'] },
          { name: '数据统计', code: 'DASHBOARD_DATA_STATISTICS', type: 'menu', path: '/dashboard/data-statistics', component: 'dashboard/DataStatistics.vue', icon: 'statistics', sort: 20, roles: ['admin', 'principal'] },
          { name: '日程安排', code: 'DASHBOARD_SCHEDULE', type: 'menu', path: '/dashboard/schedule', component: 'dashboard/Schedule.vue', icon: 'dashboard', sort: 30, roles: ['admin', 'principal', 'teacher'] }
        ]
      }
    ]
  },
  
  // 一级分类：用户管理 (User Management) - User, Role, Permission, UserRole models with RBAC
  {
    name: '用户管理',
    code: 'USER_MANAGEMENT_CATEGORY',
    type: 'category',
    path: '#user-management',
    icon: 'user',
    sort: 20,
    roles: ['admin'], // 添加角色分配
    children: [
      {
        name: '用户管理',
        code: 'USERS',
        type: 'menu',
        path: '/system/users',
        component: 'system/User.vue',
        icon: 'user',
        sort: 10,
        roles: ['admin'],
        children: []
      },
      {
        name: '角色管理',
        code: 'ROLES',
        type: 'menu',
        path: '/system/roles',
        component: 'system/Role.vue',
        icon: 'user',
        sort: 20,
        roles: ['admin'],
        children: []
      },
      {
        name: '权限管理',
        code: 'PERMISSIONS',
        type: 'menu',
        path: '/system/permissions',
        component: 'system/Permission.vue',
        icon: 'user',
        sort: 30,
        roles: ['admin'],
        children: []
      }
    ]
  },
  
  // 一级分类：教育管理 (Education) - Teacher, Student, Parent, Class models with relationships
  {
    name: '教育管理',
    code: 'EDUCATION_CATEGORY',
    type: 'category',
    path: '#education',
    icon: 'student',
    sort: 30,
    roles: ['admin', 'principal', 'teacher'], // 添加角色分配
    children: [
      {
        name: '学生管理',
        code: 'STUDENTS',
        type: 'menu',
        path: '/student',
        component: 'student/index.vue',
        icon: 'student',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '学生详情', code: 'STUDENT_DETAIL', type: 'menu', path: '/student/detail/:id', component: 'student/detail/[id].vue', icon: 'student', sort: 10, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: '教师管理',
        code: 'TEACHERS',
        type: 'menu',
        path: '/teacher',
        component: 'teacher/index.vue',
        icon: 'teacher',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '教师详情', code: 'TEACHER_DETAIL', type: 'menu', path: '/teacher/detail/:id', component: 'teacher/TeacherDetail.vue', icon: 'teacher', sort: 10, roles: ['admin', 'principal'] },
          { name: '教师编辑', code: 'TEACHER_EDIT', type: 'menu', path: '/teacher/edit/:id', component: 'teacher/TeacherEdit.vue', icon: 'teacher', sort: 20, roles: ['admin', 'principal'] }
        ]
      },
      {
        name: '家长管理',
        code: 'PARENTS',
        type: 'menu',
        path: '/parent',
        component: 'parent/index.vue',
        icon: 'parent',
        sort: 30,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '家长详情', code: 'PARENT_DETAIL', type: 'menu', path: '/parent/detail/:id', component: 'parent/ParentDetail.vue', icon: 'parent', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '子女列表', code: 'PARENT_CHILDREN', type: 'menu', path: '/parent/children', component: 'parent/ChildrenList.vue', icon: 'parent', sort: 20, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: '班级管理',
        code: 'CLASSES',
        type: 'menu',
        path: '/class',
        component: 'class/index.vue',
        icon: 'class',
        sort: 40,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '班级详情', code: 'CLASS_DETAIL', type: 'menu', path: '/class/detail/:id', component: 'class/detail/[id].vue', icon: 'class', sort: 10, roles: ['admin', 'principal', 'teacher'] }
        ]
      }
    ]
  },
  
  // 一级分类：招生管理 (Enrollment) - EnrollmentPlan, EnrollmentApplication, EnrollmentConsultation models
  {
    name: '招生管理',
    code: 'ENROLLMENT_CATEGORY',
    type: 'category',
    path: '#enrollment',
    icon: 'enrollment',
    sort: 40,
    roles: ['admin', 'principal'], // 添加角色分配
    children: [
      {
        name: '招生概览',
        code: 'ENROLLMENT_OVERVIEW',
        type: 'menu',
        path: '/enrollment',
        component: 'enrollment/index.vue',
        icon: 'enrollment',
        sort: 10,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '招生计划',
        code: 'ENROLLMENT_PLANS',
        type: 'menu',
        path: '/enrollment-plan',
        component: 'enrollment-plan.vue',
        icon: 'enrollment',
        sort: 20,
        roles: ['admin', 'principal'],
        children: [
          { name: '计划详情', code: 'ENROLLMENT_PLAN_DETAIL', type: 'menu', path: '/enrollment-plan/detail/:id', component: 'enrollment-plan/PlanDetail.vue', icon: 'enrollment', sort: 10, roles: ['admin', 'principal'] },
          { name: '计划编辑', code: 'ENROLLMENT_PLAN_EDIT', type: 'menu', path: '/enrollment-plan/edit/:id', component: 'enrollment-plan/PlanEdit.vue', icon: 'enrollment', sort: 20, roles: ['admin', 'principal'] },
          { name: '招生统计', code: 'ENROLLMENT_PLAN_STATISTICS', type: 'menu', path: '/enrollment-plan/statistics', component: 'enrollment-plan/Statistics.vue', icon: 'statistics', sort: 30, roles: ['admin', 'principal'] }
        ]
      }
    ]
  },
  
  // 一级分类：活动管理 (Activities) - Activity, ActivityRegistration, ActivityEvaluation models
  {
    name: '活动管理',
    code: 'ACTIVITIES_CATEGORY',
    type: 'category',
    path: '#activities',
    icon: 'activity',
    sort: 50,
    roles: ['admin', 'principal', 'teacher'], // 添加角色分配
    children: [
      {
        name: '活动列表',
        code: 'ACTIVITIES',
        type: 'menu',
        path: '/activity',
        component: 'activity/index.vue',
        icon: 'activity',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: [
          { name: '创建活动', code: 'ACTIVITY_CREATE', type: 'menu', path: '/activity/create', component: 'activity/ActivityCreate.vue', icon: 'plus', sort: 10, roles: ['admin', 'principal', 'teacher'] },
          { name: '活动详情', code: 'ACTIVITY_DETAIL', type: 'menu', path: '/activity/detail/:id', component: 'activity/ActivityDetail.vue', icon: 'info-circle', sort: 20, roles: ['admin', 'principal', 'teacher'] },
          { name: '编辑活动', code: 'ACTIVITY_EDIT', type: 'menu', path: '/activity/activity-edit', component: 'activity/ActivityEdit.vue', icon: 'edit', sort: 30, roles: ['admin', 'principal', 'teacher'] }
        ]
      },
      {
        name: '活动策划',
        code: 'ACTIVITY_PLANNING',
        type: 'menu',
        path: '/activity/plan/activity-planner',
        component: 'activity/plan/ActivityPlanner.vue',
        icon: 'lightbulb',
        sort: 20,
        roles: ['admin', 'principal', 'teacher']
      },
      {
        name: '活动分析',
        code: 'ACTIVITY_ANALYTICS',
        type: 'menu',
        path: '/activity/analytics/activity-analytics',
        component: 'activity/analytics/ActivityAnalytics.vue',
        icon: 'chart-bar',
        sort: 30,
        roles: ['admin', 'principal']
      },
      {
        name: '活动优化',
        code: 'ACTIVITY_OPTIMIZATION',
        type: 'menu',
        path: '/activity/optimization/activity-optimizer',
        component: 'activity/optimization/ActivityOptimizer.vue',
        icon: 'cogs',
        sort: 40,
        roles: ['admin', 'principal']
      },
      {
        name: '报名仪表板',
        code: 'ACTIVITY_REGISTRATION_DASHBOARD',
        type: 'menu',
        path: '/activity/registration/registration-dashboard',
        component: 'activity/registration/RegistrationDashboard.vue',
        icon: 'clipboard-list',
        sort: 50,
        roles: ['admin', 'principal', 'teacher']
      },
      {
        name: '活动评估',
        code: 'ACTIVITY_EVALUATION',
        type: 'menu',
        path: '/activity/evaluation/activity-evaluation',
        component: 'activity/evaluation/ActivityEvaluation.vue',
        icon: 'star',
        sort: 60,
        roles: ['admin', 'principal']
      },
      {
        name: '智能分析',
        code: 'ACTIVITY_INTELLIGENT_ANALYSIS',
        type: 'menu',
        path: '/activity/analytics/intelligent-analysis',
        component: 'activity/analytics/intelligent-analysis.vue',
        icon: 'chart-bar',
        sort: 70,
        roles: ['admin', 'principal']
      }
    ]
  },
  
  // 一级分类：AI系统 (AI System) - AIMessage, AIMemory, AIModelUsage, AIModelConfig models
  {
    name: 'AI系统',
    code: 'AI_SYSTEM_CATEGORY',
    type: 'category',
    path: '#ai-system',
    icon: 'ai',
    sort: 60,
    roles: ['admin', 'principal', 'teacher'], // 添加角色分配
    children: [
      {
        name: 'AI对话',
        code: 'AI_CHAT',
        type: 'menu',
        path: '/ai/chat-interface',
        component: 'ai/ChatInterface.vue',
        icon: 'ai',
        sort: 10,
        roles: ['admin', 'principal', 'teacher'],
        children: []
      },
      {
        name: 'AI助手',
        code: 'AI_ASSISTANT',
        type: 'menu',
        path: '/ai',
        component: 'ai/AIAssistantPage.vue',
        icon: 'ai',
        sort: 20,
        roles: ['admin', 'principal', 'teacher'],
        children: []
      },
      {
        name: 'AI记忆管理',
        code: 'AI_MEMORY',
        type: 'menu',
        path: '/ai/memory',
        component: 'ai/MemoryManagementPage.vue',
        icon: 'ai',
        sort: 30,
        roles: ['admin'],
        children: []
      },
      {
        name: 'AI模型管理',
        code: 'AI_MODEL',
        type: 'menu',
        path: '/ai/model',
        component: 'ai/ModelManagementPage.vue',
        icon: 'ai',
        sort: 40,
        roles: ['admin'],
        children: []
      }
    ]
  },
  
  // 一级分类：系统管理 (System) - Schedule, Todo, Notification, SystemLog models
  {
    name: '系统管理',
    code: 'SYSTEM_CATEGORY',
    type: 'category',
    path: '#system',
    icon: 'system',
    sort: 70,
    roles: ['admin'], // 添加角色分配
    children: [
      {
        name: '系统设置',
        code: 'SYSTEM_SETTINGS',
        type: 'menu',
        path: '/system/settings',
        component: 'system/settings/index.vue',
        icon: 'settings',
        sort: 10,
        roles: ['admin'],
        children: []
      },
      {
        name: '系统日志',
        code: 'SYSTEM_LOGS',
        type: 'menu',
        path: '/system/logs',
        component: 'system/Log.vue',
        icon: 'system',
        sort: 20,
        roles: ['admin'],
        children: []
      },
      {
        name: '数据备份',
        code: 'SYSTEM_BACKUP',
        type: 'menu',
        path: '/system/backup',
        component: 'system/Backup.vue',
        icon: 'system',
        sort: 30,
        roles: ['admin'],
        children: []
      },
      {
        name: 'AI模型配置',
        code: 'AI_MODEL_CONFIG',
        type: 'menu',
        path: '/system/ai-model-config',
        component: 'system/AIModelConfig.vue',
        icon: 'ai',
        sort: 40,
        roles: ['admin'],
        children: []
      },
      {
        name: '消息模板',
        code: 'MESSAGE_TEMPLATE',
        type: 'menu',
        path: '/system/message-template',
        component: 'system/MessageTemplate.vue',
        icon: 'system',
        sort: 50,
        roles: ['admin'],
        children: []
      }
    ]
  },
  
  // 一级分类：园长功能 (Principal Functions)
  {
    name: '园长功能',
    code: 'PRINCIPAL_CATEGORY',
    type: 'category',
    path: '#principal',
    icon: 'principal',
    sort: 80,
    roles: ['admin', 'principal'], // 添加角色分配
    children: [
      {
        name: '园长仪表板',
        code: 'PRINCIPAL_DASHBOARD',
        type: 'menu',
        path: '/principal/dashboard',
        component: 'principal/Dashboard.vue',
        icon: 'principal',
        sort: 10,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '绩效管理',
        code: 'PRINCIPAL_PERFORMANCE',
        type: 'menu',
        path: '/principal/performance',
        component: 'principal/Performance.vue',
        icon: 'principal',
        sort: 20,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '客户池管理',
        code: 'PRINCIPAL_CUSTOMER_POOL',
        type: 'menu',
        path: '/principal/customer-pool',
        component: 'principal/CustomerPool.vue',
        icon: 'customer',
        sort: 30,
        roles: ['admin', 'principal'],
        children: []
      }
    ]
  },
  
  // 一级分类：业务扩展 (Business Extensions)
  {
    name: '业务扩展',
    code: 'BUSINESS_CATEGORY',
    type: 'category',
    path: '#business',
    icon: 'Menu',
    sort: 90,
    roles: ['admin', 'principal'], // 添加角色分配
    children: [
      {
        name: '统计分析',
        code: 'STATISTICS',
        type: 'menu',
        path: '/statistics',
        component: 'statistics/index.vue',
        icon: 'statistics',
        sort: 10,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '客户管理',
        code: 'CUSTOMERS',
        type: 'menu',
        path: '/customer',
        component: 'customer/index.vue',
        icon: 'customer',
        sort: 20,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '广告管理',
        code: 'ADVERTISEMENTS',
        type: 'menu',
        path: '/advertisement',
        component: 'advertisement/index.vue',
        icon: 'advertisement',
        sort: 30,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '营销管理',
        code: 'MARKETING',
        type: 'menu',
        path: '/marketing',
        component: 'marketing.vue',
        icon: 'marketing',
        sort: 40,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '应用管理',
        code: 'APPLICATIONS',
        type: 'menu',
        path: '/application',
        component: 'application.vue',
        icon: 'application',
        sort: 50,
        roles: ['admin', 'principal'],
        children: []
      },
      {
        name: '聊天功能',
        code: 'CHAT',
        type: 'menu',
        path: '/chat',
        component: 'chat/index.vue',
        icon: 'chat',
        sort: 60,
        roles: ['admin', 'principal', 'teacher'],
        children: []
      }
    ]
  }
];

// 基础角色定义 - 使用现有的角色，不修改name
const baseRoles = [
  { code: 'admin', name: '系统管理员', description: '系统超级管理员，拥有所有权限' },
  { code: 'principal', name: '园长', description: '园长，拥有园区管理权限' },
  { code: 'teacher', name: '教师', description: '教师，拥有班级和学生管理权限' },
  { code: 'parent', name: '家长', description: '家长，拥有查看子女信息权限' },
];

// 递归函数：从菜单结构中提取所有权限项
function extractPermissions(menuItems: any[], parentId: number | null = null): any[] {
  const permissions: any[] = [];
  
  for (const item of menuItems) {
    // 创建当前项的权限记录
    const permissionItem = {
      name: item.name,
      code: item.code,
      type: item.type,
      path: item.path,
      component: item.component || null,
      permission: item.code,
      icon: item.icon || 'Menu',
      sort: item.sort,
      status: 1,
      parentId: parentId,
      roles: item.roles || []
    };
    
    permissions.push(permissionItem);
    
    // 递归处理子项
    if (item.children && item.children.length > 0) {
      // 这里需要先获取父项的ID，在创建权限后再处理
      (permissionItem as any).children = item.children;
    }
  }
  
  return permissions;
}

async function syncPermissions() {
  try {
    console.log('🔄 开始同步三级目录权限配置...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 1. 确保基础角色存在
    console.log('\n📋 步骤1: 确保基础角色存在...');
    for (const roleData of baseRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { code: roleData.code },
        defaults: roleData
      });
      console.log(`${created ? '✅ 创建' : '➡️ 存在'} 角色: ${(role as any).name} (${roleData.code})`);
    }
    
    // 2. 清理现有权限（重新构建）
    console.log('\n📋 步骤2: 清理现有权限...');
    await RolePermission.destroy({ where: {}, force: true });
    await Permission.destroy({ where: {}, force: true });

    // 强制清理软删除的数据
    await sequelize.query('DELETE FROM role_permissions WHERE 1=1');
    await sequelize.query('DELETE FROM permissions WHERE 1=1');
    console.log('✅ 已清理现有权限数据（包括软删除数据）');
    
    // 3. 创建三级目录结构
    console.log('\n📋 步骤3: 创建三级目录结构...');
    let addedCount = 0;
    
    // 获取所有角色
    const roles = await Role.findAll();
    const roleMap = new Map(roles.map(r => [(r as any).code, r]));
    
    // 递归创建权限结构
    async function createPermissions(items: any[], parentId: number | null = null) {
      for (const item of items) {
        console.log(`📝 创建权限: ${item.name} (${item.code}) - 类型: ${item.type}`);
        
        // 创建权限记录
        const permission = await Permission.create({
          name: item.name,
          code: item.code,
          type: item.type,
          path: item.path,
          component: item.component || null,
          permission: item.code,
          icon: item.icon || 'Menu',
          sort: item.sort,
          status: 1,
          parentId: parentId
        });
        
        addedCount++;
        
        // 分配角色权限（只对有角色的菜单项）
        if (item.roles && item.roles.length > 0) {
          for (const roleCode of item.roles) {
            const role = roleMap.get(roleCode);
            if (role) {
              await RolePermission.create({
                roleId: (role as any).id,
                permissionId: (permission as any).id
              });
              console.log(`  ✅ 分配给角色: ${(role as any).name}`);
            }
          }
        }
        
        // 递归处理子项
        if (item.children && item.children.length > 0) {
          await createPermissions(item.children, (permission as any).id);
        }
      }
    }
    
    // 开始创建权限结构
    await createPermissions(menuStructure);
    
    // 4. 统计结果
    console.log('\n📊 同步结果统计:');
    const finalPermissionCount = await Permission.count();
    const finalRoleCount = await Role.count();
    const finalAssociationCount = await RolePermission.count();
    
    console.log(`📈 权限总数: ${finalPermissionCount}`);
    console.log(`📈 角色总数: ${finalRoleCount}`);
    console.log(`📈 角色权限关联总数: ${finalAssociationCount}`);
    console.log(`✅ 新增权限: ${addedCount}`);
    
    // 5. 验证三级结构
    console.log('\n📋 步骤5: 验证三级结构...');
    const categoryCount = await Permission.count({ where: { type: 'category' } });
    const menuCount = await Permission.count({ where: { type: 'menu' } });
    
    console.log(`📊 一级分类数量: ${categoryCount}`);
    console.log(`📊 二三级菜单数量: ${menuCount}`);
    
    console.log('\n🎉 三级目录权限同步完成！');
    
  } catch (error) {
    console.error('❌ 权限同步失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 导出函数用于外部调用
export { syncPermissions };

// 如果直接运行此文件
if (require.main === module) {
  syncPermissions()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}