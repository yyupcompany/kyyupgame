/**
 * 更新园长账号密码
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updatePrincipalUser() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales',
    ssl: false
  });

  try {
    console.log('🔐 连接远端数据库...');
    console.log('📡 更新园长账号密码\n');

    // 哈希密码123456
    const hashedPassword = await bcrypt.hash('123456', 10);

    // 检查园长用户
    const [existingPrincipal] = await connection.execute(
      'SELECT username, role, email FROM users WHERE username = ?',
      ['principal']
    );

    console.log('📊 当前园长用户:');
    if (existingPrincipal.length > 0) {
      existingPrincipal.forEach(u => {
        console.log(`  - ${u.username} (${u.role}) - ${u.email}`);
      });
    } else {
      console.log('  ⚠️  未找到principal用户，将使用admin账号作为园长');
    }

    // 更新principal账号密码
    await connection.execute(
      'UPDATE users SET password = ?, updatedAt = NOW() WHERE username = ?',
      [hashedPassword, 'principal']
    );

    console.log('\n✅ 更新成功: principal / 123456');

    // 同时确保admin账号密码也是123456（园长快速登录使用admin账号）
    await connection.execute(
      'UPDATE users SET password = ?, updatedAt = NOW() WHERE username = ?',
      [hashedPassword, 'admin']
    );

    console.log('✅ 确认更新: admin / 123456');

    // 验证更新
    const [users] = await connection.execute(
      'SELECT username, role, email FROM users WHERE username IN (?, ?)',
      ['admin', 'principal']
    );

    console.log('\n📋 园长相关账号:');
    users.forEach(u => {
      console.log(`  - ${u.username} (${u.role}) - ${u.email}`);
    });

    console.log('\n✅ 园长账号密码更新完成！');
    console.log('\n💡 园长登录方式:');
    console.log('  方式1: 点击"园长"按钮 -> 使用 admin / 123456 登录');
    console.log('  方式2: 手动输入 principal / 123456 登录');

  } catch (error) {
    console.error('❌ 更新失败:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔚 数据库连接已关闭');
  }
}

updatePrincipalUser()
  .then(() => {
    console.log('\n🎉 脚本执行完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });