/**
 * 更新远端数据库测试用户密码
 * 只更新现有用户，不新建
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function updateTestUsers() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales',
    ssl: false // 禁用SSL
  });

  try {
    console.log('🔐 连接远端数据库...');
    console.log('📡 Host: dbconn.sealoshzh.site:43906');
    console.log('🗄️  Database: kargerdensales\n');

    // 哈希密码123456
    const unifiedPassword = await bcrypt.hash('123456', 10);

    // 检查现有用户
    const [existingUsers] = await connection.execute(
      'SELECT username, role, email, realName FROM users WHERE username IN (?, ?, ?, ?)',
      ['admin', 'teacher', 'parent', 'principal']
    );

    console.log(`📊 找到 ${existingUsers.length} 个现有用户:`);
    if (existingUsers.length > 0) {
      existingUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.role}) - ${u.realName}`);
      });
    } else {
      console.log('  ⚠️  未找到任何测试用户');
    }

    // 更新密码
    const updateQueries = [
      { username: 'admin', role: '管理员' },
      { username: 'teacher', role: '教师' },
      { username: 'parent', role: '家长' }
    ];

    console.log('\n🔄 开始更新密码...');
    for (const user of updateQueries) {
      try {
        // 检查用户是否存在
        const [checkResult] = await connection.execute(
          'SELECT username FROM users WHERE username = ?',
          [user.username]
        );

        if (checkResult.length === 0) {
          console.log(`⚠️  用户 ${user.username} 不存在，跳过`);
          continue;
        }

        // 更新密码
        await connection.execute(
          'UPDATE users SET password = ?, updatedAt = NOW() WHERE username = ?',
          [unifiedPassword, user.username]
        );

        console.log(`✅ 更新成功: ${user.username} (${user.role}) -> 密码: 123456`);
      } catch (error) {
        console.log(`❌ 更新失败: ${user.username} - ${error.message}`);
      }
    }

    // 验证更新
    console.log('\n🔍 验证更新结果...');
    const [updatedUsers] = await connection.execute(
      'SELECT username, role, email, realName FROM users WHERE username IN (?, ?, ?, ?)',
      ['admin', 'teacher', 'parent', 'principal']
    );

    console.log('\n📋 最终用户列表:');
    updatedUsers.forEach(u => {
      console.log(`  - ${u.username} (${u.role}) - ${u.realName} - ${u.email}`);
    });

    console.log('\n✅ 测试用户密码更新完成！');
    console.log('\n💡 测试账号信息:');
    console.log('  admin / 123456');
    console.log('  teacher / 123456');
    console.log('  parent / 123456');

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    throw error;
  } finally {
    await connection.end();
    console.log('🔚 数据库连接已关闭');
  }
}

// 执行更新
updateTestUsers()
  .then(() => {
    console.log('\n🎉 脚本执行完成！');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });