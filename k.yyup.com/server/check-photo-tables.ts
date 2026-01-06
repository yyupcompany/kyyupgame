import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPhotoTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('🔍 检查相册库相关的表...\n');
    
    const photoTables = [
      'photos',
      'photo_albums',
      'photo_album_items',
      'photo_students',
      'photo_videos',
      'student_face_libraries'
    ];
    
    for (const table of photoTables) {
      try {
        const [rows] = await connection.query(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
          [process.env.DB_NAME, table]
        );
        const exists = rows[0].count > 0;
        console.log(`${exists ? '✅' : '❌'} ${table}`);
        
        if (exists) {
          const [columns] = await connection.query(`DESCRIBE ${table}`);
          console.log(`   字段数: ${columns.length}`);
        }
      } catch (error) {
        console.log(`❌ ${table} - 查询失败`);
      }
    }
    
    console.log('\n📊 检查其他关键表...');
    const keyTables = ['users', 'students', 'classes', 'teachers'];
    for (const table of keyTables) {
      try {
        const [rows] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`✅ ${table}: ${rows[0].count} 条记录`);
      } catch (error) {
        console.log(`❌ ${table} - 不存在或查询失败`);
      }
    }
    
  } finally {
    await connection.end();
  }
}

checkPhotoTables().catch(console.error);
