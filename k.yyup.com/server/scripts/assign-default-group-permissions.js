require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    dialect: 'mysql',
    logging: false
  }
);

async function assignDefaultGroupPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询所有集团管理权限
    const [groupPermissions] = await sequelize.query(`
      SELECT id, name, code, type
      FROM permissions
      WHERE code LIKE '%GROUP%'
      ORDER BY id
    `);

    console.log('🏢 找到的集团管理权限：');
    groupPermissions.forEach(perm => {
      console.log(`  ${perm.id}: ${perm.name} (${perm.code}) - ${perm.type}`);
    });
    console.log('');

    // 2. 查询所有主要角色（admin, principal）
    const [mainRoles] = await sequelize.query(`
      SELECT id, name, code
      FROM roles
      WHERE code IN ('admin', 'principal')
      AND deleted_at IS NULL
      ORDER BY id
    `);

    console.log('👥 主要角色：');
    mainRoles.forEach(role => {
      console.log(`  ${role.id}: ${role.name} (${role.code})`);
    });
    console.log('');

    // 3. 为每个主要角色分配所有集团管理权限
    for (const role of mainRoles) {
      console.log(`🔧 为角色 ${role.name} (${role.code}) 分配集团管理权限...`);
      
      for (const permission of groupPermissions) {
        // 检查是否已经存在
        const [existing] = await sequelize.query(`
          SELECT id FROM role_permissions
          WHERE role_id = ${role.id} AND permission_id = ${permission.id}
        `);

        if (existing.length === 0) {
          // 插入新的权限分配
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
            VALUES (${role.id}, ${permission.id}, 1, NOW(), NOW())
          `);
          console.log(`    ✅ 分配权限: ${permission.name} (${permission.code})`);
        } else {
          console.log(`    ⏭️  权限已存在: ${permission.name} (${permission.code})`);
        }
      }
      console.log('');
    }

    // 4. 验证分配结果
    console.log('🔍 验证权限分配结果：\n');
    for (const role of mainRoles) {
      const [assignedPermissions] = await sequelize.query(`
        SELECT p.id, p.name, p.code, p.type
        FROM permissions p
        INNER JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = ${role.id} AND p.code LIKE '%GROUP%'
        ORDER BY p.id
      `);

      console.log(`📋 角色 ${role.name} (${role.code}) 的集团管理权限：`);
      if (assignedPermissions.length === 0) {
        console.log('  ❌ 没有集团管理权限');
      } else {
        assignedPermissions.forEach(perm => {
          console.log(`  ✅ ${perm.id}: ${perm.name} (${perm.code}) - ${perm.type}`);
        });
      }
      console.log('');
    }

    console.log('🎉 集团管理权限分配完成！');
    console.log('💡 建议：');
    console.log('  1. 重启前端应用以清除权限缓存');
    console.log('  2. 重新登录以获取最新权限');
    console.log('  3. 现在所有管理员和园长都可以访问集团管理功能');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

assignDefaultGroupPermissions();
