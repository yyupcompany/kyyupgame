/**
 * 激活快捷登录账号
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

async function activateQuickLoginAccounts() {
  try {
    console.log('🔧 激活快捷登录账号...\n');

    // 快捷登录使用的账号
    const quickLoginAccounts = [
      'admin',
      'principal',
      'test_teacher',
      'test_parent'
    ];

    for (const username of quickLoginAccounts) {
      console.log(`📝 激活账号: ${username}`);

      // 先查询当前状态
      const [users] = await sequelize.query(`
        SELECT id, username, status FROM users WHERE username = ?
      `, {
        replacements: [username]
      });

      if (users.length === 0) {
        console.log(`  ⚠️  账号不存在`);
        continue;
      }

      const user = users[0];
      console.log(`  - 当前状态: ${user.status === 1 ? '激活' : '禁用'}`);

      if (user.status === 1) {
        console.log(`  ✅ 账号已经是激活状态`);
        continue;
      }

      // 更新用户状态为激活
      await sequelize.query(`
        UPDATE users
        SET status = 1
        WHERE username = ?
      `, {
        replacements: [username]
      });

      console.log(`  ✅ 账号已激活`);
    }

    console.log('\n✅ 所有快捷登录账号已激活！');
    console.log('\n现在可以使用以下账号快捷登录:');
    console.log('  - admin (系统管理员)');
    console.log('  - principal (园长)');
    console.log('  - test_teacher (教师)');
    console.log('  - test_parent (家长)');

  } catch (error) {
    console.error('❌ 激活失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

activateQuickLoginAccounts();

