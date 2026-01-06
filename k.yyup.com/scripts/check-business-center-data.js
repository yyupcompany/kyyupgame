/**
 * 检查业务中心相关的数据库数据
 */

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../server/.env') });

// 数据库配置 - 使用环境变量
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'avnadmin',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function checkBusinessCenterData() {
  try {
    console.log('🔍 开始检查业务中心相关数据...\n');

    // 1. 检查业务中心权限配置
    console.log('📋 1. 检查业务中心权限配置:');
    const [permissions] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, status 
      FROM permissions 
      WHERE path LIKE '%business%' OR name LIKE '%business%' OR chinese_name LIKE '%业务%'
      ORDER BY id
    `);
    console.log(`找到 ${permissions.length} 条业务中心相关权限:`);
    permissions.forEach(p => {
      console.log(`  - ID: ${p.id}, 名称: ${p.chinese_name || p.name}, 路径: ${p.path}, 组件: ${p.component}, 状态: ${p.status}`);
    });

    // 2. 检查菜单数据
    console.log('\n📋 2. 检查菜单数据 (type=category):');
    const [menus] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, icon, sort, status 
      FROM permissions 
      WHERE type = 'category' AND status = 1
      ORDER BY sort, id
    `);
    console.log(`找到 ${menus.length} 条菜单:`);
    menus.forEach(m => {
      console.log(`  - ID: ${m.id}, 名称: ${m.chinese_name || m.name}, 路径: ${m.path}, 排序: ${m.sort}`);
    });

    // 3. 检查业务中心页面权限
    console.log('\n📋 3. 检查业务中心页面权限 (type=page):');
    const [pages] = await sequelize.query(`
      SELECT id, name, chinese_name, code, type, path, component, parent_id, status 
      FROM permissions 
      WHERE type = 'page' AND (path LIKE '%business%' OR chinese_name LIKE '%业务%')
      ORDER BY id
    `);
    console.log(`找到 ${pages.length} 条业务中心页面权限:`);
    pages.forEach(p => {
      console.log(`  - ID: ${p.id}, 名称: ${p.chinese_name || p.name}, 路径: ${p.path}, 父ID: ${p.parent_id}, 组件: ${p.component}`);
    });

    // 4. 检查角色权限关联
    console.log('\n📋 4. 检查管理员角色的业务中心权限:');
    const [rolePermissions] = await sequelize.query(`
      SELECT rp.id, r.name as role_name, p.chinese_name as permission_name, p.path, p.type
      FROM role_permissions rp
      JOIN roles r ON rp.role_id = r.id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE r.code = 'admin' AND (p.path LIKE '%business%' OR p.chinese_name LIKE '%业务%')
      ORDER BY p.id
    `);
    console.log(`找到 ${rolePermissions.length} 条管理员业务中心权限关联:`);
    rolePermissions.forEach(rp => {
      console.log(`  - 角色: ${rp.role_name}, 权限: ${rp.permission_name}, 路径: ${rp.path}, 类型: ${rp.type}`);
    });

    // 5. 检查招生数据
    console.log('\n📋 5. 检查招生数据统计:');
    const [enrollmentStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN status = 'graduated' THEN 1 ELSE 0 END) as graduated_students
      FROM students
      WHERE deleted_at IS NULL
    `);
    console.log('招生统计:', enrollmentStats[0]);

    // 6. 检查招生计划
    console.log('\n📋 6. 检查招生计划:');
    const [enrollmentPlans] = await sequelize.query(`
      SELECT id, name, target_count, start_date, end_date, status
      FROM enrollment_plans
      WHERE deleted_at IS NULL
      ORDER BY created_at DESC
      LIMIT 5
    `);
    console.log(`找到 ${enrollmentPlans.length} 条招生计划:`);
    enrollmentPlans.forEach(ep => {
      console.log(`  - ID: ${ep.id}, 名称: ${ep.name}, 目标: ${ep.target_count}, 状态: ${ep.status}`);
    });

    console.log('\n✅ 数据检查完成');
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message);
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkBusinessCenterData();

