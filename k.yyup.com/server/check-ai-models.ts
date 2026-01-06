import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function checkAIModels() {
  // 使用.env中的数据库配置
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'kargerdensales',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      dialect: 'mysql',
      logging: false
    }
  );

  console.log('📦 使用数据库配置:');
  console.log('  Host:', process.env.DB_HOST);
  console.log('  Port:', process.env.DB_PORT);
  console.log('  Database:', process.env.DB_NAME);

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 先查看表结构
    const [columns] = await sequelize.query(`DESCRIBE ai_model_config`);
    console.log('\n📋 ai_model_config 表结构：\n');
    console.table(columns);

    // 查询所有记录
    const [allRecords] = await sequelize.query(`
      SELECT * FROM ai_model_config LIMIT 10
    `);

    console.log('\n📋 ai_model_config 所有记录：\n');
    console.table(allRecords);

    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error);
    process.exit(1);
  }
}

checkAIModels();

