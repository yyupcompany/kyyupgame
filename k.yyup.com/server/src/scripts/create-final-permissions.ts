#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function createFinalPermissions() {
  try {
    console.log('🔄 开始创建最终的二级菜单权限系统...');
    
    // 清理现有权限
    console.log('🧹 清理现有权限...');
    await sequelize.query(`DELETE FROM role_permissions WHERE 1=1`);
    await sequelize.query(`DELETE FROM permissions WHERE 1=1`);

    // 创建权限结构
    console.log('🏗️  创建权限结构...');
    let sortOrder = 1;
    
    // 管理员权限
    console.log('\n👤 创建管理员权限...');
    
    // 1. 系统管理分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('系统管理', 'ADMIN_SYSTEM_CATEGORY', 'category', NULL, '#system', NULL, NULL, 'Setting', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [systemCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const systemCategoryId = (systemCategoryResult[0] as any).id;
    
    // 系统管理菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('用户管理', 'ADMIN_USER_MANAGEMENT', 'menu', ${systemCategoryId}, '/system/User', 'pages/system/User.vue', 'ADMIN_USER_MANAGEMENT', 'User', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('角色管理', 'ADMIN_ROLE_MANAGEMENT', 'menu', ${systemCategoryId}, '/system/Role', 'pages/system/Role.vue', 'ADMIN_ROLE_MANAGEMENT', 'Avatar', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('权限管理', 'ADMIN_PERMISSION_MANAGEMENT', 'menu', ${systemCategoryId}, '/system/Permission', 'pages/system/Permission.vue', 'ADMIN_PERMISSION_MANAGEMENT', 'Key', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 2. 仪表板分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('仪表板', 'ADMIN_DASHBOARD_CATEGORY', 'category', NULL, '#dashboard', NULL, NULL, 'Monitor', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [dashboardCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const dashboardCategoryId = (dashboardCategoryResult[0] as any).id;
    
    // 仪表板菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('总览', 'ADMIN_DASHBOARD_OVERVIEW', 'menu', ${dashboardCategoryId}, '/dashboard', 'pages/dashboard/index.vue', 'ADMIN_DASHBOARD_OVERVIEW', 'Monitor', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('数据统计', 'ADMIN_DASHBOARD_STATS', 'menu', ${dashboardCategoryId}, '/dashboard/data-statistics', 'pages/dashboard/DataStatistics.vue', 'ADMIN_DASHBOARD_STATS', 'DataAnalysis', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 3. 用户管理分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('用户管理', 'ADMIN_USER_CATEGORY', 'category', NULL, '#user', NULL, NULL, 'User', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [userCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const userCategoryId = (userCategoryResult[0] as any).id;
    
    // 用户管理菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('学生管理', 'ADMIN_STUDENT_MANAGEMENT', 'menu', ${userCategoryId}, '/student', 'pages/student/index.vue', 'ADMIN_STUDENT_MANAGEMENT', 'User', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('教师管理', 'ADMIN_TEACHER_MANAGEMENT', 'menu', ${userCategoryId}, '/teacher', 'pages/teacher/index.vue', 'ADMIN_TEACHER_MANAGEMENT', 'Avatar', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('家长管理', 'ADMIN_PARENT_MANAGEMENT', 'menu', ${userCategoryId}, '/parent', 'pages/parent/index.vue', 'ADMIN_PARENT_MANAGEMENT', 'User', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('班级管理', 'ADMIN_CLASS_MANAGEMENT', 'menu', ${userCategoryId}, '/class', 'pages/class/index.vue', 'ADMIN_CLASS_MANAGEMENT', 'School', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 4. 招生管理分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('招生管理', 'ADMIN_ENROLLMENT_CATEGORY', 'category', NULL, '#enrollment', NULL, NULL, 'School', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [enrollmentCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const enrollmentCategoryId = (enrollmentCategoryResult[0] as any).id;
    
    // 招生管理菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('招生概览', 'ADMIN_ENROLLMENT_OVERVIEW', 'menu', ${enrollmentCategoryId}, '/enrollment', 'pages/enrollment/index.vue', 'ADMIN_ENROLLMENT_OVERVIEW', 'School', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('招生计划', 'ADMIN_ENROLLMENT_PLAN', 'menu', ${enrollmentCategoryId}, '/enrollment-plan', 'pages/enrollment-plan/PlanList.vue', 'ADMIN_ENROLLMENT_PLAN', 'Document', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('申请管理', 'ADMIN_APPLICATION_MANAGEMENT', 'menu', ${enrollmentCategoryId}, '/application', 'pages/application/ApplicationList.vue', 'ADMIN_APPLICATION_MANAGEMENT', 'Files', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 5. 活动管理分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('活动管理', 'ADMIN_ACTIVITY_CATEGORY', 'category', NULL, '#activity', NULL, NULL, 'Calendar', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [activityCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const activityCategoryId = (activityCategoryResult[0] as any).id;
    
    // 活动管理菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('活动列表', 'ADMIN_ACTIVITY_LIST', 'menu', ${activityCategoryId}, '/activity', 'pages/activity/index.vue', 'ADMIN_ACTIVITY_LIST', 'Calendar', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('创建活动', 'ADMIN_ACTIVITY_CREATE', 'menu', ${activityCategoryId}, '/activity/create', 'pages/activity/ActivityCreate.vue', 'ADMIN_ACTIVITY_CREATE', 'Plus', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 6. AI助手分类
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('AI助手', 'ADMIN_AI_CATEGORY', 'category', NULL, '#ai', NULL, NULL, 'ChatDotRound', ${sortOrder++}, 1, NOW(), NOW())`
    );
    const [aiCategoryResult] = await sequelize.query(`SELECT LAST_INSERT_ID() as id`);
    const aiCategoryId = (aiCategoryResult[0] as any).id;
    
    // AI助手菜单
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('AI对话', 'ADMIN_AI_CHAT', 'menu', ${aiCategoryId}, '/ai', 'pages/ai/ChatInterface.vue', 'ADMIN_AI_CHAT', 'ChatDotRound', ${sortOrder++}, 1, NOW(), NOW())`
    );
    await sequelize.query(
      `INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
       VALUES ('AI模型管理', 'ADMIN_AI_MODEL', 'menu', ${aiCategoryId}, '/ai/model-management', 'pages/ai/ModelManagementPage.vue', 'ADMIN_AI_MODEL', 'Setting', ${sortOrder++}, 1, NOW(), NOW())`
    );
    
    // 为admin角色分配权限
    console.log('\n🔐 为admin角色分配权限...');
    const [adminRole] = await sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
    if (adminRole.length > 0) {
      const adminRoleId = (adminRole[0] as any).id;
      const [allPermissions] = await sequelize.query(`SELECT id FROM permissions WHERE type IN ('category', 'menu')`);
      
      for (const permission of allPermissions as any[]) {
        await sequelize.query(
          `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
           VALUES (${adminRoleId}, ${permission.id}, NOW(), NOW())`
        );
      }
    }

    // 统计结果
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN type = 'category' THEN 1 ELSE 0 END) as categories,
        SUM(CASE WHEN type = 'menu' THEN 1 ELSE 0 END) as menus
      FROM permissions
    `);
    
    const [adminStats] = await sequelize.query(`
      SELECT COUNT(*) as admin_permissions
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'admin'
    `);

    console.log('\n📊 权限创建完成统计:');
    console.table(finalStats);
    console.log('\n👤 Admin权限统计:');
    console.table(adminStats);

    // 显示菜单结构
    const [menuStructure] = await sequelize.query(`
      SELECT 
        pm.name as main_menu,
        GROUP_CONCAT(p.name ORDER BY p.sort) as sub_menus,
        COUNT(p.id) as sub_menu_count
      FROM permissions pm
      LEFT JOIN permissions p ON pm.id = p.parent_id
      WHERE pm.parent_id IS NULL AND pm.type = 'category'
      GROUP BY pm.id, pm.name
      ORDER BY pm.sort
    `);
    
    console.log('\n🏗️  菜单结构:');
    console.table(menuStructure);

    console.log('\n✅ 最终的二级菜单权限系统创建完成！');
    
  } catch (error) {
    console.error('❌ 创建权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createFinalPermissions();