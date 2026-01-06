/**
 * 修改测评相关表的字段名为下划线格式
 * 根据实际数据库字段情况进行修改
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('========== 修改测评表字段为下划线格式 ==========\n');

    // 1. assessment_records 表
    console.log('📋 修改 assessment_records 表...');
    const recordCommands = [
      "ALTER TABLE assessment_records CHANGE COLUMN recordNo record_no VARCHAR(50) NOT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN configId config_id INT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN childName child_name VARCHAR(50) NOT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN childAge child_age INT NOT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN childGender child_gender ENUM('male','female') NOT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN parentId parent_id INT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN studentId student_id INT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN userId user_id INT NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN startTime start_time DATETIME NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN endTime end_time DATETIME NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN totalScore total_score INT NULL DEFAULT 0",
      "ALTER TABLE assessment_records CHANGE COLUMN maxScore max_score INT NULL DEFAULT 0",
      "ALTER TABLE assessment_records CHANGE COLUMN dimensionScores dimension_scores JSON NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN developmentQuotient development_quotient DECIMAL(5,2) NULL",
      "ALTER TABLE assessment_records CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_records CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of recordCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message.substring(0, 80)}`);
        }
      }
    }
    console.log('  ✅ assessment_records 完成');

    // 2. assessment_questions 表
    console.log('\n📋 修改 assessment_questions 表...');
    const questionCommands = [
      "ALTER TABLE assessment_questions CHANGE COLUMN configId config_id INT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN ageGroup age_group VARCHAR(20) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN questionType question_type VARCHAR(50) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN gameConfig game_config JSON NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN sortOrder sort_order INT NULL DEFAULT 0",
      "ALTER TABLE assessment_questions CHANGE COLUMN creatorId creator_id INT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_questions CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_questions CHANGE COLUMN imageUrl image_url VARCHAR(500) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN imagePrompt image_prompt TEXT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN audioUrl audio_url VARCHAR(500) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN audioText audio_text TEXT NULL"
    ];
    
    for (const cmd of questionCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message.substring(0, 80)}`);
        }
      }
    }
    console.log('  ✅ assessment_questions 完成');

    // 3. assessment_answers 表
    console.log('\n📋 修改 assessment_answers 表...');
    const answerCommands = [
      "ALTER TABLE assessment_answers CHANGE COLUMN recordId record_id INT NOT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN questionId question_id INT NOT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN timeSpent time_spent INT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of answerCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message.substring(0, 80)}`);
        }
      }
    }
    console.log('  ✅ assessment_answers 完成');

    // 4. assessment_reports 表
    console.log('\n📋 修改 assessment_reports 表...');
    const reportCommands = [
      "ALTER TABLE assessment_reports CHANGE COLUMN recordId record_id INT NOT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN reportNo report_no VARCHAR(50) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN aiGenerated ai_generated TINYINT(1) NULL DEFAULT 0",
      "ALTER TABLE assessment_reports CHANGE COLUMN screenshotUrl screenshot_url VARCHAR(500) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN qrCodeUrl qr_code_url VARCHAR(500) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN shareUrl share_url VARCHAR(500) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN viewCount view_count INT NULL DEFAULT 0",
      "ALTER TABLE assessment_reports CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_reports CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of reportCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message.substring(0, 80)}`);
        }
      }
    }
    console.log('  ✅ assessment_reports 完成');

    console.log('\n========================================');
    console.log('✅ 所有测评表字段已成功修改为下划线格式！');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ 修改字段时出错:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

fixColumns().catch(console.error);

