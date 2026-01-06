const bcrypt = require('bcryptjs');
const { Sequelize } = require('sequelize');

async function updatePassword() {
  const sequelize = new Sequelize(
    'kargerdensales',
    'root',
    'pwk5ls7j',
    {
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      dialect: 'mysql',
      logging: console.log
    }
  );

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    const [users] = await sequelize.query(
      "SELECT id, username, phone FROM users WHERE username = 'admin' LIMIT 1"
    );

    console.log('查询结果:', users);

    if (!users || users.length === 0) {
      console.log('❌ 未找到admin用户');
      process.exit(1);
    }

    const user = users[0];
    console.log('👤 找到用户:', user);

    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log('🔐 新密码哈希长度:', hashedPassword.length);

    const [result] = await sequelize.query(
      'UPDATE users SET password = ? WHERE id = ?',
      { replacements: [hashedPassword, user.id] }
    );

    console.log('更新结果:', result);
    console.log('✅ 密码更新成功!');

  } catch (error) {
    console.error('❌ 详细错误:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

updatePassword();
