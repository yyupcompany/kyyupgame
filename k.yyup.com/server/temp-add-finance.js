
const mysql = require('mysql2/promise');

async function addFinanceCenter() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root', 
      password: 'root123',
      database: 'kindergarten_db'
    });

    console.log('Connected to database');

    // Add finance center category
    await connection.execute(
      'INSERT IGNORE INTO auth_permissions (id, name, type, route, icon, parent_id, sort_order, status, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [96, '财务中心', 'category', '/centers/finance', 'money', 0, 10, 'active', '财务管理中心，包括收费配置、缴费管理、财务报表等功能']
    );
    console.log('Added finance center category');

    // Add sub-pages
    const pages = [
      [97, '财务概览', '/finance/overview', 'dashboard', 1, '财务数据概览和统计'],
      [98, '收费配置', '/finance/fee-config', 'setting', 2, '收费项目和标准配置'],
      [99, '缴费管理', '/finance/payment-management', 'money', 3, '缴费单管理和收款确认'],
      [100, '财务报表', '/finance/financial-reports', 'data-analysis', 4, '财务报表生成和查看'],
      [101, '招生财务联动', '/finance/enrollment-finance-linkage', 'connection', 5, '招生与财务系统的自动化联动']
    ];

    for (const [id, name, route, icon, order, desc] of pages) {
      await connection.execute(
        'INSERT IGNORE INTO auth_permissions (id, name, type, route, icon, parent_id, sort_order, status, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
        [id, name, 'page', route, icon, 96, order, 'active', desc]
      );
    }
    console.log('Added finance sub-pages');

    // Add permissions to admin role (assuming role id = 1)
    const permissionIds = [96, 97, 98, 99, 100, 101];
    for (const permId of permissionIds) {
      await connection.execute(
        'INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
        [1, permId]
      );
    }
    console.log('Added permissions to admin role');

    await connection.end();
    console.log('Finance center setup completed successfully\!');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

addFinanceCenter();

