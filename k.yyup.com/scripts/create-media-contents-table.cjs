const mysql = require('mysql2/promise');

async function createTable() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('创建 media_contents 表...');
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS media_contents (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '媒体内容ID',
        title VARCHAR(200) NOT NULL COMMENT '内容标题',
        type ENUM('copywriting', 'article', 'video', 'tts') NOT NULL COMMENT '内容类型',
        platform VARCHAR(50) NOT NULL COMMENT '发布平台',
        content LONGTEXT NOT NULL COMMENT '内容正文',
        preview VARCHAR(500) DEFAULT NULL COMMENT '内容预览',
        keywords JSON DEFAULT NULL COMMENT '关键词列表',
        style ENUM('warm', 'professional', 'lively', 'elegant', 'humorous') DEFAULT NULL COMMENT '内容风格',
        settings JSON DEFAULT NULL COMMENT '其他设置',
        userId INT NOT NULL COMMENT '创建用户ID',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        deletedAt DATETIME DEFAULT NULL COMMENT '删除时间（软删除）',
        KEY idx_media_content_user_id (userId),
        KEY idx_media_content_type (type),
        KEY idx_media_content_platform (platform),
        KEY idx_media_content_created_at (createdAt),
        CONSTRAINT fk_media_content_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='媒体内容表'
    `);
    
    console.log('✅ media_contents 表创建成功');
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

createTable().catch(console.error);

