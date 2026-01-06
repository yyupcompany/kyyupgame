const { Sequelize } = require('sequelize');

// 数据库配置
const sequelize = new Sequelize({
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  dialect: 'mysql',
  timezone: '+08:00',
  logging: false
});

async function scanSidebarMenus() {
  try {
    console.log('🔍 扫描数据库侧边栏菜单内容...');
    
    // 获取所有启用的菜单项
    const [menus] = await sequelize.query(`
      SELECT 
        id, 
        name, 
        chinese_name, 
        code, 
        type, 
        parent_id, 
        path, 
        component, 
        icon, 
        sort, 
        status,
        permission
      FROM permissions 
      WHERE status = 1 AND type IN ('category', 'menu', 'page')
      ORDER BY 
        CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END,
        parent_id ASC,
        sort ASC,
        id ASC
    `);
    
    console.log(`📋 找到 ${menus.length} 个菜单项`);
    
    // 构建菜单树结构
    const menuTree = {};
    const rootMenus = [];
    
    // 先处理所有菜单项
    menus.forEach(menu => {
      menuTree[menu.id] = {
        ...menu,
        children: []
      };
    });
    
    // 构建父子关系
    menus.forEach(menu => {
      if (menu.parent_id === null) {
        rootMenus.push(menuTree[menu.id]);
      } else if (menuTree[menu.parent_id]) {
        menuTree[menu.parent_id].children.push(menuTree[menu.id]);
      }
    });
    
    console.log('\n📁 侧边栏菜单结构:');
    console.log('='.repeat(80));
    
    function printMenu(menu, level = 0) {
      const indent = '  '.repeat(level);
      const typeIcon = menu.type === 'category' ? '📁' : menu.type === 'menu' ? '📄' : '🔗';
      const statusIcon = menu.status === 1 ? '✅' : '❌';
      
      console.log(`${indent}${typeIcon} ${statusIcon} ${menu.chinese_name || menu.name}`);
      console.log(`${indent}   ID: ${menu.id} | Path: ${menu.path || 'N/A'} | Component: ${menu.component || 'N/A'}`);
      console.log(`${indent}   Type: ${menu.type} | Permission: ${menu.permission || 'N/A'}`);
      
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => printMenu(child, level + 1));
      }
      console.log('');
    }
    
    rootMenus.forEach(menu => printMenu(menu));
    
    console.log('='.repeat(80));
    console.log(`📊 统计信息:`);
    console.log(`  - 总菜单项: ${menus.length}`);
    console.log(`  - 分类: ${menus.filter(m => m.type === 'category').length}`);
    console.log(`  - 菜单: ${menus.filter(m => m.type === 'menu').length}`);
    console.log(`  - 页面: ${menus.filter(m => m.type === 'page').length}`);
    console.log(`  - 有路径的: ${menus.filter(m => m.path && m.path !== '#').length}`);
    
    // 生成任务清单数据
    const taskList = [];
    
    function generateTasks(menu, categoryName = '') {
      if (menu.type === 'category') {
        categoryName = menu.chinese_name || menu.name;
      } else if (menu.path && menu.path !== '#' && menu.path !== 'Layout') {
        taskList.push({
          id: menu.id,
          name: menu.chinese_name || menu.name,
          path: menu.path,
          component: menu.component,
          category: categoryName,
          type: menu.type,
          permission: menu.permission,
          status: 'pending'
        });
      }
      
      if (menu.children && menu.children.length > 0) {
        menu.children.forEach(child => generateTasks(child, categoryName));
      }
    }
    
    rootMenus.forEach(menu => generateTasks(menu));
    
    console.log(`\n📝 生成任务清单: ${taskList.length} 个页面需要检测`);
    
    return { menus, rootMenus, taskList };
    
  } catch (error) {
    console.error('❌ 扫描菜单失败:', error);
  } finally {
    await sequelize.close();
  }
}

// 导出函数和直接执行
module.exports = { scanSidebarMenus };

if (require.main === module) {
  scanSidebarMenus();
}
