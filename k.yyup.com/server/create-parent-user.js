/**
 * 创建家长测试用户
 */
const bcrypt = require('bcrypt');

async function createParentUser() {
  const mysql = require('mysql2/promise');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123',
    database: 'enrollment_db'
  });

  try {
    console.log('🔐 创建家长测试用户...');

    // 哈希密码
    const hashedPassword = await bcrypt.hash('parent123', 10);

    // 创建或更新家长用户
    const [result] = await connection.execute(
      `INSERT INTO users (username, password, email, realName, role, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
       ON DUPLICATE KEY UPDATE password = VALUES(password), updatedAt = NOW()`,
      ['parent', hashedPassword, 'parent@test.com', '测试家长', 'parent', 'active']
    );

    console.log('✅ 家长用户创建成功: parent / parent123');

    // 验证创建
    const [users] = await connection.execute(
      'SELECT id, username, role, realName FROM users WHERE username = ?',
      ['parent']
    );

    console.log('✅ 验证用户:', users[0]);

  } catch (error) {
    console.error('❌ 创建家长用户失败:', error);
  } finally {
    await connection.end();
  }
}

createParentUser();
