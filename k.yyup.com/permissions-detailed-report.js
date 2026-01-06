#!/usr/bin/env node

import mysql from 'mysql2/promise';

// 数据库配置
const dbConfig = {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  user: 'root',
  password: 'pwk5ls7j',
  database: 'kargerdensales',
  charset: 'utf8mb4',
};

// 生成详细权限报告
async function generateDetailedReport() {
  let connection = null;
  
  try {
    console.log('🔗 正在连接数据库...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ 数据库连接成功！\n');

    // 查询所有权限的详细信息
    const modules = [
      {
        name: '活动管理模块 (Activities)',
        query: `SELECT id, name, chinese_name, path, status, created_at, updated_at 
                FROM permissions 
                WHERE name LIKE '%activity%' OR name LIKE '%活动%' OR chinese_name LIKE '%活动%'
                ORDER BY status DESC, id ASC`
      },
      {
        name: '招生管理模块 (Enrollment)',
        query: `SELECT id, name, chinese_name, path, status, created_at, updated_at 
                FROM permissions 
                WHERE name LIKE '%enrollment%' OR name LIKE '%招生%' OR chinese_name LIKE '%招生%'
                ORDER BY status DESC, id ASC`
      },
      {
        name: 'AI智能模块 (AI)',
        query: `SELECT id, name, chinese_name, path, status, created_at, updated_at 
                FROM permissions 
                WHERE name LIKE '%ai%' OR name LIKE '%AI%' OR chinese_name LIKE '%智能%' OR chinese_name LIKE '%AI%'
                ORDER BY status DESC, id ASC`
      },
      {
        name: '系统管理模块 (System)',
        query: `SELECT id, name, chinese_name, path, status, created_at, updated_at 
                FROM permissions 
                WHERE name LIKE '%system%' OR name LIKE '%admin%' OR chinese_name LIKE '%系统%' OR chinese_name LIKE '%管理%'
                ORDER BY status DESC, id ASC`
      }
    ];

    for (const module of modules) {
      console.log(`📋 ${module.name}`);
      console.log('='.repeat(60));
      
      const [permissions] = await connection.execute(module.query);
      
      const enabledPerms = permissions.filter(p => p.status === 1);
      const disabledPerms = permissions.filter(p => p.status === 0 || p.status === 'disabled');
      
      console.log(`总权限数: ${permissions.length}`);
      console.log(`启用权限: ${enabledPerms.length} (${((enabledPerms.length / permissions.length) * 100).toFixed(1)}%)`);
      console.log(`禁用权限: ${disabledPerms.length} (${((disabledPerms.length / permissions.length) * 100).toFixed(1)}%)`);
      
      if (enabledPerms.length > 0) {
        console.log('\n✅ 启用的权限:');
        enabledPerms.forEach((perm, index) => {
          console.log(`  ${index + 1}. [ID: ${perm.id}] ${perm.name} - ${perm.chinese_name || '无中文名'}`);
          if (perm.path) {
            console.log(`     路径: ${perm.path}`);
          }
        });
      }
      
      if (disabledPerms.length > 0) {
        console.log('\n❌ 禁用的权限:');
        disabledPerms.forEach((perm, index) => {
          console.log(`  ${index + 1}. [ID: ${perm.id}] ${perm.name} - ${perm.chinese_name || '无中文名'}`);
          if (perm.path) {
            console.log(`     路径: ${perm.path}`);
          }
        });
      }
      
      console.log('\n' + '='.repeat(60) + '\n');
    }

    // 生成整体统计报告
    console.log('📊 整体权限统计报告');
    console.log('='.repeat(60));
    
    const overallStatsQuery = `
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as enabled_permissions,
        SUM(CASE WHEN status = 0 OR status = 'disabled' THEN 1 ELSE 0 END) as disabled_permissions,
        MIN(created_at) as oldest_permission,
        MAX(updated_at) as latest_update
      FROM permissions
    `;
    
    const [overallStats] = await connection.execute(overallStatsQuery);
    const stats = overallStats[0];
    
    console.log(`📈 总权限数: ${stats.total_permissions}`);
    console.log(`✅ 启用权限数: ${stats.enabled_permissions}`);
    console.log(`❌ 禁用权限数: ${stats.disabled_permissions}`);
    console.log(`📊 启用率: ${((stats.enabled_permissions / stats.total_permissions) * 100).toFixed(2)}%`);
    console.log(`📅 最早权限创建: ${stats.oldest_permission}`);
    console.log(`🕒 最新权限更新: ${stats.latest_update}`);

    // 检查角色权限关联
    console.log('\n🔗 角色权限关联检查');
    console.log('='.repeat(60));
    
    const rolePermStatsQuery = `
      SELECT 
        r.name as role_name,
        r.description as role_description,
        COUNT(rp.permission_id) as permission_count,
        COUNT(CASE WHEN p.status = 1 THEN 1 END) as enabled_permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE r.status = 1
      GROUP BY r.id, r.name, r.description
      ORDER BY permission_count DESC
    `;
    
    const [rolePermStats] = await connection.execute(rolePermStatsQuery);
    
    rolePermStats.forEach((role, index) => {
      const effectiveRate = role.permission_count > 0 ? 
        ((role.enabled_permission_count / role.permission_count) * 100).toFixed(1) : '0.0';
      console.log(`${index + 1}. ${role.role_name} (${role.role_description || '无描述'})`);
      console.log(`   权限总数: ${role.permission_count}, 有效权限: ${role.enabled_permission_count} (${effectiveRate}%)`);
    });

  } catch (error) {
    console.error('❌ 数据库操作失败:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 生成权限详细状态报告...');
  console.log('时间:', new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60) + '\n');
  
  try {
    await generateDetailedReport();
    console.log('\n✅ 报告生成完成！');
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

// 运行主函数
main();