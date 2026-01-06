#!/usr/bin/env node

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'Kargerdensales2024',
  database: 'kargerdensales'
};

async function addAIPerformanceMonitorPermission() {
  let connection;

  try {
    console.log('🚀 开始添加AI性能监控权限...');

    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');

    // 检查权限是否已存在
    const [existing] = await connection.execute(
      'SELECT * FROM permissions WHERE code = ?',
      ['ai-performance-monitor']
    );

    if (existing.length > 0) {
      console.log('✅ AI性能监控权限已存在，无需重复添加');
      console.log('现有权限信息:', existing[0]);
      return;
    }

    // 添加AI性能监控权限记录
    const [result] = await connection.execute(
      `INSERT INTO permissions (
        name, chinese_name, code, path, component, type, status, sort, icon, permission, 
        parent_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'AI Performance Monitor',
        'AI性能监控',
        'ai-performance-monitor',
        '/ai/monitoring/AIPerformanceMonitor',
        'pages/ai/monitoring/AIPerformanceMonitor.vue',
        'menu',
        1,
        301,
        'Monitor',
        'AI_PERFORMANCE_MONITOR_ACCESS',
        null  // 暂时不设置父级
      ]
    );

    console.log('✅ AI性能监控权限添加成功，ID:', result.insertId);

    // 获取管理员角色ID
    const [adminRoles] = await connection.execute(
      'SELECT id FROM roles WHERE code = ?',
      ['admin']
    );

    if (adminRoles.length > 0) {
      const adminRoleId = adminRoles[0].id;
      
      // 为管理员角色分配AI性能监控权限
      await connection.execute(
        `INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
         VALUES (?, ?, NOW(), NOW())`,
        [adminRoleId, result.insertId]
      );
      
      console.log('✅ 已为管理员角色分配AI性能监控权限');
    }

    // 查看添加的权限
    const [newPermission] = await connection.execute(
      'SELECT * FROM permissions WHERE id = ?',
      [result.insertId]
    );

    console.log('\n📋 新添加的权限信息:');
    console.table(newPermission);

    console.log('\n🎉 AI性能监控权限添加完成！');

  } catch (error) {
    console.error('❌ 添加权限失败:', error.message);
    console.error('详细错误:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 数据库连接已关闭');
    }
  }
}

// 运行脚本
addAIPerformanceMonitorPermission();
