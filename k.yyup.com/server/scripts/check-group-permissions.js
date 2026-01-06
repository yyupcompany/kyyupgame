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

async function checkGroupPermissions() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询admin用户的角色
    const [adminRoles] = await sequelize.query(`
      SELECT u.id, u.username, r.id as role_id, r.name as role_name, r.code as role_code
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.username = 'admin'
    `);

    console.log('👤 Admin用户角色信息：');
    adminRoles.forEach(row => {
      console.log(`  用户: ${row.username} (ID: ${row.id})`);
      console.log(`  角色: ${row.role_name || '无角色'} (代码: ${row.role_code || 'N/A'})`);
    });
    console.log('');

    // 查询集团管理相关权限
    const [groupPermissions] = await sequelize.query(`
      SELECT id, name, code, type, path
      FROM permissions
      WHERE code LIKE '%GROUP%'
      ORDER BY id
    `);

    console.log('🏢 集团管理相关权限：');
    groupPermissions.forEach(perm => {
      console.log(`  ${perm.id}: ${perm.name} (${perm.code}) - ${perm.type} - ${perm.path || 'N/A'}`);
    });
    console.log('');

    // 查询admin角色是否有集团管理权限
    const [adminPermissions] = await sequelize.query(`
      SELECT p.id, p.name, p.code, p.type, p.path
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      INNER JOIN user_roles ur ON r.id = ur.role_id
      INNER JOIN users u ON ur.user_id = u.id
      WHERE u.username = 'admin' AND p.code LIKE '%GROUP%'
      ORDER BY p.id
    `);

    console.log('✅ Admin用户的集团管理权限：');
    if (adminPermissions.length === 0) {
      console.log('  ❌ 没有集团管理权限');
    } else {
      adminPermissions.forEach(perm => {
        console.log(`  ${perm.id}: ${perm.name} (${perm.code}) - ${perm.type}`);
      });
    }
    console.log('');

    // 查询所有角色
    const [allRoles] = await sequelize.query(`
      SELECT id, name, code, description
      FROM roles
      WHERE deleted_at IS NULL
      ORDER BY id
    `);

    console.log('📋 所有角色：');
    allRoles.forEach(role => {
      console.log(`  ${role.id}: ${role.name} (${role.code}) - ${role.description || 'N/A'}`);
    });
    console.log('');

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

checkGroupPermissions();
