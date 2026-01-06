/**
 * 检查中心页面API需要的权限
 * 查找customer-pool, enrollment-center, supervision相关的权限
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
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  logging: false
});

async function checkCenterAPIPermissions() {
  try {
    console.log('🔌 连接远端数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查找所有与这些中心相关的权限
    console.log('🔍 搜索中心页面相关权限...\n');
    
    const keywords = [
      'customer-pool',
      'customer_pool',
      'enrollment-center',
      'enrollment_center',
      'supervision',
      'page-guide',
      'page_guide'
    ];

    for (const keyword of keywords) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`🔎 搜索关键词: "${keyword}"`);
      console.log('='.repeat(80));
      
      const [permissions] = await sequelize.query(`
        SELECT 
          id,
          code,
          name,
          path,
          type,
          description
        FROM permissions
        WHERE deleted_at IS NULL
          AND (
            code LIKE '%${keyword}%'
            OR name LIKE '%${keyword}%'
            OR path LIKE '%${keyword}%'
            OR description LIKE '%${keyword}%'
          )
        ORDER BY type, code
      `);

      if (permissions.length > 0) {
        console.log(`\n✅ 找到 ${permissions.length} 个相关权限:\n`);
        permissions.forEach((p, index) => {
          console.log(`${index + 1}. ${p.code}`);
          console.log(`   名称: ${p.name}`);
          console.log(`   类型: ${p.type}`);
          console.log(`   路径: ${p.path || '无'}`);
          console.log(`   描述: ${p.description || '无'}`);
          console.log(`   ID: ${p.id}`);
          console.log('');
        });

        // 检查principal是否有这些权限
        console.log('📊 检查principal角色是否拥有这些权限:\n');
        for (const p of permissions) {
          const [result] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM role_permissions rp
            INNER JOIN roles r ON rp.role_id = r.id
            WHERE r.code = 'PRINCIPAL'
              AND rp.permission_id = ${p.id}
          `);
          
          const hasPerm = result[0].count > 0;
          console.log(`  ${hasPerm ? '✅' : '❌'} ${p.code}`);
        }
      } else {
        console.log(`\n⚠️  未找到包含 "${keyword}" 的权限`);
      }
    }

    // 查找所有API路径权限
    console.log('\n\n' + '='.repeat(80));
    console.log('🌐 查找API路径权限');
    console.log('='.repeat(80));
    
    const apiPaths = [
      '/api/customer-pool',
      '/api/enrollment-center',
      '/api/supervision',
      '/api/page-guides'
    ];

    for (const apiPath of apiPaths) {
      console.log(`\n🔎 搜索API路径: "${apiPath}"`);
      
      const [permissions] = await sequelize.query(`
        SELECT 
          id,
          code,
          name,
          path,
          type
        FROM permissions
        WHERE deleted_at IS NULL
          AND path LIKE '${apiPath}%'
        ORDER BY path
      `);

      if (permissions.length > 0) {
        console.log(`✅ 找到 ${permissions.length} 个权限:\n`);
        permissions.forEach((p, index) => {
          console.log(`${index + 1}. ${p.path} (${p.code})`);
        });

        // 检查principal是否有这些权限
        console.log('\n检查principal角色:');
        for (const p of permissions) {
          const [result] = await sequelize.query(`
            SELECT COUNT(*) as count
            FROM role_permissions rp
            INNER JOIN roles r ON rp.role_id = r.id
            WHERE r.code = 'PRINCIPAL'
              AND rp.permission_id = ${p.id}
          `);
          
          const hasPerm = result[0].count > 0;
          console.log(`  ${hasPerm ? '✅' : '❌'} ${p.path}`);
        }
      } else {
        console.log(`⚠️  未找到 "${apiPath}" 相关权限`);
      }
    }

    // 查找所有以/开头的路径权限（可能是API权限）
    console.log('\n\n' + '='.repeat(80));
    console.log('📋 所有API路径权限（以/开头）');
    console.log('='.repeat(80));
    
    const [allApiPerms] = await sequelize.query(`
      SELECT 
        id,
        code,
        name,
        path,
        type
      FROM permissions
      WHERE deleted_at IS NULL
        AND path LIKE '/%'
        AND (
          path LIKE '%customer%'
          OR path LIKE '%enrollment%'
          OR path LIKE '%supervision%'
          OR path LIKE '%guide%'
        )
      ORDER BY path
    `);

    if (allApiPerms.length > 0) {
      console.log(`\n✅ 找到 ${allApiPerms.length} 个相关API权限:\n`);
      allApiPerms.forEach((p, index) => {
        console.log(`${index + 1}. ${p.path}`);
        console.log(`   代码: ${p.code}`);
        console.log(`   名称: ${p.name}`);
        console.log(`   ID: ${p.id}`);
        console.log('');
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 检查完成');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkCenterAPIPermissions();

