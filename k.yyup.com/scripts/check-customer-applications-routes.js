/**
 * 检查 customer-applications 路由是否在数据库中正确注册
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
  port: parseInt(process.env.DB_PORT || '43906'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'yyup2024',
  database: process.env.DB_NAME || 'kargerdensales',
  charset: 'utf8mb4'
};

async function checkRoutes() {
  let connection;
  
  try {
    console.log('🔌 连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功\n');

    // 1. 检查 permissions 表中是否有 customer-applications 相关的路由
    console.log('================================================================================');
    console.log('📋 检查 permissions 表中的 customer-applications 路由');
    console.log('================================================================================\n');

    const [permissions] = await connection.execute(
      `SELECT id, name, chinese_name, code, type, path, component, permission, status
       FROM permissions
       WHERE code LIKE '%customer-application%' OR path LIKE '%customer-application%'
       ORDER BY id`
    );

    if (permissions.length === 0) {
      console.log('❌ 未找到任何 customer-applications 相关的权限记录');
    } else {
      console.log(`✅ 找到 ${permissions.length} 条 customer-applications 相关的权限记录:\n`);
      permissions.forEach((perm, index) => {
        console.log(`${index + 1}. ID: ${perm.id}`);
        console.log(`   名称: ${perm.name} (${perm.chinese_name || 'N/A'})`);
        console.log(`   代码: ${perm.code}`);
        console.log(`   类型: ${perm.type}`);
        console.log(`   路径: ${perm.path || 'N/A'}`);
        console.log(`   组件: ${perm.component || 'N/A'}`);
        console.log(`   权限: ${perm.permission || 'N/A'}`);
        console.log(`   状态: ${perm.status === 1 ? '✅ 激活' : '❌ 禁用'}`);
        console.log('');
      });
    }

    // 2. 检查是否有 /api/customer-applications/stats 路由
    console.log('================================================================================');
    console.log('📋 检查 /api/customer-applications/stats 路由');
    console.log('================================================================================\n');

    const [statsRoute] = await connection.execute(
      `SELECT id, name, chinese_name, code, type, path, component, permission, status
       FROM permissions
       WHERE path = '/api/customer-applications/stats' OR code = 'customer-applications:stats'
       ORDER BY id`
    );

    if (statsRoute.length === 0) {
      console.log('❌ 未找到 /api/customer-applications/stats 路由');
      console.log('💡 这可能是导致404错误的原因\n');
    } else {
      console.log(`✅ 找到 /api/customer-applications/stats 路由:\n`);
      statsRoute.forEach((route) => {
        console.log(`   ID: ${route.id}`);
        console.log(`   名称: ${route.name} (${route.chinese_name || 'N/A'})`);
        console.log(`   代码: ${route.code}`);
        console.log(`   类型: ${route.type}`);
        console.log(`   路径: ${route.path || 'N/A'}`);
        console.log(`   状态: ${route.status === 1 ? '✅ 激活' : '❌ 禁用'}`);
        console.log('');
      });
    }

    // 3. 检查 principal 角色是否有 customer-applications 权限
    console.log('================================================================================');
    console.log('📋 检查 principal 角色的 customer-applications 权限');
    console.log('================================================================================\n');

    const [principalPerms] = await connection.execute(
      `SELECT p.id, p.name, p.chinese_name, p.code, p.type, p.path
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN roles r ON rp.role_id = r.id
       WHERE r.code = 'principal' 
         AND (p.code LIKE '%customer-application%' OR p.path LIKE '%customer-application%')
         AND p.status = 1
       ORDER BY p.id`
    );

    if (principalPerms.length === 0) {
      console.log('❌ principal 角色没有任何 customer-applications 权限');
    } else {
      console.log(`✅ principal 角色有 ${principalPerms.length} 个 customer-applications 权限:\n`);
      principalPerms.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.name} (${perm.code})`);
        console.log(`   路径: ${perm.path || 'N/A'}`);
        console.log(`   类型: ${perm.type}`);
        console.log('');
      });
    }

    // 4. 检查所有 API 类型的权限
    console.log('================================================================================');
    console.log('📋 检查所有 API 类型的权限 (type = "api")');
    console.log('================================================================================\n');

    const [apiPerms] = await connection.execute(
      `SELECT id, name, chinese_name, code, type, path, status
       FROM permissions
       WHERE type = 'api' AND (code LIKE '%customer%' OR path LIKE '%customer%')
       ORDER BY id
       LIMIT 20`
    );

    if (apiPerms.length === 0) {
      console.log('❌ 未找到任何 API 类型的 customer 相关权限');
    } else {
      console.log(`✅ 找到 ${apiPerms.length} 个 API 类型的 customer 相关权限:\n`);
      apiPerms.forEach((perm, index) => {
        console.log(`${index + 1}. ${perm.name} (${perm.code})`);
        console.log(`   路径: ${perm.path || 'N/A'}`);
        console.log(`   状态: ${perm.status === 1 ? '✅ 激活' : '❌ 禁用'}`);
        console.log('');
      });
    }

    console.log('================================================================================');
    console.log('✅ 检查完成');
    console.log('================================================================================');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行脚本
checkRoutes();

