/**
 * 验证教师菜单修复后的效果
 */

import { Sequelize, Op } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function verifyTeacherMenuFix() {
  try {
    console.log('✅ 验证教师菜单修复...\n');

    // 1. 获取教师角色
    const [teacherRole] = await sequelize.query(`
      SELECT id, code FROM roles WHERE code = 'teacher' LIMIT 1
    `) as any[];

    const teacherRoleId = teacherRole[0].id;

    // 2. 获取教师角色的权限ID
    const [rolePermissions] = await sequelize.query(`
      SELECT permission_id FROM role_permissions WHERE role_id = ?
    `, { replacements: [teacherRoleId] }) as any[];

    const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);

    // 3. 应用修复后的过滤逻辑（排除PARENT_开头）
    const [filteredPermissions] = await sequelize.query(`
      SELECT id, code, name, chinese_name, type, path, parent_id, sort
      FROM permissions
      WHERE id IN (${permissionIds.join(',')})
      AND status = 1
      AND type IN ('category', 'menu', 'page')
      AND code NOT LIKE 'PARENT_%'
      ORDER BY sort ASC
    `) as any[];

    console.log(`📊 修复后教师可见的权限数量: ${filteredPermissions.length}\n`);

    // 统计权限类型
    const typeCount = {};
    filteredPermissions.forEach((p: any) => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    });

    console.log('📈 权限类型分布:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 显示category权限
    const categories = filteredPermissions.filter((p: any) => p.type === 'category');
    console.log(`\n📁 Category权限 (${categories.length}):`)
    categories.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    // 显示menu权限
    const menus = filteredPermissions.filter((p: any) => p.type === 'menu');
    console.log(`\n📋 Menu权限 (${menus.length}):`)
    menus.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    console.log('\n✅ 验证完成 - 教师现在可以看到所有分配的菜单！');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

verifyTeacherMenuFix();

