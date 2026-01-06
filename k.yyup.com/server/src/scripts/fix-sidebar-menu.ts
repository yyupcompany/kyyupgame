/**
 * 侧边栏菜单修复脚本
 * 1. 清理无效菜单项
 * 2. 添加所有已开发功能
 * 3. 修复路径映射问题
 * 4. 验证权限配置
 */

import { Sequelize, DataTypes, Transaction } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';
import { updatedMenuStructure, invalidMenuItems, pathFixMapping } from './updated-menu-structure';

// 数据库连接
const dbConfig = getDatabaseConfig();
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone,
  logging: console.log,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions
});

// 定义模型
const Permission = sequelize.define('Permission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  type: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  path: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  component: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  permission: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  icon: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  sort: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'permissions',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: false,
    defaultValue: 1,
  },
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true,
  paranoid: true,
});

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'role_permissions',
  timestamps: true,
  underscored: true,
});

// 基础角色定义
const baseRoles = [
  { code: 'admin', name: '系统管理员', description: '系统超级管理员，拥有所有权限' },
  { code: 'principal', name: '园长', description: '园长，拥有园区管理权限' },
  { code: 'teacher', name: '教师', description: '教师，拥有班级和学生管理权限' },
  { code: 'parent', name: '家长', description: '家长，拥有查看子女信息权限' },
];

