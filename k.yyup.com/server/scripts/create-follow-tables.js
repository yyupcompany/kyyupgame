const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库配置 - 从环境变量读取
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function createTables() {
  try {
    console.log('🔍 检查表是否存在...');
    
    // 检查表是否存在
    const [tables] = await sequelize.query("SHOW TABLES LIKE 'customer_follow_records_enhanced'");
    
    if (tables.length > 0) {
      console.log('✅ 表 customer_follow_records_enhanced 已存在');
      process.exit(0);
    }
    
    console.log('📝 创建表 customer_follow_records_enhanced...');
    
    // 创建表
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS customer_follow_records_enhanced (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '跟进记录ID',
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        stage INT NOT NULL COMMENT '跟进阶段 (1-8)',
        sub_stage VARCHAR(50) NOT NULL COMMENT '子阶段标识',
        follow_type VARCHAR(50) NOT NULL COMMENT '跟进方式',
        content TEXT NOT NULL COMMENT '跟进内容',
        customer_feedback TEXT COMMENT '客户反馈',
        ai_suggestions JSON COMMENT 'AI建议内容 JSON格式',
        stage_status ENUM('pending', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'pending' COMMENT '阶段状态',
        media_files JSON COMMENT '媒体文件引用 JSON格式',
        next_follow_date DATETIME COMMENT '下次跟进时间',
        completed_at DATETIME COMMENT '完成时间',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_stage (stage),
        INDEX idx_stage_status (stage_status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='增强版客户跟进记录表';
    `);
    
    console.log('✅ 表创建成功!');
    
    // 验证表是否创建成功
    const [verifyTables] = await sequelize.query("SHOW TABLES LIKE 'customer_follow_records_enhanced'");
    console.log('✅ 验证结果:', verifyTables.length > 0 ? '表存在' : '表不存在');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  }
}

createTables();

