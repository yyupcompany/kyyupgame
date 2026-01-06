#!/usr/bin/env node

/**
 * 检查督查中心的ID映射问题
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../server/.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'kindergarten_management',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: false
  }
);

async function main() {
  console.log('🔍 检查督查中心的ID映射问题...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 1. 查询督查中心的实际ID
    console.log('📋 步骤1: 查询督查中心的实际ID...');
    const [inspectionCenter] = await sequelize.query(`
      SELECT id, name, chinese_name, code, path, type, status 
      FROM permissions 
      WHERE code = 'INSPECTION_CENTER' OR path = '/centers/inspection'
      ORDER BY id
    `);

    if (inspectionCenter.length > 0) {
      console.log('✅ 督查中心权限记录:\n');
      inspectionCenter.forEach(p => {
        console.log(`   ID: ${p.id}`);
        console.log(`   代码: ${p.code}`);
        console.log(`   路径: ${p.path}`);
        console.log(`   类型: ${p.type}`);
        console.log(`   状态: ${p.status === 1 ? '✅ 启用' : '❌ 禁用'}`);
        console.log();
      });
    } else {
      console.log('❌ 找不到督查中心权限记录\n');
      return;
    }

    const actualId = inspectionCenter[0].id;
    const expectedId = 5001;

    console.log('🔍 步骤2: 检查ID映射...');
    console.log(`   期望ID: ${expectedId}`);
    console.log(`   实际ID: ${actualId}`);
    
    if (actualId !== expectedId) {
      console.log(`   ⚠️ ID不匹配！需要更新配置文件\n`);
      console.log(`📝 需要在 server/src/config/role-mapping.ts 中修改:`);
      console.log(`   [centerPermissions.INSPECTION_CENTER]: ${actualId},  // 督查中心\n`);
    } else {
      console.log(`   ✅ ID映射正确\n`);
    }

    // 3. 检查所有中心的ID映射
    console.log('📊 步骤3: 检查所有中心的ID映射...\n');
    
    const expectedMappings = {
      'PERSONNEL_CENTER': 3002,
      'ACTIVITY_CENTER': 5234,
      'ENROLLMENT_CENTER': 5237,
      'MARKETING_CENTER': 3005,
      'SYSTEM_CENTER': 2013,
      'FINANCE_CENTER': 3074,
      'SCRIPT_CENTER': 5217,
      'MEDIA_CENTER': 5219,
      'BUSINESS_CENTER': 5235,
      'CUSTOMER_POOL_CENTER': 5236,
      'TASK_CENTER_CATEGORY': 5238,
      'TEACHING_CENTER': 5240,
      'INSPECTION_CENTER': 5001
    };

    const [allCenters] = await sequelize.query(`
      SELECT id, code, chinese_name, path, type, status 
      FROM permissions 
      WHERE type IN ('category', 'menu')
      AND path LIKE '/centers/%'
      ORDER BY id
    `);

    console.log('数据库中的中心权限:\n');
    
    const mismatches = [];
    
    Object.entries(expectedMappings).forEach(([code, expectedId]) => {
      const center = allCenters.find(c => c.code === code);
      
      if (center) {
        const match = center.id === expectedId ? '✅' : '❌';
        console.log(`   ${match} ${code}`);
        console.log(`      期望ID: ${expectedId}, 实际ID: ${center.id}`);
        console.log(`      路径: ${center.path}`);
        console.log(`      状态: ${center.status === 1 ? '启用' : '禁用'}`);
        
        if (center.id !== expectedId) {
          mismatches.push({
            code,
            expectedId,
            actualId: center.id,
            path: center.path
          });
        }
      } else {
        console.log(`   ⚠️ ${code} - 数据库中不存在`);
        console.log(`      期望ID: ${expectedId}`);
      }
      console.log();
    });

    // 4. 总结
    console.log('📊 总结:\n');
    console.log(`   ✅ 映射正确: ${Object.keys(expectedMappings).length - mismatches.length}/${Object.keys(expectedMappings).length}`);
    console.log(`   ❌ 映射错误: ${mismatches.length}/${Object.keys(expectedMappings).length}\n`);

    if (mismatches.length > 0) {
      console.log('⚠️ 需要修正的映射:\n');
      mismatches.forEach(m => {
        console.log(`   [centerPermissions.${m.code}]: ${m.actualId},  // 修正: ${m.expectedId} -> ${m.actualId}`);
      });
      console.log();
    }

    // 5. 检查Admin角色是否有督查中心权限
    console.log('👤 步骤4: 检查Admin角色的督查中心权限...');
    const [adminRolePermissions] = await sequelize.query(`
      SELECT 
        r.id AS role_id,
        r.name AS role_name,
        r.code AS role_code,
        p.id AS permission_id,
        p.code AS permission_code,
        p.chinese_name
      FROM roles r
      JOIN role_permissions rp ON r.id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE (r.code = 'ADMIN' OR r.name LIKE '%Admin%')
      AND p.id = ${actualId}
    `);

    if (adminRolePermissions.length > 0) {
      console.log('✅ Admin角色拥有督查中心权限\n');
    } else {
      console.log('❌ Admin角色没有督查中心权限\n');
      console.log('需要运行: node scripts/run-enable-inspection-center.js\n');
    }

  } catch (error) {
    console.error('\n❌ 检查失败:');
    console.error('   错误:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

main();

