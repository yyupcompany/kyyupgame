#!/usr/bin/env node

/**
 * 检查所有中心的权限状态
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

// 应该有的13个中心
const expectedCenters = [
  { name: '人员中心', code: 'PERSONNEL_CENTER', path: '/centers/personnel' },
  { name: '活动中心', code: 'ACTIVITY_CENTER', path: '/centers/activity' },
  { name: '营销中心', code: 'MARKETING_CENTER', path: '/centers/marketing' },
  { name: '业务中心', code: 'BUSINESS_CENTER', path: '/centers/business' },
  { name: '客户池中心', code: 'CUSTOMER_POOL_CENTER', path: '/centers/customer-pool' },
  { name: '系统中心', code: 'SYSTEM_CENTER', path: '/centers/system' },
  { name: '财务中心', code: 'FINANCE_CENTER', path: '/centers/finance' },
  { name: '招生中心', code: 'ENROLLMENT_CENTER', path: '/centers/enrollment' },
  { name: '任务中心', code: 'TASK_CENTER', path: '/centers/task' },
  { name: '教学中心', code: 'TEACHING_CENTER', path: '/centers/teaching' },
  { name: '话术中心', code: 'SCRIPT_CENTER', path: '/centers/script' },
  { name: '新媒体中心', code: 'MEDIA_CENTER', path: '/centers/media' },
  { name: '督查中心', code: 'INSPECTION_CENTER', path: '/centers/inspection' }
];

async function main() {
  console.log('🔍 检查所有中心的权限状态...\n');

  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功\n');

    // 查询所有中心权限
    const [allCenterPermissions] = await sequelize.query(`
      SELECT 
        id,
        name,
        chinese_name,
        code,
        path,
        component,
        sort,
        status
      FROM permissions
      WHERE type = 'menu'
      AND (path LIKE '/centers/%' OR code LIKE '%_CENTER%')
      ORDER BY sort, id
    `);

    console.log(`📊 数据库中的中心权限 (共 ${allCenterPermissions.length} 个):\n`);
    
    const statusMap = {
      enabled: [],
      disabled: []
    };

    allCenterPermissions.forEach((p, index) => {
      const status = p.status === 1 ? '✅ 启用' : '❌ 禁用';
      console.log(`   ${index + 1}. ${p.chinese_name || p.name}`);
      console.log(`      代码: ${p.code}`);
      console.log(`      路径: ${p.path}`);
      console.log(`      状态: ${status}`);
      console.log(`      排序: ${p.sort}`);
      console.log();

      if (p.status === 1) {
        statusMap.enabled.push(p);
      } else {
        statusMap.disabled.push(p);
      }
    });

    console.log('📈 统计:\n');
    console.log(`   ✅ 启用的中心: ${statusMap.enabled.length} 个`);
    console.log(`   ❌ 禁用的中心: ${statusMap.disabled.length} 个`);
    console.log(`   📦 总计: ${allCenterPermissions.length} 个\n`);

    // 检查缺失的中心
    console.log('🔍 检查应有的13个中心:\n');
    
    const foundCenters = [];
    const missingCenters = [];

    expectedCenters.forEach((expected, index) => {
      const found = allCenterPermissions.find(
        p => p.code === expected.code || p.path === expected.path
      );

      if (found) {
        const status = found.status === 1 ? '✅ 启用' : '❌ 禁用';
        console.log(`   ${index + 1}. ${expected.name} - ${status}`);
        foundCenters.push({ ...expected, ...found });
      } else {
        console.log(`   ${index + 1}. ${expected.name} - ⚠️ 缺失`);
        missingCenters.push(expected);
      }
    });

    console.log();
    console.log('📊 最终统计:\n');
    console.log(`   ✅ 已存在: ${foundCenters.length}/13`);
    console.log(`   ⚠️ 缺失: ${missingCenters.length}/13`);
    console.log(`   ✅ 启用: ${foundCenters.filter(c => c.status === 1).length}/13`);
    console.log(`   ❌ 禁用: ${foundCenters.filter(c => c.status === 0).length}/13\n`);

    if (missingCenters.length > 0) {
      console.log('⚠️ 缺失的中心:\n');
      missingCenters.forEach((c, index) => {
        console.log(`   ${index + 1}. ${c.name} (${c.code})`);
      });
      console.log();
    }

    if (statusMap.disabled.length > 0) {
      console.log('❌ 禁用的中心:\n');
      statusMap.disabled.forEach((c, index) => {
        console.log(`   ${index + 1}. ${c.chinese_name || c.name} (${c.code})`);
      });
      console.log();
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

