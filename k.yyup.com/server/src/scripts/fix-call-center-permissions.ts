#!/usr/bin/env ts-node
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

async function fixCallCenterPermissions() {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🔧 为园长角色分配呼叫中心权限');
    console.log('='.repeat(70) + '\n');

    // 1. 查询园长角色
    console.log('🔍 查询园长角色...');
    const principalRoles = await sequelize.query(`
      SELECT id, name, code FROM roles WHERE code = 'principal' LIMIT 1
    `, { type: QueryTypes.SELECT }) as any;

    if (!principalRoles || principalRoles.length === 0) {
      console.error('❌ 未找到园长角色');
      process.exit(1);
    }

    const principalRole = principalRoles[0];
    console.log(`✅ 找到园长角色: ID=${principalRole.id}, Name=${principalRole.name}\n`);

    // 2. 查询所有呼叫中心权限
    console.log('🔍 查询呼叫中心权限...');
    const callCenterPermissions = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path
      FROM permissions
      WHERE code = 'CALL_CENTER' OR code LIKE 'call_center_%'
      ORDER BY id
    `, { type: QueryTypes.SELECT }) as any;

    if (!callCenterPermissions || callCenterPermissions.length === 0) {
      console.error('❌ 未找到呼叫中心权限');
      process.exit(1);
    }

    console.log(`✅ 找到 ${callCenterPermissions.length} 个呼叫中心权限\n`);

    // 3. 为园长角色分配权限
    console.log('📝 为园长角色分配权限...\n');
    let addedCount = 0;
    let skippedCount = 0;

    for (const permission of callCenterPermissions) {
      // 检查是否已存在
      const existing = await sequelize.query(`
        SELECT id FROM role_permissions
        WHERE role_id = ? AND permission_id = ?
      `, {
        replacements: [principalRole.id, permission.id],
        type: QueryTypes.SELECT
      }) as any;

      if (existing && existing.length > 0) {
        console.log(`⏭️  跳过: ${permission.chinese_name || permission.name} (已存在)`);
        skippedCount++;
      } else {
        // 添加权限
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (?, ?, NOW(), NOW())
        `, {
          replacements: [principalRole.id, permission.id],
          type: QueryTypes.INSERT
        });
        
        console.log(`✅ 添加: ${permission.chinese_name || permission.name}`);
        addedCount++;
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log(`📊 结果: 新增 ${addedCount} 个权限，跳过 ${skippedCount} 个权限`);
    console.log('='.repeat(70) + '\n');

    // 4. 验证权限分配
    console.log('🔍 验证权限分配...\n');
    const verifyPermissions = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.type, p.path
      FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ? AND (p.code = 'CALL_CENTER' OR p.code LIKE 'call_center_%')
      ORDER BY p.id
    `, {
      replacements: [principalRole.id],
      type: QueryTypes.SELECT
    }) as any;

    if (verifyPermissions && verifyPermissions.length > 0) {
      console.log(`✅ 园长角色现在有 ${verifyPermissions.length} 个呼叫中心权限:\n`);
      verifyPermissions.forEach((perm: any, index: number) => {
        console.log(`${index + 1}. ${perm.chinese_name || perm.name}`);
        console.log(`   Code: ${perm.code}`);
        console.log(`   Type: ${perm.type}`);
        console.log(`   Path: ${perm.path || 'N/A'}\n`);
      });
    } else {
      console.log('❌ 权限分配失败\n');
      process.exit(1);
    }

    console.log('🎉 完成！\n');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 操作失败:', error);
    process.exit(1);
  }
}

fixCallCenterPermissions();