async function fixSidebarMenu() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🔧 开始修复侧边栏菜单...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 步骤1: 备份当前权限数据
    console.log('\n📋 步骤1: 备份当前权限数据...');
    const backupData = await Permission.findAll();
    console.log(`📦 备份了 ${backupData.length} 个权限项`);
    
    // 步骤2: 确保基础角色存在
    console.log('\n📋 步骤2: 确保基础角色存在...');
    const roleMap = new Map();
    for (const roleData of baseRoles) {
      const [role, created] = await Role.findOrCreate({
        where: { code: roleData.code },
        defaults: roleData,
        transaction
      });
      roleMap.set(roleData.code, role);
      console.log(`${created ? '✅ 创建' : '➡️ 存在'} 角色: ${(role as any).name} (${roleData.code})`);
    }
    
    // 步骤3: 清理无效菜单项
    console.log('\n📋 步骤3: 清理无效菜单项...');
    for (const invalidPath of invalidMenuItems) {
      const deleted = await Permission.destroy({
        where: { path: invalidPath },
        transaction
      });
      if (deleted > 0) {
        console.log(`🗑️ 删除无效菜单项: ${invalidPath}`);
      }
    }
    
    // 步骤4: 修复路径映射
    console.log('\n📋 步骤4: 修复路径映射...');
    for (const [oldPath, newPath] of Object.entries(pathFixMapping)) {
      const updated = await Permission.update(
        { path: newPath },
        { 
          where: { path: oldPath },
          transaction
        }
      );
      if (updated[0] > 0) {
        console.log(`🔧 修复路径映射: ${oldPath} -> ${newPath}`);
      }
    }
    
    // 步骤5: 清理现有权限和角色关联（重建）
    console.log('\n📋 步骤5: 清理现有权限数据...');
    await RolePermission.destroy({ where: {}, transaction });
    await Permission.destroy({ where: {}, force: true, transaction });
    console.log('✅ 已清理现有权限数据');
    
    // 步骤6: 创建新的权限结构
    console.log('\n📋 步骤6: 创建新的权限结构...');
    let addedCount = 0;
    let assignedCount = 0;
    
    // 递归创建权限结构
    async function createPermissions(items: any[], parentId: number | null = null) {
      for (const item of items) {
        console.log(`📝 创建权限: ${item.name} (${item.code}) - 类型: ${item.type}`);
        
        // 创建权限记录
        const permission = await Permission.create({
          name: item.name,
          code: item.code,
          type: item.type,
          path: item.path,
          component: item.component || null,
          permission: item.code,
          icon: item.icon || 'Menu',
          sort: item.sort,
          status: 1,
          parentId: parentId
        }, { transaction });
        
        addedCount++;
        
        // 分配角色权限
        if (item.roles && item.roles.length > 0) {
          for (const roleCode of item.roles) {
            const role = roleMap.get(roleCode);
            if (role) {
              await RolePermission.create({
                roleId: (role as any).id,
                permissionId: (permission as any).id
              }, { transaction });
              assignedCount++;
              console.log(`  ✅ 分配给角色: ${(role as any).name}`);
            }
          }
        }
        
        // 递归处理子项
        if (item.children && item.children.length > 0) {
          await createPermissions(item.children, (permission as any).id);
        }
      }
    }
    
    // 开始创建权限结构
    await createPermissions(updatedMenuStructure);
    
    // 步骤7: 验证权限配置
    console.log('\n📋 步骤7: 验证权限配置...');
    
    // 统计结果
    const finalPermissionCount = await Permission.count({ transaction });
    const finalRoleCount = await Role.count({ transaction });
    const finalAssociationCount = await RolePermission.count({ transaction });
    
    console.log(`📈 权限总数: ${finalPermissionCount}`);
    console.log(`📈 角色总数: ${finalRoleCount}`);
    console.log(`📈 角色权限关联总数: ${finalAssociationCount}`);
    console.log(`✅ 新增权限: ${addedCount}`);
    console.log(`✅ 分配权限: ${assignedCount}`);
    
    // 验证层级结构
    const categoryCount = await Permission.count({ where: { type: 'category' }, transaction });
    const menuCount = await Permission.count({ where: { type: 'menu' }, transaction });
    
    console.log(`📊 一级分类数量: ${categoryCount}`);
    console.log(`📊 菜单项数量: ${menuCount}`);
    
    // 验证各角色权限分配
    console.log('\n📋 各角色权限分配验证:');
    for (const [roleCode, role] of roleMap.entries()) {
      const permissionCount = await RolePermission.count({
        where: { roleId: (role as any).id },
        transaction
      });
      console.log(`👤 ${(role as any).name}: ${permissionCount} 个权限`);
    }
    
    // 检查是否有孤立的权限（没有分配给任何角色的权限）
    const allPermissions = await Permission.findAll({ transaction });
    const assignedPermissionIds = await RolePermission.findAll({ 
      attributes: ['permissionId'],
      transaction
    });
    const assignedIds = new Set(assignedPermissionIds.map(rp => (rp as any).permissionId));
    
    const orphanCount = allPermissions.filter(p => !assignedIds.has((p as any).id)).length;
    if (orphanCount > 0) {
      console.log(`⚠️ 发现 ${orphanCount} 个未分配权限的菜单项`);
    } else {
      console.log('✅ 所有权限项都已正确分配');
    }
    
    // 提交事务
    await transaction.commit();
    console.log('\n🎉 侧边栏菜单修复完成！');
    
    // 生成修复报告
    const report = {
      timestamp: new Date().toISOString(),
      totalPermissions: finalPermissionCount,
      totalRoles: finalRoleCount,
      totalAssociations: finalAssociationCount,
      addedPermissions: addedCount,
      assignedPermissions: assignedCount,
      categories: categoryCount,
      menus: menuCount,
      orphanPermissions: orphanCount,
      rolePermissions: {}
    };
    
    // 添加每个角色的权限统计
    for (const [roleCode, role] of roleMap.entries()) {
      const count = await RolePermission.count({
        where: { roleId: (role as any).id }
      });
      (report.rolePermissions as any)[roleCode] = count;
    }
    
    console.log('\n📊 修复报告:', JSON.stringify(report, null, 2));
    
    return report;
    
  } catch (error) {
    console.error('❌ 侧边栏菜单修复失败:', error);
    await transaction.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 导出函数
export { fixSidebarMenu };

// 如果直接运行此文件
if (require.main === module) {
  fixSidebarMenu()
    .then((report) => {
      console.log('✅ 修复脚本执行完成');
      console.log('📋 最终报告:', report);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 修复脚本执行失败:', error);
      process.exit(1);
    });
}