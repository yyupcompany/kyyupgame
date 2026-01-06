/**
 * 检查教师角色的菜单权限配置
 */

import { Sequelize } from 'sequelize';
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

async function checkTeacherMenu() {
  try {
    console.log('🔍 检查教师角色菜单权限配置...\n');

    // 1. 获取教师角色ID
    const [teacherRole] = await sequelize.query(`
      SELECT id, code, name FROM roles WHERE code = 'teacher' LIMIT 1
    `) as any[];

    if (!teacherRole || teacherRole.length === 0) {
      console.log('❌ 未找到教师角色');
      return;
    }

    const teacherRoleId = teacherRole[0].id;
    console.log(`✅ 教师角色ID: ${teacherRoleId}\n`);

    // 2. 获取教师角色拥有的权限
    const [rolePermissions] = await sequelize.query(`
      SELECT rp.permission_id, p.code, p.name, p.chinese_name, p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.sort ASC
    `, { replacements: [teacherRoleId] }) as any[];

    console.log(`📊 教师角色拥有的权限总数: ${rolePermissions.length}\n`);

    // 3. 统计权限类型
    const typeCount = {};
    rolePermissions.forEach((p: any) => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    });

    console.log('📈 权限类型分布:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 4. 检查TEACHER_开头的权限
    const teacherPermissions = rolePermissions.filter((p: any) => p.code.startsWith('TEACHER_'));
    console.log(`\n🏫 TEACHER_开头的权限: ${teacherPermissions.length}`);
    if (teacherPermissions.length > 0) {
      teacherPermissions.slice(0, 10).forEach((p: any) => {
        console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
      });
    }

    // 5. 检查category类型的权限
    const categories = rolePermissions.filter((p: any) => p.type === 'category');
    console.log(`\n📁 Category类型权限: ${categories.length}`);
    categories.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    // 6. 检查menu类型的权限
    const menus = rolePermissions.filter((p: any) => p.type === 'menu');
    console.log(`\n📋 Menu类型权限: ${menus.length}`);
    menus.slice(0, 15).forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

checkTeacherMenu();

