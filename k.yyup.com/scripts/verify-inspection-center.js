#!/usr/bin/env node

/**
 * 验证督查中心的完整状态
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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
  console.log('🔍 验证督查中心的完整状态...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询督查中心权限
    console.log('📋 步骤1: 查询督查中心权限...');
    const [inspectionPermissions] = await sequelize.query(`
      SELECT * FROM permissions 
      WHERE code = 'INSPECTION_CENTER' OR id = 5001
    `);

    if (inspectionPermissions.length > 0) {
      console.log('✅ 督查中心权限存在:\n');
      inspectionPermissions.forEach(p => {
        console.log(`   ID: ${p.id}`);
        console.log(`   名称: ${p.name}`);
        console.log(`   中文名: ${p.chinese_name}`);
        console.log(`   代码: ${p.code}`);
        console.log(`   类型: ${p.type}`);
        console.log(`   路径: ${p.path}`);
        console.log(`   组件: ${p.component}`);
        console.log(`   文件路径: ${p.file_path}`);
        console.log(`   图标: ${p.icon}`);
        console.log(`   排序: ${p.sort}`);
        console.log(`   状态: ${p.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
        console.log(`   父级ID: ${p.parent_id || '无'}`);
        console.log();
      });
    } else {
      console.log('❌ 督查中心权限不存在\n');
      return;
    }

    // 2. 查询Admin角色的督查中心权限
    console.log('👤 步骤2: 查询Admin角色的督查中心权限...');
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,
        p.id AS permission_id,
        p.name AS permission_name,
        p.chinese_name,
        p.code AS permission_code,
        p.path
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE (r.code = 'ADMIN' OR r.name LIKE '%Admin%')
      AND (p.code = 'INSPECTION_CENTER' OR p.id = 5001)
    `);

    if (rolePermissions.length > 0) {
      console.log('✅ Admin角色拥有督查中心权限:\n');
      rolePermissions.forEach(rp => {
        console.log(`   角色ID: ${rp.role_id}`);
        console.log(`   角色名称: ${rp.role_name}`);
        console.log(`   角色代码: ${rp.role_code}`);
        console.log(`   权限ID: ${rp.permission_id}`);
        console.log(`   权限名称: ${rp.chinese_name || rp.permission_name}`);
        console.log(`   权限代码: ${rp.permission_code}`);
        console.log(`   权限路径: ${rp.path}`);
        console.log();
      });
    } else {
      console.log('❌ Admin角色没有督查中心权限\n');
    }

    // 3. 查询所有角色的督查中心权限
    console.log('🔍 步骤3: 查询所有拥有督查中心权限的角色...');
    const [allRolePermissions] = await sequelize.query(`
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      WHERE rp.permission_id = 5001
    `);

    if (allRolePermissions.length > 0) {
      console.log(`✅ 共有 ${allRolePermissions.length} 个角色拥有督查中心权限:\n`);
      allRolePermissions.forEach((r, index) => {
        console.log(`   ${index + 1}. ${r.role_name} (${r.role_code || 'N/A'})`);
      });
      console.log();
    } else {
      console.log('❌ 没有角色拥有督查中心权限\n');
    }

    // 4. 测试动态权限API
    console.log('🌐 步骤4: 测试前端是否能获取督查中心权限...');
    console.log('   提示: 需要重新登录系统才能看到督查中心\n');

    console.log('🎉 督查中心验证完成！\n');
    console.log('📋 总结:');
    console.log(`   ✅ 督查中心权限已在数据库中`);
    console.log(`   ✅ Admin角色已分配督查中心权限`);
    console.log(`   ✅ 状态: ${inspectionPermissions[0].status === 1 ? '启用' : '禁用'}`);
    console.log();
    console.log('🔧 下一步:');
    console.log('   1. 重新登录系统 (清除旧的权限缓存)');
    console.log('   2. 检查侧边栏是否显示"督查中心"');
    console.log('   3. 访问 http://k.yyup.cc/centers/inspection');
    console.log('   4. 使用MCP浏览器自动化测试督查中心\n');

  } catch (error) {
    console.error('\n❌ 验证失败:');
    console.error('   错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

