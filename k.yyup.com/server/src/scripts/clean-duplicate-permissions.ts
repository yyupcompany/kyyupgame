#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function cleanDuplicatePermissions() {
  try {
    console.log('🧹 开始清理重复权限...');
    
    // 需要保留的新权限（我们新建的）
    const keepPermissions = [
      'user', 'enrollment', 'activity', 'ai', 'poster', 'system', // 主菜单
      'user:student', 'user:teacher', 'user:parent', 'user:class', // 用户管理子菜单
      'enrollment:plan', 'enrollment:application', 'enrollment:simulation', 'enrollment:forecast', 
      'enrollment:strategy', 'enrollment:analytics', 'enrollment:application-detail', 
      'enrollment:application-review', 'enrollment:interview', // 招生管理子菜单
      'ai:chat', 'ai:model', 'ai:memory', 'ai:expert', // AI助手子菜单
      'poster:templates', 'poster:editor', 'poster:generator', // 海报管理子菜单
      'system:user', 'system:role', 'system:permission', // 系统管理子菜单
      'marketing:analysis', 'marketing:campaigns' // 营销管理子菜单
    ];
    
    // 1. 先删除重复的role_permissions关联
    console.log('🔄 清理重复的角色权限关联...');
    
    // 删除旧的权限关联（保留新的）
    await sequelize.query(`
      DELETE rp FROM role_permissions rp
      JOIN permissions p ON rp.permission_id = p.id
      WHERE p.type = 'menu' 
      AND p.code NOT IN (${keepPermissions.map(code => `'${code}'`).join(', ')})
    `);
    
    // 2. 删除旧的权限记录
    console.log('🗑️  删除旧的权限记录...');
    
    await sequelize.query(`
      DELETE FROM permissions 
      WHERE type = 'menu' 
      AND code NOT IN (${keepPermissions.map(code => `'${code}'`).join(', ')})
    `);
    
    // 3. 确保我们的新权限都有admin角色权限
    console.log('✅ 确保admin角色拥有所有新权限...');
    
    const [adminRole] = await sequelize.query(`SELECT id FROM roles WHERE code = 'admin'`);
    const adminRoleId = adminRole.length > 0 ? (adminRole[0] as any).id : null;
    
    if (adminRoleId) {
      // 获取所有保留的权限ID
      const [keptPermissions] = await sequelize.query(`
        SELECT id FROM permissions 
        WHERE type = 'menu' 
        AND code IN (${keepPermissions.map(code => `'${code}'`).join(', ')})
      `);
      
      for (const permission of keptPermissions as any[]) {
        // 检查是否已存在
        const [existing] = await sequelize.query(`
          SELECT id FROM role_permissions 
          WHERE role_id = ${adminRoleId} AND permission_id = ${permission.id}
        `);
        
        if (existing.length === 0) {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${adminRoleId}, ${permission.id}, NOW(), NOW())
          `);
        }
      }
    }
    
    // 4. 检查清理结果
    console.log('📊 检查清理结果...');
    
    const [finalStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as main_menus,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as sub_menus
      FROM permissions WHERE type = 'menu'
    `);
    
    console.log('📋 清理后的权限统计:');
    console.table(finalStats);
    
    // 5. 显示最终的权限结构
    const [finalStructure] = await sequelize.query(`
      SELECT 
        pm.name as main_menu,
        GROUP_CONCAT(p.name ORDER BY p.sort) as sub_menus,
        COUNT(p.id) as sub_menu_count
      FROM permissions pm
      LEFT JOIN permissions p ON pm.id = p.parent_id
      WHERE pm.parent_id IS NULL AND pm.type = 'menu'
      GROUP BY pm.id, pm.name
      ORDER BY pm.sort
    `);
    
    console.log('🏗️  最终菜单结构:');
    console.table(finalStructure);
    
    console.log('✅ 清理完成！');
    
  } catch (error) {
    console.error('❌ 清理失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

cleanDuplicatePermissions();