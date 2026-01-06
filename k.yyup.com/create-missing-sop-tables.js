import { Sequelize } from 'sequelize';

// 数据库连接配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log,
});

async function createMissingSOPTables() {
  try {
    console.log('🔍 正在连接数据库...\n');
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 1. 创建customer_sop_task_records表
    console.log('📋 创建customer_sop_task_records表...\n');
    
    const createTaskRecordsSQL = `
      CREATE TABLE IF NOT EXISTS customer_sop_task_records (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT '任务记录ID',
        
        -- 关联字段
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        task_id INT NOT NULL COMMENT '任务ID',
        stage_id INT NOT NULL COMMENT '阶段ID',
        
        -- 任务状态
        status ENUM('pending', 'in_progress', 'completed', 'skipped') NOT NULL DEFAULT 'pending' COMMENT '任务状态',
        
        -- 完成信息
        completed_at DATETIME NULL COMMENT '完成时间',
        completion_notes TEXT NULL COMMENT '完成备注',
        
        -- 跳过信息
        skip_reason VARCHAR(500) NULL COMMENT '跳过原因',
        
        -- 时间戳
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        -- 外键约束
        FOREIGN KEY (customer_id) REFERENCES teacher_customers(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES sop_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (stage_id) REFERENCES sop_stages(id) ON UPDATE CASCADE ON DELETE CASCADE,
        
        -- 索引
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_task_id (task_id),
        INDEX idx_stage_id (stage_id),
        INDEX idx_status (status),
        INDEX idx_completed_at (completed_at),
        
        -- 唯一索引：确保同一客户的同一任务只有一条记录
        UNIQUE INDEX uk_customer_task (customer_id, task_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户SOP任务完成记录表';
    `;
    
    await sequelize.query(createTaskRecordsSQL);
    console.log('✅ customer_sop_task_records表创建成功！\n');
    
    // 2. 创建ai_suggestion_history表
    console.log('📋 创建ai_suggestion_history表...\n');
    
    const createAISuggestionSQL = `
      CREATE TABLE IF NOT EXISTS ai_suggestion_history (
        id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'AI建议历史ID',
        
        -- 关联字段
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        task_id INT NULL COMMENT '任务ID（可选）',
        
        -- 建议类型
        suggestion_type ENUM('task', 'global', 'conversation', 'screenshot') NOT NULL COMMENT '建议类型',
        
        -- 输入上下文
        input_context JSON NULL COMMENT '输入上下文（对话记录、任务信息等）',
        
        -- AI响应
        ai_response JSON NULL COMMENT 'AI响应内容',
        
        -- 建议内容
        suggestion_text TEXT NULL COMMENT '建议文本',
        next_steps JSON NULL COMMENT '下一步建议',
        
        -- 应用状态
        is_applied TINYINT(1) DEFAULT 0 COMMENT '是否已应用',
        applied_at DATETIME NULL COMMENT '应用时间',
        
        -- 反馈
        feedback_rating INT NULL COMMENT '反馈评分（1-5）',
        feedback_text TEXT NULL COMMENT '反馈文本',
        
        -- 时间戳
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        -- 外键约束
        FOREIGN KEY (customer_id) REFERENCES teacher_customers(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON UPDATE CASCADE ON DELETE CASCADE,
        FOREIGN KEY (task_id) REFERENCES sop_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL,
        
        -- 索引
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_task_id (task_id),
        INDEX idx_suggestion_type (suggestion_type),
        INDEX idx_is_applied (is_applied),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI建议历史表';
    `;
    
    await sequelize.query(createAISuggestionSQL);
    console.log('✅ ai_suggestion_history表创建成功！\n');
    
    // 验证表是否创建成功
    console.log('📋 验证表创建结果...\n');
    console.log('='.repeat(80));
    
    const tables = ['customer_sop_task_records', 'ai_suggestion_history'];
    
    for (const tableName of tables) {
      const [result] = await sequelize.query(`SHOW TABLES LIKE '${tableName}'`);
      
      if (result.length > 0) {
        console.log(`✅ ${tableName} - 创建成功`);
        
        // 显示表结构
        const [columns] = await sequelize.query(`DESCRIBE ${tableName}`);
        console.log(`   字段数: ${columns.length}`);
        
        // 显示索引
        const [indexes] = await sequelize.query(`SHOW INDEX FROM ${tableName}`);
        const indexMap = new Map();
        indexes.forEach(idx => {
          if (!indexMap.has(idx.Key_name)) {
            indexMap.set(idx.Key_name, true);
          }
        });
        console.log(`   索引数: ${indexMap.size}`);
        
        // 显示记录数
        const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        console.log(`   记录数: ${count[0].count}\n`);
      } else {
        console.log(`❌ ${tableName} - 创建失败\n`);
      }
    }
    
    console.log('='.repeat(80));
    console.log('\n✅ 所有缺失的表已创建完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
    console.log('\n✅ 数据库连接已关闭');
  }
}

createMissingSOPTables();

