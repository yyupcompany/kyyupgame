/**
 * 修复三个中心的type字段
 * 将考勤中心、集团管理、用量中心的type从'menu'改为'category'
 * 这样它们就能在侧边栏中显示为一级菜单
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false
  }
);

(async () => {
  try {
    console.log('\n=== 修复三个中心的type字段 ===\n');
    
    // 1. 修复前查看
    console.log('📋 修复前状态:\n');
    const [before] = await sequelize.query(`
      SELECT code, chinese_name, type, parent_id
      FROM permissions
      WHERE code IN ('ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER')
      ORDER BY code
    `);
    
    before.forEach(row => {
      console.log(`${row.chinese_name}: type=${row.type}, parent_id=${row.parent_id}`);
    });
    
    // 2. 执行修复
    console.log('\n🔧 执行修复...\n');
    
    await sequelize.query(`
      UPDATE permissions
      SET type = 'category'
      WHERE code IN ('ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER')
        AND type = 'menu'
        AND parent_id IS NULL
    `);
    
    console.log('✅ type字段已更新为 "category"\n');
    
    // 3. 修复后验证
    console.log('📋 修复后状态:\n');
    const [after] = await sequelize.query(`
      SELECT code, chinese_name, type, parent_id, path, component
      FROM permissions
      WHERE code IN ('ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER')
      ORDER BY code
    `);
    
    after.forEach(row => {
      console.log(`✅ ${row.chinese_name}:`);
      console.log(`   - type: ${row.type}`);
      console.log(`   - parent_id: ${row.parent_id}`);
      console.log(`   - path: ${row.path}`);
      console.log(`   - component: ${row.component}`);
      console.log('');
    });
    
    console.log('🎉 修复完成！\n');
    console.log('📝 下一步操作:');
    console.log('   1. 清除浏览器缓存 (Ctrl + Shift + R)');
    console.log('   2. 重新登录');
    console.log('   3. 检查侧边栏是否显示三个中心\n');
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
})();

