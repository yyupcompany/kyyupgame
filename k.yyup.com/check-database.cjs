const { Sequelize } = require('sequelize');

// 创建数据库连接
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: console.log
});

async function checkDatabase() {
  try {
    console.log('🔍 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 先查看数据库中所有表
    console.log('\n📋 查看数据库中的所有表...');
    const [tablesResults] = await sequelize.query('SHOW TABLES');
    console.log('数据库中的表:', tablesResults.map(row => Object.values(row)[0]));

    // 检查学生表 (如果存在)
    const hasStudents = tablesResults.some(row => Object.values(row)[0].toLowerCase().includes('student'));
    if (hasStudents) {
      console.log('\n📊 检查学生相关数据...');
      // 尝试查找学生相关的表
      for (const table of tablesResults) {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('student')) {
          const [studentResults] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`${tableName} 表中的记录数量:`, studentResults[0].count);
        }
      }
    }

    // 检查教师表 (如果存在)
    const hasTeachers = tablesResults.some(row => Object.values(row)[0].toLowerCase().includes('teacher'));
    if (hasTeachers) {
      console.log('\n👨‍🏫 检查教师相关数据...');
      for (const table of tablesResults) {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('teacher')) {
          const [teacherResults] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`${tableName} 表中的记录数量:`, teacherResults[0].count);
        }
      }
    }

    // 检查班级表 (如果存在)
    const hasClasses = tablesResults.some(row => Object.values(row)[0].toLowerCase().includes('class'));
    if (hasClasses) {
      console.log('\n🏫 检查班级相关数据...');
      for (const table of tablesResults) {
        const tableName = Object.values(table)[0];
        if (tableName.toLowerCase().includes('class')) {
          const [classResults] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`);
          console.log(`${tableName} 表中的记录数量:`, classResults[0].count);
        }
      }
    }

    // 查看详细的学生数据（如果有的话）
    if (parseInt(studentResults[0].count) > 0) {
      console.log('\n👶 学生详细数据:');
      const [studentDetails] = await sequelize.query('SELECT * FROM Students LIMIT 5');
      console.log(studentDetails);
    }

    // 查看详细的教师数据（如果有的话）
    if (parseInt(teacherResults[0].count) > 0) {
      console.log('\n👨‍🏫 教师详细数据:');
      const [teacherDetails] = await sequelize.query('SELECT * FROM Teachers LIMIT 5');
      console.log(teacherDetails);
    }

    // 查看详细的班级数据（如果有的话）
    if (parseInt(classResults[0].count) > 0) {
      console.log('\n🏫 班级详细数据:');
      const [classDetails] = await sequelize.query('SELECT * FROM Classes LIMIT 5');
      console.log(classDetails);
    }

  } catch (error) {
    console.error('❌ 数据库查询失败:', error);
  } finally {
    await sequelize.close();
  }
}

checkDatabase();