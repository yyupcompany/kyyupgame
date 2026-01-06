import { Sequelize } from 'sequelize';

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  username: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales',
  logging: false
});

async function checkAIMessagesTable() {
  try {
    console.log('检查 ai_messages 表结构...');
    
    const [results] = await sequelize.query('DESCRIBE ai_messages');
    console.log('ai_messages 表结构:');
    console.table(results);
    
    // 检查所有必需的字段
    const fields = results as any[];
    const requiredFields = [
      { name: 'status', sql: `ADD COLUMN status ENUM('sending', 'delivered', 'failed') NOT NULL DEFAULT 'delivered' COMMENT '消息状态'` },
      { name: 'media_url', sql: `ADD COLUMN media_url VARCHAR(255) NULL COMMENT '媒体文件URL'` }
    ];

    for (const requiredField of requiredFields) {
      const hasField = fields.some(field => field.Field === requiredField.name);
      console.log(`\n是否有 ${requiredField.name} 字段: ${hasField ? '✅ 是' : '❌ 否'}`);

      if (!hasField) {
        console.log(`\n需要添加 ${requiredField.name} 字段...`);
        await sequelize.query(`ALTER TABLE ai_messages ${requiredField.sql}`);
        console.log(`✅ ${requiredField.name} 字段添加成功`);
      }
    }
    
  } catch (error) {
    console.error('检查表结构时出错:', error);
  } finally {
    await sequelize.close();
  }
}

checkAIMessagesTable();
