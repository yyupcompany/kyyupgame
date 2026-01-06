/**
 * 插入话术模板权限数据
 */

const mysql = require('mysql2/promise');

async function insertPermission() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });

  try {
    console.log('✅ 数据库连接成功');

    // 1. 查找呼叫中心的父权限ID
    const [parentRows] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ? LIMIT 1',
      ['CALL_CENTER']
    );

    let parentId = null;
    if (parentRows.length > 0) {
      parentId = parentRows[0].id;
      console.log(`✅ 找到父权限 CALL_CENTER，ID: ${parentId}`);
    } else {
      console.log('⚠️  未找到父权限 CALL_CENTER，将作为顶级权限插入');
    }

    // 2. 检查权限是否已存在
    const [existingRows] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ? LIMIT 1',
      ['SCRIPT_TEMPLATES']
    );

    if (existingRows.length > 0) {
      console.log('⚠️  权限 SCRIPT_TEMPLATES 已存在，跳过插入');
      await connection.end();
      return;
    }

    // 3. 插入话术模板权限
    const [result] = await connection.execute(
      `INSERT INTO permissions (
        code,
        name,
        description,
        type,
        parent_id,
        status,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'SCRIPT_TEMPLATES',
        '话术模板',
        '管理AI呼叫中心的话术模板',
        'menu',
        parentId,
        'active'
      ]
    );

    console.log(`✅ 成功插入权限 SCRIPT_TEMPLATES，ID: ${result.insertId}`);

    // 4. 为admin角色分配权限
    const [adminRoleRows] = await connection.execute(
      'SELECT id FROM roles WHERE code = ? LIMIT 1',
      ['ADMIN']
    );

    if (adminRoleRows.length > 0) {
      const adminRoleId = adminRoleRows[0].id;
      
      // 检查角色权限是否已存在
      const [existingRolePermission] = await connection.execute(
        'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ? LIMIT 1',
        [adminRoleId, result.insertId]
      );

      if (existingRolePermission.length === 0) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [adminRoleId, result.insertId]
        );
        console.log(`✅ 成功为ADMIN角色分配权限 SCRIPT_TEMPLATES`);
      } else {
        console.log('⚠️  ADMIN角色已有该权限，跳过分配');
      }
    } else {
      console.log('⚠️  未找到ADMIN角色');
    }

    // 5. 验证插入结果
    const [verifyRows] = await connection.execute(
      'SELECT * FROM permissions WHERE code = ? LIMIT 1',
      ['SCRIPT_TEMPLATES']
    );

    console.log('\n📊 插入的权限数据:');
    console.log(verifyRows[0]);

    console.log('\n✅ 所有操作完成！');

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await connection.end();
    console.log('✅ 数据库连接已关闭');
  }
}

insertPermission();

