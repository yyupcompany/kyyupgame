/**
 * 测试教师菜单API返回的数据
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

async function testTeacherMenuAPI() {
  try {
    console.log('🔍 模拟教师菜单API调用...\n');

    // 1. 获取教师角色
    const [teacherRole] = await sequelize.query(`
      SELECT id, code FROM roles WHERE code = 'teacher' LIMIT 1
    `) as any[];

    const teacherRoleId = teacherRole[0].id;
    const userRoleCode = 'teacher';

    // 2. 获取教师角色的权限ID
    const [rolePermissions] = await sequelize.query(`
      SELECT permission_id FROM role_permissions WHERE role_id = ?
    `, { replacements: [teacherRoleId] }) as any[];

    const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);
    console.log(`✅ 教师角色权限ID数量: ${permissionIds.length}\n`);

    // 3. 模拟后端过滤逻辑
    let whereCondition: any = {
      id: { [Op.in]: permissionIds },
      status: 1,
      type: { [Op.in]: ['category', 'menu', 'page'] }
    };

    // 教师：只显示TEACHER_开头的权限
    if (userRoleCode === 'teacher') {
      whereCondition.code = { [Op.like]: 'TEACHER_%' };
      console.log('🔐 应用教师过滤: code LIKE "TEACHER_%"\n');
    }

    // 4. 查询过滤后的权限
    const [filteredPermissions] = await sequelize.query(`
      SELECT id, code, name, chinese_name, type, path, parent_id, sort
      FROM permissions
      WHERE id IN (${permissionIds.join(',')})
      AND status = 1
      AND type IN ('category', 'menu', 'page')
      AND code LIKE 'TEACHER_%'
      ORDER BY sort ASC
    `) as any[];

    console.log(`📊 过滤后的权限数量: ${filteredPermissions.length}\n`);

    if (filteredPermissions.length === 0) {
      console.log('⚠️  警告：过滤后没有权限！这就是为什么菜单为空\n');
      console.log('原因分析：');
      console.log('  1. 教师角色的权限中只有2个TEACHER_开头的权限');
      console.log('  2. 其他权限都是通用的中心权限（如BUSINESS_CENTER、TEACHING_CENTER等）');
      console.log('  3. 后端过滤逻辑要求code LIKE "TEACHER_%"，导致大部分权限被过滤掉\n');
    }

    console.log('📋 过滤后的权限列表:');
    filteredPermissions.forEach((p: any) => {
      console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
    });

    console.log('\n✅ 测试完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

testTeacherMenuAPI();

