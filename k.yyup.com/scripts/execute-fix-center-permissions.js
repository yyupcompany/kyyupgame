/**
 * 执行中心页面权限修复 - 将menu类型的中心转换为category类型
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
    logging: true // 显示SQL日志
  }
);

async function executeFix() {
  try {
    console.log('🔧 开始执行中心页面权限修复...\n');

    // 需要转换为category的中心页面ID
    const centerIds = [3002, 3005, 3006, 2013, 3074, 3073, 5001];

    console.log('📋 将以下中心从menu类型转换为category类型:');
    console.log(`   ID列表: ${centerIds.join(', ')}\n`);

    // 执行批量更新
    const [result] = await sequelize.query(`
      UPDATE permissions 
      SET type = 'category' 
      WHERE id IN (${centerIds.join(',')})
        AND deleted_at IS NULL
    `);

    console.log(`✅ 成功更新 ${result.affectedRows || centerIds.length} 条权限记录\n`);

    // 验证更新结果
    console.log('📋 验证更新结果:');
    const [updated] = await sequelize.query(`
      SELECT id, name, chinese_name, type, path, status
      FROM permissions
      WHERE id IN (${centerIds.join(',')})
      ORDER BY id
    `);

    updated.forEach((p, index) => {
      const displayName = p.chinese_name || p.name;
      const typeIcon = p.type === 'category' ? '✅' : '❌';
      console.log(`  ${index + 1}. ${typeIcon} ${displayName} (ID: ${p.id}) - 类型: ${p.type}, 路径: ${p.path}`);
    });

    // 检查admin角色应该看到的所有category
    console.log('\n📋 检查admin角色的所有category权限:');
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    const [adminCategories] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.path, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type = 'category'
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);

    console.log(`admin角色现在拥有 ${adminCategories.length} 个启用的category权限:`);
    adminCategories.forEach((p, index) => {
      const displayName = p.chinese_name || p.name;
      console.log(`  ${index + 1}. ${displayName} - ${p.path} (排序: ${p.sort})`);
    });

    console.log('\n✅ 修复完成！');
    console.log('\n💡 下一步操作:');
    console.log('1. 重启后端服务: npm run start:backend');
    console.log('2. 刷新前端页面');
    console.log('3. 检查侧边栏是否显示所有中心');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

executeFix();

