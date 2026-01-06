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

async function checkRoles() {
  try {
    const [roles] = await sequelize.query('SELECT * FROM roles ORDER BY id');
    console.log('数据库中的角色:');
    console.table(roles);
  } catch (error) {
    console.error('查询失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkRoles();

