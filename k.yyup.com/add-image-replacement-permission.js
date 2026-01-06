// 添加AI自动配图管理权限到数据库
import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'kargerdensales',
  database: 'kargerdensales'
};

async function addImageReplacementPermission() {
  let connection;
  
  try {
    console.log('🔗 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查是否已存在AI自动配图管理权限
    console.log('🔍 检查现有权限...');
    const [existingPermissions] = await connection.execute(
      'SELECT * FROM permissions WHERE path = ? OR code = ?',
      ['/admin/image-replacement', 'IMAGE_REPLACEMENT_MANAGER']
    );

    if (existingPermissions.length > 0) {
      console.log('⚠️ AI自动配图管理权限已存在');
      console.log('现有权限:', existingPermissions);
      return;
    }

    // 查找AI中心的父级ID
    console.log('🔍 查找AI中心父级权限...');
    const [aiCenterResults] = await connection.execute(
      'SELECT id FROM permissions WHERE name LIKE "%AI%" AND type = "menu" AND parent_id IS NULL ORDER BY id DESC LIMIT 1'
    );

    let parentId = null;
    if (aiCenterResults.length > 0) {
      parentId = aiCenterResults[0].id;
      console.log('✅ 找到AI中心父级ID:', parentId);
    } else {
      console.log('⚠️ 未找到AI中心父级，将作为顶级菜单');
    }

    // 获取当前最大排序值
    console.log('🔍 获取当前最大排序值...');
    const [maxSortResults] = await connection.execute(
      'SELECT MAX(sort) as max_sort FROM permissions'
    );
    
    const currentSort = (maxSortResults[0].max_sort || 0) + 10;
    console.log('📊 新权限排序值:', currentSort);

    // 添加AI自动配图管理权限
    console.log('➕ 添加AI自动配图管理权限...');
    const [insertResult] = await connection.execute(`
      INSERT INTO permissions (
        name, chinese_name, code, type, parent_id, path, component, file_path,
        permission, icon, sort, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      'AI自动配图管理',
      'AI自动配图管理',
      'IMAGE_REPLACEMENT_MANAGER',
      'menu',
      parentId,
      '/admin/image-replacement',
      'pages/admin/ImageReplacementManager.vue',
      'pages/admin/ImageReplacementManager.vue',
      'IMAGE_REPLACEMENT_MANAGE',
      'Picture',
      currentSort,
      1
    ]);

    console.log('✅ AI自动配图管理权限添加成功');
    console.log('插入ID:', insertResult.insertId);

    // 为admin角色分配权限
    console.log('🔐 为admin角色分配权限...');
    const [adminRoleResults] = await connection.execute(
      'SELECT id FROM roles WHERE name = "admin" OR code = "admin" LIMIT 1'
    );

    if (adminRoleResults.length > 0) {
      const adminRoleId = adminRoleResults[0].id;
      console.log('✅ 找到admin角色ID:', adminRoleId);

      // 检查是否已分配权限
      const [existingRolePermissions] = await connection.execute(
        'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [adminRoleId, insertResult.insertId]
      );

      if (existingRolePermissions.length === 0) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [adminRoleId, insertResult.insertId]
        );
        console.log('✅ admin角色权限分配成功');
      } else {
        console.log('⚠️ admin角色权限已存在');
      }
    } else {
      console.log('⚠️ 未找到admin角色');
    }

    console.log('🎉 AI自动配图管理权限配置完成！');

  } catch (error) {
    console.error('❌ 添加权限失败:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 执行添加权限
addImageReplacementPermission();
