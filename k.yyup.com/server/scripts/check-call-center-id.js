/**
 * 检查呼叫中心权限ID
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'Yyup@2024',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkCallCenterIds() {
  try {
    console.log('🔍 检查呼叫中心权限ID...\n');

    // 1. 查找所有呼叫中心权限
    const [callCenterPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, parent_id
      FROM permissions
      WHERE code = 'CALL_CENTER' OR code LIKE 'call_center_%'
      ORDER BY id
    `);

    console.log(`✅ 呼叫中心权限:\n`);
    callCenterPermissions.forEach(p => {
      console.log(`   ID: ${p.id}, Code: ${p.code}, Type: ${p.type}, Name: ${p.chinese_name || p.name}`);
    });
    console.log('');

    // 2. 查找ID 5323和5324是什么
    const [permissions5323_5324] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, parent_id
      FROM permissions
      WHERE id IN (5323, 5324, 5328)
      ORDER BY id
    `);

    console.log(`🔍 ID 5323, 5324, 5328 的权限:\n`);
    permissions5323_5324.forEach(p => {
      console.log(`   ID: ${p.id}, Code: ${p.code}, Type: ${p.type}, Name: ${p.chinese_name || p.name}`);
    });
    console.log('');

    // 3. 查找所有category类型的权限
    const [categoryPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type
      FROM permissions
      WHERE type = 'category' AND status = 1
      ORDER BY id
    `);

    console.log(`📋 所有category类型权限 (${categoryPermissions.length}个):\n`);
    categoryPermissions.forEach(p => {
      console.log(`   ID: ${p.id}, Code: ${p.code}, Name: ${p.chinese_name || p.name}`);
    });

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
checkCallCenterIds();

