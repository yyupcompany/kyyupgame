const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function fixPosterElementsTable() {
  let connection;
  
  try {
    console.log('🔧 开始修复 poster_elements 表结构...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 检查表是否存在
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'poster_elements'"
    );
    
    if (tables.length === 0) {
      console.log('📋 poster_elements 表不存在，创建新表...');
      
      // 创建完整的表结构
      await connection.execute(`
        CREATE TABLE poster_elements (
          id INT AUTO_INCREMENT PRIMARY KEY,
          type VARCHAR(50) NOT NULL COMMENT '元素类型：text-文本，image-图片，shape-形状等',
          content TEXT NOT NULL COMMENT '元素内容（JSON格式）',
          style TEXT NOT NULL COMMENT '元素样式（JSON格式）',
          position VARCHAR(100) NOT NULL COMMENT '元素位置（JSON格式：{x,y}）',
          width INT NOT NULL COMMENT '元素宽度（像素）',
          height INT NOT NULL COMMENT '元素高度（像素）',
          z_index INT NOT NULL DEFAULT 0 COMMENT '元素层级',
          template_id INT NULL COMMENT '所属模板ID',
          generation_id INT NULL COMMENT '所属生成记录ID',
          remark VARCHAR(500) NULL COMMENT '备注',
          creator_id INT NULL COMMENT '创建者ID',
          updater_id INT NULL COMMENT '更新者ID',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          deleted_at TIMESTAMP NULL,
          INDEX idx_template_id (template_id),
          INDEX idx_generation_id (generation_id),
          INDEX idx_creator_id (creator_id),
          INDEX idx_deleted_at (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='海报元素表'
      `);
      
      console.log('✅ poster_elements 表创建成功');
    } else {
      console.log('📋 poster_elements 表已存在，检查字段...');
      
      // 检查现有字段
      const [columns] = await connection.execute(
        "SHOW COLUMNS FROM poster_elements"
      );
      
      const existingColumns = columns.map(col => col.Field);
      console.log('📋 现有字段:', existingColumns);
      
      // 需要添加的字段
      const requiredFields = [
        {
          name: 'position',
          sql: 'ADD COLUMN position VARCHAR(100) NOT NULL COMMENT "元素位置（JSON格式：{x,y}）" AFTER style'
        },
        {
          name: 'width',
          sql: 'ADD COLUMN width INT NOT NULL COMMENT "元素宽度（像素）" AFTER position'
        },
        {
          name: 'height',
          sql: 'ADD COLUMN height INT NOT NULL COMMENT "元素高度（像素）" AFTER width'
        },
        {
          name: 'z_index',
          sql: 'ADD COLUMN z_index INT NOT NULL DEFAULT 0 COMMENT "元素层级" AFTER height'
        },
        {
          name: 'generation_id',
          sql: 'ADD COLUMN generation_id INT NULL COMMENT "所属生成记录ID" AFTER z_index'
        }
      ];
      
      // 检查并添加缺失的字段
      for (const field of requiredFields) {
        if (!existingColumns.includes(field.name)) {
          console.log(`🔧 添加缺失字段: ${field.name}`);
          await connection.execute(`ALTER TABLE poster_elements ${field.sql}`);
          console.log(`✅ 字段 ${field.name} 添加成功`);
        } else {
          console.log(`✅ 字段 ${field.name} 已存在`);
        }
      }
    }
    
    // 验证表结构
    console.log('🔍 验证表结构...');
    const [finalColumns] = await connection.execute(
      "SHOW COLUMNS FROM poster_elements"
    );
    
    console.log('📋 最终表结构:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('🎉 poster_elements 表结构修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行修复
fixPosterElementsTable()
  .then(() => {
    console.log('✅ 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
