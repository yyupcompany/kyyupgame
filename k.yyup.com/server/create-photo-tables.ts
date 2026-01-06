import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

async function createPhotoTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  });

  try {
    console.log('🔍 正在创建相册库表...\n');
    
    const sql = fs.readFileSync('./create-photo-tables.sql', 'utf-8');
    await connection.query(sql);
    
    console.log('✅ 相册库表创建成功！\n');
    
    // 验证表是否创建
    console.log('📊 验证表创建情况:');
    const tables = ['photos', 'photo_albums', 'photo_album_items', 'photo_students', 'photo_videos', 'student_face_libraries'];
    
    for (const table of tables) {
      const [rows] = await connection.query(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        [process.env.DB_NAME, table]
      );
      const exists = rows[0].count > 0;
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    }
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

createPhotoTables();
