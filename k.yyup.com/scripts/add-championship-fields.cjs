require('dotenv').config({ path: './server/.env' });
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

(async () => {
  try {
    console.log('🔍 检查championship_records表字段...');
    
    // 检查字段是否存在
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'championship_records' 
      AND COLUMN_NAME IN ('participating_class_count', 'class_participation_rate', 'student_participation_rate')
    `);

    const existingColumns = results.map(r => r.COLUMN_NAME);

    // 添加参与班级数字段
    if (!existingColumns.includes('participating_class_count')) {
      await sequelize.query(`
        ALTER TABLE championship_records 
        ADD COLUMN participating_class_count INT DEFAULT 0 COMMENT '参与班级数' AFTER total_participants
      `);
      console.log('✅ 添加 participating_class_count 字段成功');
    } else {
      console.log('⏭️  participating_class_count 字段已存在');
    }

    // 添加班级参与比例字段
    if (!existingColumns.includes('class_participation_rate')) {
      await sequelize.query(`
        ALTER TABLE championship_records 
        ADD COLUMN class_participation_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '班级参与比例（%）' AFTER participating_class_count
      `);
      console.log('✅ 添加 class_participation_rate 字段成功');
    } else {
      console.log('⏭️  class_participation_rate 字段已存在');
    }

    // 添加学生参与比例字段
    if (!existingColumns.includes('student_participation_rate')) {
      await sequelize.query(`
        ALTER TABLE championship_records 
        ADD COLUMN student_participation_rate DECIMAL(5,2) DEFAULT 0.00 COMMENT '学生参与比例（%）' AFTER class_participation_rate
      `);
      console.log('✅ 添加 student_participation_rate 字段成功');
    } else {
      console.log('⏭️  student_participation_rate 字段已存在');
    }

    await sequelize.close();
    console.log('✅ 数据库字段添加完成');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
})();

