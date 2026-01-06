import mysql from 'mysql2/promise';

async function createAIKnowledgeTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });
    
    console.log('📊 正在创建AI知识库表...');
    
    // 创建AI知识库表
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ai_knowledge_base (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category VARCHAR(100) NOT NULL COMMENT '文档分类',
        title VARCHAR(255) NOT NULL COMMENT '文档标题',
        content TEXT NOT NULL COMMENT '文档内容',
        metadata JSON COMMENT '元数据',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_category (category),
        INDEX idx_title (title),
        UNIQUE KEY unique_category_title (category, title)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='AI助手知识库表';
    `;
    
    await connection.execute(createTableQuery);
    console.log('✅ AI知识库表创建成功');
    
    // 检查表结构
    const [tableInfo] = await connection.execute("DESCRIBE ai_knowledge_base");
    console.log('\n📋 表结构:');
    tableInfo.forEach(column => {
      console.log(`  ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''} ${column.Key ? `(${column.Key})` : ''}`);
    });
    
    await connection.end();
    console.log('\n🎉 AI知识库表创建完成！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  }
}

createAIKnowledgeTable();