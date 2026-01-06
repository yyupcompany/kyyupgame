import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: false,
  timezone: '+08:00'
});

async function checkPrincipalUser() {
  try {
    // 先查看users表结构
    const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM users
    `);

    console.log('users表结构:');
    console.table(columns);

    // 查询园长用户
    const [users] = await sequelize.query(`
      SELECT * FROM users WHERE username LIKE '%principal%' OR username LIKE '%园长%' LIMIT 10
    `);
    
    console.log('园长用户列表:');
    console.table(users);
    
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPrincipalUser();

