#!/usr/bin/env node

/**
 * 执行SQL脚本启用督查中心
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../server/.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function main() {
  console.log('🚀 开始启用督查中心...\n');

  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 检查督查中心权限是否存在
    console.log('🔍 步骤1: 检查督查中心权限...');
    const [existingPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, status 
      FROM permissions 
      WHERE code = 'INSPECTION_CENTER' OR id = 5001
    `);

    if (existingPermissions.length > 0) {
      console.log('✅ 督查中心权限已存在:');
      existingPermissions.forEach(p => {
        console.log(`   ID: ${p.id}, 名称: ${p.chinese_name || p.name}, 状态: ${p.status === 1 ? '启用' : '禁用'}`);
      });
      console.log();
    } else {
      console.log('⚠️ 督查中心权限不存在\n');
    }

    // 2. 更新或插入督查中心权限
    console.log('📋 步骤2: 更新/插入督查中心权限...');
    await sequelize.query(`
      INSERT INTO permissions (
        id,
        name,
        chinese_name,
        code,
        type,
        parent_id,
        path,
        component,
        file_path,
        permission,
        icon,
        sort,
        status,
        created_at,
        updated_at
      ) VALUES (
        5001,
        'Inspection Center',
        '督查中心',
        'INSPECTION_CENTER',
        'menu',
        NULL,
        '/centers/inspection',
        'InspectionCenter',
        'pages/centers/InspectionCenter.vue',
        'INSPECTION_CENTER',
        'inspection',
        13,
        1,
        NOW(),
        NOW()
      ) ON DUPLICATE KEY UPDATE
        chinese_name = '督查中心',
        path = '/centers/inspection',
        component = 'InspectionCenter',
        file_path = 'pages/centers/InspectionCenter.vue',
        status = 1,
        sort = 13,
        updated_at = NOW()
    `);
    console.log('✅ 督查中心权限已更新\n');

    // 3. 验证督查中心权限
    console.log('🔍 步骤3: 验证督查中心权限...');
    const [verifyPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, status 
      FROM permissions 
      WHERE code = 'INSPECTION_CENTER'
    `);
    
    if (verifyPermissions.length > 0) {
      console.log('✅ 督查中心权限验证成功:');
      verifyPermissions.forEach(p => {
        console.log(`   ID: ${p.id}`);
        console.log(`   名称: ${p.chinese_name || p.name}`);
        console.log(`   代码: ${p.code}`);
        console.log(`   路径: ${p.path}`);
        console.log(`   状态: ${p.status === 1 ? '启用' : '禁用'}`);
      });
      console.log();
    }

    // 4. 获取Admin角色
    console.log('👤 步骤4: 获取Admin角色...');
    const [adminRoles] = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code = 'ADMIN' OR name = 'Admin'
    `);

    if (adminRoles.length === 0) {
      console.log('❌ 找不到Admin角色\n');
      return;
    }

    const adminRole = adminRoles[0];
    console.log(`✅ Admin角色ID: ${adminRole.id}\n`);

    // 5. 为Admin角色分配督查中心权限
    console.log('🔗 步骤5: 为Admin角色分配督查中心权限...');
    const [insertResult] = await sequelize.query(`
      INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
      SELECT ${adminRole.id}, 5001, NOW(), NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM role_permissions 
        WHERE role_id = ${adminRole.id} AND permission_id = 5001
      )
    `);

    if (insertResult.affectedRows > 0) {
      console.log('✅ 已为Admin角色分配督查中心权限\n');
    } else {
      console.log('✅ Admin角色已拥有督查中心权限\n');
    }

    // 6. 验证角色权限分配
    console.log('🔍 步骤6: 验证Admin角色的督查中心权限...');
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        p.id AS permission_id,
        p.name AS permission_name,
        p.chinese_name,
        p.path
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.id = ${adminRole.id}
      AND p.code = 'INSPECTION_CENTER'
    `);

    if (rolePermissions.length > 0) {
      console.log('✅ Admin角色的督查中心权限验证成功:');
      rolePermissions.forEach(rp => {
        console.log(`   角色: ${rp.role_name}`);
        console.log(`   权限: ${rp.chinese_name || rp.permission_name}`);
        console.log(`   路径: ${rp.path}`);
      });
      console.log();
    } else {
      console.log('❌ Admin角色没有督查中心权限\n');
    }

    // 7. 显示所有活跃的中心权限
    console.log('📊 步骤7: 显示所有活跃的中心权限...');
    const [centerPermissions] = await sequelize.query(`
      SELECT 
        id,
        name,
        chinese_name,
        code,
        path,
        sort,
        status
      FROM permissions
      WHERE type = 'menu'
      AND path LIKE '/centers/%'
      AND status = 1
      ORDER BY sort
    `);

    console.log(`✅ 共有 ${centerPermissions.length} 个活跃的中心权限:\n`);
    centerPermissions.forEach((p, index) => {
      console.log(`   ${index + 1}. ${p.chinese_name || p.name} (${p.path})`);
    });
    console.log();

    console.log('🎉 督查中心启用完成！\n');
    console.log('📋 下一步:');
    console.log('   1. 重新登录系统');
    console.log('   2. 检查侧边栏是否显示"督查中心"');
    console.log('   3. 访问 http://k.yyup.cc/centers/inspection 测试页面\n');

  } catch (error) {
    console.error('\n❌ 启用督查中心失败:');
    console.error('   错误:', error.message);
    if (error.sql) {
      console.error('   SQL:', error.sql);
    }
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

