/**
 * 检查不是"工作台"或"中心"的菜单项
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

async function checkNonCenterMenus() {
  try {
    console.log('🔍 检查不是"工作台"或"中心"的菜单项...\n');

    // 获取admin角色ID
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    // 查找所有admin的category权限
    const [allCategories] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.path, p.sort, p.status
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type = 'category'
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);

    console.log(`admin角色共有 ${allCategories.length} 个启用的category权限:\n`);

    // 分类
    const centerMenus = [];
    const dashboardMenus = [];
    const otherMenus = [];

    allCategories.forEach(p => {
      const name = p.chinese_name || p.name || '';
      
      if (name.includes('中心') || name.toLowerCase().includes('center')) {
        centerMenus.push(p);
      } else if (name.includes('工作台') || name.toLowerCase().includes('dashboard')) {
        dashboardMenus.push(p);
      } else {
        otherMenus.push(p);
      }
    });

    console.log(`✅ 应该保留的"中心"菜单 (${centerMenus.length}个):`);
    centerMenus.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.chinese_name || p.name} - ${p.path} (ID: ${p.id})`);
    });

    console.log(`\n✅ 应该保留的"工作台"菜单 (${dashboardMenus.length}个):`);
    dashboardMenus.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.chinese_name || p.name} - ${p.path} (ID: ${p.id})`);
    });

    console.log(`\n❌ 应该移除的其他菜单 (${otherMenus.length}个):`);
    if (otherMenus.length > 0) {
      otherMenus.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.chinese_name || p.name} - ${p.path} (ID: ${p.id})`);
      });
    } else {
      console.log('  无');
    }

    console.log('\n📊 统计总结:');
    console.log(`  - 中心菜单: ${centerMenus.length}`);
    console.log(`  - 工作台菜单: ${dashboardMenus.length}`);
    console.log(`  - 需要移除的菜单: ${otherMenus.length}`);
    console.log(`  - 保留后的菜单总数: ${centerMenus.length + dashboardMenus.length}`);

    if (otherMenus.length > 0) {
      console.log('\n🔧 移除方案:');
      console.log('方案1: 禁用这些权限（设置status=0）');
      const disableSql = `UPDATE permissions SET status = 0 WHERE id IN (${otherMenus.map(p => p.id).join(',')});`;
      console.log(disableSql);
      
      console.log('\n方案2: 删除admin角色的这些权限关联');
      const deleteSql = `DELETE FROM role_permissions WHERE role_id = ${adminRoleId} AND permission_id IN (${otherMenus.map(p => p.id).join(',')});`;
      console.log(deleteSql);
    }

    console.log('\n✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkNonCenterMenus();

