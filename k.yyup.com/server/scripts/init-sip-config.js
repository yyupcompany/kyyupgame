/**
 * 初始化SIP配置脚本
 * 在数据库中创建SIP配置表并插入默认配置
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initSIPConfig() {
  let connection;

  try {
    console.log('🔧 开始初始化SIP配置...\n');

    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ 数据库连接成功');
    console.log(`   数据库: ${process.env.DB_NAME}`);
    console.log(`   主机: ${process.env.DB_HOST}:${process.env.DB_PORT}\n`);

    // 读取SQL文件
    const sqlFile = path.join(__dirname, '../database/sip-config-init.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('📄 执行SQL脚本...\n');

    // 执行SQL
    const [results] = await connection.query(sql);

    console.log('✅ SQL脚本执行成功\n');

    // 验证配置
    console.log('🔍 验证SIP配置...\n');

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
      WHERE is_active = TRUE
    `);

    if (configs && configs.length > 0) {
      console.log('✅ SIP配置已创建:');
      configs.forEach(config => {
        console.log(`   ID: ${config.id}`);
        console.log(`   服务器: ${config.server_host}:${config.server_port}`);
        console.log(`   用户名: ${config.username}`);
        console.log(`   协议: ${config.protocol}`);
        console.log(`   注册间隔: ${config.register_interval}秒`);
        console.log(`   创建时间: ${config.created_at}`);
        console.log('');
      });
    } else {
      console.warn('⚠️  未找到激活的SIP配置');
    }

    // 验证分机
    const [extensions] = await connection.query(`
      SELECT 
        e.id,
        e.extension,
        e.display_name,
        e.max_concurrent_calls,
        e.is_active
      FROM sip_extensions e
      WHERE e.is_active = TRUE
    `);

    if (extensions && extensions.length > 0) {
      console.log('✅ SIP分机已创建:');
      extensions.forEach(ext => {
        console.log(`   分机号: ${ext.extension}`);
        console.log(`   名称: ${ext.display_name}`);
        console.log(`   最大并发: ${ext.max_concurrent_calls}`);
        console.log('');
      });
    }

    console.log('🎉 SIP配置初始化完成！\n');
    console.log('📝 下一步:');
    console.log('   1. 重启后端服务: npm run start:backend');
    console.log('   2. 测试SIP连接: npx ts-node tests/sip-udp-test.ts');
    console.log('   3. 或使用API测试: ./tests/call-center-api-test.sh\n');

  } catch (error) {
    console.error('❌ 初始化失败:', error.message);
    
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('\n💡 提示: 表已存在，这是正常的');
    } else if (error.code === 'ER_DUP_ENTRY') {
      console.log('\n💡 提示: 配置已存在，已更新为最新值');
    } else {
      console.error('\n详细错误:', error);
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行初始化
initSIPConfig();

