/**
 * 为管理员角色分配集团管理权限
 * 运行方式: node server/scripts/assign-group-permissions-to-admin.js
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '123456',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: console.log
  }
);

async function assignGroupPermissionsToAdmin() {
  try {
    console.log('🔄 开始为管理员角色分配集团管理权限...\n');
    
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');
    
    // 查找所有角色
    const [allRoles] = await sequelize.query(
      "SELECT id, name FROM roles ORDER BY id LIMIT 10"
    );

    if (allRoles.length === 0) {
      console.error('❌ 未找到任何角色');
      console.log('💡 请先创建角色\n');
      process.exit(1);
    }

    // 尝试找管理员角色
    let adminRoles = allRoles.filter(r =>
      r.name.toLowerCase().includes('admin') ||
      r.name.includes('管理员') ||
      r.name.toLowerCase().includes('super')
    );

    // 如果没找到，使用第一个角色
    if (adminRoles.length === 0) {
      console.log('⚠️  未找到明确的管理员角色，将使用第一个角色\n');
      adminRoles = [allRoles[0]];
    }
    
    console.log('📋 找到以下角色:');
    adminRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ID: ${role.id}, 名称: ${role.name}`);
    });
    console.log('');
    
    // 使用第一个管理员角色
    const adminRoleId = adminRoles[0].id;
    const adminRoleName = adminRoles[0].name;
    
    console.log(`✅ 选择角色: ${adminRoleName} (ID: ${adminRoleId})\n`);
    
    // 获取所有集团管理权限
    const [groupPermissions] = await sequelize.query(
      "SELECT id, name, code FROM permissions WHERE id >= 1000 AND id < 1100 ORDER BY id"
    );
    
    if (groupPermissions.length === 0) {
      console.error('❌ 未找到集团管理权限');
      console.log('💡 请先运行 add-group-permissions.js 脚本\n');
      process.exit(1);
    }
    
    console.log(`📝 找到 ${groupPermissions.length} 个集团管理权限\n`);
    
    // 检查已存在的权限分配
    const [existingAssignments] = await sequelize.query(
      `SELECT permission_id FROM role_permissions 
       WHERE role_id = ${adminRoleId} AND permission_id >= 1000 AND permission_id < 1100`
    );
    
    const existingPermissionIds = new Set(existingAssignments.map(a => a.permission_id));
    
    if (existingPermissionIds.size > 0) {
      console.log(`⚠️  已存在 ${existingPermissionIds.size} 个权限分配，将跳过这些权限\n`);
    }
    
    // 分配权限
    let assignedCount = 0;
    let skippedCount = 0;
    
    for (const permission of groupPermissions) {
      if (existingPermissionIds.has(permission.id)) {
        console.log(`⏭️  跳过已分配: ${permission.name} (${permission.code})`);
        skippedCount++;
        continue;
      }
      
      const sql = `INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) 
                   VALUES (${adminRoleId}, ${permission.id}, NOW(), NOW())`;
      
      await sequelize.query(sql);
      console.log(`✅ 分配权限: ${permission.name} (${permission.code})`);
      assignedCount++;
    }
    
    console.log('\n🎉 权限分配完成！\n');
    
    // 显示统计信息
    console.log('📊 分配统计:');
    console.log(`   - 新分配: ${assignedCount}个`);
    console.log(`   - 已存在: ${skippedCount}个`);
    console.log(`   - 总计: ${groupPermissions.length}个\n`);
    
    // 验证分配结果
    const [finalCount] = await sequelize.query(
      `SELECT COUNT(*) as count FROM role_permissions 
       WHERE role_id = ${adminRoleId} AND permission_id >= 1000 AND permission_id < 1100`
    );
    
    console.log(`✅ 验证: 角色 "${adminRoleName}" 现在拥有 ${finalCount[0].count} 个集团管理权限\n`);
    
    console.log('💡 下一步:');
    console.log('   1. 使用管理员账号登录系统');
    console.log('   2. 刷新页面，查看集团管理菜单');
    console.log('   3. 测试集团管理功能\n');
    
  } catch (error) {
    console.error('❌ 分配权限失败:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// 执行脚本
assignGroupPermissionsToAdmin();

