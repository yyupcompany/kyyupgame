/**
 * 检查basic-info权限配置
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

async function checkBasicInfoPermission() {
  try {
    console.log('🔍 检查basic-info相关权限配置...\n');

    // 查询所有包含basic-info的权限
    const [permissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, status
      FROM permissions
      WHERE path LIKE '%basic-info%' OR component LIKE '%basic-info%' OR code LIKE '%basic-info%'
      ORDER BY id
    `);

    if (permissions.length === 0) {
      console.log('❌ 没有找到basic-info相关的权限配置');
    } else {
      console.log(`✅ 找到 ${permissions.length} 个相关权限:\n`);
      permissions.forEach(perm => {
        console.log(`ID: ${perm.id}`);
        console.log(`  名称: ${perm.name}`);
        console.log(`  中文名: ${perm.chinese_name || 'N/A'}`);
        console.log(`  代码: ${perm.code}`);
        console.log(`  类型: ${perm.type}`);
        console.log(`  路径: ${perm.path || 'N/A'}`);
        console.log(`  组件: ${perm.component || 'N/A'}`);
        console.log(`  状态: ${perm.status === 1 ? '启用' : '禁用'}`);
        console.log('---');
      });
    }

    // 查询园长角色的权限
    console.log('\n🔍 检查园长角色的权限...\n');
    const [rolePerms] = await sequelize.query(`
      SELECT p.id, p.name, p.path, p.component, r.name as role_name
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'principal' AND (p.path LIKE '%basic-info%' OR p.component LIKE '%basic-info%')
    `);

    if (rolePerms.length === 0) {
      console.log('❌ 园长角色没有basic-info权限');
    } else {
      console.log(`✅ 园长角色有 ${rolePerms.length} 个basic-info相关权限`);
      rolePerms.forEach(perm => {
        console.log(`  - ${perm.name} (${perm.path || perm.component})`);
      });
    }

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkBasicInfoPermission();

