#!/usr/bin/env ts-node
import { sequelize } from '../src/init';
import { QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';

async function addAIQueryPermissions() {
  try {
    console.log('🚀 开始添加AI查询系统权限...');

    // 1. 插入系统管理菜单 (如果不存在)
    const systemMenuExists = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'system' LIMIT 1
    `, { type: QueryTypes.SELECT });

    let systemParentId;
    if (systemMenuExists.length === 0) {
      console.log('📁 创建系统管理菜单...');
      const [result] = await sequelize.query(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at
        ) VALUES (
          'System Management', '系统管理', 'system', 'menu', NULL, '/system', NULL, NULL, 'Setting', 900, 1, NOW(), NOW()
        )
      `, { type: QueryTypes.INSERT });
      systemParentId = (result as any).insertId;
    } else {
      systemParentId = (systemMenuExists[0] as any).id;
      console.log('📁 系统管理菜单已存在，ID:', systemParentId);
    }

    // 2. 插入AI查询助手主菜单
    const aiQueryMenuExists = await sequelize.query(`
      SELECT id FROM permissions WHERE code = 'ai-query' LIMIT 1
    `, { type: QueryTypes.SELECT });

    let aiQueryParentId;
    if (aiQueryMenuExists.length === 0) {
      console.log('🤖 创建AI查询助手菜单...');
      const [result] = await sequelize.query(`
        INSERT INTO permissions (
          name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at
        ) VALUES (
          'AI Query Assistant', 'AI查询助手', 'ai-query', 'menu', ?, '/ai-query', 'pages/ai/AIQueryInterface', 'ai:query', 'DataAnalysis', 910, 1, NOW(), NOW()
        )
      `, { 
        type: QueryTypes.INSERT,
        replacements: [systemParentId]
      });
      aiQueryParentId = (result as any).insertId;
    } else {
      aiQueryParentId = (aiQueryMenuExists[0] as any).id;
      console.log('🤖 AI查询助手菜单已存在，ID:', aiQueryParentId);
    }

    // 3. 插入AI查询功能权限
    const aiQueryPermissions = [
      // 基础查询功能
      ['AI Query Execute', 'AI查询执行', 'ai-query-execute', 'button', '/ai-query/execute', null, 'ai:query:execute', null, 911],
      ['AI Query History', 'AI查询历史', 'ai-query-history', 'button', '/ai-query/history', null, 'ai:query:history', null, 912],
      ['AI Query Templates', 'AI查询模板', 'ai-query-templates', 'button', '/ai-query/templates', null, 'ai:query:templates', null, 913],
      ['AI Query Examples', 'AI查询示例', 'ai-query-examples', 'button', '/ai-query/examples', null, 'ai:query:examples', null, 914],
      
      // 管理功能
      ['AI Query Feedback', 'AI查询反馈', 'ai-query-feedback', 'button', '/ai-query/feedback', null, 'ai:query:feedback', null, 915],
      ['AI Query Export', 'AI查询导出', 'ai-query-export', 'button', '/ai-query/export', null, 'ai:query:export', null, 916],
      ['AI Query Statistics', 'AI查询统计', 'ai-query-statistics', 'button', '/ai-query/statistics', null, 'ai:query:statistics', null, 917],
      
      // 高级管理功能
      ['AI Query Cache Management', 'AI查询缓存管理', 'ai-query-cache', 'button', '/ai-query/cache', null, 'ai:query:cache:manage', null, 918],
      ['AI Query Database Schema', 'AI查询数据库结构', 'ai-query-schema', 'button', '/ai-query/schema', null, 'ai:query:schema', null, 919],
      ['AI Query SQL Validation', 'AI查询SQL验证', 'ai-query-validate', 'button', '/ai-query/validate', null, 'ai:query:validate', null, 920]
    ];

    console.log('⚙️ 添加AI查询功能权限...');
    for (const permission of aiQueryPermissions) {
      const [name, chineseName, code, type, path, component, permissionKey, icon, sort] = permission;
      
      // 检查权限是否已存在
      const exists = await sequelize.query(`
        SELECT id FROM permissions WHERE code = ? LIMIT 1
      `, { 
        type: QueryTypes.SELECT,
        replacements: [code]
      });

      if (exists.length === 0) {
        await sequelize.query(`
          INSERT INTO permissions (
            name, chinese_name, code, type, parent_id, path, component, permission, icon, sort, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())
        `, {
          type: QueryTypes.INSERT,
          replacements: [name, chineseName, code, type, aiQueryParentId, path, component || null, permissionKey, icon || null, sort]
        });
        console.log(`  ✓ 添加权限: ${chineseName}`);
      } else {
        console.log(`  - 权限已存在: ${chineseName}`);
      }
    }

    // 4. 获取角色ID
    const roles = await sequelize.query(`
      SELECT id, code, name FROM roles WHERE code IN ('admin', 'principal', 'teacher', 'parent')
    `, { type: QueryTypes.SELECT }) as any[];

    const roleMap = new Map();
    roles.forEach(role => {
      roleMap.set(role.code, role.id);
    });

    console.log('👥 找到角色:', roles.map(r => r.name).join(', '));

    // 5. 分配权限给不同角色
    console.log('🔐 分配权限给角色...');

    // 获取所有AI查询权限
    const allAIPermissions = await sequelize.query(`
      SELECT id, code FROM permissions WHERE code LIKE 'ai-query%'
    `, { type: QueryTypes.SELECT }) as any[];

    // 管理员: 所有权限
    if (roleMap.has('admin')) {
      const adminRoleId = roleMap.get('admin');
      for (const permission of allAIPermissions) {
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          type: QueryTypes.INSERT,
          replacements: [adminRoleId, permission.id]
        });
      }
      console.log(`  ✓ 管理员: ${allAIPermissions.length}个权限`);
    }

    // 园长: 基础权限 + 统计权限
    if (roleMap.has('principal')) {
      const principalRoleId = roleMap.get('principal');
      const principalPermissions = allAIPermissions.filter(p => 
        !p.code.includes('cache') && !p.code.includes('validate')
      );
      for (const permission of principalPermissions) {
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          type: QueryTypes.INSERT,
          replacements: [principalRoleId, permission.id]
        });
      }
      console.log(`  ✓ 园长: ${principalPermissions.length}个权限`);
    }

    // 教师: 基础查询权限
    if (roleMap.has('teacher')) {
      const teacherRoleId = roleMap.get('teacher');
      const teacherPermissions = allAIPermissions.filter(p => 
        ['ai-query', 'ai-query-execute', 'ai-query-history', 'ai-query-templates', 'ai-query-examples', 'ai-query-feedback'].includes(p.code)
      );
      for (const permission of teacherPermissions) {
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          type: QueryTypes.INSERT,
          replacements: [teacherRoleId, permission.id]
        });
      }
      console.log(`  ✓ 教师: ${teacherPermissions.length}个权限`);
    }

    // 家长: 基础查看权限
    if (roleMap.has('parent')) {
      const parentRoleId = roleMap.get('parent');
      const parentPermissions = allAIPermissions.filter(p => 
        ['ai-query', 'ai-query-execute', 'ai-query-history', 'ai-query-examples'].includes(p.code)
      );
      for (const permission of parentPermissions) {
        await sequelize.query(`
          INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          type: QueryTypes.INSERT,
          replacements: [parentRoleId, permission.id]
        });
      }
      console.log(`  ✓ 家长: ${parentPermissions.length}个权限`);
    }

    // 6. 验证权限分配结果
    console.log('\n📊 权限分配汇总:');
    const summary = await sequelize.query(`
      SELECT 
        r.name as role_name,
        COUNT(rp.permission_id) as ai_permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE p.code LIKE 'ai-query%'
      GROUP BY r.id, r.name
      ORDER BY ai_permission_count DESC
    `, { type: QueryTypes.SELECT }) as any[];

    summary.forEach(s => {
      console.log(`  ${s.role_name}: ${s.ai_permission_count}个AI查询权限`);
    });

    console.log('\n✅ AI查询系统权限配置完成!');

    // 7. 显示已添加的权限
    console.log('\n📋 已添加的AI查询权限:');
    const addedPermissions = await sequelize.query(`
      SELECT id, chinese_name, code, path, permission
      FROM permissions 
      WHERE code LIKE 'ai-query%' 
      ORDER BY sort
    `, { type: QueryTypes.SELECT }) as any[];

    addedPermissions.forEach(p => {
      console.log(`  ${p.chinese_name} (${p.code}) - ${p.path}`);
    });

  } catch (error) {
    console.error('❌ 添加AI查询权限失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 运行脚本
if (require.main === module) {
  addAIQueryPermissions()
    .then(() => {
      console.log('\n🎉 AI查询权限配置脚本执行完成!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 脚本执行失败:', error);
      process.exit(1);
    });
}

export { addAIQueryPermissions };