const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'k.yyup.com/server/.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_k001',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
  }
);

async function checkTables() {
  try {
    console.log('🔍 检查考勤相关的数据库表...\n');
    
    // 检查 attendances 表
    const [attendances] = await sequelize.query('SELECT COUNT(*) as count FROM attendances');
    console.log('✅ attendances 表 (学生考勤):', attendances[0].count, '条记录');
    
    // 检查最近的数据
    const [recentAttendances] = await sequelize.query(`
      SELECT id, student_id, class_id, kindergarten_id, attendance_date, status 
      FROM attendances 
      ORDER BY attendance_date DESC 
      LIMIT 5
    `);
    console.log('   最近5条记录:');
    recentAttendances.forEach(r => {
      console.log(`   - ID: ${r.id}, 学生: ${r.student_id}, 班级: ${r.class_id}, 日期: ${r.attendance_date}, 状态: ${r.status}`);
    });
    
    console.log('');
    
    // 检查 teacher_attendances 表
    const [teacherAttendances] = await sequelize.query('SELECT COUNT(*) as count FROM teacher_attendances');
    console.log('✅ teacher_attendances 表 (教师考勤):', teacherAttendances[0].count, '条记录');
    
    // 检查表结构
    const [structure] = await sequelize.query('DESCRIBE attendances');
    console.log('\n📋 attendances 表结构:');
    structure.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key ? `(${col.Key})` : ''}`);
    });
    
    await sequelize.close();
    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    await sequelize.close();
    process.exit(1);
  }
}

checkTables();
