/**
 * 直接从数据库验证家长权限
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

async function verifyParentPermissions() {
  try {
    console.log('🔍 从数据库验证家长权限...\n');

    // 1. 获取家长角色
    const [parentRole] = await sequelize.query(`
      SELECT id, code FROM roles WHERE code = 'parent' LIMIT 1
    `) as any[];

    if (!parentRole || parentRole.length === 0) {
      console.log('❌ 没有找到家长角色');
      return;
    }

    const parentRoleId = parentRole[0].id;
    console.log(`✅ 家长角色ID: ${parentRoleId}\n`);

    // 2. 获取家长角色的所有权限
    const [permissions] = await sequelize.query(`
      SELECT p.id, p.code, p.chinese_name FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND p.status = 1
      ORDER BY p.code ASC
    `, { replacements: [parentRoleId] }) as any[];

    console.log(`📊 家长角色权限总数: ${permissions.length}\n`);

    // 3. 统计权限类型
    const systemPerms = permissions.filter((p: any) => p.code.startsWith('SYSTEM_'));
    const parentPerms = permissions.filter((p: any) => p.code.startsWith('PARENT_'));
    const otherPerms = permissions.filter((p: any) => 
      !p.code.startsWith('SYSTEM_') && !p.code.startsWith('PARENT_')
    );

    console.log(`📈 权限分类:`);
    console.log(`  ✅ PARENT_权限: ${parentPerms.length}个`);
    console.log(`  ⚠️ 其他权限: ${otherPerms.length}个`);
    console.log(`  ❌ SYSTEM_权限: ${systemPerms.length}个\n`);

    // 4. 检查是否有SYSTEM权限（不应该有）
    if (systemPerms.length === 0) {
      console.log('✅ 正确：家长没有SYSTEM权限');
    } else {
      console.log(`❌ 错误：家长仍然有SYSTEM权限:`);
      systemPerms.forEach((p: any) => {
        console.log(`  - ${p.code} (${p.chinese_name})`);
      });
    }

    // 5. 显示PARENT权限列表
    console.log(`\n📋 家长权限列表 (${parentPerms.length}个):`);
    parentPerms.forEach((p: any, i: number) => {
      console.log(`  ${i + 1}. ${p.code} - ${p.chinese_name}`);
    });

    // 6. 检查关键权限
    console.log(`\n🔑 关键权限检查:`);
    const hasParentDashboard = permissions.some((p: any) => p.code === 'PARENT_DASHBOARD');
    const hasParentCenter = permissions.some((p: any) => p.code === 'PARENT_CENTER');
    const hasSystemCenter = permissions.some((p: any) => p.code === 'SYSTEM_CENTER');

    console.log(`  ${hasParentDashboard ? '✅' : '❌'} PARENT_DASHBOARD`);
    console.log(`  ${hasParentCenter ? '✅' : '❌'} PARENT_CENTER`);
    console.log(`  ${hasSystemCenter ? '❌' : '✅'} 没有SYSTEM_CENTER`);

    // 7. 总结
    console.log(`\n================================`);
    if (systemPerms.length === 0 && parentPerms.length > 0) {
      console.log(`✅ 家长权限配置正确`);
    } else {
      console.log(`❌ 家长权限配置有问题`);
    }
    console.log(`================================`);
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

verifyParentPermissions();

