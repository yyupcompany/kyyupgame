/**
 * 最终验证 - 模拟后端菜单API的完整流程
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

async function finalVerification() {
  try {
    console.log('🔍 最终验证 - 模拟菜单API完整流程\n');

    // 1. 获取教师用户
    const [teachers] = await sequelize.query(`
      SELECT u.id, u.username, ur.role_id
      FROM users u
      JOIN user_roles ur ON u.id = ur.user_id
      WHERE ur.role_id = (SELECT id FROM roles WHERE code = 'teacher')
      LIMIT 1
    `) as any[];

    if (teachers.length === 0) {
      console.log('❌ 没有找到教师用户');
      return;
    }

    const teacher = teachers[0];
    console.log(`✅ 教师用户: ${teacher.username} (ID: ${teacher.id})\n`);

    // 2. 获取教师角色的权限ID
    const [rolePermissions] = await sequelize.query(`
      SELECT permission_id FROM role_permissions WHERE role_id = ?
    `, { replacements: [teacher.role_id] }) as any[];

    const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);
    console.log(`📊 教师角色权限总数: ${permissionIds.length}\n`);

    // 3. 应用修复后的过滤逻辑（排除PARENT_）
    const [filteredPermissions] = await sequelize.query(`
      SELECT id, code, name, chinese_name, type, path, parent_id, sort, icon
      FROM permissions
      WHERE id IN (${permissionIds.join(',')})
      AND status = 1
      AND type IN ('category', 'menu', 'page')
      AND code NOT LIKE 'PARENT_%'
      ORDER BY sort ASC
    `) as any[];

    console.log(`✅ 过滤后的权限数: ${filteredPermissions.length}\n`);

    // 4. 统计权限类型
    const typeCount = {};
    filteredPermissions.forEach((p: any) => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    });

    console.log('📈 权限类型分布:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 5. 显示权限列表
    console.log('\n📋 权限列表 (前30个):');
    filteredPermissions.slice(0, 30).forEach((p: any, i: number) => {
      const indent = p.type === 'category' ? '📁' : p.type === 'menu' ? '📋' : '📄';
      console.log(`${i + 1}. ${indent} ${p.code} (${p.chinese_name || p.name})`);
    });

    if (filteredPermissions.length > 30) {
      console.log(`\n... 还有 ${filteredPermissions.length - 30} 个权限`);
    }

    // 6. 验证结果
    console.log('\n' + '='.repeat(60));
    console.log('✅ 验证结果:');
    console.log('='.repeat(60));
    
    if (filteredPermissions.length > 20) {
      console.log('✅ 教师菜单权限充足 (> 20个)');
      console.log('✅ 菜单应该正常显示');
      console.log('✅ 修复成功！');
    } else {
      console.log('⚠️ 教师菜单权限不足 (< 20个)');
      console.log('❌ 菜单可能显示不完整');
    }

    console.log('='.repeat(60));
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

finalVerification();

