/**
 * 重置test_parent账号密码
 */

const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
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

async function resetPassword() {
  try {
    console.log('🔧 重置test_parent账号密码...\n');

    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await sequelize.query(`
      UPDATE users
      SET password = ?
      WHERE username = 'test_parent'
    `, {
      replacements: [hashedPassword]
    });

    console.log('✅ 密码已重置为: admin123');

  } catch (error) {
    console.error('❌ 重置失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

resetPassword();

