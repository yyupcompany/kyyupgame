#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function analyzePermissionDuplicates() {
  try {
    console.log('🔍 分析权限重复情况...');
    
    // 1. 查看所有权限的详细信息
    const [allPermissions] = await sequelize.query(
      `SELECT id, code, name, path, component, parent_id, type, sort, status
       FROM permissions 
       WHERE type = 'menu'
       ORDER BY parent_id, sort`
    );
    
    console.log('\n📋 所有菜单权限详细信息:');
    console.table(allPermissions);
    
    // 2. 查找重复的权限代码
    const [duplicateCodes] = await sequelize.query(
      `SELECT code, COUNT(*) as count
       FROM permissions 
       WHERE type = 'menu'
       GROUP BY code
       HAVING COUNT(*) > 1`
    );
    
    console.log('\n🔍 重复的权限代码:');
    if (duplicateCodes.length > 0) {
      console.table(duplicateCodes);
    } else {
      console.log('✅ 没有发现重复的权限代码');
    }
    
    // 3. 查找重复的权限名称
    const [duplicateNames] = await sequelize.query(
      `SELECT name, COUNT(*) as count
       FROM permissions 
       WHERE type = 'menu'
       GROUP BY name
       HAVING COUNT(*) > 1`
    );
    
    console.log('\n🔍 重复的权限名称:');
    if (duplicateNames.length > 0) {
      console.table(duplicateNames);
    } else {
      console.log('✅ 没有发现重复的权限名称');
    }
    
    // 4. 查找重复的路径
    const [duplicatePaths] = await sequelize.query(
      `SELECT path, COUNT(*) as count
       FROM permissions 
       WHERE type = 'menu' AND path IS NOT NULL
       GROUP BY path
       HAVING COUNT(*) > 1`
    );
    
    console.log('\n🔍 重复的路径:');
    if (duplicatePaths.length > 0) {
      console.table(duplicatePaths);
    } else {
      console.log('✅ 没有发现重复的路径');
    }
    
    // 5. 查找重复的组件
    const [duplicateComponents] = await sequelize.query(
      `SELECT component, COUNT(*) as count
       FROM permissions 
       WHERE type = 'menu' AND component IS NOT NULL
       GROUP BY component
       HAVING COUNT(*) > 1`
    );
    
    console.log('\n🔍 重复的组件:');
    if (duplicateComponents.length > 0) {
      console.table(duplicateComponents);
    } else {
      console.log('✅ 没有发现重复的组件');
    }
    
    // 6. 按父菜单分组显示子菜单数量
    const [parentMenuStats] = await sequelize.query(
      `SELECT 
        pm.id as parent_id,
        pm.code as parent_code,
        pm.name as parent_name,
        COUNT(p.id) as child_count,
        GROUP_CONCAT(DISTINCT p.name ORDER BY p.sort SEPARATOR ', ') as child_names
       FROM permissions pm
       LEFT JOIN permissions p ON pm.id = p.parent_id
       WHERE pm.parent_id IS NULL AND pm.type = 'menu'
       GROUP BY pm.id, pm.code, pm.name
       ORDER BY pm.sort`
    );
    
    console.log('\n📊 父菜单统计:');
    console.table(parentMenuStats);
    
    // 7. 检查孤立的权限（有parent_id但找不到父权限）
    const [orphanedPermissions] = await sequelize.query(
      `SELECT p.id, p.code, p.name, p.parent_id
       FROM permissions p
       LEFT JOIN permissions parent ON p.parent_id = parent.id
       WHERE p.parent_id IS NOT NULL AND parent.id IS NULL AND p.type = 'menu'`
    );
    
    console.log('\n🔍 孤立的权限（找不到父权限）:');
    if (orphanedPermissions.length > 0) {
      console.table(orphanedPermissions);
    } else {
      console.log('✅ 没有发现孤立的权限');
    }
    
    // 8. 检查admin角色的权限分配
    const [adminPermissionDetails] = await sequelize.query(
      `SELECT p.id, p.code, p.name, p.type, p.parent_id
       FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN roles r ON rp.role_id = r.id
       WHERE r.code = 'admin' AND p.type = 'menu'
       ORDER BY p.parent_id, p.sort`
    );
    
    console.log('\n👤 Admin角色拥有的菜单权限:');
    console.table(adminPermissionDetails);
    
    // 9. 统计各类权限数量
    const [permissionStats] = await sequelize.query(
      `SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN parent_id IS NULL THEN 1 END) as main_menus,
        COUNT(CASE WHEN parent_id IS NOT NULL THEN 1 END) as sub_menus
       FROM permissions 
       GROUP BY type`
    );
    
    console.log('\n📊 权限类型统计:');
    console.table(permissionStats);
    
    console.log('\n✅ 分析完成！');
    
  } catch (error) {
    console.error('❌ 分析失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

analyzePermissionDuplicates();