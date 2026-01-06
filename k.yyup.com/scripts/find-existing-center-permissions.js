/**
 * 查找已存在的中心权限（可能路径不同或被禁用）
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

async function findExistingPermissions() {
  try {
    console.log('🔍 查找已存在的中心权限...\n');

    // 查找所有包含这些code的权限
    const codes = [
      'activity_center',
      'business_center',
      'customer_pool_center',
      'enrollment_center',
      'task_center',
      'teaching_center'
    ];

    console.log('📋 查找以下code的权限:\n');
    
    for (const code of codes) {
      const [permissions] = await sequelize.query(`
        SELECT id, name, chinese_name, code, type, path, status, deleted_at
        FROM permissions
        WHERE code = '${code}'
      `);

      if (permissions.length > 0) {
        permissions.forEach(p => {
          const statusText = p.status === 1 ? '✅启用' : '❌禁用';
          const deletedText = p.deleted_at ? '🗑️已删除' : '';
          console.log(`${code}:`);
          console.log(`  ID: ${p.id}, 名称: ${p.chinese_name || p.name}`);
          console.log(`  类型: ${p.type}, 路径: ${p.path}`);
          console.log(`  状态: ${statusText} ${deletedText}\n`);
        });
      } else {
        console.log(`${code}: ❌ 未找到\n`);
      }
    }

    // 查找所有中心相关的权限（包括已删除的）
    console.log('\n📋 查找所有中心相关的权限（包括已删除）:\n');
    
    const [allCenterPermissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, status, deleted_at
      FROM permissions
      WHERE (chinese_name LIKE '%中心%' OR name LIKE '%Center%' OR path LIKE '%center%')
      ORDER BY deleted_at IS NULL DESC, status DESC, type, id
    `);

    console.log(`找到 ${allCenterPermissions.length} 个中心相关权限:\n`);

    const byStatus = {
      active: [],
      disabled: [],
      deleted: []
    };

    allCenterPermissions.forEach(p => {
      if (p.deleted_at) {
        byStatus.deleted.push(p);
      } else if (p.status === 1) {
        byStatus.active.push(p);
      } else {
        byStatus.disabled.push(p);
      }
    });

    console.log(`✅ 启用的权限 (${byStatus.active.length}个):`);
    byStatus.active.forEach(p => {
      console.log(`  ID:${p.id} ${p.chinese_name || p.name} (${p.type}) - ${p.path}`);
    });

    console.log(`\n❌ 禁用的权限 (${byStatus.disabled.length}个):`);
    byStatus.disabled.forEach(p => {
      console.log(`  ID:${p.id} ${p.chinese_name || p.name} (${p.type}) - ${p.path}`);
    });

    console.log(`\n🗑️  已删除的权限 (${byStatus.deleted.length}个):`);
    byStatus.deleted.forEach(p => {
      console.log(`  ID:${p.id} ${p.chinese_name || p.name} (${p.type}) - ${p.path}`);
    });

    console.log('\n✅ 查找完成');
    
  } catch (error) {
    console.error('❌ 查找失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

findExistingPermissions();

