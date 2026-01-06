/**
 * 检查快捷登录账号是否存在
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

async function checkQuickLoginAccounts() {
  try {
    console.log('🔍 检查快捷登录账号...\n');

    // 快捷登录使用的账号
    const quickLoginAccounts = [
      { username: 'admin', password: 'admin123', role: '系统管理员' },
      { username: 'principal', password: '123456', role: '园长' },
      { username: 'test_teacher', password: 'admin123', role: '教师' },
      { username: 'test_parent', password: 'admin123', role: '家长' }
    ];

    for (const account of quickLoginAccounts) {
      console.log(`\n📋 检查账号: ${account.username} (${account.role})`);
      
      // 查询用户
      const [users] = await sequelize.query(`
        SELECT u.id, u.username, u.email, u.password, u.status,
               GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.username = ?
        GROUP BY u.id
      `, {
        replacements: [account.username]
      });

      if (users.length === 0) {
        console.log(`  ❌ 账号不存在`);
        continue;
      }

      const user = users[0];
      console.log(`  ✅ 账号存在`);
      console.log(`     - ID: ${user.id}`);
      console.log(`     - 邮箱: ${user.email || 'N/A'}`);
      console.log(`     - 角色: ${user.roles || '无角色'}`);
      console.log(`     - 状态: ${user.status}`);

      // 显示密码哈希（前20个字符）
      console.log(`     - 密码哈希: ${user.password.substring(0, 20)}...`);

      // 检查状态
      if (user.status !== 'active' && user.status !== 1) {
        console.log(`     ⚠️  警告: 账号已禁用，无法登录`);
      } else {
        console.log(`     ✅ 账号状态正常，可以登录`);
      }

      // 检查角色
      if (!user.roles) {
        console.log(`     ⚠️  警告: 账号没有分配角色`);
      }
    }

    console.log('\n\n📊 总结:');
    console.log('快捷登录需要以下账号处于激活状态:');
    quickLoginAccounts.forEach(account => {
      console.log(`  - ${account.username} (${account.role})`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkQuickLoginAccounts();

