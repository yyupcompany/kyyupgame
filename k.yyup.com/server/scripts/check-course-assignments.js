/**
 * 检查 course_assignments 表结构和数据
 */
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5l57j',
  database: process.env.DB_NAME || 'kindergarten_db',
  logging: console.log,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

async function checkTable() {
  try {
    console.log('🔄 连接到数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 检查表结构
    console.log('📋 表结构:');
    const [columns] = await sequelize.query("DESCRIBE course_assignments;");
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''}`);
    });

    // 检查数据
    console.log('\n📊 数据统计:');
    const [countResult] = await sequelize.query("SELECT COUNT(*) as count FROM course_assignments;");
    console.log(`  总记录数: ${countResult[0].count}`);

    // 检查状态分布
    console.log('\n📈 状态分布:');
    const [statusResult] = await sequelize.query("SELECT status, COUNT(*) as count FROM course_assignments GROUP BY status;");
    statusResult.forEach(row => {
      console.log(`  ${row.status}: ${row.count}`);
    });

  } catch (error) {
    console.error('❌ 查询失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

checkTable()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 失败:', error);
    process.exit(1);
  });
