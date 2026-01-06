/**
 * 修复园长角色权限脚本 - 独立执行版本
 * 将principal角色的权限设置为与admin完全相同
 */

import * as dotenv from 'dotenv';
import { Sequelize } from 'sequelize';

// 加载环境变量
dotenv.config();

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || '',
  process.env.DB_USER || '',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log,
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci',
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
    dialectOptions: {
      charset: 'utf8mb4',
      collation: 'utf8mb4_unicode_ci',
      ssl: {
        rejectUnauthorized: false
      }
    }
  }
);

// 定义模型
const Role = sequelize.define('Role', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: Sequelize.STRING(50),
  code: Sequelize.STRING(50),
  description: Sequelize.STRING(200),
  status: Sequelize.TINYINT,
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
});

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  roleId: Sequelize.INTEGER,
  permissionId: Sequelize.INTEGER,
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
});

async function fixPrincipalPermissions() {
  try {
    console.log('🔧 开始修复园长角色权限...');

    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

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
    const deleteResult = await RolePermission.destroy({
      where: { roleId: principalRole.id }
    });
    console.log(`已删除 ${deleteResult} 条principal权限记录`);

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

    const createResult = await RolePermission.bulkCreate(principalPermissions);
    console.log(`✅ 已为principal角色添加 ${createResult.length} 条权限`);

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
  } finally {
    await sequelize.close();
    console.log('🔌 数据库连接已关闭');
  }
}

// 执行修复
fixPrincipalPermissions()
  .then(() => {
    console.log('🔌 脚本执行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 脚本执行失败:', error);
    process.exit(1);
  });