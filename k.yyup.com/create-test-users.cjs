/**
 * 创建测试用户（admin, teacher, test_parent）
 * 统一使用密码123456
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function createTestUsers() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'enrollment_db'
  });

  try {
    console.log('🔐 开始创建测试用户...\n');

    // 统一密码123456
    const unifiedPassword = await bcrypt.hash('123456', 10);
    const testUsers = [
      { username: 'admin', email: 'admin@test.com', realName: '系统管理员', role: 'admin' },
      { username: 'teacher', email: 'teacher@test.com', realName: '测试教师', role: 'teacher' },
      { username: 'test_parent', email: 'parent@test.com', realName: '测试家长', role: 'parent' }
    ];

    // 检查用户是否已存在
    const [existingUsers] = await connection.execute(
      'SELECT username, role FROM users WHERE username IN (?, ?, ?)',
      ['admin', 'teacher', 'test_parent']
    );

    console.log(`已存在用户: ${existingUsers.length} 个`);
    if (existingUsers.length > 0) {
      existingUsers.forEach(u => {
        console.log(`  - ${u.username} (${u.role})`);
      });
    }

    // 为每个用户创建或更新
    for (const user of testUsers) {
      const existingUser = existingUsers.find(u => u.username === user.username);

      if (!existingUser) {
        // 创建新用户
        await connection.execute(
          `INSERT INTO users (username, password, email, realName, role, status, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [user.username, unifiedPassword, user.email, user.realName, user.role, 'active']
        );
        console.log(`✅ 创建用户: ${user.username} / 123456`);
      } else {
        // 更新密码
        await connection.execute(
          'UPDATE users SET password = ?, updatedAt = NOW() WHERE username = ?',
          [unifiedPassword, user.username]
        );
        console.log(`✅ 更新用户: ${user.username} / 123456`);
      }
    }

    // 验证创建
    const [users] = await connection.execute(
      'SELECT id, username, role, realName, status FROM users WHERE username IN (?, ?, ?)',
      ['admin', 'teacher', 'test_parent']
    );

    console.log('\n📊 当前测试用户:');
    users.forEach(u => {
      console.log(`  - ID: ${u.id}, 用户名: ${u.username}, 角色: ${u.role}, 姓名: ${u.realName}, 状态: ${u.status}`);
    });

    console.log('\n✅ 测试用户创建/更新完成！');

  } catch (error) {
    console.error('❌ 创建用户失败:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

createTestUsers()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
