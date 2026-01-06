/**
 * 修复教师用户的role字段
 * 将test_teacher用户的role更新为'teacher'
 */

const { Sequelize, QueryTypes } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: process.env.DB_PORT || 43906,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sealos@2024',
  database: process.env.DB_NAME || 'kargerdensales',
  dialect: 'mysql',
  logging: console.log
});

async function main() {
  try {
    console.log('🔧 开始修复教师用户role字段...\n');

    // 1. 查看当前test_teacher的用户信息
    console.log('步骤1: 查看test_teacher当前信息...');
    const users = await sequelize.query(
      `SELECT id, username, role, realName, email FROM users WHERE username = 'test_teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (!users || users.length === 0) {
      console.log('❌ 没有找到test_teacher用户');
      process.exit(1);
    }

    const currentUser = users[0];
    console.log(`✅ 找到test_teacher用户:`);
    console.log(`   - ID: ${currentUser.id}`);
    console.log(`   - 用户名: ${currentUser.username}`);
    console.log(`   - 当前角色: ${currentUser.role}`);
    console.log(`   - 真实姓名: ${currentUser.realName}`);
    console.log(`   - 邮箱: ${currentUser.email}\n`);

    // 2. 更新role字段
    console.log('步骤2: 更新role字段为teacher...');
    const updateResult = await sequelize.query(
      `UPDATE users SET role = 'teacher' WHERE username = 'test_teacher'`,
      { type: QueryTypes.UPDATE }
    );

    console.log(`✅ 更新完成，影响行数: ${updateResult[1]}\n`);

    // 3. 验证更新结果
    console.log('步骤3: 验证更新结果...');
    const updatedUsers = await sequelize.query(
      `SELECT id, username, role, realName FROM users WHERE username = 'test_teacher' LIMIT 1`,
      { type: QueryTypes.SELECT }
    );

    if (updatedUsers && updatedUsers.length > 0) {
      const updatedUser = updatedUsers[0];
      console.log(`✅ 验证成功！用户角色已更新:`);
      console.log(`   - ID: ${updatedUser.id}`);
      console.log(`   - 用户名: ${updatedUser.username}`);
      console.log(`   - 新角色: ${updatedUser.role}`);
      console.log(`   - 真实姓名: ${updatedUser.realName}\n`);
    }

    // 4. 检查其他可能的测试用户
    console.log('步骤4: 检查其他可能需要修复的测试用户...');
    const otherUsers = await sequelize.query(
      `SELECT username, role FROM users WHERE username LIKE '%_test' OR username LIKE 'test_%' OR username IN ('test_parent', 'test_admin', 'test_principal')`,
      { type: QueryTypes.SELECT }
    );

    if (otherUsers && otherUsers.length > 0) {
      console.log('📋 发现其他测试用户:');
      otherUsers.forEach(user => {
        console.log(`   - ${user.username}: ${user.role || 'NULL'}`);
      });

      // 自动修复其他测试用户的角色
      const fixes = [
        { username: 'test_parent', role: 'parent' },
        { username: 'test_admin', role: 'admin' },
        { username: 'test_principal', role: 'principal' }
      ];

      console.log('\n步骤5: 自动修复其他测试用户...');
      for (const fix of fixes) {
        const userExists = otherUsers.find(u => u.username === fix.username);
        if (userExists) {
          await sequelize.query(
            `UPDATE users SET role = '${fix.role}' WHERE username = '${fix.username}'`,
            { type: QueryTypes.UPDATE }
          );
          console.log(`✅ 已修复 ${fix.username} -> ${fix.role}`);
        }
      }
    }

    console.log('\n🎉 教师用户role字段修复完成！');
    console.log('现在test_teacher用户应该可以正常登录并显示教师侧边栏了');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();