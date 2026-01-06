/**
 * 复制系统管理员权限给园长角色
 *
 * 功能：
 * 1. 获取admin角色的所有权限
 * 2. 排除系统中心相关权限
 * 3. 将剩余权限复制给principal角色
 *
 * 执行方式：
 * node scripts/copy-admin-permissions-to-principal.js
 */

import { Sequelize } from 'sequelize';

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: console.log,
  timezone: '+08:00'
});

async function copyAdminPermissionsToPrincipal() {
  try {
    console.log('🚀 开始复制系统管理员权限给园长角色...\n');

    // 1. 获取admin和principal角色的ID
    const [roles] = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code IN ('admin', 'principal')
    `);

    const adminRole = roles.find(r => r.code === 'admin');
    const principalRole = roles.find(r => r.code === 'principal');

    if (!adminRole) {
      throw new Error('❌ 未找到admin角色');
    }
    if (!principalRole) {
      throw new Error('❌ 未找到principal角色');
    }

    console.log(`✅ 找到角色:`);
    console.log(`   - admin角色 ID: ${adminRole.id}`);
    console.log(`   - principal角色 ID: ${principalRole.id}\n`);

    // 2. 获取admin角色的所有权限（排除系统中心相关权限）
    const [adminPermissions] = await sequelize.query(`
      SELECT DISTINCT p.id, p.code, p.name, p.description
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRole.id}
        AND p.code != 'SYSTEM_CENTER'
        AND p.code NOT LIKE 'SYSTEM_%'
      ORDER BY p.code
    `);

    console.log(`📋 admin角色的权限数量（排除系统管理权限）: ${adminPermissions.length}\n`);

    if (adminPermissions.length === 0) {
      console.log('⚠️  没有找到需要复制的权限');
      return;
    }

    // 3. 获取principal角色当前已有的权限
    const [existingPermissions] = await sequelize.query(`
      SELECT permission_id
      FROM role_permissions
      WHERE role_id = ${principalRole.id}
    `);

    const existingPermissionIds = new Set(existingPermissions.map(p => p.permission_id));
    console.log(`📋 principal角色当前权限数量: ${existingPermissionIds.size}\n`);

    // 4. 筛选出需要添加的权限（admin有但principal没有的）
    const permissionsToAdd = adminPermissions.filter(p => !existingPermissionIds.has(p.id));

    console.log(`📊 需要添加的权限数量: ${permissionsToAdd.length}\n`);

    if (permissionsToAdd.length === 0) {
      console.log('✅ principal角色已经拥有所有admin权限（除系统中心外）');
      return;
    }

    // 5. 显示将要添加的权限列表
    console.log('📝 将要添加的权限列表:');
    console.log('─'.repeat(80));
    permissionsToAdd.forEach((p, index) => {
      console.log(`${(index + 1).toString().padStart(3)}. ${p.code.padEnd(40)} ${p.name}`);
    });
    console.log('─'.repeat(80));
    console.log('');

    // 6. 批量插入权限关联
    const values = permissionsToAdd.map(p => 
      `(${principalRole.id}, ${p.id}, NOW(), NOW())`
    ).join(',\n      ');

    const insertQuery = `
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      VALUES
      ${values}
    `;

    await sequelize.query(insertQuery);

    console.log(`✅ 成功添加 ${permissionsToAdd.length} 个权限给principal角色\n`);

    // 7. 验证结果
    const [finalCount] = await sequelize.query(`
      SELECT COUNT(*) as count
      FROM role_permissions
      WHERE role_id = ${principalRole.id}
    `);

    console.log('📊 最终统计:');
    console.log(`   - principal角色权限总数: ${finalCount[0].count}`);
    console.log(`   - 新增权限数量: ${permissionsToAdd.length}`);
    console.log(`   - 原有权限数量: ${existingPermissionIds.size}\n`);

    // 8. 显示权限分类统计
    console.log('📈 权限分类统计:');
    const categories = {};
    permissionsToAdd.forEach(p => {
      const category = p.code.split('_')[0];
      categories[category] = (categories[category] || 0) + 1;
    });

    Object.entries(categories).sort((a, b) => b[1] - a[1]).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count}个权限`);
    });

    console.log('\n✅ 权限复制完成！\n');

  } catch (error) {
    console.error('❌ 执行失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
copyAdminPermissionsToPrincipal();

