/**
 * 检查centers目录下的所有中心页面，并与数据库权限对比
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// centers目录下的所有中心页面
const centerPages = [
  { file: 'AICenter.vue', name: 'AI中心', path: '/centers/ai' },
  { file: 'ActivityCenter.vue', name: '活动中心', path: '/centers/activity' },
  { file: 'ActivityCenterTimeline.vue', name: '活动中心时间线', path: '/centers/activity/timeline' },
  { file: 'AnalyticsCenter.vue', name: '分析中心', path: '/centers/analytics' },
  { file: 'BusinessCenter.vue', name: '业务中心', path: '/centers/business' },
  { file: 'CustomerPoolCenter.vue', name: '客户池中心', path: '/centers/customer-pool' },
  { file: 'EnrollmentCenter.vue', name: '招生中心', path: '/centers/enrollment' },
  { file: 'FinanceCenter.vue', name: '财务中心', path: '/centers/finance' },
  { file: 'InspectionCenter.vue', name: '检查中心', path: '/centers/inspection' },
  { file: 'MarketingCenter.vue', name: '营销中心', path: '/centers/marketing' },
  { file: 'PersonnelCenter.vue', name: '人事中心', path: '/centers/personnel' },
  { file: 'ScriptCenter.vue', name: '话术中心', path: '/centers/script' },
  { file: 'SystemCenter.vue', name: '系统中心', path: '/centers/system' },
  { file: 'TaskCenter.vue', name: '任务中心', path: '/centers/task' },
  { file: 'TeachingCenter.vue', name: '教学中心', path: '/centers/teaching' },
  { file: 'TeachingCenterTimeline.vue', name: '教学中心时间线', path: '/centers/teaching/timeline' }
];

async function checkCentersDirectory() {
  try {
    console.log('🔍 检查centers目录下的所有中心页面...\n');

    console.log(`📋 centers目录下共有 ${centerPages.length} 个中心页面:\n`);
    centerPages.forEach((center, index) => {
      console.log(`  ${index + 1}. ${center.name} (${center.file}) - ${center.path}`);
    });

    // 检查数据库中的权限
    console.log('\n📋 检查数据库中对应的权限配置:\n');

    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    const results = [];
    
    for (const center of centerPages) {
      // 查找对应的权限
      const [permissions] = await sequelize.query(`
        SELECT id, name, chinese_name, type, path, status
        FROM permissions
        WHERE path = '${center.path}' AND deleted_at IS NULL
      `);

      if (permissions.length === 0) {
        results.push({
          center,
          status: '❌ 缺失',
          permission: null,
          hasAdminRole: false
        });
      } else {
        const permission = permissions[0];
        
        // 检查admin角色是否有这个权限
        const [rolePermissions] = await sequelize.query(`
          SELECT id FROM role_permissions
          WHERE role_id = ${adminRoleId} AND permission_id = ${permission.id}
        `);

        results.push({
          center,
          status: permission.status === 1 ? '✅ 存在' : '⚠️  禁用',
          permission,
          hasAdminRole: rolePermissions.length > 0
        });
      }
    }

    // 显示结果
    console.log('检查结果:\n');
    results.forEach((result, index) => {
      const roleStatus = result.hasAdminRole ? '✅有权限' : '❌无权限';
      const typeInfo = result.permission ? `类型:${result.permission.type}` : '';
      console.log(`  ${index + 1}. ${result.status} ${result.center.name}`);
      console.log(`     路径: ${result.center.path}`);
      if (result.permission) {
        console.log(`     数据库ID: ${result.permission.id}, ${typeInfo}, admin角色: ${roleStatus}`);
      }
      console.log('');
    });

    // 统计
    const existing = results.filter(r => r.permission && r.permission.status === 1);
    const missing = results.filter(r => !r.permission);
    const disabled = results.filter(r => r.permission && r.permission.status !== 1);
    const withAdminRole = results.filter(r => r.hasAdminRole);
    const categoryType = results.filter(r => r.permission && r.permission.type === 'category');

    console.log('📊 统计总结:');
    console.log(`  - centers目录中心总数: ${centerPages.length}`);
    console.log(`  - 数据库中已存在且启用: ${existing.length}`);
    console.log(`  - 数据库中缺失: ${missing.length}`);
    console.log(`  - 数据库中已禁用: ${disabled.length}`);
    console.log(`  - admin角色拥有权限: ${withAdminRole.length}`);
    console.log(`  - category类型(应显示在侧边栏): ${categoryType.length}`);

    // 列出需要修复的问题
    console.log('\n🔧 需要修复的问题:\n');

    if (missing.length > 0) {
      console.log(`1. 缺失的权限 (${missing.length}个):`);
      missing.forEach(r => {
        console.log(`   - ${r.center.name} (${r.center.path})`);
      });
      console.log('');
    }

    if (disabled.length > 0) {
      console.log(`2. 已禁用的权限 (${disabled.length}个):`);
      disabled.forEach(r => {
        console.log(`   - ${r.center.name} (${r.center.path}) - ID: ${r.permission.id}`);
      });
      console.log('');
    }

    const notCategory = results.filter(r => r.permission && r.permission.type !== 'category' && r.permission.status === 1);
    if (notCategory.length > 0) {
      console.log(`3. 类型不是category的权限 (${notCategory.length}个):`);
      notCategory.forEach(r => {
        console.log(`   - ${r.center.name} (${r.center.path}) - 当前类型: ${r.permission.type}, ID: ${r.permission.id}`);
      });
      console.log('');
    }

    const noAdminRole = results.filter(r => r.permission && !r.hasAdminRole);
    if (noAdminRole.length > 0) {
      console.log(`4. admin角色缺少的权限 (${noAdminRole.length}个):`);
      noAdminRole.forEach(r => {
        console.log(`   - ${r.center.name} (${r.center.path}) - ID: ${r.permission.id}`);
      });
      console.log('');
    }

    console.log('✅ 检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkCentersDirectory();

