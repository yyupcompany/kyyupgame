#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function completePermissionCleanup() {
  try {
    console.log('🧹 开始完全清理权限系统...');
    
    // 1. 首先删除所有role_permissions关联
    console.log('🔄 删除所有角色权限关联...');
    await sequelize.query(`DELETE FROM role_permissions WHERE 1=1`);
    
    // 2. 删除所有菜单类型的权限
    console.log('🗑️  删除所有菜单权限...');
    await sequelize.query(`DELETE FROM permissions WHERE type = 'menu'`);
    
    // 3. 重新创建干净的权限结构
    console.log('🏗️  重新创建权限结构...');
    
    // 创建主菜单
    const mainMenus = [
      { name: '仪表板', code: 'dashboard', path: '/dashboard', icon: 'Monitor', sort: 5 },
      { name: '用户管理', code: 'user', path: '/user', icon: 'User', sort: 10 },
      { name: '招生管理', code: 'enrollment', path: '/enrollment', icon: 'School', sort: 20 },
      { name: '活动管理', code: 'activity', path: '/activity', icon: 'Calendar', sort: 30 },
      { name: 'AI助手', code: 'ai', path: '/ai', icon: 'ChatDotRound', sort: 40 },
      { name: '海报管理', code: 'poster', path: '/poster', icon: 'Picture', sort: 50 },
      { name: '营销管理', code: 'marketing', path: '/marketing', icon: 'Promotion', sort: 60 },
      { name: '系统管理', code: 'system', path: '/system', icon: 'Setting', sort: 90 }
    ];
    
    for (const menu of mainMenus) {
      await sequelize.query(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
        VALUES ('${menu.name}', '${menu.code}', 'menu', NULL, '${menu.path}', 'Layout', NULL, '${menu.icon}', ${menu.sort}, 1, NOW(), NOW())
      `);
    }
    
    // 4. 获取主菜单ID
    const menuIds: Record<string, number> = {};
    for (const menu of mainMenus) {
      const [result] = await sequelize.query(`SELECT id FROM permissions WHERE code = '${menu.code}'`);
      if (result.length > 0) {
        menuIds[menu.code] = (result[0] as any).id;
      }
    }
    
    // 5. 创建子菜单
    const subMenus = [
      // 用户管理子菜单
      { name: '学生管理', code: 'user:student', parent: 'user', path: 'student', component: 'pages/student/index.vue', icon: 'UserFilled', sort: 1 },
      { name: '教师管理', code: 'user:teacher', parent: 'user', path: 'teacher', component: 'pages/teacher/index.vue', icon: 'Avatar', sort: 2 },
      { name: '家长管理', code: 'user:parent', parent: 'user', path: 'parent', component: 'pages/parent/index.vue', icon: 'UserFilled', sort: 3 },
      { name: '班级管理', code: 'user:class', parent: 'user', path: 'class', component: 'pages/class/index.vue', icon: 'School', sort: 4 },
      
      // 招生管理子菜单
      { name: '招生计划', code: 'enrollment:plan', parent: 'enrollment', path: 'enrollment-plan', component: 'pages/enrollment-plan/PlanList.vue', icon: 'Document', sort: 1 },
      { name: '招生申请', code: 'enrollment:application', parent: 'enrollment', path: 'application', component: 'pages/application/ApplicationList.vue', icon: 'Files', sort: 2 },
      { name: '招生仿真模拟', code: 'enrollment:simulation', parent: 'enrollment', path: 'simulation/enrollment-simulation', component: 'pages/enrollment-plan/simulation/enrollment-simulation.vue', icon: 'Monitor', sort: 3 },
      { name: '招生预测分析', code: 'enrollment:forecast', parent: 'enrollment', path: 'forecast/enrollment-forecast', component: 'pages/enrollment-plan/forecast/enrollment-forecast.vue', icon: 'TrendCharts', sort: 4 },
      { name: '招生策略管理', code: 'enrollment:strategy', parent: 'enrollment', path: 'strategy/enrollment-strategy', component: 'pages/enrollment-plan/strategy/enrollment-strategy.vue', icon: 'Operation', sort: 5 },
      { name: '招生数据分析', code: 'enrollment:analytics', parent: 'enrollment', path: 'analytics/enrollment-analytics', component: 'pages/enrollment-plan/analytics/enrollment-analytics.vue', icon: 'DataAnalysis', sort: 6 },
      { name: '报名详情管理', code: 'enrollment:application-detail', parent: 'enrollment', path: 'application-detail', component: 'pages/application/ApplicationDetail.vue', icon: 'Document', sort: 7 },
      { name: '报名审核管理', code: 'enrollment:application-review', parent: 'enrollment', path: 'application-review', component: 'pages/application/review/ApplicationReview.vue', icon: 'Select', sort: 8 },
      { name: '面试管理', code: 'enrollment:interview', parent: 'enrollment', path: 'interview', component: 'pages/application/interview/ApplicationInterview.vue', icon: 'User', sort: 9 },
      
      // AI助手子菜单
      { name: 'AI对话', code: 'ai:chat', parent: 'ai', path: 'chat-interface', component: 'pages/ai/ChatInterface.vue', icon: 'ChatDotRound', sort: 1 },
      { name: 'AI模型管理', code: 'ai:model', parent: 'ai', path: 'model-management', component: 'pages/ai/ModelManagementPage.vue', icon: 'Setting', sort: 2 },
      { name: 'AI记忆管理', code: 'ai:memory', parent: 'ai', path: 'memory-management', component: 'pages/ai/MemoryManagementPage.vue', icon: 'FolderOpened', sort: 3 },
      { name: '专家咨询', code: 'ai:expert', parent: 'ai', path: 'expert-consultation', component: 'pages/ai/ExpertConsultationPage.vue', icon: 'User', sort: 4 },
      
      // 海报管理子菜单
      { name: '海报模板管理', code: 'poster:templates', parent: 'poster', path: 'templates', component: 'pages/principal/PosterTemplates.vue', icon: 'CollectionTag', sort: 1 },
      { name: '海报编辑器', code: 'poster:editor', parent: 'poster', path: 'editor', component: 'pages/principal/PosterEditor.vue', icon: 'Edit', sort: 2 },
      { name: '海报生成器', code: 'poster:generator', parent: 'poster', path: 'generator', component: 'pages/principal/PosterGenerator.vue', icon: 'Magic', sort: 3 },
      
      // 营销管理子菜单
      { name: '营销分析', code: 'marketing:analysis', parent: 'marketing', path: 'analysis', component: 'pages/principal/MarketingAnalysis.vue', icon: 'DataAnalysis', sort: 1 },
      { name: '营销活动管理', code: 'marketing:campaigns', parent: 'marketing', path: 'campaigns', component: 'pages/marketing.vue', icon: 'Campaign', sort: 2 },
      
      // 系统管理子菜单
      { name: '用户账户', code: 'system:user', parent: 'system', path: 'User', component: 'pages/system/User.vue', icon: 'User', sort: 1 },
      { name: '角色管理', code: 'system:role', parent: 'system', path: 'Role', component: 'pages/system/Role.vue', icon: 'Avatar', sort: 2 },
      { name: '权限管理', code: 'system:permission', parent: 'system', path: 'Permission', component: 'pages/system/Permission.vue', icon: 'Key', sort: 3 }
    ];
    
    for (const submenu of subMenus) {
      const parentId = menuIds[submenu.parent];
      if (parentId) {
        await sequelize.query(`
          INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
          VALUES ('${submenu.name}', '${submenu.code}', 'menu', ${parentId}, '${submenu.path}', '${submenu.component}', NULL, '${submenu.icon}', ${submenu.sort}, 1, NOW(), NOW())
        `);
      }
    }
    
    // 6. 为admin角色添加所有权限
    console.log('👤 为admin角色添加所有权限...');
    const [adminRole] = await sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
    const adminRoleId = adminRole.length > 0 ? (adminRole[0] as any).id : null;
    
    if (adminRoleId) {
      const [allPermissions] = await sequelize.query(`SELECT id FROM permissions WHERE type = 'menu'`);
      
      for (const permission of allPermissions as any[]) {
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${adminRoleId}, ${permission.id}, NOW(), NOW())
        `);
      }
    }
    
    // 7. 最终统计
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as main_menus,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as sub_menus
      FROM permissions WHERE type = 'menu'
    `);
    
    console.log('📊 最终权限统计:');
    console.table(finalStats);
    
    // 8. 显示菜单结构
    const [menuStructure] = await sequelize.query(`
      SELECT 
        pm.name as main_menu,
        GROUP_CONCAT(p.name ORDER BY p.sort) as sub_menus,
        COUNT(p.id) as sub_menu_count
      FROM permissions pm
      LEFT JOIN permissions p ON pm.id = p.parent_id
      WHERE pm.parent_id IS NULL AND pm.type = 'menu'
      GROUP BY pm.id, pm.name
      ORDER BY pm.sort
    `);
    
    console.log('🏗️  菜单结构:');
    console.table(menuStructure);
    
    // 9. Admin角色权限统计
    const [adminStats] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM role_permissions rp 
      JOIN roles r ON rp.role_id = r.id 
      WHERE r.code = 'admin'
    `);
    
    console.log('👤 Admin角色权限数量:');
    console.table(adminStats);
    
    console.log('✅ 权限系统完全清理并重建完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

completePermissionCleanup();