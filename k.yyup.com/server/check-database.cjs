const { Sequelize } = require('sequelize');

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

console.log('🔍 检查数据库连接和用户数据');
console.log('数据库配置:', {
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username
});

async function checkDatabase() {
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

    // 测试连接
    console.log('\n📡 正在连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查用户表
    console.log('\n👥 检查用户表...');

    const [results] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status, password IS NOT NULL as has_password
      FROM users
      LIMIT 10
    `);

    console.log('📋 数据库中的用户列表:');
    console.log(JSON.stringify(results, null, 2));

    // 检查admin用户
    console.log('\n🔍 查找admin用户...');
    const [adminResults] = await sequelize.query(`
      SELECT id, username, email, role, real_name, status, password
      FROM users
      WHERE username = 'admin'
    `);

    if (adminResults.length > 0) {
      const admin = adminResults[0];
      console.log('✅ 找到admin用户:');
      console.log({
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        realName: admin.real_name,
        status: admin.status,
        hasPassword: !!admin.password
      });

      // 检查其他快捷登录用户
      console.log('\n🔍 查找其他快捷登录用户...');
      const [quickUsers] = await sequelize.query(`
        SELECT id, username, email, role, real_name, status
        FROM users
        WHERE username IN ('principal', 'teacher', 'test_parent')
        ORDER BY username
      `);

      if (quickUsers.length > 0) {
        console.log('✅ 找到快捷登录用户:');
        console.log(JSON.stringify(quickUsers, null, 2));
      } else {
        console.log('❌ 未找到其他快捷登录用户 (principal, teacher, test_parent)');
      }

    } else {
      console.log('❌ 未找到admin用户');

      // 检查是否存在任何用户
      const [countResults] = await sequelize.query('SELECT COUNT(*) as userCount FROM users');
      console.log(`📊 用户总数: ${countResults[0].userCount}`);
    }

    // 检查表结构
    console.log('\n🏗️ 检查用户表结构...');
    const [structure] = await sequelize.query('DESCRIBE users');
    console.log('用户表结构:');
    console.log(JSON.stringify(structure, null, 2));

  } catch (error) {
    console.error('❌ 数据库检查失败:', error.message);

    if (error.original) {
      console.error('原始错误:', error.original.message);
    }
  } finally {
    if (sequelize) {
      await sequelize.close();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 运行检查
checkDatabase();