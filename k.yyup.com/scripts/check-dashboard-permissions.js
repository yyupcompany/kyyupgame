/**
 * 检查工作台权限
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

async function checkDashboardPermissions() {
  try {
    console.log('🔍 检查工作台权限...\n');

    // 查找所有工作台相关的权限
    const [dashboards] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, status, deleted_at
      FROM permissions
      WHERE (chinese_name LIKE '%工作台%' OR name LIKE '%Dashboard%' OR path LIKE '%dashboard%')
      ORDER BY type, status DESC, id
    `);

    console.log(`找到 ${dashboards.length} 个工作台相关权限:\n`);

    if (dashboards.length === 0) {
      console.log('❌ 没有找到工作台权限');
      console.log('\n💡 建议: 如果需要工作台菜单，可以创建一个新的category类型权限');
      return;
    }

    dashboards.forEach((p, index) => {
      const statusText = p.status === 1 ? '✅启用' : '❌禁用';
      const deletedText = p.deleted_at ? '🗑️已删除' : '';
      const typeText = p.type === 'category' ? '📁category' : `📄${p.type}`;
      
      console.log(`${index + 1}. ${typeText} ${statusText} ${deletedText}`);
      console.log(`   ID: ${p.id}, 名称: ${p.chinese_name || p.name}`);
      console.log(`   路径: ${p.path}, code: ${p.code}\n`);
    });

    // 检查admin角色是否有工作台权限
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    console.log('📋 检查admin角色的工作台权限:\n');

    for (const dashboard of dashboards) {
      const [rolePermission] = await sequelize.query(`
        SELECT id FROM role_permissions
        WHERE role_id = ${adminRoleId} AND permission_id = ${dashboard.id}
      `);

      const hasPermission = rolePermission.length > 0 ? '✅有权限' : '❌无权限';
      console.log(`${dashboard.chinese_name || dashboard.name} (ID: ${dashboard.id}): ${hasPermission}`);
    }

    console.log('\n✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkDashboardPermissions();

