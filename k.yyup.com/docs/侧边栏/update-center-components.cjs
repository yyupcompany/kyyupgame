/**
 * 更新活动中心和教学中心的组件路径
 * 
 * 修改内容：
 * 1. ActivityCenterTimeline.vue → ActivityCenter.vue
 * 2. TeachingCenterTimeline.vue → TeachingCenter.vue
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../server/.env') });
const mysql = require('mysql2/promise');

async function updateCenterComponents() {
  let connection;
  
  try {
    // 创建数据库连接
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✅ 数据库连接成功\n');

    // 1. 查询当前的组件路径
    console.log('📋 查询当前的组件路径...\n');
    const [currentRecords] = await connection.execute(`
      SELECT id, name, chinese_name, component, path 
      FROM permissions 
      WHERE component LIKE '%ActivityCenter%' OR component LIKE '%TeachingCenter%'
      ORDER BY id
    `);

    console.log('当前记录：');
    console.table(currentRecords);

    // 2. 更新 ActivityCenterTimeline → ActivityCenter（不带.vue后缀）
    console.log('\n🔄 更新活动中心组件路径...');
    const [activityResult] = await connection.execute(`
      UPDATE permissions
      SET component = REPLACE(component, 'ActivityCenterTimeline', 'ActivityCenter')
      WHERE component LIKE '%ActivityCenterTimeline%'
    `);
    console.log(`✅ 活动中心更新完成，影响行数: ${activityResult.affectedRows}`);

    // 3. 更新 TeachingCenterTimeline → TeachingCenter（不带.vue后缀）
    console.log('\n🔄 更新教学中心组件路径...');
    const [teachingResult] = await connection.execute(`
      UPDATE permissions
      SET component = REPLACE(component, 'TeachingCenterTimeline', 'TeachingCenter')
      WHERE component LIKE '%TeachingCenterTimeline%'
    `);
    console.log(`✅ 教学中心更新完成，影响行数: ${teachingResult.affectedRows}`);

    // 4. 验证更新结果
    console.log('\n📋 验证更新结果...\n');
    const [updatedRecords] = await connection.execute(`
      SELECT id, name, chinese_name, component, path 
      FROM permissions 
      WHERE component LIKE '%ActivityCenter%' OR component LIKE '%TeachingCenter%'
      ORDER BY id
    `);

    console.log('更新后的记录：');
    console.table(updatedRecords);

    // 5. 统计信息
    console.log('\n📊 更新统计：');
    console.log(`- 活动中心更新: ${activityResult.affectedRows} 条记录`);
    console.log(`- 教学中心更新: ${teachingResult.affectedRows} 条记录`);
    console.log(`- 总计更新: ${activityResult.affectedRows + teachingResult.affectedRows} 条记录`);

    console.log('\n✅ 所有更新完成！');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 数据库连接已关闭');
    }
  }
}

// 执行更新
updateCenterComponents();

