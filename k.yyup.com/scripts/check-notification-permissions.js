/**
 * 检查通知相关权限配置
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

async function checkPermissions() {
  try {
    console.log('🔍 检查通知相关权限配置...\n');

    // 1. 查询所有通知相关权限
    const [permissions] = await sequelize.query(`
      SELECT id, name, path, description, created_at
      FROM permissions
      WHERE path LIKE '%notification%'
      ORDER BY path
    `);

    console.log('📋 通知相关权限列表:');
    console.log('='.repeat(80));
    if (permissions.length === 0) {
      console.log('❌ 没有找到任何通知相关权限！');
    } else {
      permissions.forEach((p, index) => {
        console.log(`${index + 1}. ID: ${p.id}`);
        console.log(`   名称: ${p.name}`);
        console.log(`   路径: ${p.path}`);
        console.log(`   描述: ${p.description || '无'}`);
        console.log(`   创建时间: ${p.created_at}`);
        console.log('-'.repeat(80));
      });
    }

    // 2. 查询园长角色
    const [principalRoles] = await sequelize.query(`
      SELECT id, name, description
      FROM roles
      WHERE name = 'principal' OR name LIKE '%园长%'
    `);

    console.log('\n👤 园长角色信息:');
    console.log('='.repeat(80));
    if (principalRoles.length === 0) {
      console.log('❌ 没有找到园长角色！');
    } else {
      principalRoles.forEach((r, index) => {
        console.log(`${index + 1}. ID: ${r.id}, 名称: ${r.name}, 描述: ${r.description || '无'}`);
      });
    }

    // 3. 查询园长角色的通知权限
    if (principalRoles.length > 0 && permissions.length > 0) {
      const principalRoleId = principalRoles[0].id;
      
      const [rolePermissions] = await sequelize.query(`
        SELECT rp.*, p.name as permission_name, p.path as permission_path
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ${principalRoleId}
        AND p.path LIKE '%notification%'
      `);

      console.log('\n🔐 园长角色的通知权限:');
      console.log('='.repeat(80));
      if (rolePermissions.length === 0) {
        console.log('❌ 园长角色没有任何通知相关权限！');
        console.log('\n💡 建议: 需要为园长角色添加通知权限');
      } else {
        rolePermissions.forEach((rp, index) => {
          console.log(`${index + 1}. 权限名称: ${rp.permission_name}`);
          console.log(`   权限路径: ${rp.permission_path}`);
          console.log('-'.repeat(80));
        });
      }

      // 4. 查询园长角色的所有权限
      const [allRolePermissions] = await sequelize.query(`
        SELECT p.path
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ${principalRoleId}
        ORDER BY p.path
      `);

      console.log('\n📊 园长角色的所有权限路径:');
      console.log('='.repeat(80));
      if (allRolePermissions.length === 0) {
        console.log('❌ 园长角色没有任何权限！');
      } else {
        console.log(`总计: ${allRolePermissions.length} 个权限`);
        allRolePermissions.forEach((p, index) => {
          console.log(`${index + 1}. ${p.path}`);
        });
      }
    }

    // 5. 检查 /notifications 路径的权限
    const [notificationPagePermission] = await sequelize.query(`
      SELECT id, name, path, description
      FROM permissions
      WHERE path = '/notifications'
    `);

    console.log('\n🎯 /notifications 页面权限:');
    console.log('='.repeat(80));
    if (notificationPagePermission.length === 0) {
      console.log('❌ 没有找到 /notifications 页面权限！');
      console.log('\n💡 建议: 需要创建 /notifications 页面权限');
    } else {
      const perm = notificationPagePermission[0];
      console.log(`✅ 找到权限:`);
      console.log(`   ID: ${perm.id}`);
      console.log(`   名称: ${perm.name}`);
      console.log(`   路径: ${perm.path}`);
      console.log(`   描述: ${perm.description || '无'}`);

      // 检查哪些角色有这个权限
      const [rolesWithPermission] = await sequelize.query(`
        SELECT r.id, r.name, r.description
        FROM role_permissions rp
        JOIN roles r ON rp.role_id = r.id
        WHERE rp.permission_id = ${perm.id}
      `);

      console.log(`\n   拥有此权限的角色 (${rolesWithPermission.length}):`);
      if (rolesWithPermission.length === 0) {
        console.log('   ❌ 没有任何角色拥有此权限！');
      } else {
        rolesWithPermission.forEach((r, index) => {
          console.log(`   ${index + 1}. ${r.name} (${r.description || '无描述'})`);
        });
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 检查完成！');

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkPermissions();

