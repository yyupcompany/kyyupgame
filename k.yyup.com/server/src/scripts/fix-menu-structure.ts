#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function fixMenuStructure() {
  try {
    console.log('🔧 手动修复菜单结构，添加核心页面...');

    // 获取admin角色ID
    const [adminRole] = await sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
    const adminRoleId = adminRole.length > 0 ? (adminRole[0] as any).id : null;

    if (!adminRoleId) {
      console.log('❌ 无法找到admin角色');
      return;
    }

    // 1. 添加班级管理主菜单
    console.log('📚 添加班级管理菜单...');
    await sequelize.query(`
      INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
      VALUES ('班级管理', 'class', 'menu', NULL, '/class', 'pages/class/index.vue', 'CLASS_VIEW', 'School', 30, 1, NOW(), NOW())
    `);

    const [classMenu] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'class' AND parent_id IS NULL
    `);

    if (classMenu.length > 0) {
      const classMenuId = (classMenu[0] as any).id;
      await sequelize.query(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${adminRoleId}, ${classMenuId}, NOW(), NOW())
      `);
      console.log('✅ 班级管理菜单添加成功');
    }

    // 2. 添加活动管理主菜单
    console.log('🎯 添加活动管理菜单...');
    await sequelize.query(`
      INSERT IGNORE INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
      VALUES ('活动管理', 'activity', 'menu', NULL, '/activity', 'pages/activity/index.vue', 'ACTIVITY_VIEW', 'Calendar', 40, 1, NOW(), NOW())
    `);

    const [activityMenu] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'activity' AND parent_id IS NULL
    `);

    if (activityMenu.length > 0) {
      const activityMenuId = (activityMenu[0] as any).id;
      await sequelize.query(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${adminRoleId}, ${activityMenuId}, NOW(), NOW())
      `);
      console.log('✅ 活动管理菜单添加成功');
    }

    // 3. 检查并添加仪表板主菜单
    console.log('📊 检查仪表板菜单...');
    const [dashboardExists] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'dashboard' AND parent_id IS NULL
    `);

    if (dashboardExists.length === 0) {
      await sequelize.query(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
        VALUES ('仪表板', 'dashboard', 'menu', NULL, '/dashboard', 'pages/dashboard/index.vue', 'DASHBOARD_VIEW', 'Monitor', 5, 1, NOW(), NOW())
      `);

      const [dashboardMenu] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = 'dashboard' AND parent_id IS NULL
      `);

      if (dashboardMenu.length > 0) {
        const dashboardId = (dashboardMenu[0] as any).id;
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${adminRoleId}, ${dashboardId}, NOW(), NOW())
        `);
        console.log('✅ 仪表板菜单添加成功');
      }
    } else {
      console.log('✅ 仪表板菜单已存在');
    }
    
    // 6. 检查最终结果
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as main_menus,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as sub_menus
      FROM permissions WHERE type = 'menu'
    `);
    
    console.log('📊 修复后的权限统计:');
    console.table(finalStats);
    
    // 7. 显示最终菜单结构
    const [finalStructure] = await sequelize.query(`
      SELECT 
        pm.id,
        pm.code,
        pm.name as main_menu,
        GROUP_CONCAT(p.name ORDER BY p.sort) as sub_menus,
        COUNT(p.id) as sub_menu_count
      FROM permissions pm
      LEFT JOIN permissions p ON pm.id = p.parent_id
      WHERE pm.parent_id IS NULL AND pm.type = 'menu'
      GROUP BY pm.id, pm.code, pm.name
      ORDER BY pm.sort
    `);
    
    console.log('🏗️  最终菜单结构:');
    console.table(finalStructure);
    
    // 8. 显示admin角色权限数量
    const [adminPermCount] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM role_permissions rp 
      JOIN roles r ON rp.role_id = r.id 
      WHERE r.code = 'admin'
    `);
    
    console.log('👤 Admin角色权限数量:');
    console.table(adminPermCount);
    
    console.log('✅ 菜单结构修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

fixMenuStructure();