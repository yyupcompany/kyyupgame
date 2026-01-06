const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env' });

async function deleteOldMemoryTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: process.env.DB_PORT || 43906,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'pwk5ls7j',
    database: process.env.DB_NAME || 'kargerdensales'
  });

  console.log('🗑️ 准备删除旧的记忆系统表...\n');
  
  // 要删除的旧表
  const oldTables = ['ai_memories'];
  
  try {
    // 备份数据（可选）
    console.log('📦 首先备份旧表数据...');
    for (const tableName of oldTables) {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   - ${tableName}: ${rows[0].count} 条记录`);
      
      // 创建备份表
      const backupTableName = `${tableName}_backup_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`;
      
      try {
        // 先删除可能存在的备份表
        await connection.execute(`DROP TABLE IF EXISTS ${backupTableName}`);
        
        // 创建备份
        await connection.execute(`CREATE TABLE ${backupTableName} AS SELECT * FROM ${tableName}`);
        console.log(`   ✅ 已备份到: ${backupTableName}`);
      } catch (error) {
        console.log(`   ⚠️ 备份失败: ${error.message}`);
      }
    }
    
    console.log('\n🔥 开始删除旧表...');
    
    // 删除旧表
    for (const tableName of oldTables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`   ✅ 已删除: ${tableName}`);
      } catch (error) {
        console.log(`   ❌ 删除失败 ${tableName}: ${error.message}`);
      }
    }
    
    // 验证删除结果
    console.log('\n🔍 验证删除结果...');
    const [remainingTables] = await connection.execute(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = ? AND table_name IN (?)`,
      [process.env.DB_NAME || 'kargerdensales', oldTables.join(',')]
    );
    
    if (remainingTables.length === 0) {
      console.log('   ✅ 所有旧表已成功删除！');
    } else {
      console.log('   ⚠️ 以下表未能删除:');
      remainingTables.forEach(t => console.log(`     - ${t.table_name || t.TABLE_NAME}`));
    }
    
    // 显示当前的记忆系统表
    console.log('\n📋 当前六维记忆系统表状态:');
    const sixDimensionTables = [
      'core_memories',
      'episodic_memories',
      'semantic_memories',
      'semantic_relationships',
      'procedural_memories',
      'resource_memories',
      'knowledge_vault'
    ];
    
    for (const tableName of sixDimensionTables) {
      const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`   - ${tableName}: ${rows[0].count} 条记录`);
    }
    
    console.log('\n✨ 旧记忆系统清理完成！新的六维记忆系统已完全接管。');
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  } finally {
    await connection.end();
  }
}

// 添加确认提示
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  警告：此操作将删除旧的记忆系统表！');
console.log('   旧表: ai_memories (包含236条记录)');
console.log('   数据将被备份到带日期的备份表中。\n');

rl.question('确定要继续吗？(yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    deleteOldMemoryTables().catch(console.error).finally(() => {
      rl.close();
    });
  } else {
    console.log('操作已取消。');
    rl.close();
  }
});