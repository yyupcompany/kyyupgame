/**
 * 检查家长角色的权限配置
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

async function checkParentPermissions() {
  try {
    console.log('🔍 检查家长角色权限配置...\n');

    // 1. 获取家长角色
    const [parentRole] = await sequelize.query(`
      SELECT id, code, name FROM roles WHERE code = 'parent' LIMIT 1
    `) as any[];

    if (!parentRole || parentRole.length === 0) {
      console.log('❌ 未找到家长角色');
      return;
    }

    const parentRoleId = parentRole[0].id;
    console.log(`✅ 家长角色ID: ${parentRoleId}\n`);

    // 2. 获取家长角色的权限
    const [rolePermissions] = await sequelize.query(`
      SELECT rp.permission_id, p.code, p.name, p.chinese_name, p.type
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.sort ASC
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📊 家长角色拥有的权限总数: ${rolePermissions.length}\n`);

    // 3. 检查是否包含SYSTEM_CENTER或ADMIN相关权限
    const systemPermissions = rolePermissions.filter((p: any) => 
      p.code.includes('SYSTEM') || p.code.includes('ADMIN') || p.code.includes('CONTROL')
    );

    console.log(`⚠️ 包含SYSTEM/ADMIN/CONTROL的权限: ${systemPermissions.length}`);
    if (systemPermissions.length > 0) {
      console.log('❌ 家长不应该有这些权限！');
      systemPermissions.forEach((p: any) => {
        console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
      });
    }

    // 4. 统计权限类型
    const typeCount = {};
    rolePermissions.forEach((p: any) => {
      typeCount[p.type] = (typeCount[p.type] || 0) + 1;
    });

    console.log('\n📈 权限类型分布:');
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });

    // 5. 显示权限列表
    console.log('\n📋 家长权限列表 (前20个):');
    rolePermissions.slice(0, 20).forEach((p: any, i: number) => {
      console.log(`${i + 1}. ${p.code} (${p.chinese_name || p.name})`);
    });

    if (rolePermissions.length > 20) {
      console.log(`\n... 还有 ${rolePermissions.length - 20} 个权限`);
    }

    console.log('\n✅ 检查完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

checkParentPermissions();

