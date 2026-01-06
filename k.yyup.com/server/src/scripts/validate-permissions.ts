/**
 * 验证权限配置正确性脚本
 */

import { Sequelize, DataTypes, Op } from 'sequelize';
import { getDatabaseConfig } from '../config/database-unified';

// 数据库连接
const dbConfig = getDatabaseConfig();
const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  timezone: dbConfig.timezone,
  logging: false, // 关闭日志以便查看结果
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

async function validatePermissions() {
  try {
    console.log('🔍 开始验证权限配置...');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    // 1. 统计基础信息
    console.log('\n📊 基础统计信息:');
    const totalPermissions = await Permission.count();
    const totalRoles = await Role.count();
    const totalAssociations = await RolePermission.count();
    
    console.log(`📈 权限总数: ${totalPermissions}`);
    console.log(`📈 角色总数: ${totalRoles}`);
    console.log(`📈 角色权限关联总数: ${totalAssociations}`);
    
    // 2. 权限类型分布
    console.log('\n📋 权限类型分布:');
    const permissionsByType = await Permission.findAll({
      attributes: ['type', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['type']
    });
    
    permissionsByType.forEach(p => {
      console.log(`  ${(p as any).type}: ${(p as any).get('count')} 个`);
    });
    
    // 3. 角色权限分配
    console.log('\n👥 角色权限分配:');
    const roles = await Role.findAll();
    
    for (const role of roles) {
      const permissionCount = await RolePermission.count({
        where: { roleId: (role as any).id }
      });
      console.log(`  ${(role as any).name} (${(role as any).code}): ${permissionCount} 个权限`);
    }
    
    // 4. 验证层级结构
    console.log('\n🌳 验证层级结构:');
    const categories = await Permission.findAll({
      where: { type: 'category' },
      order: [['sort', 'ASC']]
    });
    
    console.log(`📁 一级分类 (${categories.length}个):`);
    for (const category of categories) {
      console.log(`  ${(category as any).name} (${(category as any).code})`);
      
      // 查找子菜单
      const childMenus = await Permission.findAll({
        where: { parentId: (category as any).id },
        order: [['sort', 'ASC']]
      });
      
      console.log(`    ├── 子菜单: ${childMenus.length}个`);
      for (const menu of childMenus) {
        console.log(`    │   ├── ${(menu as any).name} (${(menu as any).path})`);
        
        // 查找三级菜单
        const subMenus = await Permission.findAll({
          where: { parentId: (menu as any).id },
          order: [['sort', 'ASC']]
        });
        
        if (subMenus.length > 0) {
          console.log(`    │   │   └── 子项: ${subMenus.length}个`);
        }
      }
    }
    
    // 5. 检查孤立的权限
    console.log('\n🔍 检查孤立的权限:');
    const assignedPermissionIds = await RolePermission.findAll({
      attributes: ['permissionId']
    });
    const assignedIds = new Set(assignedPermissionIds.map(rp => (rp as any).permissionId));
    
    const orphanPermissions = await Permission.findAll({
      where: {},
      attributes: ['id', 'name', 'code', 'type', 'path']
    });
    
    const orphans = orphanPermissions.filter(p => !assignedIds.has((p as any).id));
    
    if (orphans.length > 0) {
      console.log(`⚠️ 发现 ${orphans.length} 个未分配的权限:`);
      orphans.forEach(p => {
        console.log(`  - ${(p as any).name} (${(p as any).code}) [${(p as any).type}]`);
      });
    } else {
      console.log('✅ 所有权限都已正确分配');
    }
    
    // 6. 检查无效的路径
    console.log('\n🔍 检查路径配置:');
    const invalidPaths = await Permission.findAll({
      where: {
        path: {
          [Op.or]: [
            { [Op.like]: '/demo/%' },
            { [Op.like]: '/test/%' },
            { [Op.like]: '/example%' },
            { [Op.like]: '/api/%' }
          ]
        }
      }
    });
    
    if (invalidPaths.length > 0) {
      console.log(`⚠️ 发现 ${invalidPaths.length} 个可能无效的路径:`);
      invalidPaths.forEach(p => {
        console.log(`  - ${(p as any).name}: ${(p as any).path}`);
      });
    } else {
      console.log('✅ 所有路径配置正确');
    }
    
    // 7. 验证权限代码一致性
    console.log('\n🔍 验证权限代码一致性:');
    const inconsistentCodes = await Permission.findAll({
      where: sequelize.where(
        sequelize.col('code'),
        Op.ne,
        sequelize.col('permission')
      )
    });
    
    if (inconsistentCodes.length > 0) {
      console.log(`⚠️ 发现 ${inconsistentCodes.length} 个代码不一致的权限:`);
      inconsistentCodes.forEach(p => {
        console.log(`  - ${(p as any).name}: code=${(p as any).code}, permission=${(p as any).permission}`);
      });
    } else {
      console.log('✅ 所有权限代码一致');
    }
    
    // 8. 检查重复的路径
    console.log('\n🔍 检查重复的路径:');
    const duplicatePaths = await Permission.findAll({
      attributes: ['path', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['path'],
      having: sequelize.where(sequelize.fn('COUNT', sequelize.col('id')), '>', 1)
    });
    
    if (duplicatePaths.length > 0) {
      console.log(`⚠️ 发现 ${duplicatePaths.length} 个重复的路径:`);
      for (const dup of duplicatePaths) {
        console.log(`  - ${(dup as any).path}: ${(dup as any).get('count')} 次`);
      }
    } else {
      console.log('✅ 所有路径唯一');
    }
    
    // 9. 生成完整的菜单树
    console.log('\n🌳 完整的菜单树结构:');
    const menuTree = await buildMenuTree();
    printMenuTree(menuTree);
    
    // 10. 生成验证报告
    const report = {
      timestamp: new Date().toISOString(),
      totalPermissions,
      totalRoles,
      totalAssociations,
      permissionsByType: permissionsByType.map(p => ({
        type: (p as any).type,
        count: (p as any).get('count')
      })),
      rolePermissions: {},
      orphanPermissions: orphans.length,
      invalidPaths: invalidPaths.length,
      inconsistentCodes: inconsistentCodes.length,
      duplicatePaths: duplicatePaths.length,
      validation: {
        allPermissionsAssigned: orphans.length === 0,
        allPathsValid: invalidPaths.length === 0,
        allCodesConsistent: inconsistentCodes.length === 0,
        allPathsUnique: duplicatePaths.length === 0
      }
    };
    
    // 添加每个角色的权限统计
    for (const role of roles) {
      const count = await RolePermission.count({
        where: { roleId: (role as any).id }
      });
      (report.rolePermissions as any)[(role as any).code] = count;
    }
    
    console.log('\n✅ 权限配置验证完成！');
    console.log('\n📊 验证报告:', JSON.stringify(report, null, 2));
    
    return report;
    
  } catch (error) {
    console.error('❌ 权限配置验证失败:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 构建菜单树
async function buildMenuTree() {
  const allPermissions = await Permission.findAll({
    order: [['sort', 'ASC']]
  });
  
  const permissionMap = new Map();
  const rootItems = [];
  
  // 第一遍：创建映射
  allPermissions.forEach(p => {
    permissionMap.set((p as any).id, {
      ...(p as any).toJSON(),
      children: []
    });
  });
  
  // 第二遍：构建树结构
  allPermissions.forEach(p => {
    const item = permissionMap.get((p as any).id);
    if ((p as any).parentId) {
      const parent = permissionMap.get((p as any).parentId);
      if (parent) {
        parent.children.push(item);
      }
    } else {
      rootItems.push(item);
    }
  });
  
  return rootItems;
}

// 打印菜单树
function printMenuTree(items: any[], level = 0) {
  const indent = '  '.repeat(level);
  
  items.forEach(item => {
    const prefix = level === 0 ? '📁' : level === 1 ? '📂' : '📄';
    console.log(`${indent}${prefix} ${item.name} (${item.code}) [${item.type}] - ${item.path}`);
    
    if (item.children && item.children.length > 0) {
      printMenuTree(item.children, level + 1);
    }
  });
}

// 导出函数
export { validatePermissions };

// 如果直接运行此文件
if (require.main === module) {
  validatePermissions()
    .then((report) => {
      console.log('✅ 验证脚本执行完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 验证脚本执行失败:', error);
      process.exit(1);
    });
}