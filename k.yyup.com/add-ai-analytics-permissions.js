import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
});

console.log('开始添加AI分析子页面权限...');

// 查询现有的AI分析权限
console.log('查询现有的AI分析权限...');
const [existingRows] = await connection.execute(`
  SELECT * FROM permissions 
  WHERE code LIKE '%analytics%' OR path LIKE '%analytics%' 
  ORDER BY sort
`);

console.log('现有AI分析权限:');
existingRows.forEach(row => {
  console.log(`- ID: ${row.id}, 名称: ${row.name}, 代码: ${row.code}, 路径: ${row.path}, 组件: ${row.component}`);
});

// 要添加的AI分析子页面权限
const analyticsPermissions = [
  {
    name: '实时分析',
    code: 'ai:analytics:real-time',
    path: '/ai/analytics/real-time-analytics',
    component: 'pages/ai/analytics/real-time-analytics.vue',
    type: 'page',
    parent_code: 'ai:analytics',
    sort: 301,
    icon: 'chart-line',
    description: 'AI实时数据分析功能'
  },
  {
    name: '预测分析', 
    code: 'ai:analytics:predictive',
    path: '/ai/analytics/predictive-analytics',
    component: 'pages/ai/analytics/predictive-analytics.vue',
    type: 'page',
    parent_code: 'ai:analytics',
    sort: 302,
    icon: 'crystal-ball',
    description: 'AI预测分析功能'
  },
  {
    name: '高级分析',
    code: 'ai:analytics:advanced', 
    path: '/ai/analytics/AdvancedAnalytics',
    component: 'pages/ai/analytics/AdvancedAnalytics.vue',
    type: 'page',
    parent_code: 'ai:analytics',
    sort: 303,
    icon: 'brain',
    description: 'AI高级分析功能'
  },
  {
    name: '学生分析',
    code: 'student:analytics',
    path: '/student/analytics/StudentAnalytics', 
    component: 'pages/student/analytics/StudentAnalytics.vue',
    type: 'page',
    parent_code: 'ai:analytics',
    sort: 304,
    icon: 'user-graduate',
    description: '学生数据分析功能'
  },
  {
    name: '客户分析',
    code: 'customer:analytics',
    path: '/customer/analytics/CustomerAnalytics',
    component: 'pages/customer/analytics/CustomerAnalytics.vue', 
    type: 'page',
    parent_code: 'ai:analytics',
    sort: 305,
    icon: 'users',
    description: '客户数据分析功能'
  },
  {
    name: '报表构建器',
    code: 'analytics:report-builder',
    path: '/analytics/ReportBuilder',
    component: 'pages/analytics/ReportBuilder.vue',
    type: 'page', 
    parent_code: 'ai:analytics',
    sort: 306,
    icon: 'chart-bar',
    description: '自定义报表构建器'
  }
];

// 查找AI分析父权限ID
const [parentRows] = await connection.execute(`
  SELECT id FROM permissions WHERE code = 'ai:analytics'
`);

let parentId = null;
if (parentRows.length > 0) {
  parentId = parentRows[0].id;
  console.log(`找到AI分析父权限ID: ${parentId}`);
} else {
  console.log('未找到AI分析父权限，将创建...');
  
  // 创建AI分析父权限
  const [result] = await connection.execute(`
    INSERT INTO permissions (name, code, path, component, type, parent_id, sort, icon, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `, ['AI分析', 'ai:analytics', '/ai/analytics', 'pages/ai/analytics/index.vue', 'page', null, 300, 'chart-line', 'AI数据分析功能']);
  
  parentId = result.insertId;
  console.log(`创建AI分析父权限，ID: ${parentId}`);
}

// 添加子权限
console.log('开始添加AI分析子权限...');
for (const permission of analyticsPermissions) {
  try {
    // 检查权限是否已存在
    const [existingPermission] = await connection.execute(
      'SELECT id FROM permissions WHERE code = ?',
      [permission.code]
    );
    
    if (existingPermission.length > 0) {
      console.log(`权限已存在，跳过: ${permission.code}`);
      continue;
    }
    
    const [result] = await connection.execute(`
      INSERT INTO permissions (name, code, path, component, type, parent_id, sort, icon, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      permission.name,
      permission.code, 
      permission.path,
      permission.component,
      permission.type,
      parentId,
      permission.sort,
      permission.icon,
      permission.description
    ]);
    
    console.log(`✅ 成功添加权限: ${permission.name} (ID: ${result.insertId})`);
  } catch (error) {
    console.error(`❌ 添加权限失败: ${permission.name}`, error.message);
  }
}

// 为管理员角色添加这些权限
console.log('为管理员角色添加新权限...');
const [adminRole] = await connection.execute(`
  SELECT id FROM roles WHERE code = 'admin' OR name = '管理员' LIMIT 1
`);

if (adminRole.length > 0) {
  const adminRoleId = adminRole[0].id;
  console.log(`找到管理员角色ID: ${adminRoleId}`);
  
  // 获取所有新添加的权限ID
  const [newPermissions] = await connection.execute(`
    SELECT id, code FROM permissions 
    WHERE code IN (${analyticsPermissions.map(() => '?').join(',')})
  `, analyticsPermissions.map(p => p.code));
  
  for (const perm of newPermissions) {
    try {
      // 检查角色权限关联是否已存在
      const [existingRolePerm] = await connection.execute(
        'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [adminRoleId, perm.id]
      );
      
      if (existingRolePerm.length === 0) {
        await connection.execute(
          'INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (?, ?, NOW(), NOW())',
          [adminRoleId, perm.id]
        );
        console.log(`✅ 为管理员角色添加权限: ${perm.code}`);
      } else {
        console.log(`权限关联已存在: ${perm.code}`);
      }
    } catch (error) {
      console.error(`❌ 添加角色权限失败: ${perm.code}`, error.message);
    }
  }
} else {
  console.log('未找到管理员角色');
}

await connection.end();
console.log('AI分析子页面权限添加完成！');