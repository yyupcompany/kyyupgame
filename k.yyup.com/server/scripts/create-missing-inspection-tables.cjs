const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function createTables() {
  try {
    console.log('🔌 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 创建 task_comments 表
    console.log('📝 创建 task_comments 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS task_comments (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '评论ID',
        task_id INT NOT NULL COMMENT '任务ID',
        user_id INT NOT NULL COMMENT '评论人ID',
        content TEXT NOT NULL COMMENT '评论内容',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_task_comments_task_id (task_id),
        INDEX idx_task_comments_user_id (user_id),
        INDEX idx_task_comments_created_at (created_at),
        FOREIGN KEY (task_id) REFERENCES inspection_tasks(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务评论表'
    `);
    console.log('✅ task_comments 表创建成功\n');

    // 创建 reminder_logs 表
    console.log('📝 创建 reminder_logs 表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS reminder_logs (
        id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
        inspection_plan_id INT NOT NULL COMMENT '检查计划ID',
        reminder_id INT NOT NULL COMMENT '提醒配置ID',
        sent_to INT NOT NULL COMMENT '接收人ID',
        channel VARCHAR(20) NOT NULL COMMENT '通知渠道(system/email/sms)',
        message TEXT NULL COMMENT '消息内容',
        status ENUM('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending' COMMENT '发送状态',
        sent_at DATETIME NULL COMMENT '发送时间',
        error_message TEXT NULL COMMENT '错误信息',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_reminder_logs_plan_id (inspection_plan_id),
        INDEX idx_reminder_logs_reminder_id (reminder_id),
        INDEX idx_reminder_logs_sent_to (sent_to),
        INDEX idx_reminder_logs_status (status),
        INDEX idx_reminder_logs_sent_at (sent_at),
        FOREIGN KEY (inspection_plan_id) REFERENCES inspection_plans(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (reminder_id) REFERENCES inspection_reminders(id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (sent_to) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='提醒记录表'
    `);
    console.log('✅ reminder_logs 表创建成功\n');

    // 验证表创建
    console.log('🔍 验证表结构...');
    
    const [taskCommentsColumns] = await sequelize.query('DESCRIBE task_comments');
    console.log('📊 task_comments 表字段:');
    taskCommentsColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type})`);
    });
    
    const [reminderLogsColumns] = await sequelize.query('DESCRIBE reminder_logs');
    console.log('\n📊 reminder_logs 表字段:');
    reminderLogsColumns.forEach((col, index) => {
      console.log(`   ${index + 1}. ${col.Field} (${col.Type})`);
    });

    console.log('\n🎉 所有表创建完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

createTables();

