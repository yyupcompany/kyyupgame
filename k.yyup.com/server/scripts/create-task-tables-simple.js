const mysql = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kindergarten_management',
  charset: 'utf8mb4'
};

async function createTaskTables() {
  let connection;
  
  try {
    console.log('🚀 开始创建任务管理表...');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 创建任务主表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '任务ID',
        title VARCHAR(200) NOT NULL COMMENT '任务标题',
        description TEXT COMMENT '任务描述',
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '优先级',
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '任务状态',
        type ENUM('enrollment', 'activity', 'daily', 'management') DEFAULT 'daily' COMMENT '任务类型',
        
        creator_id INT NOT NULL COMMENT '创建者ID',
        assignee_id INT NOT NULL COMMENT '执行者ID',
        reviewer_id INT NULL COMMENT '审核者ID',
        
        due_date DATETIME NULL COMMENT '截止时间',
        start_date DATETIME NULL COMMENT '开始时间',
        completed_at DATETIME NULL COMMENT '完成时间',
        
        related_type VARCHAR(50) NULL COMMENT '关联类型',
        related_id INT NULL COMMENT '关联对象ID',
        
        progress INT DEFAULT 0 COMMENT '进度百分比',
        estimated_hours DECIMAL(5,2) NULL COMMENT '预估工时',
        actual_hours DECIMAL(5,2) NULL COMMENT '实际工时',
        
        tags JSON NULL COMMENT '标签信息',
        attachments JSON NULL COMMENT '附件信息',
        requirements TEXT NULL COMMENT '任务要求',
        acceptance_criteria TEXT NULL COMMENT '验收标准',
        
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_assignee_status (assignee_id, status),
        INDEX idx_creator_id (creator_id),
        INDEX idx_related (related_type, related_id),
        INDEX idx_due_date (due_date),
        INDEX idx_status_priority (status, priority),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务主表'
    `);
    console.log('✅ 创建表: tasks');
    
    // 2. 创建任务评论表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
        task_id INT NOT NULL COMMENT '任务ID',
        user_id INT NOT NULL COMMENT '用户ID',
        content TEXT NOT NULL COMMENT '评论内容',
        type ENUM('comment', 'feedback', 'correction', 'completion', 'question') DEFAULT 'comment' COMMENT '评论类型',
        parent_id INT NULL COMMENT '父评论ID',
        attachments JSON NULL COMMENT '附件信息',
        is_internal TINYINT DEFAULT 0 COMMENT '是否内部评论',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_task_id (task_id),
        INDEX idx_user_id (user_id),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论反馈表'
    `);
    console.log('✅ 创建表: task_comments');
    
    // 3. 创建任务模板表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_templates (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '模板ID',
        name VARCHAR(100) NOT NULL COMMENT '模板名称',
        description TEXT COMMENT '模板描述',
        type ENUM('enrollment', 'activity', 'daily', 'management') NOT NULL COMMENT '模板类型',
        category VARCHAR(50) NULL COMMENT '模板分类',
        
        template_content JSON NOT NULL COMMENT '模板内容配置',
        default_priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium' COMMENT '默认优先级',
        default_estimated_hours DECIMAL(5,2) NULL COMMENT '默认预估工时',
        
        usage_count INT DEFAULT 0 COMMENT '使用次数',
        
        is_active TINYINT DEFAULT 1 COMMENT '是否启用',
        is_public TINYINT DEFAULT 1 COMMENT '是否公开',
        created_by INT NOT NULL COMMENT '创建者ID',
        
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_type (type),
        INDEX idx_category (category),
        INDEX idx_created_by (created_by),
        INDEX idx_is_active (is_active),
        INDEX idx_usage_count (usage_count)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务模板表'
    `);
    console.log('✅ 创建表: task_templates');
    
    // 4. 创建任务子任务表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_subtasks (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '子任务ID',
        parent_task_id INT NOT NULL COMMENT '父任务ID',
        title VARCHAR(200) NOT NULL COMMENT '子任务标题',
        description TEXT COMMENT '子任务描述',
        status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending' COMMENT '状态',
        assignee_id INT NULL COMMENT '执行者ID',
        due_date DATETIME NULL COMMENT '截止时间',
        completed_at DATETIME NULL COMMENT '完成时间',
        sort_order INT DEFAULT 0 COMMENT '排序顺序',
        
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        
        INDEX idx_parent_task (parent_task_id),
        INDEX idx_assignee_id (assignee_id),
        INDEX idx_status (status),
        INDEX idx_sort_order (sort_order)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务子任务表'
    `);
    console.log('✅ 创建表: task_subtasks');
    
    // 5. 创建任务操作日志表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS task_logs (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
        task_id INT NOT NULL COMMENT '任务ID',
        user_id INT NOT NULL COMMENT '操作用户ID',
        action VARCHAR(50) NOT NULL COMMENT '操作类型',
        old_value JSON NULL COMMENT '旧值',
        new_value JSON NULL COMMENT '新值',
        description TEXT NULL COMMENT '操作描述',
        ip_address VARCHAR(45) NULL COMMENT 'IP地址',
        user_agent TEXT NULL COMMENT '用户代理',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        
        INDEX idx_task_id (task_id),
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务操作日志表'
    `);
    console.log('✅ 创建表: task_logs');
    
    // 验证表创建
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_COMMENT 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE 'task%'
      ORDER BY TABLE_NAME
    `, [dbConfig.database]);
    
    console.log('\n📋 任务相关表列表:');
    tables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}: ${table.TABLE_COMMENT}`);
    });
    
    console.log('\n🎉 任务管理表创建完成！');
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createTaskTables().catch(console.error);
}

module.exports = { createTaskTables };
