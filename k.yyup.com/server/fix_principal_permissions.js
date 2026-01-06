#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// 加载环境变量
config();

async function fixPrincipalPermissions() {
  let connection;

  try {
    // 数据库连接配置
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false  // 跳过SSL证书验证
      }
    });

    console.log('🔗 数据库连接成功');

    // 1. 查询当前权限情况
    console.log('\n📊 查询当前权限情况...');
    const [currentStatus] = await connection.execute(`
      SELECT
        r1.name as admin_role,
        COUNT(rp1.permission_id) as admin_permissions,
        r2.name as principal_role,
        COUNT(rp2.permission_id) as principal_permissions
      FROM roles r1
      LEFT JOIN role_permissions rp1 ON r1.id = rp1.role_id
      LEFT JOIN roles r2 ON r2.key = 'principal'
      LEFT JOIN role_permissions rp2 ON r2.id = rp2.role_id
      WHERE r1.key = 'admin'
      GROUP BY r1.name, r2.name
    `);

    console.table(currentStatus);

    // 2. 获取admin和principal角色的ID
    const [adminRole] = await connection.execute(
      'SELECT id FROM roles WHERE key = ?',
      ['admin']
    );

    const [principalRole] = await connection.execute(
      'SELECT id FROM roles WHERE key = ?',
      ['principal']
    );

    if (adminRole.length === 0) {
      throw new Error('未找到admin角色');
    }

    if (principalRole.length === 0) {
      throw new Error('未找到principal角色');
    }

    const adminId = adminRole[0].id;
    const principalId = principalRole[0].id;

    console.log(`\n👤 角色ID查询成功: admin=${adminId}, principal=${principalId}`);

    // 3. 删除principal角色的所有现有权限
    console.log('\n🗑️ 删除principal角色的现有权限...');
    const [deleteResult] = await connection.execute(
      'DELETE FROM role_permissions WHERE role_id = ?',
      [principalId]
    );
    console.log(`已删除 ${deleteResult.affectedRows} 条principal权限记录`);

    // 4. 复制admin角色的所有权限给principal角色
    console.log('\n📋 复制admin权限给principal角色...');
    const [adminPermissions] = await connection.execute(
      'SELECT permission_id FROM role_permissions WHERE role_id = ?',
      [adminId]
    );

    if (adminPermissions.length > 0) {
      const insertValues = adminPermissions.map(perm =>
        [principalId, perm.permission_id, new Date(), new Date()]
      );

      const [insertResult] = await connection.execute(
        'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES ?',
        [insertValues]
      );

      console.log(`✅ 已为principal角色添加 ${insertResult.affectedRows} 条权限`);
    }

    // 5. 验证修复结果
    console.log('\n🔍 验证修复结果...');
    const [finalStatus] = await connection.execute(`
      SELECT
        r1.name as admin_role,
        COUNT(rp1.permission_id) as admin_permissions,
        r2.name as principal_role,
        COUNT(rp2.permission_id) as principal_permissions,
        CASE
          WHEN COUNT(rp1.permission_id) = COUNT(rp2.permission_id) THEN '✅ 权限同步成功'
          ELSE '❌ 权限同步失败'
        END as status
      FROM roles r1
      LEFT JOIN role_permissions rp1 ON r1.id = rp1.role_id
      LEFT JOIN roles r2 ON r2.key = 'principal'
      LEFT JOIN role_permissions rp2 ON r2.id = rp2.role_id
      WHERE r1.key = 'admin'
      GROUP BY r1.name, r2.name
    `);

    console.table(finalStatus);

    const status = finalStatus[0]?.status || '未知';
    if (status.includes('成功')) {
      console.log('\n🎉 园长角色权限修复成功！现在园长可以访问与admin相同的所有功能。');
    } else {
      console.log('\n⚠️ 权限修复可能不完整，请检查数据库。');
    }

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行修复
fixPrincipalPermissions();