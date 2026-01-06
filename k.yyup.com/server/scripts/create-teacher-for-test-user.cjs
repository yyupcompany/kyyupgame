/**
 * 为test_teacher用户创建teacher记录
 * 这样test_teacher用户就能从teachers表中获取kindergartenId
 */

const { Sequelize, QueryTypes } = require('sequelize');
const path = require('path');

// 数据库配置
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: process.env.DB_PORT || 43906,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sealos@2024',
  database: process.env.DB_NAME || 'kargerdensales',
  dialect: 'mysql',
  logging: false
});

async function main() {
  try {
    console.log('🔍 开始为test_teacher用户创建teacher记录...\n');

    // 1. 查找test_teacher用户
    console.log('步骤1: 查找test_teacher用户...');
    const users = await sequelize.query(
      `SELECT id, username FROM users WHERE username = 'test_teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!users || users.length === 0) {
      console.log('❌ 没有找到test_teacher用户');
      process.exit(1);
    }

    const userId = users[0].id;
    console.log(`✅ 找到test_teacher用户，ID: ${userId}\n`);

    // 2. 查找第一个幼儿园
    console.log('步骤2: 查找幼儿园...');
    const kindergartens = await sequelize.query(
      `SELECT id, name FROM kindergartens ORDER BY id LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!kindergartens || kindergartens.length === 0) {
      console.log('❌ 没有找到幼儿园');
      process.exit(1);
    }

    const kindergartenId = kindergartens[0].id;
    const kindergartenName = kindergartens[0].name;
    console.log(`✅ 找到幼儿园，ID: ${kindergartenId}, 名称: ${kindergartenName}\n`);

    // 3. 检查是否已经有teacher记录
    console.log('步骤3: 检查是否已经有teacher记录...');
    const existingTeachers = await sequelize.query(
      `SELECT id FROM teachers WHERE user_id = ? LIMIT 1`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    if (existingTeachers && existingTeachers.length > 0) {
      console.log(`✅ test_teacher用户已经有teacher记录，ID: ${existingTeachers[0].id}\n`);
      process.exit(0);
    }

    // 4. 创建teacher记录
    console.log('步骤4: 为test_teacher用户创建teacher记录...');
    
    const teacherNo = `T${Date.now()}`;
    const result = await sequelize.query(
      `INSERT INTO teachers (
        user_id, 
        kindergarten_id, 
        teacher_no, 
        position, 
        status, 
        created_at, 
        updated_at
      ) VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
      { 
        replacements: [userId, kindergartenId, teacherNo, 5, 1],
        type: QueryTypes.INSERT
      }
    );

    console.log(`✅ 成功为test_teacher用户创建teacher记录\n`);

    // 5. 验证
    console.log('步骤5: 验证teacher记录...');
    const teachers = await sequelize.query(
      `SELECT id, user_id, kindergarten_id, teacher_no FROM teachers WHERE user_id = ? LIMIT 1`,
      { replacements: [userId], type: QueryTypes.SELECT }
    );

    if (teachers && teachers.length > 0) {
      const teacher = teachers[0];
      console.log(`✅ 验证成功！`);
      console.log(`   - Teacher ID: ${teacher.id}`);
      console.log(`   - User ID: ${teacher.user_id}`);
      console.log(`   - Kindergarten ID: ${teacher.kindergarten_id}`);
      console.log(`   - Teacher No: ${teacher.teacher_no}\n`);
    }

    console.log('🎉 完成！test_teacher用户现在可以从teachers表中获取kindergartenId了');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

