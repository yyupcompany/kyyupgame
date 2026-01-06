const mysql = require('mysql2/promise');

async function findValidStudent() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'dbconn.sealoshzh.site',
      port: 43906,
      user: 'root',
      password: 'pwk5ls7j',
      database: 'kargerdensales'
    });

    console.log('数据库连接成功');

    // 查找前几个有效的学生记录
    const [validStudents] = await connection.execute(`
      SELECT id, name, student_no, status, created_at, updated_at
      FROM students 
      WHERE deleted_at IS NULL 
      ORDER BY id ASC 
      LIMIT 10;
    `);
    
    console.log('\n前10个有效的学生记录:');
    console.table(validStudents);

    // 查找最小的有效学生ID
    const [minId] = await connection.execute(`
      SELECT MIN(id) as min_id 
      FROM students 
      WHERE deleted_at IS NULL;
    `);
    
    console.log('\n最小有效学生ID:', minId[0].min_id);

    // 统计有效学生数量
    const [count] = await connection.execute(`
      SELECT COUNT(*) as count 
      FROM students 
      WHERE deleted_at IS NULL;
    `);
    
    console.log('有效学生总数:', count[0].count);

  } catch (error) {
    console.error('数据库操作失败:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

findValidStudent();