/**
 * 检查principal角色缺失的权限
 * 对比admin和principal角色的权限差异
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

async function checkMissingPermissions() {
  try {
    console.log('🔌 连接远端数据库...');
    console.log(`   数据库: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 获取admin角色的所有权限
    console.log('📊 查询admin角色权限...');
    const [adminPermissions] = await sequelize.query(`
      SELECT 
        p.id,
        p.code,
        p.name,
        p.path,
        p.type
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'ADMIN'
        AND p.deleted_at IS NULL
      ORDER BY p.code
    `);
    
    console.log(`✅ admin角色共有 ${adminPermissions.length} 个权限\n`);

    // 2. 获取principal角色的所有权限
    console.log('📊 查询principal角色权限...');
    const [principalPermissions] = await sequelize.query(`
      SELECT 
        p.id,
        p.code,
        p.name,
        p.path,
        p.type
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN roles r ON rp.role_id = r.id
      WHERE r.code = 'PRINCIPAL'
        AND p.deleted_at IS NULL
      ORDER BY p.code
    `);
    
    console.log(`✅ principal角色共有 ${principalPermissions.length} 个权限\n`);

    // 3. 找出principal缺失的权限
    const principalCodes = new Set(principalPermissions.map(p => p.code));
    const missingPermissions = adminPermissions.filter(p => !principalCodes.has(p.code));

    console.log('=' .repeat(80));
    console.log('📋 principal角色缺失的权限');
    console.log('='.repeat(80));
    
    if (missingPermissions.length === 0) {
      console.log('✅ principal角色拥有所有admin权限');
    } else {
      console.log(`⚠️  发现 ${missingPermissions.length} 个缺失权限:\n`);
      
      // 按类型分组
      const byType = {};
      missingPermissions.forEach(p => {
        if (!byType[p.type]) {
          byType[p.type] = [];
        }
        byType[p.type].push(p);
      });

      // 显示缺失权限
      Object.keys(byType).sort().forEach(type => {
        console.log(`\n【${type}类型权限】 (${byType[type].length}个)`);
        byType[type].forEach((p, index) => {
          console.log(`  ${index + 1}. ${p.code}`);
          console.log(`     名称: ${p.name}`);
          console.log(`     路径: ${p.path || '无'}`);
          console.log(`     ID: ${p.id}`);
        });
      });

      // 4. 重点检查中心页面相关权限
      console.log('\n' + '='.repeat(80));
      console.log('🎯 中心页面相关缺失权限');
      console.log('='.repeat(80));
      
      const centerRelated = missingPermissions.filter(p => 
        p.code.includes('CENTER') || 
        p.code.includes('CUSTOMER') || 
        p.code.includes('ENROLLMENT') ||
        p.code.includes('SUPERVISION') ||
        p.path && (
          p.path.includes('customer-pool') ||
          p.path.includes('enrollment-center') ||
          p.path.includes('supervision')
        )
      );

      if (centerRelated.length > 0) {
        console.log(`\n⚠️  发现 ${centerRelated.length} 个中心页面相关缺失权限:\n`);
        centerRelated.forEach((p, index) => {
          console.log(`${index + 1}. ${p.code} - ${p.name}`);
          console.log(`   路径: ${p.path || '无'}`);
          console.log(`   ID: ${p.id}`);
          console.log('');
        });
      } else {
        console.log('\n✅ 没有发现中心页面相关的缺失权限');
      }

      // 5. 生成添加权限的SQL
      console.log('\n' + '='.repeat(80));
      console.log('📝 添加缺失权限的SQL语句');
      console.log('='.repeat(80));
      console.log('\n-- 获取principal角色ID');
      console.log('SET @principal_role_id = (SELECT id FROM roles WHERE code = \'PRINCIPAL\' LIMIT 1);');
      console.log('\n-- 添加缺失的权限');
      
      missingPermissions.forEach(p => {
        console.log(`INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at, updated_at)`);
        console.log(`VALUES (@principal_role_id, ${p.id}, NOW(), NOW()); -- ${p.code}: ${p.name}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    console.log('✅ 权限检查完成');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkMissingPermissions();

