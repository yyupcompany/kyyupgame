const mysql = require('mysql2/promise');

async function createTestStudent() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('开始创建测试学生记录...');

    // 创建一个新的测试学生记录
    const [result] = await connection.execute(`
      INSERT INTO students (
        name, student_no, kindergarten_id, class_id, gender, birth_date, 
        nationality, enrollment_date, status, remark, creator_id, updater_id, 
        created_at, updated_at
      ) VALUES (
        '测试学生', 'TEST001', 1, 1, 1, '2020-01-01', 
        '中国', '2024-01-01', 1, '用于前端测试的学生记录', 1, 1, 
        NOW(), NOW()
      );
    `);
    
    if (result.affectedRows > 0) {
      const newStudentId = result.insertId;
      console.log('✅ 成功创建新学生记录，ID:', newStudentId);
      
      // 验证创建结果
      const [student] = await connection.execute(`
        SELECT id, name, student_no, status, created_at 
        FROM students 
        WHERE id = ?;
      `, [newStudentId]);
      
      console.log('新创建的学生信息:');
      console.table(student);
      
      console.log(`💡 前端可以使用学生ID=${newStudentId}进行测试`);
    } else {
      console.log('❌ 创建学生记录失败');
    }

  } catch (error) {
    console.error('创建失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果需要执行创建，取消下面的注释
// createTestStudent();

console.log('⚠️  注意：这个方案会在数据库中创建新数据！');
console.log('💡 如需执行，请取消注释并运行：node solution3-create-student.js');