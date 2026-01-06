#!/usr/bin/env node

/**
 * 创建SOP相关表的脚本
 * 直接执行SQL创建表，不依赖Sequelize CLI
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
const envPath = path.join(__dirname, '../server/.env');
console.log('📁 加载环境变量文件:', envPath);
dotenv.config({ path: envPath });

// 打印数据库配置
console.log('🔧 数据库配置:');
console.log('  DB_HOST:', process.env.DB_HOST);
console.log('  DB_PORT:', process.env.DB_PORT);
console.log('  DB_NAME:', process.env.DB_NAME);
console.log('  DB_USER:', process.env.DB_USER);
console.log('');

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false  // 关闭SQL日志，减少输出
  }
);

async function createSOPTables() {
  try {
    console.log('🔍 检查数据库连接...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 创建SOP阶段表
    console.log('📝 创建sop_stages表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sop_stages (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL COMMENT '阶段名称',
        order_num INT NOT NULL COMMENT '排序号',
        description TEXT COMMENT '阶段描述',
        key_points JSON COMMENT '关键要点',
        expected_duration INT COMMENT '预计时长(天)',
        is_active BOOLEAN DEFAULT true COMMENT '是否激活',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_order_num (order_num),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SOP阶段表';
    `);
    console.log('✅ sop_stages表创建成功\n');

    // 2. 创建SOP任务表
    console.log('📝 创建sop_tasks表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS sop_tasks (
        id INT PRIMARY KEY AUTO_INCREMENT,
        stage_id INT NOT NULL COMMENT '所属阶段',
        name VARCHAR(200) NOT NULL COMMENT '任务名称',
        description TEXT COMMENT '任务描述',
        order_num INT NOT NULL COMMENT '排序号',
        is_required BOOLEAN DEFAULT true COMMENT '是否必需',
        estimated_time INT COMMENT '预计时长(分钟)',
        is_active BOOLEAN DEFAULT true COMMENT '是否激活',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (stage_id) REFERENCES sop_stages(id) ON DELETE CASCADE ON UPDATE CASCADE,
        INDEX idx_stage_id (stage_id),
        INDEX idx_order_num (order_num),
        INDEX idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SOP任务表';
    `);
    console.log('✅ sop_tasks表创建成功\n');

    // 3. 创建客户SOP进度表
    console.log('📝 创建customer_sop_progress表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS customer_sop_progress (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        current_stage_id INT NOT NULL COMMENT '当前阶段',
        stage_progress DECIMAL(5,2) DEFAULT 0 COMMENT '阶段进度(%)',
        completed_tasks JSON COMMENT '已完成任务ID列表',
        estimated_close_date DATE COMMENT '预计成交日期',
        success_probability DECIMAL(5,2) DEFAULT 50 COMMENT '成功概率(%)',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (current_stage_id) REFERENCES sop_stages(id),
        UNIQUE KEY uk_customer_teacher (customer_id, teacher_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_current_stage_id (current_stage_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户SOP进度表';
    `);
    console.log('✅ customer_sop_progress表创建成功\n');

    // 4. 创建对话记录表
    console.log('📝 创建conversation_records表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS conversation_records (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        speaker_type ENUM('teacher', 'customer') NOT NULL COMMENT '发言人类型',
        content TEXT NOT NULL COMMENT '对话内容',
        message_type ENUM('text', 'voice', 'image', 'video') DEFAULT 'text' COMMENT '消息类型',
        sentiment_score DECIMAL(3,2) COMMENT '情感分数(-1到1)',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话记录表';
    `);
    console.log('✅ conversation_records表创建成功\n');

    // 5. 创建截图表
    console.log('📝 创建conversation_screenshots表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS conversation_screenshots (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        image_url VARCHAR(500) NOT NULL COMMENT '图片URL',
        recognized_text TEXT COMMENT '识别的文字',
        analysis_result JSON COMMENT '分析结果',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='对话截图表';
    `);
    console.log('✅ conversation_screenshots表创建成功\n');

    // 6. 创建AI建议历史表
    console.log('📝 创建ai_suggestions_history表...');
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_suggestions_history (
        id INT PRIMARY KEY AUTO_INCREMENT,
        customer_id INT NOT NULL COMMENT '客户ID',
        teacher_id INT NOT NULL COMMENT '教师ID',
        suggestion_type ENUM('task', 'stage', 'global') NOT NULL COMMENT '建议类型',
        context JSON COMMENT '上下文信息',
        suggestion TEXT NOT NULL COMMENT 'AI建议内容',
        is_adopted BOOLEAN DEFAULT false COMMENT '是否采纳',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_teacher_id (teacher_id),
        INDEX idx_suggestion_type (suggestion_type),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='AI建议历史表';
    `);
    console.log('✅ ai_suggestions_history表创建成功\n');

    console.log('🎉 所有SOP相关表创建完成！');
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
createSOPTables();

