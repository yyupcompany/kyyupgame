/**
 * 检查admin角色的菜单权限
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

async function checkAdminMenu() {
  try {
    console.log('🔍 开始检查admin角色的菜单权限...\n');

    // 1. 检查admin角色
    console.log('📋 1. 检查admin角色:');
    const [adminRole] = await sequelize.query(`
      SELECT id, name, code, description 
      FROM roles 
      WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    console.log(`✅ 找到admin角色: ID=${adminRole[0].id}, 名称=${adminRole[0].name}`);
    const adminRoleId = adminRole[0].id;

    // 2. 检查所有category类型的权限（菜单分类）
    console.log('\n📋 2. 检查所有菜单分类 (type=category):');
    const [allCategories] = await sequelize.query(`
      SELECT id, name, chinese_name, code, path, icon, sort, status 
      FROM permissions 
      WHERE type = 'category' AND deleted_at IS NULL
      ORDER BY sort, id
    `);
    console.log(`数据库中共有 ${allCategories.length} 个菜单分类:`);
    allCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ID: ${cat.id}, 名称: ${cat.chinese_name || cat.name}, 路径: ${cat.path}, 状态: ${cat.status === 1 ? '启用' : '禁用'}, 排序: ${cat.sort}`);
    });

    // 3. 检查admin角色拥有的category权限
    console.log('\n📋 3. 检查admin角色拥有的菜单分类权限:');
    const [adminCategories] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.path, p.icon, p.sort, p.status,
             rp.id as role_permission_id
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type = 'category'
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);
    console.log(`admin角色拥有 ${adminCategories.length} 个菜单分类权限:`);
    adminCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ID: ${cat.id}, 名称: ${cat.chinese_name || cat.name}, 路径: ${cat.path}, 状态: ${cat.status === 1 ? '启用' : '禁用'}, 排序: ${cat.sort}`);
    });

    // 4. 检查启用状态的admin菜单
    console.log('\n📋 4. 检查admin角色的启用菜单 (status=1):');
    const [activeAdminCategories] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.path, p.icon, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type = 'category'
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);
    console.log(`admin角色拥有 ${activeAdminCategories.length} 个启用的菜单分类:`);
    activeAdminCategories.forEach((cat, index) => {
      console.log(`  ${index + 1}. ID: ${cat.id}, 名称: ${cat.chinese_name || cat.name}, 路径: ${cat.path}, 排序: ${cat.sort}`);
    });

    // 5. 检查缺失的菜单权限
    console.log('\n📋 5. 检查admin角色缺失的菜单权限:');
    const [missingCategories] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.code, p.path, p.status
      FROM permissions p
      WHERE p.type = 'category'
        AND p.deleted_at IS NULL
        AND p.id NOT IN (
          SELECT permission_id 
          FROM role_permissions 
          WHERE role_id = ${adminRoleId}
        )
      ORDER BY p.sort, p.id
    `);
    
    if (missingCategories.length > 0) {
      console.log(`⚠️  admin角色缺失 ${missingCategories.length} 个菜单权限:`);
      missingCategories.forEach((cat, index) => {
        console.log(`  ${index + 1}. ID: ${cat.id}, 名称: ${cat.chinese_name || cat.name}, 路径: ${cat.path}, 状态: ${cat.status === 1 ? '启用' : '禁用'}`);
      });
    } else {
      console.log('✅ admin角色拥有所有菜单权限');
    }

    // 6. 检查前端应该显示的菜单（启用且admin有权限）
    console.log('\n📋 6. 前端应该显示的菜单列表:');
    console.log(`根据数据库，前端应该显示 ${activeAdminCategories.length} 个菜单项：`);
    activeAdminCategories.forEach((cat, index) => {
      const displayName = cat.chinese_name || cat.name;
      console.log(`  ${index + 1}. ${displayName} (${cat.path})`);
    });

    // 7. 统计总结
    console.log('\n📊 统计总结:');
    console.log(`  - 数据库中菜单分类总数: ${allCategories.length}`);
    console.log(`  - admin角色拥有的菜单权限: ${adminCategories.length}`);
    console.log(`  - 启用状态的admin菜单: ${activeAdminCategories.length}`);
    console.log(`  - 缺失的菜单权限: ${missingCategories.length}`);
    
    console.log('\n✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkAdminMenu();

