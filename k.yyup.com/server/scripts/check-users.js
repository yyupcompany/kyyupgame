/**
 * 检查数据库中的用户账号
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 创建数据库连接
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

async function checkUsers() {
  try {
    console.log('🔍 检查数据库中的用户账号...\n');

    // 查询所有用户及其角色
    const [users] = await sequelize.query(`
      SELECT u.id, u.username, u.email, u.status, u.created_at,
             GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 20
    `);

    console.log(`找到 ${users.length} 个用户账号:\n`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. 用户名: ${user.username}`);
      console.log(`   邮箱: ${user.email || 'N/A'}`);
      console.log(`   角色: ${user.roles || '无角色'}`);
      console.log(`   状态: ${user.status === 1 ? '激活' : '禁用'}`);
      console.log(`   创建时间: ${user.created_at}`);
      console.log('');
    });

    // 查询角色信息
    const [roles] = await sequelize.query(`
      SELECT id, name, code, description
      FROM roles
      ORDER BY id
    `);

    console.log(`\n系统角色列表 (${roles.length}个):\n`);
    roles.forEach(role => {
      console.log(`- ${role.name} (${role.code}): ${role.description || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();

