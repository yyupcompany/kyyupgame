/**
 * 检查 kindergartens 表的索引数量
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function checkIndexes() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询索引信息
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM kindergartens
    `);

    // 按索引名分组
    const indexMap = new Map();
    indexes.forEach(idx => {
      if (!indexMap.has(idx.Key_name)) {
        indexMap.set(idx.Key_name, {
          name: idx.Key_name,
          unique: idx.Non_unique === 0,
          columns: []
        });
      }
      indexMap.get(idx.Key_name).columns.push(idx.Column_name);
    });

    console.log(`📊 kindergartens 表索引统计:`);
    console.log(`总索引数: ${indexMap.size}\n`);

    console.log('索引列表:');
    console.log('='.repeat(80));
    
    let i = 1;
    indexMap.forEach((index, name) => {
      const type = index.unique ? '[唯一]' : '[普通]';
      const cols = index.columns.join(', ');
      console.log(`${i}. ${type} ${name}`);
      console.log(`   字段: ${cols}`);
      i++;
    });

    console.log('='.repeat(80));
    console.log(`\n⚠️  MySQL 索引限制: 最多 64 个索引`);
    console.log(`当前使用: ${indexMap.size}/64`);
    console.log(`剩余空间: ${64 - indexMap.size} 个索引\n`);

    if (indexMap.size >= 60) {
      console.log('🚨 警告: 索引数量接近限制，建议优化！');
    }

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkIndexes();

