const mysql = require('mysql2/promise');

async function addAnalyticsCenterPermission() {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  try {
    console.log('连接到远程数据库...');
    
    // 先检查是否已存在
    const [existing] = await connection.execute(
      'SELECT * FROM permissions WHERE path = ?',
      ['/centers/analytics']
    );
    
    if (existing.length > 0) {
      console.log('分析中心权限已存在:', {
        id: existing[0].id,
        name: existing[0].name,
        path: existing[0].path
      });
    } else {
      console.log('添加分析中心权限...');
      
      // 获取最大的 sort 值
      const [maxSort] = await connection.execute(
        'SELECT MAX(sort) as maxSort FROM permissions WHERE path LIKE "/centers/%"'
      );
      const nextSort = (maxSort[0].maxSort || 0) + 10;
      
      // 插入新权限
      const [result] = await connection.execute(
        `INSERT INTO permissions (name, chinese_name, code, type, path, component, permission, icon, sort, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          'AnalyticsCenter',
          '分析中心',
          'ANALYTICS_CENTER',
          'page',
          '/centers/analytics',
          'pages/centers/AnalyticsCenter.vue',
          'ANALYTICS_CENTER_VIEW',
          'TrendCharts',
          nextSort,
          1
        ]
      );
      
      console.log('✅ 分析中心权限添加成功，ID:', result.insertId);
      
      // 为管理员角色添加权限
      const [adminRole] = await connection.execute(
        'SELECT id FROM roles WHERE name = ? OR name = ?',
        ['admin', '管理员']
      );
      
      if (adminRole.length > 0) {
        const roleId = adminRole[0].id;
        // 检查是否已有角色权限关联
        const [existingRolePerm] = await connection.execute(
          'SELECT * FROM role_permissions WHERE role_id = ? AND permission_id = ?',
          [roleId, result.insertId]
        );
        
        if (existingRolePerm.length === 0) {
          await connection.execute(
            'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
            [roleId, result.insertId]
          );
          console.log('✅ 已为管理员角色添加分析中心权限');
        }
      }
    }
    
    // 验证结果
    const [verify] = await connection.execute(
      'SELECT id, name, chinese_name, path, component, permission FROM permissions WHERE path = ?',
      ['/centers/analytics']
    );
    
    if (verify.length > 0) {
      console.log('\n当前分析中心权限配置:');
      console.log('- ID:', verify[0].id);
      console.log('- 名称:', verify[0].chinese_name || verify[0].name);
      console.log('- 路径:', verify[0].path);
      console.log('- 组件:', verify[0].component);
      console.log('- 权限:', verify[0].permission);
    }
    
  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await connection.end();
    console.log('\n数据库连接已关闭');
  }
}

// 执行
addAnalyticsCenterPermission().catch(console.error);