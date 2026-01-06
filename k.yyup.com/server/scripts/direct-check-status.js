/**
 * 直接查询用户状态
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
    logging: console.log  // 显示SQL语句
  }
);

async function checkStatus() {
  try {
    const [users] = await sequelize.query(`
      SELECT username, status FROM users 
      WHERE username IN ('admin', 'principal', 'test_teacher', 'test_parent')
    `);
    
    console.log('用户状态:');
    users.forEach(user => {
      console.log(`${user.username}: ${user.status}`);
    });
  } catch (error) {
    console.error('错误:', error);
  } finally {
    await sequelize.close();
  }
}

checkStatus();

