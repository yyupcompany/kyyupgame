/**
 * 为 /notifications 页面添加权限并分配给园长角色
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      connectTimeout: 10000
    }
  }
);

async function addPermission() {
  try {
    console.log('🚀 开始添加 /notifications 页面权限...\n');

    // 1. 检查权限是否已存在
    const [existingPermissions] = await sequelize.query(`
      SELECT id, name, path
      FROM permissions
      WHERE path = '/notifications'
    `);

    let permissionId;

    if (existingPermissions.length > 0) {
      console.log('✅ 权限已存在:');
      console.log(`   ID: ${existingPermissions[0].id}`);
      console.log(`   名称: ${existingPermissions[0].name}`);
      console.log(`   路径: ${existingPermissions[0].path}\n`);
      permissionId = existingPermissions[0].id;
    } else {
      // 2. 创建新权限
      console.log('📝 创建新权限...');
      
      const [result] = await sequelize.query(`
        INSERT INTO permissions (name, code, path, description, created_at, updated_at)
        VALUES ('Notifications', 'notifications', '/notifications', '通知管理页面', NOW(), NOW())
      `);

      permissionId = result;
      console.log(`✅ 权限创建成功！ID: ${permissionId}\n`);
    }

    // 3. 查询园长角色
    const [principalRoles] = await sequelize.query(`
      SELECT id, name
      FROM roles
      WHERE name = '园长'
    `);

    if (principalRoles.length === 0) {
      console.log('❌ 没有找到园长角色！');
      return;
    }

    const principalRoleId = principalRoles[0].id;
    console.log(`👤 找到园长角色: ID=${principalRoleId}, 名称=${principalRoles[0].name}\n`);

    // 4. 检查角色权限是否已存在
    const [existingRolePermissions] = await sequelize.query(`
      SELECT id
      FROM role_permissions
      WHERE role_id = ${principalRoleId} AND permission_id = ${permissionId}
    `);

    if (existingRolePermissions.length > 0) {
      console.log('✅ 园长角色已拥有此权限！');
    } else {
      // 5. 为园长角色添加权限
      console.log('📝 为园长角色添加权限...');
      
      await sequelize.query(`
        INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
        VALUES (${principalRoleId}, ${permissionId}, NOW(), NOW())
      `);

      console.log('✅ 权限添加成功！');
    }

    // 6. 验证结果
    console.log('\n🔍 验证结果...');
    
    const [verification] = await sequelize.query(`
      SELECT p.id, p.name, p.path, rp.role_id
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE p.path = '/notifications' AND rp.role_id = ${principalRoleId}
    `);

    if (verification.length > 0) {
      console.log('✅ 验证成功！园长角色现在拥有 /notifications 页面权限');
      console.log(`   权限ID: ${verification[0].id}`);
      console.log(`   权限名称: ${verification[0].name}`);
      console.log(`   权限路径: ${verification[0].path}`);
      console.log(`   角色ID: ${verification[0].role_id}`);
    } else {
      console.log('❌ 验证失败！权限添加可能有问题');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 操作完成！');
    console.log('\n💡 提示: 请重新登录以刷新权限缓存');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

addPermission();

