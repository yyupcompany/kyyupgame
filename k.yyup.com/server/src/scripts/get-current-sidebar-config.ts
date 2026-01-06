/**
 * 获取当前数据库中的侧边栏配置
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

async function getCurrentSidebarConfig() {
  try {
    console.log('📊 获取当前侧边栏配置...\n');

    // 获取所有category类型的权限（一级分类）
    const [categories] = await sequelize.query(`
      SELECT id, name, chinese_name, code, path, icon, sort, status
      FROM permissions
      WHERE type = 'category' AND status = 1
      ORDER BY sort ASC
    `) as any[];

    console.log(`📋 当前活跃的中心数量: ${categories.length}\n`);
    console.log('| 序号 | 中心名称 | 英文名称 | Code | 路由 | 图标 | 排序 |');
    console.log('|------|---------|---------|------|------|------|------|');

    categories.forEach((cat: any, i: number) => {
      console.log(`| ${i + 1} | ${cat.chinese_name || '(未设置)'} | ${cat.name} | ${cat.code} | ${cat.path} | ${cat.icon} | ${cat.sort} |`);
    });

    // 获取所有角色及其权限
    console.log('\n\n📊 各角色权限统计:\n');

    const [roles] = await sequelize.query(`
      SELECT r.id, r.code, r.name, COUNT(rp.permission_id) as permission_count
      FROM roles r
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      GROUP BY r.id, r.code, r.name
      ORDER BY r.id ASC
    `) as any[];

    roles.forEach((role: any) => {
      console.log(`${role.code}: ${role.permission_count}个权限`);
    });

    // 获取家长角色的权限
    console.log('\n\n📊 家长角色权限详情:\n');

    const [parentPerms] = await sequelize.query(`
      SELECT p.code, p.chinese_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'parent' AND p.status = 1
      ORDER BY p.code ASC
    `) as any[];

    console.log(`家长权限总数: ${parentPerms.length}个\n`);
    parentPerms.forEach((perm: any, i: number) => {
      console.log(`${i + 1}. ${perm.code} - ${perm.chinese_name}`);
    });

    // 获取教师角色的权限
    console.log('\n\n📊 教师角色权限详情:\n');

    const [teacherPerms] = await sequelize.query(`
      SELECT p.code, p.chinese_name
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'teacher' AND p.status = 1
      ORDER BY p.code ASC
    `) as any[];

    console.log(`教师权限总数: ${teacherPerms.length}个\n`);
    teacherPerms.slice(0, 10).forEach((perm: any, i: number) => {
      console.log(`${i + 1}. ${perm.code} - ${perm.chinese_name}`);
    });
    if (teacherPerms.length > 10) {
      console.log(`... 还有 ${teacherPerms.length - 10} 个权限`);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

getCurrentSidebarConfig();

