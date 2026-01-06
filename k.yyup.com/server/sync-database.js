const { sequelize } = require('./dist/init.js');

console.log('开始数据库同步...');
console.log('数据库配置:', {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: process.env.DB_PORT || '43906',
  database: process.env.DB_NAME || 'kindergarten'
});

/**
 * 安全同步数据库结构
 *
 * ⚠️  重要说明：
 * - 使用 { force: false } 只创建不存在的表，不会修改现有表
 * - 不使用 { alter: true }，因为它会导致重复索引问题
 * - 如需修改表结构，请使用迁移脚本 (migrations)
 */

async function safeSync() {
  try {
    // 第一步：检查并清理重复索引
    console.log('🔍 检查重复索引...');
    const [duplicateIndexes] = await sequelize.query(`
      SELECT TABLE_NAME, INDEX_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME REGEXP '_[0-9]+$'
      GROUP BY TABLE_NAME, INDEX_NAME
    `);

    if (duplicateIndexes.length > 0) {
      console.log(`⚠️  发现 ${duplicateIndexes.length} 个重复索引，正在清理...`);
      for (const idx of duplicateIndexes) {
        try {
          await sequelize.query(`DROP INDEX \`${idx.INDEX_NAME}\` ON \`${idx.TABLE_NAME}\``);
        } catch (e) {
          // 忽略删除失败
        }
      }
      console.log('✅ 重复索引清理完成');
    } else {
      console.log('✅ 没有发现重复索引');
    }

    // 第二步：安全同步（只创建不存在的表）
    console.log('📦 开始同步数据库结构...');
    await sequelize.sync({ force: false });
    console.log('✅ 数据库同步成功！');

    // 第三步：再次检查并清理可能新产生的重复索引
    const [newDuplicates] = await sequelize.query(`
      SELECT TABLE_NAME, INDEX_NAME
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE()
      AND INDEX_NAME REGEXP '_[0-9]+$'
      GROUP BY TABLE_NAME, INDEX_NAME
    `);

    if (newDuplicates.length > 0) {
      console.log(`🔧 清理同步过程中产生的 ${newDuplicates.length} 个重复索引...`);
      for (const idx of newDuplicates) {
        try {
          await sequelize.query(`DROP INDEX \`${idx.INDEX_NAME}\` ON \`${idx.TABLE_NAME}\``);
        } catch (e) {
          // 忽略删除失败
        }
      }
    }

    await sequelize.close();
    console.log('✅ 数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error('❌ 数据库同步失败:', error);
    console.error('错误详情:', error.message);
    process.exit(1);
  }
}

safeSync();