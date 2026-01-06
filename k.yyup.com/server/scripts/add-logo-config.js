/**
 * 添加 Logo 系统配置到数据库
 */
const { sequelize } = require('../dist/init');
const { QueryTypes } = require('sequelize');

async function addLogoConfig() {
  try {
    console.log('🎨 开始添加系统 Logo 配置...');

    // 检查配置是否已存在
    const existingConfig = await sequelize.query(
      `SELECT id FROM system_configs WHERE group_key = 'system' AND config_key = 'logo_url'`,
      { type: QueryTypes.SELECT }
    );

    if (existingConfig.length > 0) {
      console.log('⚠️  Logo 配置已存在，跳过插入');
      process.exit(0);
    }

    // 插入Logo相关配置
    await sequelize.query(`
      INSERT INTO system_configs 
        (group_key, config_key, config_value, value_type, description, is_system, is_readonly, sort_order, created_at, updated_at)
      VALUES
        ('system', 'logo_url', '', 'string', '系统Logo URL', 0, 0, 1, NOW(), NOW()),
        ('system', 'logo_text', '幼儿园管理系统', 'string', '系统Logo旁边的文字', 0, 0, 2, NOW(), NOW()),
        ('system', 'favicon_url', '', 'string', '网站Favicon URL', 0, 0, 3, NOW(), NOW())
    `);

    console.log('✅ 系统 Logo 配置添加成功');
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加失败:', error);
    process.exit(1);
  }
}

addLogoConfig();
