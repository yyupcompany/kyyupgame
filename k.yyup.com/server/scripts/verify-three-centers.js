/**
 * 验证三个中心是否能正确返回
 * 模拟getUserMenu API的逻辑
 */

const { Sequelize, QueryTypes } = require('sequelize');
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
    console.log('\n=== 验证三个中心的菜单数据 ===\n');
    
    // 模拟getUserMenu的查询逻辑
    console.log('📋 步骤1: 查询所有category类型的顶级权限\n');
    
    const centerCategories = await sequelize.query(`
      SELECT id, name, chinese_name, code, path, icon, sort, type
      FROM permissions 
      WHERE status = 1 AND type = 'category' AND parent_id IS NULL
      ORDER BY sort
    `, {
      type: QueryTypes.SELECT
    });
    
    console.log(`找到 ${centerCategories.length} 个顶级分类:\n`);
    
    // 检查三个中心是否在列表中
    const threeCenters = ['ATTENDANCE_CENTER', 'GROUP_MANAGEMENT', 'USAGE_CENTER'];
    const foundCenters = centerCategories.filter(cat => 
      threeCenters.includes(cat.code)
    );
    
    console.log('🔍 三个中心的状态:\n');
    threeCenters.forEach(code => {
      const found = foundCenters.find(c => c.code === code);
      if (found) {
        console.log(`✅ ${found.chinese_name} (${code})`);
        console.log(`   - type: ${found.type}`);
        console.log(`   - path: ${found.path}`);
        console.log(`   - sort: ${found.sort}`);
      } else {
        console.log(`❌ ${code} - 未找到！`);
      }
      console.log('');
    });
    
    // 显示所有分类
    console.log('\n📂 所有顶级分类:\n');
    centerCategories.forEach((cat, index) => {
      const isNewCenter = threeCenters.includes(cat.code);
      const marker = isNewCenter ? '🆕' : '  ';
      console.log(`${marker} ${index + 1}. ${cat.chinese_name} (${cat.code})`);
      console.log(`      路径: ${cat.path}`);
      console.log(`      排序: ${cat.sort}`);
      console.log('');
    });
    
    // 构建完整的菜单结构（模拟API返回）
    console.log('\n🎯 模拟API返回的菜单结构:\n');
    
    const menuItems = [];
    for (const category of centerCategories) {
      // 获取每个分类下的菜单项
      const categoryMenus = await sequelize.query(`
        SELECT id, name, chinese_name, code, path, component, icon, sort, type
        FROM permissions 
        WHERE status = 1 AND parent_id = :categoryId AND type = 'menu'
        ORDER BY sort
      `, {
        replacements: { categoryId: category.id },
        type: QueryTypes.SELECT
      });
      
      const categoryItem = {
        id: category.code.toLowerCase().replace(/_/g, '-'),
        name: category.name,
        chinese_name: category.chinese_name || category.name,
        title: category.chinese_name || category.name,
        path: category.path,
        icon: category.icon || 'Menu',
        type: category.type,
        sort: category.sort,
        children: categoryMenus.map(menu => ({
          id: menu.code.toLowerCase().replace(/_/g, '-'),
          name: menu.name,
          chinese_name: menu.chinese_name || menu.name,
          title: menu.chinese_name || menu.name,
          path: menu.path,
          component: menu.component,
          icon: menu.icon || 'Menu',
          type: menu.type,
          sort: menu.sort
        }))
      };
      
      menuItems.push(categoryItem);
      
      // 只显示三个新中心的详细信息
      if (threeCenters.includes(category.code)) {
        console.log(`🆕 ${categoryItem.title}:`);
        console.log(`   - id: ${categoryItem.id}`);
        console.log(`   - path: ${categoryItem.path}`);
        console.log(`   - icon: ${categoryItem.icon}`);
        console.log(`   - 子菜单数量: ${categoryItem.children.length}`);
        if (categoryItem.children.length > 0) {
          categoryItem.children.forEach(child => {
            console.log(`     - ${child.title} (${child.path})`);
          });
        }
        console.log('');
      }
    }
    
    console.log(`\n✅ 总共 ${menuItems.length} 个菜单分类`);
    console.log(`✅ 三个新中心已包含: ${foundCenters.length}/3\n`);
    
    if (foundCenters.length === 3) {
      console.log('🎉 验证成功！三个中心都能正确返回！\n');
      console.log('📝 下一步操作:');
      console.log('   1. 前端不需要重启（使用的是API数据）');
      console.log('   2. 清除浏览器缓存 (Ctrl + Shift + R)');
      console.log('   3. 重新登录');
      console.log('   4. 侧边栏应该会显示三个新中心\n');
    } else {
      console.log('⚠️ 警告：只找到 ' + foundCenters.length + '/3 个中心\n');
      console.log('请检查数据库配置是否正确\n');
    }
    
    await sequelize.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
})();

