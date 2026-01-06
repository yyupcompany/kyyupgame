const mysql = require('mysql2/promise');

async function addMenusManually() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '123456',
      database: 'kindergarten_management'
    });
    
    console.log('✅ 数据库连接成功');
    
    // 1. 查看当前permissions表结构
    console.log('\n📋 查看permissions表结构:');
    const [tableStructure] = await connection.execute('DESCRIBE permissions');
    console.table(tableStructure);
    
    // 2. 查看现有的主菜单
    console.log('\n📋 查看现有主菜单:');
    const [existingMenus] = await connection.execute(`
      SELECT id, name, code, path, component, icon, sort 
      FROM permissions 
      WHERE parent_id IS NULL AND type = 'menu' 
      ORDER BY sort
    `);
    console.table(existingMenus);
    
    // 3. 获取admin角色ID
    const [adminRoles] = await connection.execute(`SELECT id FROM roles WHERE code = 'admin'`);
    if (adminRoles.length === 0) {
      console.log('❌ 找不到admin角色');
      return;
    }
    const adminRoleId = adminRoles[0].id;
    console.log(`✅ 找到admin角色ID: ${adminRoleId}`);
    
    // 4. 手动添加班级管理菜单
    console.log('\n📚 添加班级管理菜单...');
    
    // 检查是否已存在
    const [existingClass] = await connection.execute(`
      SELECT id FROM permissions WHERE code = 'class' AND parent_id IS NULL
    `);
    
    if (existingClass.length === 0) {
      // 插入班级管理菜单
      const [classResult] = await connection.execute(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
        VALUES ('班级管理', 'class', 'menu', NULL, '/class', 'pages/class/index.vue', 'CLASS_VIEW', 'School', 30, 1, NOW(), NOW())
      `);
      
      const classMenuId = classResult.insertId;
      console.log(`✅ 班级管理菜单添加成功，ID: ${classMenuId}`);
      
      // 为admin角色添加权限
      await connection.execute(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `, [adminRoleId, classMenuId]);
      
      console.log('✅ admin角色权限添加成功');
    } else {
      console.log('✅ 班级管理菜单已存在');
    }
    
    // 5. 手动添加活动管理菜单
    console.log('\n🎯 添加活动管理菜单...');
    
    const [existingActivity] = await connection.execute(`
      SELECT id FROM permissions WHERE code = 'activity' AND parent_id IS NULL
    `);
    
    if (existingActivity.length === 0) {
      const [activityResult] = await connection.execute(`
        INSERT INTO permissions (name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at)
        VALUES ('活动管理', 'activity', 'menu', NULL, '/activity', 'pages/activity/index.vue', 'ACTIVITY_VIEW', 'Calendar', 40, 1, NOW(), NOW())
      `);
      
      const activityMenuId = activityResult.insertId;
      console.log(`✅ 活动管理菜单添加成功，ID: ${activityMenuId}`);
      
      await connection.execute(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `, [adminRoleId, activityMenuId]);
      
      console.log('✅ admin角色权限添加成功');
    } else {
      console.log('✅ 活动管理菜单已存在');
    }
    
    // 6. 查看最终结果
    console.log('\n📊 最终菜单结构:');
    const [finalMenus] = await connection.execute(`
      SELECT id, name, code, path, component, icon, sort 
      FROM permissions 
      WHERE parent_id IS NULL AND type = 'menu' 
      ORDER BY sort
    `);
    console.table(finalMenus);
    
    console.log('\n🎉 手动添加菜单完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ 数据库连接已关闭');
    }
  }
}

// 运行脚本
addMenusManually();
