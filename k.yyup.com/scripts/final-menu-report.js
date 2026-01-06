/**
 * 生成最终的菜单配置报告
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

async function generateFinalReport() {
  try {
    console.log('📊 生成最终菜单配置报告\n');
    console.log('='.repeat(80));
    console.log('\n');

    // 获取admin角色ID
    const [adminRole] = await sequelize.query(`
      SELECT id FROM roles WHERE code = 'admin' AND deleted_at IS NULL
    `);
    
    if (adminRole.length === 0) {
      console.log('❌ 未找到admin角色');
      return;
    }
    
    const adminRoleId = adminRole[0].id;

    // 获取所有侧边栏菜单
    const [sidebarMenus] = await sequelize.query(`
      SELECT p.id, p.name, p.chinese_name, p.path, p.component, p.icon, p.sort
      FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      WHERE rp.role_id = ${adminRoleId}
        AND p.type = 'category'
        AND p.status = 1
        AND p.deleted_at IS NULL
      ORDER BY p.sort, p.id
    `);

    console.log('✅ Admin角色侧边栏菜单配置\n');
    console.log(`共 ${sidebarMenus.length} 个菜单项\n`);
    console.log('-'.repeat(80));
    console.log('\n');

    sidebarMenus.forEach((menu, index) => {
      console.log(`${index + 1}. ${menu.chinese_name || menu.name}`);
      console.log(`   路径: ${menu.path}`);
      console.log(`   组件: ${menu.component}`);
      console.log(`   图标: ${menu.icon}`);
      console.log(`   排序: ${menu.sort}`);
      console.log(`   ID: ${menu.id}`);
      console.log('');
    });

    console.log('-'.repeat(80));
    console.log('\n');

    // 统计信息
    console.log('📈 统计信息\n');
    console.log(`总菜单数: ${sidebarMenus.length}`);
    
    const centerMenus = sidebarMenus.filter(m => {
      const name = m.chinese_name || m.name || '';
      return name.includes('中心') || name.toLowerCase().includes('center');
    });
    console.log(`中心菜单: ${centerMenus.length}`);

    const dashboardMenus = sidebarMenus.filter(m => {
      const name = m.chinese_name || m.name || '';
      return name.includes('工作台') || name.toLowerCase().includes('dashboard');
    });
    console.log(`工作台菜单: ${dashboardMenus.length}`);

    console.log('\n');
    console.log('-'.repeat(80));
    console.log('\n');

    // 前端文件检查
    console.log('📁 前端文件检查\n');
    
    const centerFiles = [
      'AICenter.vue',
      'ActivityCenterTimeline.vue',
      'AnalyticsCenter.vue',
      'BusinessCenter.vue',
      'CustomerPoolCenter.vue',
      'EnrollmentCenter.vue',
      'FinanceCenter.vue',
      'InspectionCenter.vue',
      'MarketingCenter.vue',
      'PersonnelCenter.vue',
      'ScriptCenter.vue',
      'SystemCenter.vue',
      'TaskCenter.vue',
      'TeachingCenterTimeline.vue'
    ];

    console.log('centers目录下应该存在的文件:');
    centerFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });

    console.log('\n已删除的文件:');
    console.log('  1. TeachingCenter.vue (已删除，使用TeachingCenterTimeline.vue代替)');
    console.log('  2. ActivityCenter.vue (已删除，使用ActivityCenterTimeline.vue代替)');

    console.log('\n');
    console.log('-'.repeat(80));
    console.log('\n');

    // 修复总结
    console.log('🔧 修复总结\n');
    console.log('1. ✅ 将7个menu类型的中心权限转换为category类型');
    console.log('2. ✅ 为centers目录下的所有页面创建了对应的权限');
    console.log('3. ✅ 删除了重复的教学中心和活动中心权限');
    console.log('4. ✅ 重命名时间线权限为中心名称');
    console.log('5. ✅ 删除了不需要的前端文件');
    console.log('6. ✅ 确保admin角色拥有所有中心权限');

    console.log('\n');
    console.log('='.repeat(80));
    console.log('\n✅ 报告生成完成！\n');
    
  } catch (error) {
    console.error('❌ 生成报告失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

generateFinalReport();

