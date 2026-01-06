import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

async function checkConversationTablesDetail() {
  try {
    console.log('🔍 正在连接数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 检查conversation_records表
    console.log('📋 表名: conversation_records');
    console.log('='.repeat(80));
    
    const [conversationColumns] = await sequelize.query(`DESCRIBE conversation_records`);
    console.log('字段列表:');
    conversationColumns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    const [conversationIndexes] = await sequelize.query(`SHOW INDEX FROM conversation_records`);
    if (conversationIndexes.length > 0) {
      console.log('\n索引:');
      const indexMap = new Map();
      conversationIndexes.forEach(idx => {
        if (!indexMap.has(idx.Key_name)) {
          indexMap.set(idx.Key_name, {
            name: idx.Key_name,
            unique: idx.Non_unique === 0,
            columns: []
          });
        }
        indexMap.get(idx.Key_name).columns.push(idx.Column_name);
      });
      
      indexMap.forEach((idx, name) => {
        const type = idx.unique ? 'UNIQUE' : 'INDEX';
        console.log(`  - ${name} (${type}): ${idx.columns.join(', ')}`);
      });
    }
    
    const [conversationCount] = await sequelize.query(`SELECT COUNT(*) as count FROM conversation_records`);
    console.log(`\n记录数: ${conversationCount[0].count}\n`);
    
    // 检查conversation_screenshots表
    console.log('📋 表名: conversation_screenshots');
    console.log('='.repeat(80));
    
    const [screenshotColumns] = await sequelize.query(`DESCRIBE conversation_screenshots`);
    console.log('字段列表:');
    screenshotColumns.forEach((col, index) => {
      console.log(`  ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
    });
    
    const [screenshotIndexes] = await sequelize.query(`SHOW INDEX FROM conversation_screenshots`);
    if (screenshotIndexes.length > 0) {
      console.log('\n索引:');
      const indexMap = new Map();
      screenshotIndexes.forEach(idx => {
        if (!indexMap.has(idx.Key_name)) {
          indexMap.set(idx.Key_name, {
            name: idx.Key_name,
            unique: idx.Non_unique === 0,
            columns: []
          });
        }
        indexMap.get(idx.Key_name).columns.push(idx.Column_name);
      });
      
      indexMap.forEach((idx, name) => {
        const type = idx.unique ? 'UNIQUE' : 'INDEX';
        console.log(`  - ${name} (${type}): ${idx.columns.join(', ')}`);
      });
    }
    
    const [screenshotCount] = await sequelize.query(`SELECT COUNT(*) as count FROM conversation_screenshots`);
    console.log(`\n记录数: ${screenshotCount[0].count}\n`);
    
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

checkConversationTablesDetail();

