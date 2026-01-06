/**
 * 修复所有中心权限 - 为centers目录下的页面创建category类型权限
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

// centers目录下需要的所有权限
const centerPermissions = [
  { code: 'ai_center', name: 'AI Center', chinese_name: 'AI中心', path: '/centers/ai', component: 'pages/centers/AICenter', icon: 'MagicStick', sort: 5 },
  { code: 'activity_center_page', name: 'Activity Center', chinese_name: '活动中心', path: '/centers/activity', component: 'pages/centers/ActivityCenter', icon: 'Calendar', sort: 2 },
  { code: 'activity_center_timeline_page', name: 'Activity Center Timeline', chinese_name: '活动中心时间线', path: '/centers/activity/timeline', component: 'pages/centers/ActivityCenterTimeline', icon: 'Calendar', sort: 3 },
  { code: 'analytics_center', name: 'Analytics Center', chinese_name: '分析中心', path: '/centers/analytics', component: 'pages/centers/AnalyticsCenter', icon: 'DataAnalysis', sort: 10 },
  { code: 'business_center_page', name: 'Business Center', chinese_name: '业务中心', path: '/centers/business', component: 'pages/centers/BusinessCenter', icon: 'Briefcase', sort: 6 },
  { code: 'customer_pool_center_page', name: 'Customer Pool Center', chinese_name: '客户池中心', path: '/centers/customer-pool', component: 'pages/centers/CustomerPoolCenter', icon: 'User', sort: 7 },
  { code: 'enrollment_center_page', name: 'Enrollment Center', chinese_name: '招生中心', path: '/centers/enrollment', component: 'pages/centers/EnrollmentCenter', icon: 'UserPlus', sort: 11 },
  { code: 'finance_center', name: 'Finance Center', chinese_name: '财务中心', path: '/centers/finance', component: 'pages/centers/FinanceCenter', icon: 'Money', sort: 9 },
  { code: 'inspection_center', name: 'Inspection Center', chinese_name: '检查中心', path: '/centers/inspection', component: 'pages/centers/InspectionCenter', icon: 'View', sort: 12 },
  { code: 'marketing_center', name: 'Marketing Center', chinese_name: '营销中心', path: '/centers/marketing', component: 'pages/centers/MarketingCenter', icon: 'Promotion', sort: 4 },
  { code: 'personnel_center', name: 'Personnel Center', chinese_name: '人事中心', path: '/centers/personnel', component: 'pages/centers/PersonnelCenter', icon: 'User', sort: 1 },
  { code: 'script_center', name: 'Script Center', chinese_name: '话术中心', path: '/centers/script', component: 'pages/centers/ScriptCenter', icon: 'ChatDotRound', sort: 21 },
  { code: 'system_center', name: 'System Center', chinese_name: '系统中心', path: '/centers/system', component: 'pages/centers/SystemCenter', icon: 'Setting', sort: 8 },
  { code: 'task_center_page', name: 'Task Center', chinese_name: '任务中心', path: '/centers/task', component: 'pages/centers/TaskCenter', icon: 'List', sort: 13 },
  { code: 'teaching_center_page', name: 'Teaching Center', chinese_name: '教学中心', path: '/centers/teaching', component: 'pages/centers/TeachingCenter', icon: 'Reading', sort: 14 },
  { code: 'teaching_center_timeline_page', name: 'Teaching Center Timeline', chinese_name: '教学中心时间线', path: '/centers/teaching/timeline', component: 'pages/centers/TeachingCenterTimeline', icon: 'Reading', sort: 15 }
];

async function fixAllCenterPermissions() {
  try {
    console.log('🔧 开始修复所有中心权限...\n');

    // 获取admin角色ID
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;
    console.log(`✅ 找到admin角色，ID: ${adminRoleId}\n`);

    console.log(`📋 处理 ${centerPermissions.length} 个中心权限:\n`);

    const results = [];

    for (const center of centerPermissions) {
      console.log(`处理: ${center.chinese_name} (${center.path})`);

      // 检查路径是否已存在
      const [existingByPath] = await sequelize.query(`
        SELECT id, code, type, status FROM permissions 
        WHERE path = '${center.path}' AND deleted_at IS NULL
      `);

      if (existingByPath.length > 0) {
        const existing = existingByPath[0];
        console.log(`  ✅ 路径已存在，ID: ${existing.id}, 类型: ${existing.type}`);
        
        // 如果类型不是category，更新为category
        if (existing.type !== 'category') {
          await sequelize.query(`
            UPDATE permissions SET type = 'category' WHERE id = ${existing.id}
          `);
          console.log(`  ✅ 已更新类型为category`);
        }

        // 确保admin有权限
        const [rolePermission] = await sequelize.query(`
          SELECT id FROM role_permissions 
          WHERE role_id = ${adminRoleId} AND permission_id = ${existing.id}
        `);

        if (rolePermission.length === 0) {
          await sequelize.query(`
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES (${adminRoleId}, ${existing.id}, NOW(), NOW())
          `);
          console.log(`  ✅ 已为admin角色添加权限`);
        }

        results.push({ ...center, id: existing.id, action: 'updated' });
        console.log('');
        continue;
      }

      // 检查code是否已存在
      const [existingByCode] = await sequelize.query(`
        SELECT id, path, type FROM permissions 
        WHERE code = '${center.code}' AND deleted_at IS NULL
      `);

      if (existingByCode.length > 0) {
        const existing = existingByCode[0];
        console.log(`  ⚠️  code已存在但路径不同，ID: ${existing.id}, 路径: ${existing.path}`);
        console.log(`  ⚠️  跳过创建，使用已存在的权限`);
        results.push({ ...center, id: existing.id, action: 'skipped' });
        console.log('');
        continue;
      }

      // 创建新权限
      try {
        const [result] = await sequelize.query(`
          INSERT INTO permissions (
            name, chinese_name, code, type, path, component, icon, sort, status, 
            created_at, updated_at
          ) VALUES (
            '${center.name}',
            '${center.chinese_name}',
            '${center.code}',
            'category',
            '${center.path}',
            '${center.component}',
            '${center.icon}',
            ${center.sort},
            1,
            NOW(),
            NOW()
          )
        `);

        const permissionId = result;
        console.log(`  ✅ 权限已创建，ID: ${permissionId}`);

        // 为admin角色添加权限
        await sequelize.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
          VALUES (${adminRoleId}, ${permissionId}, NOW(), NOW())
        `);

        console.log(`  ✅ 已为admin角色添加权限\n`);

        results.push({ ...center, id: permissionId, action: 'created' });
      } catch (error) {
        console.log(`  ❌ 创建失败: ${error.message}\n`);
        results.push({ ...center, action: 'failed', error: error.message });
      }
    }

    // 验证结果
    console.log('\n📋 验证最终结果:\n');

    const [allCenterPermissions] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.path, p.type, p.sort
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
      console.log(`  ${index + 1}. ${p.chinese_name} - ${p.path} (排序: ${p.sort})`);
    });

    console.log('\n📊 统计总结:');
    const created = results.filter(r => r.action === 'created').length;
    const updated = results.filter(r => r.action === 'updated').length;
    const skipped = results.filter(r => r.action === 'skipped').length;
    const failed = results.filter(r => r.action === 'failed').length;
    
    console.log(`  - 新创建: ${created}`);
    console.log(`  - 已更新: ${updated}`);
    console.log(`  - 已跳过: ${skipped}`);
    console.log(`  - 失败: ${failed}`);
    console.log(`  - admin角色中心权限总数: ${allCenterPermissions.length}`);

    console.log('\n✅ 修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

fixAllCenterPermissions();

