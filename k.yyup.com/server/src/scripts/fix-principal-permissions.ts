/**
 * 修复园长角色权限脚本
 * 将principal角色的权限设置为与admin完全相同
 */

import { getSequelize } from '../config/database';
import { Role, Permission, RolePermission } from '../models';

export async function fixPrincipalPermissions(): Promise<void> {
  try {
    console.log('🔧 开始修复园长角色权限...');

    // 获取数据库连接
    const sequelize = getSequelize();

    // 查找admin和principal角色
    const adminRole = await Role.findOne({ where: { code: 'admin' } });
    const principalRole = await Role.findOne({ where: { code: 'principal' } });

    if (!adminRole) {
      throw new Error('❌ 未找到admin角色');
    }

    if (!principalRole) {
      throw new Error('❌ 未找到principal角色');
    }

    console.log(`📋 找到角色: admin=${adminRole.id}, principal=${principalRole.id}`);

    // 删除principal角色的现有权限
    console.log('🗑️ 删除principal角色的现有权限...');
    await RolePermission.destroy({
      where: { roleId: principalRole.id }
    });

    // 获取admin角色的所有权限
    console.log('📖 获取admin角色的所有权限...');
    const adminPermissions = await RolePermission.findAll({
      where: { roleId: adminRole.id }
    });

    if (adminPermissions.length === 0) {
      console.warn('⚠️ admin角色没有任何权限');
      return;
    }

    console.log(`📝 admin角色有 ${adminPermissions.length} 个权限`);

    // 为principal角色添加权限
    console.log('➕ 为principal角色添加权限...');
    const principalPermissions = adminPermissions.map(permission => ({
      roleId: principalRole.id,
      permissionId: permission.permissionId,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await RolePermission.bulkCreate(principalPermissions);

    // 验证修复结果
    const finalAdminCount = await RolePermission.count({
      where: { roleId: adminRole.id }
    });

    const finalPrincipalCount = await RolePermission.count({
      where: { roleId: principalRole.id }
    });

    console.log('✅ 修复完成!');
    console.log(`   - admin角色权限数量: ${finalAdminCount}`);
    console.log(`   - principal角色权限数量: ${finalPrincipalCount}`);
    console.log(`   - 状态: ${finalAdminCount === finalPrincipalCount ? '✅ 同步成功' : '❌ 同步失败'}`);

    if (finalAdminCount === finalPrincipalCount) {
      console.log('🎉 园长角色权限已修复为与admin完全相同！');
    }

  } catch (error) {
    console.error('❌ 修复过程中出现错误:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  fixPrincipalPermissions()
    .then(() => {
      console.log('🔌 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 脚本执行失败:', error);
      process.exit(1);
    });
}