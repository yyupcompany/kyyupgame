/**
 * 修复用量中心的父级权限
 * 将用量中心从系统管理子菜单改为一级菜单
 */

const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// 数据库配置
const sequelize = new Sequelize(
  process.env.DB_NAME || 'kargerdensales',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'dbconn.sealoshzh.site',
    port: parseInt(process.env.DB_PORT || '43906'),
    dialect: 'mysql',
    logging: false
  }
);

async function fixUsageCenterParent() {
  try {
    console.log('🔧 修复用量中心的父级权限\n');
    console.log('='.repeat(80));

    // 1. 检查当前状态
    console.log('\n📝 步骤1: 检查当前状态');
    console.log('-'.repeat(80));
    
    const [current] = await sequelize.query(`
      SELECT id, code, chinese_name, type, parent_id, path, component, sort
      FROM permissions 
      WHERE code = 'USAGE_CENTER'
    `);

    if (current.length === 0) {
      console.log('❌ 用量中心权限不存在');
      return;
    }

    const usageCenter = current[0];
    console.log('当前配置:');
    console.log(`  ID: ${usageCenter.id}`);
    console.log(`  代码: ${usageCenter.code}`);
    console.log(`  名称: ${usageCenter.chinese_name}`);
    console.log(`  类型: ${usageCenter.type}`);
    console.log(`  父ID: ${usageCenter.parent_id}`);
    console.log(`  路径: ${usageCenter.path}`);
    console.log(`  组件: ${usageCenter.component}`);
    console.log(`  排序: ${usageCenter.sort}`);

    if (usageCenter.parent_id === null) {
      console.log('\n✅ 用量中心已经是一级菜单，无需修复');
      return;
    }

    // 2. 获取父权限信息
    const [parent] = await sequelize.query(`
      SELECT id, code, chinese_name, type
      FROM permissions 
      WHERE id = ?
    `, { replacements: [usageCenter.parent_id] });

    if (parent.length > 0) {
      console.log(`\n当前父权限: ${parent[0].code} (${parent[0].chinese_name})`);
    }

    // 3. 修复parent_id
    console.log('\n📝 步骤2: 修复parent_id');
    console.log('-'.repeat(80));
    
    await sequelize.query(`
      UPDATE permissions 
      SET parent_id = NULL,
          sort = 100,
          updated_at = NOW()
      WHERE code = 'USAGE_CENTER'
    `);

    console.log('✅ 已将用量中心设置为一级菜单');

    // 4. 验证修复结果
    console.log('\n📝 步骤3: 验证修复结果');
    console.log('-'.repeat(80));
    
    const [updated] = await sequelize.query(`
      SELECT id, code, chinese_name, type, parent_id, path, component, sort
      FROM permissions 
      WHERE code = 'USAGE_CENTER'
    `);

    const updatedCenter = updated[0];
    console.log('修复后配置:');
    console.log(`  ID: ${updatedCenter.id}`);
    console.log(`  代码: ${updatedCenter.code}`);
    console.log(`  名称: ${updatedCenter.chinese_name}`);
    console.log(`  类型: ${updatedCenter.type}`);
    console.log(`  父ID: ${updatedCenter.parent_id || 'NULL (一级菜单)'}`);
    console.log(`  路径: ${updatedCenter.path}`);
    console.log(`  组件: ${updatedCenter.component}`);
    console.log(`  排序: ${updatedCenter.sort}`);

    // 5. 检查三个中心的状态
    console.log('\n📝 步骤4: 检查三个中心的状态');
    console.log('-'.repeat(80));
    
    const [centers] = await sequelize.query(`
      SELECT code, chinese_name, type, parent_id, path, sort
      FROM permissions 
      WHERE code IN ('ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER')
      ORDER BY sort, code
    `);

    console.log('\n三个中心的配置:');
    centers.forEach(c => {
      const parentStatus = c.parent_id === null ? '✅ 一级菜单' : `❌ 子菜单 (parent_id: ${c.parent_id})`;
      console.log(`  ${c.code.padEnd(25)} ${(c.chinese_name || '').padEnd(15)} ${parentStatus}`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ 修复完成！');
    
    console.log('\n📝 下一步操作:');
    console.log('   1. 重启前端服务（如果正在运行）');
    console.log('   2. 清除浏览器缓存或重新登录');
    console.log('   3. 检查侧边栏是否显示三个中心');

  } catch (error) {
    console.error('❌ 修复失败:', error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// 执行修复
fixUsageCenterParent()
  .then(() => {
    console.log('\n🎉 脚本执行成功！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 脚本执行失败:', error);
    process.exit(1);
  });

