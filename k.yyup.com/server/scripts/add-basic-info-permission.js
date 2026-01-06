/**
 * 添加basic-info权限并分配给园长角色
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

async function addBasicInfoPermission() {
  try {
    console.log('🔧 添加basic-info权限...\n');

    // 1. 检查权限是否已存在
    const [existing] = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'PRINCIPAL_BASIC_INFO'
    `);

    let permissionId;

    if (existing.length > 0) {
      permissionId = existing[0].id;
      console.log(`✅ 权限已存在，ID: ${permissionId}`);
    } else {
      // 2. 创建权限
      await sequelize.query(`
        INSERT INTO permissions (
          name, chinese_name, code, type, path, component, icon, sort, status, created_at, updated_at
        ) VALUES (
          'Basic Info', '基本资料', 'PRINCIPAL_BASIC_INFO', 'page',
          '/principal/basic-info', 'pages/principal/BasicInfo.vue',
          'user', 100, 1, NOW(), NOW()
        )
      `);

      // 获取刚插入的ID
      const [newPerm] = await sequelize.query(`
        SELECT id FROM permissions WHERE code = 'PRINCIPAL_BASIC_INFO'
      `);
      permissionId = newPerm[0].id;
      console.log(`✅ 权限已创建，ID: ${permissionId}`);
    }

    // 3. 查询园长角色ID
    const [roles] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'principal'
    `);

    if (roles.length === 0) {
      console.log('❌ 找不到园长角色');
      return;
    }

    const principalRoleId = roles[0].id;
    console.log(`✅ 园长角色ID: ${principalRoleId}`);

    // 4. 检查角色权限关系是否已存在
    const [existingRolePermission] = await sequelize.query(`
      SELECT id FROM role_permissions 
      WHERE role_id = ? AND permission_id = ?
    `, {
      replacements: [principalRoleId, permissionId]
    });

    if (existingRolePermission.length > 0) {
      console.log('✅ 角色权限关系已存在');
    } else {
      // 5. 分配权限给园长角色
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (?, ?, NOW(), NOW())
      `, {
        replacements: [principalRoleId, permissionId]
      });
      
      console.log('✅ 权限已分配给园长角色');
    }

    console.log('\n✅ 完成！现在园长可以访问基本资料页面了');
    console.log('   路径: /principal/basic-info');
    console.log('   组件: pages/principal/BasicInfo.vue');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

addBasicInfoPermission();

