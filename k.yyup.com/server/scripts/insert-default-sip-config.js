/**
 * 插入默认SIP配置脚本
 * 
 * 用法: node scripts/insert-default-sip-config.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertDefaultSIPConfig() {
  let connection;

  try {
    console.log('🔌 正在连接数据库...');
    
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功\n');

    // 检查表是否存在
    console.log('📋 检查sip_configs表是否存在...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'sip_configs'
    `);

    if (tables.length === 0) {
      console.error('❌ sip_configs表不存在');
      console.log('💡 请先运行数据库迁移:');
      console.log('   cd server && npx sequelize-cli db:migrate');
      process.exit(1);
    }

    console.log('✅ sip_configs表存在\n');

    // 删除已存在的默认配置
    console.log('🗑️  删除已存在的默认配置...');
    await connection.query(`
      DELETE FROM sip_configs WHERE username = 'kanderadmin'
    `);
    console.log('✅ 已删除旧配置\n');

    // 插入默认SIP配置
    console.log('📝 插入默认SIP配置...');
    const [result] = await connection.query(`
      INSERT INTO sip_configs (
        user_id,
        server_host,
        server_port,
        username,
        password,
        protocol,
        is_active,
        register_interval,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      1,                    // 管理员用户ID
      '47.94.82.59',       // SIP服务器地址
      5060,                // SIP端口
      'kanderadmin',       // 用户名
      'Szblade3944',       // 密码
      'UDP',               // 协议
      true,                // 启用
      3600                 // 注册间隔(秒)
    ]);

    console.log('✅ 默认SIP配置插入成功\n');

    // 验证插入
    console.log('🔍 验证插入的配置...');
    const [configs] = await connection.query(`
      SELECT 
        id,
        server_host,
        server_port,
        username,
        protocol,
        is_active,
        register_interval,
        created_at
      FROM sip_configs
      WHERE username = 'kanderadmin'
    `);

    if (configs.length > 0) {
      const config = configs[0];
      console.log('✅ 配置验证成功:');
      console.log(`   ID: ${config.id}`);
      console.log(`   服务器: ${config.server_host}:${config.server_port}`);
      console.log(`   用户名: ${config.username}`);
      console.log(`   协议: ${config.protocol}`);
      console.log(`   状态: ${config.is_active ? '启用' : '禁用'}`);
      console.log(`   注册间隔: ${config.register_interval}秒`);
      console.log(`   创建时间: ${config.created_at}`);
    } else {
      console.error('❌ 配置验证失败');
      process.exit(1);
    }

    console.log('\n🎉 默认SIP配置插入完成！');
    console.log('\n💡 提示: 重启服务器后，SIP配置将自动加载');
    console.log('   npm run dev');

  } catch (error) {
    console.error('\n❌ 插入默认SIP配置失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行脚本
insertDefaultSIPConfig();

