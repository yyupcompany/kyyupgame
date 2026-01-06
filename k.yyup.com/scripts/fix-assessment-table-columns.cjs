/**
 * 修改测评相关表的字段名为下划线格式
 * 确保与 Sequelize underscored: true 配置一致
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixAssessmentTableColumns() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('========== 修改测评表字段为下划线格式 ==========\n');

    // 1. 修改 assessment_configs 表
    console.log('📋 修改 assessment_configs 表字段...');
    await connection.execute(`
      ALTER TABLE assessment_configs
        CHANGE COLUMN minAge min_age INT NOT NULL,
        CHANGE COLUMN maxAge max_age INT NOT NULL,
        CHANGE COLUMN creatorId creator_id INT NULL,
        CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    `);
    console.log('  ✅ assessment_configs 表字段已更新');

    // 2. 修改 assessment_records 表
    console.log('\n📋 修改 assessment_records 表字段...');
    
    // 先查询外键约束
    const [foreignKeys] = await connection.execute(`
      SELECT CONSTRAINT_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'assessment_records'
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [process.env.DB_NAME]);
    
    // 删除外键约束
    console.log('  🔧 临时删除外键约束...');
    for (const fk of foreignKeys) {
      try {
        await connection.execute(`ALTER TABLE assessment_records DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`);
        console.log(`    - 删除外键: ${fk.CONSTRAINT_NAME}`);
      } catch (e) {
        console.log(`    ⚠️ 外键 ${fk.CONSTRAINT_NAME} 可能已不存在`);
      }
    }
    
    // 重命名字段（分多步执行避免复杂性）
    console.log('  🔧 重命名字段...');
    const renameCommands = [
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
    
    for (const cmd of renameCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message}`);
        }
      }
    }
    
    // 重新添加外键约束
    console.log('  🔧 重新添加外键约束...');
    try {
      await connection.execute(`
        ALTER TABLE assessment_records
        ADD CONSTRAINT fk_assessment_records_config
        FOREIGN KEY (config_id) REFERENCES assessment_configs(id)
      `);
    } catch (e) {
      console.log(`    ⚠️ config_id 外键可能已存在`);
    }
    
    try {
      await connection.execute(`
        ALTER TABLE assessment_records
        ADD CONSTRAINT fk_assessment_records_user
        FOREIGN KEY (user_id) REFERENCES users(id)
      `);
    } catch (e) {
      console.log(`    ⚠️ user_id 外键可能已存在`);
    }
    
    console.log('  ✅ assessment_records 表字段已更新');

    // 3. 修改 assessment_questions 表
    console.log('\n📋 修改 assessment_questions 表字段...');
    const questionRenameCommands = [
      "ALTER TABLE assessment_questions CHANGE COLUMN configId config_id INT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN questionText question_text TEXT NOT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN questionType question_type VARCHAR(50) NULL DEFAULT 'qa'",
      "ALTER TABLE assessment_questions CHANGE COLUMN ageGroup age_group VARCHAR(20) NOT NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN correctAnswer correct_answer VARCHAR(255) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN imageUrl image_url VARCHAR(255) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN audioUrl audio_url VARCHAR(255) NULL",
      "ALTER TABLE assessment_questions CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_questions CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of questionRenameCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message}`);
        }
      }
    }
    console.log('  ✅ assessment_questions 表字段已更新');

    // 4. 修改 assessment_answers 表
    console.log('\n📋 修改 assessment_answers 表字段...');
    const answerRenameCommands = [
      "ALTER TABLE assessment_answers CHANGE COLUMN recordId record_id INT NOT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN questionId question_id INT NOT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN answerContent answer_content TEXT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN isCorrect is_correct TINYINT(1) NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN responseTime response_time INT NULL",
      "ALTER TABLE assessment_answers CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_answers CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of answerRenameCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message}`);
        }
      }
    }
    console.log('  ✅ assessment_answers 表字段已更新');

    // 5. 修改 assessment_reports 表
    console.log('\n📋 修改 assessment_reports 表字段...');
    const reportRenameCommands = [
      "ALTER TABLE assessment_reports CHANGE COLUMN recordId record_id INT NOT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN overallScore overall_score INT NOT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN developmentQuotient development_quotient DECIMAL(5,2) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN dqLevel dq_level VARCHAR(20) NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN dimensionAnalysis dimension_analysis JSON NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN strengths strengths TEXT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN weaknesses weaknesses TEXT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN recommendations recommendations TEXT NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN generatedAt generated_at DATETIME NULL",
      "ALTER TABLE assessment_reports CHANGE COLUMN createdAt created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE assessment_reports CHANGE COLUMN updatedAt updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    ];
    
    for (const cmd of reportRenameCommands) {
      try {
        await connection.execute(cmd);
      } catch (e) {
        if (!e.message.includes("check that it exists")) {
          console.log(`    ⚠️ ${e.message}`);
        }
      }
    }
    console.log('  ✅ assessment_reports 表字段已更新');

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

fixAssessmentTableColumns().catch(console.error);

