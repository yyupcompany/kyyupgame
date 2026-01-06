import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false,
});

async function checkSOPTables() {
  try {
    console.log('🔍 正在连接数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 查询所有包含sop的表
    const [tables] = await sequelize.query(`
      SHOW TABLES LIKE '%sop%'
    `);
    
    console.log('📊 SOP相关的表:');
    console.log('='.repeat(80));
    
    if (tables.length === 0) {
      console.log('❌ 未找到任何SOP相关的表！\n');
    } else {
      console.log(`✅ 找到 ${tables.length} 个SOP相关的表:\n`);
      
      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`\n📋 表名: ${tableName}`);
        console.log('-'.repeat(80));
        
        // 获取表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        
        console.log('字段列表:');
        columns.forEach((col, index) => {
          console.log(`  ${index + 1}. ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
        });
        
        // 获取记录数
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`\n记录数: ${count[0].count}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    // 检查特定的表是否存在
    console.log('\n🔍 检查必需的SOP表:');
    console.log('='.repeat(80));
    
    const requiredTables = [
      'sop_stages',                    // SOP阶段表
      'sop_tasks',                     // SOP任务表
      'customer_sop_progress',         // 客户SOP进度表
      'customer_sop_task_records',     // 客户任务完成记录表
      'conversation_records',          // 对话记录表
      'conversation_screenshots',      // 对话截图表
      'ai_suggestion_history'          // AI建议历史表
    ];
    
    for (const tableName of requiredTables) {
      const [result] = await sequelize.query(`
        SHOW TABLES LIKE '${tableName}'
      `);
      
      if (result.length > 0) {
        console.log(`✅ ${tableName} - 存在`);
      } else {
        console.log(`❌ ${tableName} - 不存在`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    
    // 检查对话相关的表
    console.log('\n🔍 检查对话相关的表:');
    console.log('='.repeat(80));
    
    const [conversationTables] = await sequelize.query(`
      SHOW TABLES LIKE '%conversation%'
    `);
    
    if (conversationTables.length === 0) {
      console.log('❌ 未找到任何对话相关的表！\n');
    } else {
      console.log(`✅ 找到 ${conversationTables.length} 个对话相关的表:\n`);
      conversationTables.forEach((table, index) => {
        console.log(`  ${index + 1}. ${Object.values(table)[0]}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

checkSOPTables();

