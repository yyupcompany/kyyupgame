const { Sequelize } = require('sequelize');

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkAdminUserManagementPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 1. 获取admin角色ID
    console.log('\n🔍 查找admin角色...');
    const [adminRoleResult] = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);

    if (!adminRoleResult.length) {
      console.log('❌ 未找到admin角色');
      return;
    }

    const adminRoleId = adminRoleResult[0].id;
    console.log(`✅ 找到admin角色，ID: ${adminRoleId}, 名称: ${adminRoleResult[0].name}`);

    // 2. 查找用户管理相关的权限
    console.log('\n🔍 查找用户管理相关权限...');
    const [userManagementPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.chinese_name, p.path, p.component, p.type, p.parent_id, p.sort
      FROM permissions p
      WHERE (
        p.code LIKE '%USER_%'
        OR p.code LIKE '%ROLE_%'
        OR p.code LIKE '%PERMISSION_%'
        OR p.path LIKE '/system/users'
        OR p.path LIKE '/system/roles'
        OR p.path LIKE '/system/permissions'
        OR p.chinese_name LIKE '%用户%'
        OR p.chinese_name LIKE '%角色%'
        OR p.chinese_name LIKE '%权限%'
      )
      AND p.deleted_at IS NULL
      ORDER BY p.sort ASC, p.code ASC
    `);

    console.log(`📊 找到 ${userManagementPermissions.length} 个用户管理相关权限:`);
    userManagementPermissions.forEach(p => {
      console.log(`  - ${p.code}: ${p.chinese_name || p.name} (${p.path})`);
    });

    // 3. 查看admin角色拥有的用户管理权限
    console.log('\n🔧 查看admin角色的用户管理权限分配...');
    const [adminUserPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.chinese_name, p.path, p.component, p.type, p.parent_id, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
      AND (
        p.code LIKE '%USER_%'
        OR p.code LIKE '%ROLE_%'
        OR p.code LIKE '%PERMISSION_%'
        OR p.path LIKE '/system/users'
        OR p.path LIKE '/system/roles'
        OR p.path LIKE '/system/permissions'
        OR p.chinese_name LIKE '%用户%'
        OR p.chinese_name LIKE '%角色%'
        OR p.chinese_name LIKE '%权限%'
      )
      AND p.deleted_at IS NULL AND rp.deleted_at IS NULL
      ORDER BY p.sort ASC, p.code ASC
    `);

    console.log(`\n📋 admin角色拥有的用户管理权限 (${adminUserPermissions.length} 个):`);
    adminUserPermissions.forEach(p => {
      console.log(`  ✅ ${p.code}: ${p.chinese_name || p.name}`);
      if (p.path) console.log(`     路径: ${p.path}`);
      if (p.component) console.log(`     组件: ${p.component}`);
    });

    // 4. 查看侧边栏菜单权限
    console.log('\n📱 查看admin角色的侧边栏菜单权限...');
    const [adminSidebarPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.chinese_name, p.path, p.component, p.type, p.parent_id, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
      AND p.type = 'menu'
      AND p.deleted_at IS NULL AND rp.deleted_at IS NULL
      ORDER BY p.sort ASC
    `);

    console.log(`\n🎯 admin角色侧边栏菜单权限 (${adminSidebarPermissions.length} 个):`);
    adminSidebarPermissions.forEach(p => {
      console.log(`  📋 ${p.code}: ${p.chinese_name || p.name}`);
      if (p.path) console.log(`     路径: ${p.path}`);
      if (p.component) console.log(`     组件: ${p.component}`);
    });

    // 5. 分析权限对应关系
    console.log('\n🔍 分析权限对应关系...');

    // 用户管理权限类别
    const userManagementCodes = [
      'USER_MANAGE', 'USER_VIEW', 'USER_CREATE', 'USER_UPDATE', 'USER_DELETE',
      'ROLE_MANAGE', 'ROLE_VIEW', 'ROLE_CREATE', 'ROLE_UPDATE', 'ROLE_DELETE',
      'PERMISSION_MANAGE', 'PERMISSION_VIEW', 'PERMISSION_CREATE', 'PERMISSION_UPDATE', 'PERMISSION_DELETE'
    ];

    const adminPermissionCodes = adminUserPermissions.map(p => p.code);

    console.log('\n📊 用户管理核心权限分析:');
    userManagementCodes.forEach(code => {
      const hasPermission = adminPermissionCodes.includes(code);
      const status = hasPermission ? '✅' : '❌';
      console.log(`  ${status} ${code}`);
    });

    // 6. 检查系统中心相关权限
    console.log('\n🏢 检查系统中心相关权限...');
    const [systemCenterPermissions] = await sequelize.query(`
      SELECT p.id, p.code, p.name, p.chinese_name, p.path, p.component
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
      AND p.code LIKE '%SYSTEM_%'
      AND p.deleted_at IS NULL AND rp.deleted_at IS NULL
      ORDER BY p.sort ASC
    `);

    console.log(`\n🏛️ 系统中心权限 (${systemCenterPermissions.length} 个):`);
    systemCenterPermissions.forEach(p => {
      console.log(`  🏛️ ${p.code}: ${p.chinese_name || p.name}`);
      if (p.path) console.log(`     路径: ${p.path}`);
    });

    // 7. 总结对比结果
    console.log('\n📋 权限对应关系总结:');
    console.log(`- 总用户管理权限: ${userManagementPermissions.length} 个`);
    console.log(`- admin用户管理权限: ${adminUserPermissions.length} 个`);
    console.log(`- 侧边栏菜单权限: ${adminSidebarPermissions.length} 个`);
    console.log(`- 系统中心权限: ${systemCenterPermissions.length} 个`);

    // 检查用户管理页面路径
    const userManagementPaths = adminUserPermissions.filter(p => p.path && p.path.includes('/system'));
    console.log(`\n🛠️ 用户管理页面路径 (${userManagementPaths.length} 个):`);
    userManagementPaths.forEach(p => {
      console.log(`  🔧 ${p.path} -> ${p.code}`);
    });

  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔚 数据库连接已关闭');
  }
}

checkAdminUserManagementPermissions();