const mysql = require('mysql2/promise');

async function addAnalyticsCenterPermission() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123456',
    database: 'kargerdensales'
  });
  
  try {
    console.log('检查分析中心权限...');
    
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
          800,
          1
        ]
      );
      
      console.log('✅ 分析中心权限添加成功，ID:', result.insertId);
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