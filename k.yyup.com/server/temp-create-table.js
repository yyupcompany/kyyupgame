/**
 * 临时脚本：通过服务器现有的Sequelize连接创建表
 * 这个脚本将被集成到服务器的启动流程中
 */

const { initModels, sequelize } = require('./dist/models/index.js');

async function createReferralCodesTable() {
  try {
    console.log('🔄 开始创建 referral_codes 表...');

    // 初始化模型（包括ReferralCode）
    initModels(sequelize);

    // 尝试同步ReferralCode模型到数据库
    const { ReferralCode } = require('./dist/models');
    await ReferralCode.sync({ force: false, alter: false });

    console.log('✅ referral_codes 表创建/验证成功');

    // 验证表结构
    const [results] = await sequelize.query('DESCRIBE referral_codes');
    console.log('📋 表结构：');
    console.table(results);

    return true;

  } catch (error) {
    console.error('❌ 创建表失败:', error);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  createReferralCodesTable()
    .then((success) => {
      if (success) {
        console.log('🎉 表创建完成，现在可以测试推广码生成功能了！');
      }
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { createReferralCodesTable };