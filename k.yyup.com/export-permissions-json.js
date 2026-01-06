const { Sequelize, QueryTypes } = require('sequelize');
const fs = require('fs');

// 数据库配置
const sequelize = new Sequelize('kargerdensales', 'root', 'pwk5ls7j', {
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  dialect: 'mysql',
  logging: false
});

async function exportPermissionsToJSON() {
  try {
    console.log('🔍 连接数据库并导出权限数据...');
    
    // 1. 获取所有权限数据
    const permissions = await sequelize.query(`
      SELECT 
        id, name, chinese_name, code, type, parent_id, path, component, 
        permission, icon, sort, status, created_at, updated_at
      FROM permissions 
      ORDER BY id
    `, { type: QueryTypes.SELECT });
    
    console.log(`📋 找到 ${permissions.length} 条权限记录`);
    
    // 2. 获取所有角色数据
    const roles = await sequelize.query(`
      SELECT id, name, code, description, status, created_at, updated_at
      FROM roles 
      ORDER BY id
    `, { type: QueryTypes.SELECT });
    
    console.log(`👥 找到 ${roles.length} 条角色记录`);
    
    // 3. 获取角色权限关联数据
    const rolePermissions = await sequelize.query(`
      SELECT rp.id, rp.role_id, rp.permission_id, r.name as role_name, p.code as permission_code
      FROM role_permissions rp
      LEFT JOIN roles r ON rp.role_id = r.id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      ORDER BY rp.role_id, rp.permission_id
    `, { type: QueryTypes.SELECT });
    
    console.log(`🔗 找到 ${rolePermissions.length} 条角色权限关联记录`);
    
    // 4. 构建完整的JSON数据结构
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        database: 'kargerdensales',
        description: '幼儿园管理系统权限数据导出',
        version: '1.0.0'
      },
      permissions: {
        total: permissions.length,
        data: permissions
      },
      roles: {
        total: roles.length,
        data: roles
      },
      rolePermissions: {
        total: rolePermissions.length,
        data: rolePermissions
      },
      statistics: {
        permissionsByType: {},
        permissionsByStatus: {},
        rolesByStatus: {}
      }
    };
    
    // 5. 计算统计信息
    // 按类型统计权限
    permissions.forEach(perm => {
      const type = perm.type || 'unknown';
      exportData.statistics.permissionsByType[type] = (exportData.statistics.permissionsByType[type] || 0) + 1;
    });
    
    // 按状态统计权限
    permissions.forEach(perm => {
      const status = perm.status === 1 ? 'active' : 'inactive';
      exportData.statistics.permissionsByStatus[status] = (exportData.statistics.permissionsByStatus[status] || 0) + 1;
    });
    
    // 按状态统计角色
    roles.forEach(role => {
      const status = role.status === 1 ? 'active' : 'inactive';
      exportData.statistics.rolesByStatus[status] = (exportData.statistics.rolesByStatus[status] || 0) + 1;
    });
    
    // 6. 保存为JSON文件
    const fileName = `permissions-export-${new Date().toISOString().slice(0, 10)}.json`;
    fs.writeFileSync(fileName, JSON.stringify(exportData, null, 2), 'utf8');
    
    console.log(`✅ 权限数据已导出到: ${fileName}`);
    console.log('\n📊 导出统计:');
    console.log(`- 权限总数: ${permissions.length}`);
    console.log(`- 角色总数: ${roles.length}`);
    console.log(`- 角色权限关联: ${rolePermissions.length}`);
    console.log('\n📋 权限类型分布:');
    console.table(exportData.statistics.permissionsByType);
    console.log('\n👥 角色状态分布:');
    console.table(exportData.statistics.rolesByStatus);
    
    await sequelize.close();
    
  } catch (error) {
    console.error('❌ 导出失败:', error.message);
    console.error(error);
  }
}

// 运行导出
exportPermissionsToJSON();
