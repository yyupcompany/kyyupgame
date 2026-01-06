const { Sequelize } = require('sequelize');
require('dotenv').config();

// 数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false
  }
);

async function checkDBStructure() {
  try {
    console.log('🔍 检查数据库表结构...\n');

    // 检查权限表结构
    const [permissionsColumns] = await sequelize.query(`
      DESCRIBE permissions
    `);

    console.log('📋 Permissions表字段:');
    permissionsColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n');

    // 检查路由表结构
    const [routesColumns] = await sequelize.query(`
      DESCRIBE dynamic_routes
    `);

    console.log('📋 Dynamic Routes表字段:');
    routesColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    console.log('\n');

    // 查询权限表中包含"中心"的内容
    const [centers] = await sequelize.query(`
      SELECT id, name, path, icon, parent_id, sort_order, is_active
      FROM permissions
      WHERE is_active = 1
      AND (name LIKE '%中心%' OR path LIKE '%center%' OR path LIKE '%center%')
      ORDER BY sort_order
    `);

    console.log('🏢 权限表中的中心内容:');
    console.log('=====================');
    centers.forEach(center => {
      console.log(`ID: ${center.id}`);
      console.log(`名称: ${center.name}`);
      console.log(`路径: ${center.path}`);
      console.log(`图标: ${center.icon}`);
      console.log(`父级ID: ${center.parent_id}`);
      console.log(`排序: ${center.sort_order}`);
      console.log('---');
    });

    console.log('\n');

    // 查询路由表中包含"中心"的内容
    const [routeCenters] = await sequelize.query(`
      SELECT id, name, path, component_path, parent_id, icon, sort_order, is_active
      FROM dynamic_routes
      WHERE is_active = 1
      AND (name LIKE '%中心%' OR path LIKE '%center%' OR component_path LIKE '%center%')
      ORDER BY sort_order
    `);

    console.log('🛤️ 路由表中的中心内容:');
    console.log('=====================');
    routeCenters.forEach(center => {
      console.log(`ID: ${center.id}`);
      console.log(`名称: ${center.name}`);
      console.log(`路径: ${center.path}`);
      console.log(`组件: ${center.component_path}`);
      console.log(`图标: ${center.icon}`);
      console.log(`父级ID: ${center.parent_id}`);
      console.log(`排序: ${center.sort_order}`);
      console.log('---');
    });

    console.log('\n');

    // 分析层级关系
    const [parentCenters] = await sequelize.query(`
      SELECT DISTINCT p1.id, p1.name, p1.path, p1.icon, p1.sort_order
      FROM permissions p1
      WHERE p1.is_active = 1
      AND p1.name LIKE '%中心%'
      AND (p1.parent_id IS NULL OR p1.parent_id = 0)
      ORDER BY p1.sort_order
    `);

    console.log('📊 顶级中心分析:');
    console.log('==================');
    for (const parent of parentCenters) {
      console.log(`📁 ${parent.name}`);
      console.log(`   路径: ${parent.path}`);
      console.log(`   图标: ${parent.icon}`);

      // 查找子页面
      const [children] = await sequelize.query(`
        SELECT id, name, path, icon, sort_order
        FROM permissions
        WHERE parent_id = ${parent.id} AND is_active = 1
        ORDER BY sort_order
      `);

      if (children.length > 0) {
        console.log('   子页面:');
        for (const child of children) {
          console.log(`     - ${child.name} (${child.path})`);
        }
      } else {
        console.log('   (无子页面)');
      }
      console.log('---');
    }

    console.log('\n📈 数量统计:');
    console.log('=============');
    console.log(`权限表中心数量: ${centers.length}`);
    console.log(`路由表中心数量: ${routeCenters.length}`);
    console.log(`顶级中心数量: ${parentCenters.length}`);

    // 检查所有页面（不限于中心）
    const [allPages] = await sequelize.query(`
      SELECT COUNT(*) as total FROM permissions WHERE is_active = 1
    `);

    console.log(`权限表总页面数: ${allPages[0].total}`);

  } catch (error) {
    console.error('❌ 检查失败:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkDBStructure();