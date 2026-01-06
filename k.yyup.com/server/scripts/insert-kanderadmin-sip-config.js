/**
 * 插入kanderadmin SIP配置脚本
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertKanderadminConfig() {
  let connection;

  try {
    console.log('🔌 正在连接数据库...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
      port: parseInt(process.env.DB_PORT || '43906'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Yyup@2024',
      database: process.env.DB_NAME || 'kindergarten_management'
    });

    console.log('✅ 数据库连接成功\n');

    // 删除已存在的kanderadmin配置
    console.log('🗑️  删除已存在的kanderadmin配置...');
    await connection.query(`
      DELETE FROM sip_configs WHERE username = 'kanderadmin'
    `);
    console.log('✅ 已删除旧配置\n');

    // 插入kanderadmin配置
    console.log('📝 插入kanderadmin SIP配置...');
    await connection.query(`
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
      ) VALUES (
        1,
        '47.94.82.59',
        5060,
        'kanderadmin',
        'Szblade3944',
        'UDP',
        TRUE,
        3600,
        NOW(),
        NOW()
      )
    `);

    console.log('✅ kanderadmin SIP配置插入成功\n');

    // 验证插入的配置
    console.log('🔍 验证插入的配置...');
    const [results] = await connection.query(`
      SELECT * FROM sip_configs WHERE username = 'kanderadmin'
    `);

    if (results && results.length > 0) {
      const config = results[0];
      console.log('✅ 配置验证成功:');
      console.log(`   ID: ${config.id}`);
      console.log(`   服务器: ${config.server_host}:${config.server_port}`);
      console.log(`   用户名: ${config.username}`);
      console.log(`   协议: ${config.protocol}`);
      console.log(`   状态: ${config.is_active ? '启用' : '禁用'}`);
      console.log(`   注册间隔: ${config.register_interval}秒`);
      console.log(`   创建时间: ${config.created_at}`);
    }

    console.log('\n🎉 kanderadmin SIP配置插入完成！');
    console.log('\n💡 提示: 重启服务器后，SIP配置将自动加载');
    console.log('   npm run dev\n');

  } catch (error) {
    console.error('\n❌ 插入配置失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

insertKanderadminConfig();

