const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 添加所有中心权限
    const centers = [
      { id: 3002, name: 'Personnel Center', chinese_name: '人事中心', code: 'PERSONNEL_CENTER', path: '/centers/personnel', icon: 'user', sort: 1 },
      { id: 3003, name: 'Activity Center', chinese_name: '活动中心', code: 'ACTIVITY_CENTER', path: '/centers/activity', icon: 'calendar', sort: 2 },
      { id: 3004, name: 'Enrollment Center', chinese_name: '招生中心', code: 'ENROLLMENT_CENTER', path: '/centers/enrollment', icon: 'user-plus', sort: 3 },
      { id: 3005, name: 'Marketing Center', chinese_name: '营销中心', code: 'MARKETING_CENTER', path: '/centers/marketing', icon: 'megaphone', sort: 4 },
      { id: 3006, name: 'AI Center', chinese_name: 'AI中心', code: 'AI_CENTER', path: '/centers/ai', icon: 'robot', sort: 5 },
      { id: 3054, name: 'Customer Pool Center', chinese_name: '客户池中心', code: 'CUSTOMER_POOL_CENTER', path: '/centers/customer-pool', icon: 'users', sort: 6 },
      { id: 3035, name: 'Task Center', chinese_name: '任务中心', code: 'TASK_CENTER_CATEGORY', path: '/centers/task', icon: 'check-square', sort: 7 },
      { id: 2013, name: 'System Center', chinese_name: '系统中心', code: 'SYSTEM_CENTER', path: '/centers/system', icon: 'settings', sort: 8 },
      { id: 3074, name: 'Finance Center', chinese_name: '财务中心', code: 'FINANCE_CENTER', path: '/centers/finance', icon: 'dollar-sign', sort: 9 },
      { id: 3073, name: 'Analytics Center', chinese_name: '分析中心', code: 'ANALYTICS_CENTER', path: '/centers/analytics', icon: 'bar-chart', sort: 10 },
      { id: 4059, name: 'Teaching Center', chinese_name: '教学中心', code: 'TEACHING_CENTER', path: '/centers/teaching', icon: 'book', sort: 11 }
    ];
    
    console.log('📝 添加中心权限记录...\n');
    
    for (const center of centers) {
      await sequelize.query(`
        INSERT INTO permissions (id, name, chinese_name, code, type, parent_id, path, component, file_path, permission, icon, sort, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'menu', NULL, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE chinese_name=VALUES(chinese_name), path=VALUES(path), status=1, updated_at=NOW()
      `, {
        replacements: [
          center.id,
          center.name,
          center.chinese_name,
          center.code,
          center.path,
          center.name.replace(' ', ''),
          `pages/centers/${center.name.replace(' ', '')}.vue`,
          center.code,
          center.icon,
          center.sort
        ]
      });
      console.log(`  ✅ ${center.chinese_name}`);
    }
    
    console.log('\n📝 为Admin角色添加权限...');
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT 1, id, NOW(), NOW() FROM permissions WHERE id IN (3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001)
    `);
    
    console.log('📝 为Principal角色添加权限...');
    await sequelize.query(`
      INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT 2, id, NOW(), NOW() FROM permissions WHERE id IN (3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001)
    `);
    
    console.log('\n✅ 所有权限记录已添加');
    
    // 验证
    const [result] = await sequelize.query(`
      SELECT id, chinese_name, code, status
      FROM permissions
      WHERE id IN (3002, 3003, 3004, 3005, 3006, 3054, 3035, 2013, 3074, 3073, 4059, 5001)
      ORDER BY sort
    `);
    
    console.log(`\n📊 验证结果: 找到 ${result.length} 个中心权限:\n`);
    result.forEach(r => {
      console.log(`  - ${r.chinese_name} (ID: ${r.id})`);
    });
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
})();

