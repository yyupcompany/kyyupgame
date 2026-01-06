const mysql = require('mysql2/promise');

async function restoreStudentId1() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('开始恢复学生ID=1的记录...');

    // 恢复软删除的学生记录
    const [result] = await connection.execute(`
      UPDATE students 
      SET deleted_at = NULL, updated_at = NOW() 
      WHERE id = 1;
    `);
    
    if (result.affectedRows > 0) {
      console.log('✅ 成功恢复学生ID=1的记录');
      
      // 验证恢复结果
      const [student] = await connection.execute(`
        SELECT id, name, student_no, status, deleted_at 
        FROM students 
        WHERE id = 1;
      `);
      
      console.log('恢复后的学生信息:');
      console.table(student);
    } else {
      console.log('❌ 未找到需要恢复的记录');
    }

  } catch (error) {
    console.error('恢复失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// 如果需要执行恢复，取消下面的注释
// restoreStudentId1();

console.log('⚠️  注意：这个方案会修改数据库数据，请谨慎使用！');
console.log('💡 如需执行，请取消注释并运行：node solution2-restore-student.js');