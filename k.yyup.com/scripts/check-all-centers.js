/**
 * 检查所有中心页面的权限配置
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'pwk5ls7j',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkAllCenters() {
  try {
    console.log('🔍 开始检查所有中心页面的权限配置...\n');

    // 1. 检查所有包含"中心"或"Center"的权限
    console.log('📋 1. 检查所有包含"中心"或"Center"的权限:');
    const [centerPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, status, sort
      FROM permissions 
      WHERE (chinese_name LIKE '%中心%' OR name LIKE '%Center%' OR path LIKE '%center%')
        AND deleted_at IS NULL
      ORDER BY type, sort, id
    `);
    
    console.log(`找到 ${centerPermissions.length} 个中心相关权限:`);
    
    // 按类型分组
    const byType = {};
    centerPermissions.forEach(p => {
      if (!byType[p.type]) byType[p.type] = [];
      byType[p.type].push(p);
    });
    
    Object.keys(byType).forEach(type => {
      console.log(`\n  ${type} 类型 (${byType[type].length}个):`);
      byType[type].forEach((p, index) => {
        const displayName = p.chinese_name || p.name;
        const statusText = p.status === 1 ? '✅启用' : '❌禁用';
        console.log(`    ${index + 1}. ${statusText} ID:${p.id} ${displayName} - ${p.path} (排序:${p.sort})`);
      });
    });

    // 2. 检查admin角色对这些中心的权限
    console.log('\n📋 2. 检查admin角色对中心页面的权限:');
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;
    
    const [adminCenterPermissions] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.type, p.path, p.status, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND (p.chinese_name LIKE '%中心%' OR p.name LIKE '%Center%' OR p.path LIKE '%center%')
        AND p.deleted_at IS NULL
      ORDER BY p.type, p.sort, p.id
    `);
    
    console.log(`admin角色拥有 ${adminCenterPermissions.length} 个中心相关权限:`);
    
    const adminByType = {};
    adminCenterPermissions.forEach(p => {
      if (!adminByType[p.type]) adminByType[p.type] = [];
      adminByType[p.type].push(p);
    });
    
    Object.keys(adminByType).forEach(type => {
      console.log(`\n  ${type} 类型 (${adminByType[type].length}个):`);
      adminByType[type].forEach((p, index) => {
        const displayName = p.chinese_name || p.name;
        const statusText = p.status === 1 ? '✅启用' : '❌禁用';
        console.log(`    ${index + 1}. ${statusText} ${displayName} - ${p.path}`);
      });
    });

    // 3. 检查应该在侧边栏显示的中心（category或page类型，启用状态）
    console.log('\n📋 3. 应该在侧边栏显示的中心页面:');
    const [sidebarCenters] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.type, p.path, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND (p.chinese_name LIKE '%中心%' OR p.name LIKE '%Center%' OR p.path LIKE '%center%')
        AND p.type IN ('category', 'page')
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);
    
    console.log(`应该显示 ${sidebarCenters.length} 个中心页面:`);
    sidebarCenters.forEach((p, index) => {
      const displayName = p.chinese_name || p.name;
      console.log(`  ${index + 1}. ${displayName} (${p.type}) - ${p.path}`);
    });

    // 4. 检查所有启用的category和page权限（不限于中心）
    console.log('\n📋 4. 检查所有应该在侧边栏显示的菜单:');
    const [allSidebarItems] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.type, p.path, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type IN ('category', 'page')
        AND p.status = 1
        AND p.deleted_at IS NULL
        AND p.path NOT LIKE '#%'
      ORDER BY p.sort, p.id
    `);
    
    console.log(`admin角色应该看到 ${allSidebarItems.length} 个侧边栏菜单项:`);
    allSidebarItems.forEach((p, index) => {
      const displayName = p.chinese_name || p.name;
      console.log(`  ${index + 1}. ${displayName} (${p.type}) - ${p.path} (排序:${p.sort})`);
    });

    // 5. 统计总结
    console.log('\n📊 统计总结:');
    console.log(`  - 数据库中中心相关权限总数: ${centerPermissions.length}`);
    console.log(`  - admin拥有的中心权限: ${adminCenterPermissions.length}`);
    console.log(`  - 应该显示的中心页面: ${sidebarCenters.length}`);
    console.log(`  - 应该显示的所有侧边栏菜单: ${allSidebarItems.length}`);
    
    console.log('\n✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkAllCenters();

