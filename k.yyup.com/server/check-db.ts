import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: 'mysql',
  logging: false,
});

async function checkDatabase() {
  try {
    console.log('🔍 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
    
    console.log('\n📊 检查现有表...');
    const tables = await sequelize.showAllSchemas({ logging: false });
    console.log('数据库中的表:', tables);
    
    // 检查关键表
    const keyTables = [
      'users', 'roles', 'permissions', 'students', 'teachers', 
      'classes', 'photos', 'photo_albums', 'student_face_libraries'
    ];
    
    console.log('\n🔎 检查关键表是否存在:');
    for (const table of keyTables) {
      const exists = await sequelize.query(
        `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = ?`,
        { replacements: [process.env.DB_NAME, table], raw: true }
      );
      const count = exists[0][0]['COUNT(*)'];
      console.log(`  ${table}: ${count > 0 ? '✅ 存在' : '❌ 不存在'}`);
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 数据库连接失败:', error.message);
    process.exit(1);
  }
}

checkDatabase();
