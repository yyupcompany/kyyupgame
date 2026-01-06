/**
 * 修复时间线中心权限
 * 1. 删除 /centers/teaching 权限
 * 2. 保留 /centers/teaching/timeline 并重命名为"教学中心"
 * 3. 删除 /centers/activity 权限
 * 4. 保留 /centers/activity/timeline 并重命名为"活动中心"
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

async function fixTimelineCenters() {
  try {
    console.log('🔧 开始修复时间线中心权限...\n');

    // 1. 查找需要删除的权限
    console.log('📋 1. 查找需要删除的权限:\n');
    
    const pathsToDelete = ['/centers/teaching', '/centers/activity'];
    const idsToDelete = [];

    for (const pathToDelete of pathsToDelete) {
      const [permissions] = await sequelize.query(`
        SELECT id, name, chinese_name, path
        FROM permissions
        WHERE path = '${pathToDelete}' AND deleted_at IS NULL
      `);

      if (permissions.length > 0) {
        const p = permissions[0];
        console.log(`  找到: ${p.chinese_name || p.name} (ID: ${p.id}) - ${p.path}`);
        idsToDelete.push(p.id);
      } else {
        console.log(`  未找到: ${pathToDelete}`);
      }
    }

    // 2. 删除这些权限（软删除）
    if (idsToDelete.length > 0) {
      console.log(`\n📋 2. 删除权限 (软删除):\n`);
      
      for (const id of idsToDelete) {
        await sequelize.query(`
          UPDATE permissions 
          SET deleted_at = NOW(), status = 0
          WHERE id = ${id}
        `);
        console.log(`  ✅ 已删除权限 ID: ${id}`);
      }

      // 删除角色权限关联
      await sequelize.query(`
        DELETE FROM role_permissions 
        WHERE permission_id IN (${idsToDelete.join(',')})
      `);
      console.log(`  ✅ 已删除角色权限关联`);
    } else {
      console.log(`\n📋 2. 没有需要删除的权限\n`);
    }

    // 3. 重命名时间线权限
    console.log(`\n📋 3. 重命名时间线权限:\n`);

    const timelineUpdates = [
      { 
        path: '/centers/teaching/timeline', 
        newName: 'Teaching Center',
        newChineseName: '教学中心'
      },
      { 
        path: '/centers/activity/timeline', 
        newName: 'Activity Center',
        newChineseName: '活动中心'
      }
    ];

    for (const update of timelineUpdates) {
      const [permissions] = await sequelize.query(`
        SELECT id, name, chinese_name, path
        FROM permissions
        WHERE path = '${update.path}' AND deleted_at IS NULL
      `);

      if (permissions.length > 0) {
        const p = permissions[0];
        console.log(`  找到: ${p.chinese_name || p.name} (ID: ${p.id}) - ${p.path}`);
        
        await sequelize.query(`
          UPDATE permissions 
          SET name = '${update.newName}',
              chinese_name = '${update.newChineseName}'
          WHERE id = ${p.id}
        `);
        
        console.log(`  ✅ 已重命名为: ${update.newChineseName}\n`);
      } else {
        console.log(`  ⚠️  未找到: ${update.path}\n`);
      }
    }

    // 4. 验证结果
    console.log('📋 4. 验证最终结果:\n');

    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    const [allCenterPermissions] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.path, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.path LIKE '/centers/%'
        AND p.type = 'category'
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);

    console.log(`admin角色现在拥有 ${allCenterPermissions.length} 个中心category权限:\n`);
    allCenterPermissions.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.chinese_name || p.name} - ${p.path} (排序: ${p.sort})`);
    });

    console.log('\n✅ 修复完成！');
    console.log('\n💡 下一步操作:');
    console.log('1. 重启后端服务');
    console.log('2. 刷新前端页面');
    console.log('3. 检查侧边栏菜单');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixTimelineCenters();

