/**
 * 测试所有角色的菜单权限
 * 验证修复后不同角色的菜单显示是否正确
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

async function testAllRolesMenu() {
  try {
    console.log('🔍 测试所有角色的菜单权限...\n');

    // 获取所有角色
    const [roles] = await sequelize.query(`
      SELECT id, code, name FROM roles WHERE code IN ('admin', 'principal', 'teacher', 'parent')
    `) as any[];

    for (const role of roles) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`👤 角色: ${role.code} (${role.name})`);
      console.log(`${'='.repeat(60)}`);

      // 获取该角色的权限
      const [rolePermissions] = await sequelize.query(`
        SELECT rp.permission_id FROM role_permissions rp
        WHERE rp.role_id = ?
      `, { replacements: [role.id] }) as any[];

      const permissionIds = rolePermissions.map((rp: any) => rp.permission_id);
      console.log(`📊 该角色拥有的权限ID数量: ${permissionIds.length}`);

      if (permissionIds.length === 0) {
        console.log('⚠️  该角色没有权限');
        continue;
      }

      // 应用修复后的过滤逻辑
      let whereClause = `id IN (${permissionIds.join(',')}) AND status = 1 AND type IN ('category', 'menu', 'page')`;
      
      if (role.code === 'parent') {
        whereClause += ` AND code NOT LIKE 'TEACHER_%'`;
      } else if (role.code === 'teacher') {
        whereClause += ` AND code NOT LIKE 'PARENT_%'`;
      } else {
        whereClause += ` AND code NOT LIKE 'TEACHER_%' AND code NOT LIKE 'PARENT_%'`;
      }

      const [filteredPermissions] = await sequelize.query(`
        SELECT code, name, chinese_name, type FROM permissions
        WHERE ${whereClause}
        ORDER BY sort ASC
      `) as any[];

      console.log(`✅ 过滤后的权限数量: ${filteredPermissions.length}`);

      // 统计权限类型
      const typeCount = {};
      filteredPermissions.forEach((p: any) => {
        typeCount[p.type] = (typeCount[p.type] || 0) + 1;
      });

      console.log('\n📈 权限类型分布:');
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });

      // 显示前10个权限
      console.log('\n📋 权限列表 (前10个):');
      filteredPermissions.slice(0, 10).forEach((p: any) => {
        console.log(`  - ${p.code} (${p.chinese_name || p.name})`);
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ 测试完成');
  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await sequelize.close();
  }
}

testAllRolesMenu();

