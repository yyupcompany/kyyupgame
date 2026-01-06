#!/usr/bin/env node

const { Sequelize } = require('sequelize');
const config = require('./config/config.js');

const sequelize = new Sequelize(config.development);

async function testUserRoleAccess() {
  try {
    console.log('=== 🔍 测试用户角色访问权限 ===\n');

    // 1. 查询所有有角色的用户
    const [usersWithRoles] = await sequelize.query(`
      SELECT DISTINCT
        u.id,
        u.username,
        u.email,
        r.name as role_name,
        r.code as role_code
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE u.status = 1
      ORDER BY r.code, u.username
    `);

    console.log('📋 有角色分配的用户:');
    usersWithRoles.forEach(user => {
      console.log(`  👤 ${user.username} (${user.email}) - ${user.role_name} (${user.role_code})`);
    });

    // 2. 查询每个角色的菜单权限
    const roles = ['admin', 'principal', 'teacher', 'parent'];

    for (const roleCode of roles) {
      console.log(`\n🎯 ${roleCode.toUpperCase()} 角色菜单权限:`);

      const [roleMenuPermissions] = await sequelize.query(`
        SELECT DISTINCT
          p.name,
          p.code,
          p.path,
          p.parent_id,
          p.sort
        FROM roles r
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE r.code = :roleCode AND p.type = 'menu' AND p.status = 1
        ORDER BY p.sort
      `, {
        replacements: { roleCode }
      });

      if (roleMenuPermissions.length === 0) {
        console.log(`  ❌ ${roleCode} 角色没有任何菜单权限`);
      } else {
        roleMenuPermissions.forEach(perm => {
          const indent = perm.parent_id ? '    └──' : '  └──';
          console.log(`${indent} ${perm.name} (${perm.code}) - ${perm.path || '无路径'}`);
        });
      }
    }

    // 3. 检查快捷登录用户
    console.log('\n🔑 快捷登录测试用户:');
    const quickLoginUsers = [
      { username: 'admin', email: 'admin@test.com' },
      { username: 'test_parent', email: 'ik8220@gmail.com' }
    ];

    for (const testUser of quickLoginUsers) {
      const [userInfo] = await sequelize.query(`
        SELECT u.username, u.email, r.name as role_name, r.code as role_code
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.username = :username AND u.status = 1
      `, {
        replacements: { username: testUser.username }
      });

      if (userInfo.length > 0) {
        const user = userInfo[0];
        console.log(`  👤 ${user.username} (${user.email})`);
        console.log(`     角色: ${user.role_name || '未分配'} (${user.role_code || '无'})`);

        if (user.role_code) {
          const [userPermissions] = await sequelize.query(`
            SELECT COUNT(*) as permission_count
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = (SELECT id FROM roles WHERE code = :roleCode)
            AND p.type = 'menu' AND p.status = 1
          `, {
            replacements: { roleCode: user.role_code }
          });

          console.log(`     菜单权限数量: ${userPermissions[0].permission_count}`);
        }
      } else {
        console.log(`  ❌ 用户 ${testUser.username} 不存在或已禁用`);
      }
    }

    // 4. 检查是否需要创建teacher角色的测试用户
    console.log('\n🏫 检查教师角色用户:');
    const [teacherUsers] = await sequelize.query(`
      SELECT u.username, u.email
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      JOIN roles r ON ur.role_id = r.id
      WHERE r.code = 'teacher' AND u.status = 1
    `);

    if (teacherUsers.length === 0) {
      console.log('  ⚠️  没有找到分配了teacher角色的用户');
      console.log('  💡 建议创建一个teacher角色的测试用户');
    } else {
      teacherUsers.forEach(user => {
        console.log(`  👤 ${user.username} (${user.email})`);
      });
    }

    await sequelize.close();

    console.log('\n✅ 测试完成');
    console.log('\n🎯 建议解决方案:');
    console.log('1. 为teacher角色创建测试用户并分配正确权限');
    console.log('2. 确保teacher和parent角色有适当的菜单权限');
    console.log('3. 验证前端路径匹配逻辑');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  }
}

// 运行测试
testUserRoleAccess();