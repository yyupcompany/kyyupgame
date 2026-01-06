const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  database: process.env.DB_NAME || 'kargerdensales',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'pwk5ls7j',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false
};

const JWT_SECRET = process.env.JWT_SECRET || 'kindergarten-enrollment-secret';

async function testAdminLogin() {
  let sequelize;

  try {
    // 创建数据库连接
    sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        port: dbConfig.port,
        dialect: dbConfig.dialect,
        timezone: dbConfig.timezone,
        logging: console.log,
        define: {
          charset: 'utf8mb4',
          collate: 'utf8mb4_unicode_ci',
          timestamps: true,
          underscored: true,
          freezeTableName: true,
        },
      }
    );

    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 查找admin用户
    const [adminResults] = await sequelize.query(`
      SELECT id, username, email, password, role, real_name, status
      FROM users
      WHERE username = 'admin' AND status = 'active'
    `);

    if (adminResults.length === 0) {
      console.log('❌ 未找到admin用户');
      return;
    }

    const adminUser = adminResults[0];
    console.log('📋 Admin用户信息:');
    console.log({
      id: adminUser.id,
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      realName: adminUser.real_name,
      status: adminUser.status,
      hasPassword: !!adminUser.password
    });

    // 测试密码验证
    const testPasswords = ['123456', 'admin', 'password', 'admin123'];

    console.log('\n🔐 测试密码验证:');
    for (const testPassword of testPasswords) {
      try {
        const isValid = await bcrypt.compare(testPassword, adminUser.password);
        console.log(`- "${testPassword}": ${isValid ? '✅ 有效' : '❌ 无效'}`);

        if (isValid) {
          // 如果密码正确，生成JWT token
          const token = jwt.sign(
            {
              id: adminUser.id,
              username: adminUser.username,
              role: adminUser.role || 'admin',
              isAdmin: adminUser.role === 'admin'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
          );

          console.log('\n🎉 登录成功！生成的Token:');
          console.log(token.substring(0, 50) + '...');

          // 验证token
          const decoded = jwt.verify(token, JWT_SECRET);
          console.log('\n🔑 Token验证成功:');
          console.log({
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            isAdmin: decoded.isAdmin
          });
        }
      } catch (error) {
        console.log(`- "${testPassword}": ❌ 验证出错 - ${error.message}`);
      }
    }

    // 如果所有密码都不正确，我们可以更新admin用户的密码
    console.log('\n🔧 如果所有密码都不正确，可以更新密码:');
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`新密码: "${newPassword}"`);
    console.log(`bcrypt哈希: ${hashedPassword}`);

    // 询问是否要更新密码
    console.log('\n❓ 是否要更新admin用户的密码为 "123456"？');
    console.log('如果需要更新，请手动执行以下SQL:');
    console.log(`UPDATE users SET password = '${hashedPassword}' WHERE username = 'admin';`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    if (sequelize) {
      await sequelize.close();
    }
  }
}

testAdminLogin();