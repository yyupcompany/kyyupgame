/**
 * 清理 kindergartens 表的重复索引
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
    logging: console.log
  }
);

async function cleanupIndexes() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有索引
    const [indexes] = await sequelize.query(`
      SHOW INDEX FROM kindergartens
    `);

    // 找出重复的 code 索引
    const codeIndexes = indexes
      .filter(idx => idx.Key_name.startsWith('code'))
      .map(idx => idx.Key_name);

    const uniqueCodeIndexes = [...new Set(codeIndexes)];

    console.log(`📊 发现 ${uniqueCodeIndexes.length} 个 code 相关索引`);
    console.log(`需要保留: code (原始唯一索引)`);
    console.log(`需要删除: ${uniqueCodeIndexes.length - 1} 个重复索引\n`);

    // 删除重复索引 (保留原始的 'code' 索引)
    const indexesToDrop = uniqueCodeIndexes.filter(name => name !== 'code');

    console.log('开始清理重复索引...\n');

    for (const indexName of indexesToDrop) {
      try {
        console.log(`🗑️  删除索引: ${indexName}`);
        await sequelize.query(`DROP INDEX \`${indexName}\` ON kindergartens`);
        console.log(`✅ 已删除: ${indexName}`);
      } catch (error) {
        console.error(`❌ 删除失败 ${indexName}:`, error.message);
      }
    }

    console.log('\n清理完成！\n');

    // 再次检查索引数量
    const [newIndexes] = await sequelize.query(`
      SHOW INDEX FROM kindergartens
    `);

    const indexMap = new Map();
    newIndexes.forEach(idx => {
      if (!indexMap.has(idx.Key_name)) {
        indexMap.set(idx.Key_name, true);
      }
    });

    console.log(`📊 清理后索引统计:`);
    console.log(`总索引数: ${indexMap.size}/64`);
    console.log(`剩余空间: ${64 - indexMap.size} 个索引\n`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

cleanupIndexes();

