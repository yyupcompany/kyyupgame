import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

async function checkCustomerTable() {
  try {
    await sequelize.authenticate();
    
    const [tables] = await sequelize.query(`SHOW TABLES LIKE '%customer%'`);
    
    console.log('客户相关的表:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkCustomerTable();

