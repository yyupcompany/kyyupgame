#!/usr/bin/env node

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales'
};

async function configureMarketingPermissions() {
  let connection;
  
  try {
    console.log('🔧 配置营销中心权限...\n');
    
    // 创建数据库连接
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功');
    
    // 1. 检查权限表结构
    console.log('\n1️⃣ 检查权限表结构...');
    
    // 检查permissions表是否存在
    const [permissionTables] = await connection.execute(`
      SHOW TABLES LIKE 'permissions'
    `);
    
    if (permissionTables.length === 0) {
      console.log('📋 创建permissions表...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS permissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL COMMENT '权限名称',
          code VARCHAR(100) NOT NULL UNIQUE COMMENT '权限代码',
          type ENUM('menu', 'button', 'api', 'page') DEFAULT 'page' COMMENT '权限类型',
          path VARCHAR(255) NULL COMMENT '页面路径',
          component VARCHAR(255) NULL COMMENT '组件路径',
          icon VARCHAR(50) NULL COMMENT '图标',
          sort_order INT DEFAULT 0 COMMENT '排序',
          parent_id INT NULL COMMENT '父权限ID',
          description TEXT NULL COMMENT '权限描述',
          status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_code (code),
          INDEX idx_type (type),
          INDEX idx_path (path),
          INDEX idx_parent (parent_id)
        ) COMMENT='权限表'
      `);
      console.log('✅ permissions表创建成功');
    } else {
      console.log('✅ permissions表已存在');
    }
    
    // 检查roles表是否存在
    const [roleTables] = await connection.execute(`
      SHOW TABLES LIKE 'roles'
    `);
    
    if (roleTables.length === 0) {
      console.log('📋 创建roles表...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS roles (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) NOT NULL COMMENT '角色名称',
          code VARCHAR(50) NOT NULL UNIQUE COMMENT '角色代码',
          description TEXT NULL COMMENT '角色描述',
          status TINYINT DEFAULT 1 COMMENT '状态：1启用，0禁用',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_code (code)
        ) COMMENT='角色表'
      `);
      console.log('✅ roles表创建成功');
    } else {
      console.log('✅ roles表已存在');
    }
    
    // 检查role_permissions表是否存在
    const [rolePermTables] = await connection.execute(`
      SHOW TABLES LIKE 'role_permissions'
    `);
    
    if (rolePermTables.length === 0) {
      console.log('📋 创建role_permissions表...');
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          role_id INT NOT NULL COMMENT '角色ID',
          permission_id INT NOT NULL COMMENT '权限ID',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uk_role_permission (role_id, permission_id),
          INDEX idx_role (role_id),
          INDEX idx_permission (permission_id)
        ) COMMENT='角色权限关联表'
      `);
      console.log('✅ role_permissions表创建成功');
    } else {
      console.log('✅ role_permissions表已存在');
    }
    
    // 2. 创建营销中心权限
    console.log('\n2️⃣ 创建营销中心权限...');
    
    const marketingPermissions = [
      {
        name: '营销中心',
        code: 'MARKETING_CENTER',
        type: 'menu',
        path: '/marketing',
        icon: 'marketing',
        description: '营销中心主菜单'
      },
      {
        name: '渠道管理',
        code: 'MARKETING_CHANNELS',
        type: 'page',
        path: '/marketing/channels',
        icon: 'channels',
        description: '营销渠道管理页面'
      },
      {
        name: '老带新管理',
        code: 'MARKETING_REFERRALS',
        type: 'page',
        path: '/marketing/referrals',
        icon: 'referrals',
        description: '老带新推荐管理页面'
      },
      {
        name: '转换统计',
        code: 'MARKETING_CONVERSIONS',
        type: 'page',
        path: '/marketing/conversions',
        icon: 'conversions',
        description: '转换统计分析页面'
      },
      {
        name: '销售漏斗',
        code: 'MARKETING_FUNNEL',
        type: 'page',
        path: '/marketing/funnel',
        icon: 'funnel',
        description: '销售漏斗分析页面'
      },
      {
        name: '仪表板',
        code: 'DASHBOARD',
        type: 'page',
        path: '/dashboard',
        icon: 'dashboard',
        description: '系统仪表板'
      }
    ];
    
    for (const perm of marketingPermissions) {
      await connection.execute(`
        INSERT IGNORE INTO permissions (name, code, type, path, icon, description, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
      `, [perm.name, perm.code, perm.type, perm.path, perm.icon, perm.description]);
      console.log(`✅ 权限创建: ${perm.name} (${perm.code})`);
    }
    
    // 3. 创建admin角色
    console.log('\n3️⃣ 创建admin角色...');
    await connection.execute(`
      INSERT IGNORE INTO roles (name, code, description, status, created_at, updated_at)
      VALUES ('系统管理员', 'admin', '系统管理员角色，拥有所有权限', 1, NOW(), NOW())
    `);
    console.log('✅ admin角色创建成功');
    
    // 4. 为admin角色分配所有权限
    console.log('\n4️⃣ 为admin角色分配权限...');
    
    // 获取admin角色ID
    const [adminRole] = await connection.execute(`
      SELECT id FROM roles WHERE code = 'admin'
    `);
    
    if (adminRole.length === 0) {
      throw new Error('admin角色不存在');
    }
    
    const adminRoleId = adminRole[0].id;
    
    // 获取所有权限ID
    const [allPermissions] = await connection.execute(`
      SELECT id, code FROM permissions WHERE status = 1
    `);
    
    console.log(`📋 为admin角色分配 ${allPermissions.length} 个权限...`);
    
    for (const permission of allPermissions) {
      await connection.execute(`
        INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at)
        VALUES (?, ?, NOW())
      `, [adminRoleId, permission.id]);
      console.log(`  ✅ ${permission.code}`);
    }
    
    // 5. 更新admin用户的角色
    console.log('\n5️⃣ 更新admin用户角色...');
    await connection.execute(`
      UPDATE users 
      SET role = 'admin', updated_at = NOW()
      WHERE username = 'admin'
    `);
    console.log('✅ admin用户角色更新成功');
    
    // 6. 验证权限配置
    console.log('\n6️⃣ 验证权限配置...');
    
    // 检查admin用户信息
    const [adminUser] = await connection.execute(`
      SELECT id, username, role, status FROM users WHERE username = 'admin'
    `);
    
    if (adminUser.length > 0) {
      console.log('👤 Admin用户信息:');
      console.log(`  - ID: ${adminUser[0].id}`);
      console.log(`  - 用户名: ${adminUser[0].username}`);
      console.log(`  - 角色: ${adminUser[0].role}`);
      console.log(`  - 状态: ${adminUser[0].status}`);
    }
    
    // 检查admin角色的权限
    const [rolePermissions] = await connection.execute(`
      SELECT p.name, p.code, p.path 
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'admin' AND p.path LIKE '%marketing%'
      ORDER BY p.name
    `);
    
    console.log(`📋 Admin角色的营销权限 (${rolePermissions.length}个):`);
    rolePermissions.forEach(perm => {
      console.log(`  ✅ ${perm.name} -> ${perm.path}`);
    });
    
    console.log('\n🎉 营销中心权限配置完成！');
    console.log('📋 配置摘要:');
    console.log(`  - 创建了 ${marketingPermissions.length} 个营销权限`);
    console.log(`  - admin角色拥有 ${allPermissions.length} 个权限`);
    console.log(`  - admin用户已关联到admin角色`);
    console.log('\n💡 现在可以使用admin用户登录并访问营销中心了！');
    
  } catch (error) {
    console.error('❌ 配置失败:', error.message);
    if (error.sql) {
      console.error('SQL错误:', error.sql);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  configureMarketingPermissions();
}

module.exports = { configureMarketingPermissions };
