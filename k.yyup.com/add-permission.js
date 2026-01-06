const mysql = require('mysql2/promise');

async function addFunctionToolsPermission() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'Aa123456',
    database: 'kargerdensales'
  });

  try {
    console.log('🚀 开始添加Function Tools权限...');

    // 检查权限是否已存在
    const [existing] = await connection.execute(
      'SELECT * FROM permissions WHERE code = ?',
      ['AI_FUNCTION_TOOLS']
    );

    if (existing.length > 0) {
      console.log('✅ Function Tools权限已存在，无需重复添加');
      return;
    }

    // 添加权限记录
    const [result] = await connection.execute(
      `INSERT INTO permissions (
        name, code, path, component, type, status, sort, icon, description, 
        parent_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'Function Tools',
        'AI_FUNCTION_TOOLS', 
        '/ai-center/function-tools',
        'pages/ai-center/function-tools.vue',
        'menu',
        1,
        100,
        'Tools',
        '智能工具调用系统，支持数据查询、页面导航等多种功能',
        3006  // AI Center的ID
      ]
    );

    console.log('✅ Function Tools权限添加成功:', result);

    // 查询刚添加的权限
    const [newPermission] = await connection.execute(
      'SELECT * FROM permissions WHERE code = ?',
      ['AI_FUNCTION_TOOLS']
    );

    console.log('📋 新添加的权限记录:', newPermission[0]);
    console.log('🎉 Function Tools权限添加完成！');

  } catch (error) {
    console.error('❌ 添加Function Tools权限失败:', error);
  } finally {
    await connection.end();
  }
}

addFunctionToolsPermission();
