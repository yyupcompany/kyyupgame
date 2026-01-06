#!/usr/bin/env ts-node
import { sequelize } from '../init';

async function checkFinalPermissions() {
  try {
    console.log('🔍 检查最终权限配置...');
    
    // 查看所有主菜单
    const [mainMenus] = await sequelize.query(
      `SELECT id, code, name, path, sort FROM permissions 
       WHERE parent_id IS NULL AND type = 'menu' 
       ORDER BY sort`
    );
    
    console.log('\n📋 主菜单权限:');
    console.table(mainMenus);
    
    // 查看所有子菜单
    const [subMenus] = await sequelize.query(
      `SELECT p.id, p.code, p.name, p.path, p.sort, pm.name as parent_name 
       FROM permissions p 
       LEFT JOIN permissions pm ON p.parent_id = pm.id 
       WHERE p.parent_id IS NOT NULL AND p.type = 'menu' 
       ORDER BY p.parent_id, p.sort`
    );
    
    console.log('\n📋 子菜单权限:');
    console.table(subMenus);
    
    // 统计数据
    const [stats] = await sequelize.query(
      `SELECT 
        COUNT(*) as total_permissions,
        SUM(CASE WHEN parent_id IS NULL THEN 1 ELSE 0 END) as main_menus,
        SUM(CASE WHEN parent_id IS NOT NULL THEN 1 ELSE 0 END) as sub_menus
       FROM permissions WHERE type = 'menu'`
    );
    
    console.log('\n📊 权限统计:');
    console.table(stats);
    
    // 检查admin角色的权限数量
    const [adminPermissions] = await sequelize.query(
      `SELECT COUNT(*) as admin_permissions
       FROM role_permissions rp
       JOIN roles r ON rp.role_id = r.id
       WHERE r.code = 'admin'`
    );
    
    console.log('\n👤 Admin角色权限数量:');
    console.table(adminPermissions);
    
    // 按主菜单分组显示子菜单
    const [groupedMenus] = await sequelize.query(
      `SELECT 
        pm.name as main_menu,
        GROUP_CONCAT(p.name ORDER BY p.sort) as sub_menus,
        COUNT(p.id) as sub_menu_count
       FROM permissions pm
       LEFT JOIN permissions p ON pm.id = p.parent_id
       WHERE pm.parent_id IS NULL AND pm.type = 'menu'
       GROUP BY pm.id, pm.name
       ORDER BY pm.sort`
    );
    
    console.log('\n🏗️  菜单结构:');
    console.table(groupedMenus);
    
    console.log('\n✅ 检查完成！');
    
  } catch (error) {
    console.error('❌ 检查失败:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

checkFinalPermissions();