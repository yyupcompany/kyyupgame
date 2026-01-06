const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 手动分析页面类型：功能页面 vs 组件功能 ===');
  
  // 获取所有菜单项
  const [allMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path, component, type
    FROM permissions 
    WHERE type = 'menu' AND status = 1
    ORDER BY path
  `);
  
  console.log(`总共找到 ${allMenus.length} 个菜单项`);
  
  // 手动分类规则 - 基于实际文件结构分析
  const functionalPages = []; // 真正的功能页面（应保留为菜单）
  const componentPages = []; // 组件功能（应移除菜单）
  const detailPages = []; // 详情/编辑页（应移除菜单）
  const systemPages = []; // 系统/测试页（应移除菜单）
  
  for (const menu of allMenus) {
    const menuName = menu.name || '';
    const chineseName = menu.chinese_name || '';
    const path = menu.path || '';
    const component = menu.component || '';
    
    let category = '';
    let shouldKeep = true;
    
    // 1. 系统错误页面和登录页面
    if (path.match(/^\/40[0-9]$|^\/50[0-9]$/) || 
        menuName.match(/^(403|404|Login|ExamplePage)$/i) ||
        path.includes('login')) {
      category = '系统页面';
      shouldKeep = false;
      systemPages.push({ ...menu, category });
      continue;
    }
    
    // 2. 测试和演示页面
    if (menuName.match(/(Demo|Test|Example|Template)$/i) ||
        path.includes('demo') || path.includes('test') ||
        chineseName.includes('测试') || chineseName.includes('演示')) {
      category = '测试/演示页';
      shouldKeep = false;
      systemPages.push({ ...menu, category });
      continue;
    }
    
    // 3. 表单组件和对话框组件
    if (menuName.match(/(Form|Dialog|Modal|Component)$/i) ||
        component.match(/(Form|Dialog|Modal|Component)$/i)) {
      category = 'UI组件';
      shouldKeep = false;
      componentPages.push({ ...menu, category });
      continue;
    }
    
    // 4. 详情页、编辑页、创建页（通常从列表页跳转）
    if (menuName.match(/(Detail|Edit|Create|Add|View)$/i) ||
        chineseName.match(/(详情|编辑|创建|添加|查看)$/) ||
        path.includes('/detail') || path.includes('/edit') ||
        path.includes('/create') || path.includes('/add') ||
        path.includes('/:') || path.includes('/_')) {
      category = '详情/编辑页';
      shouldKeep = false;
      detailPages.push({ ...menu, category });
      continue;
    }
    
    // 5. 特殊的详情页面（基于中文名称）
    if (chineseName.match(/(申请详情|活动详情|学生详情|教师详情|班级详情|客户详情|家长详情|计划详情|绩效详情)/) ||
        menuName.match(/(ApplicationInterview|ApplicationReview|CampusOverview|ClassCreate|PlanEdit|ParentEdit|EnhancedExample)/)) {
      category = '详情/编辑页';
      shouldKeep = false;
      detailPages.push({ ...menu, category });
      continue;
    }
    
    // 6. 保留的功能页面 - 主要的业务功能入口
    functionalPages.push({ ...menu, category: '功能页面' });
  }
  
  console.log('\n📊 分析结果统计:');
  console.log(`✅ 功能页面（应保留为菜单）: ${functionalPages.length} 个`);
  console.log(`🔧 UI组件（应移除菜单）: ${componentPages.length} 个`);
  console.log(`📝 详情/编辑页（应移除菜单）: ${detailPages.length} 个`);
  console.log(`🛠️ 系统/测试页（应移除菜单）: ${systemPages.length} 个`);
  
  console.log('\n=== 功能页面（应保留为菜单）===');
  functionalPages.forEach(menu => {
    console.log(`✅ [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  console.log('\n=== UI组件（应移除菜单）===');
  componentPages.forEach(menu => {
    console.log(`🔧 [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  console.log('\n=== 详情/编辑页（应移除菜单）===');
  detailPages.forEach(menu => {
    console.log(`📝 [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  console.log('\n=== 系统/测试页（应移除菜单）===');
  systemPages.forEach(menu => {
    console.log(`🛠️ [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  // 生成需要移除的ID列表
  const toRemove = [...componentPages, ...detailPages, ...systemPages];
  console.log('\n=== 需要移除的菜单ID列表 ===');
  console.log('const itemsToRemove = [');
  toRemove.forEach(menu => {
    console.log(`  ${menu.id}, // ${menu.category}: ${menu.chinese_name || menu.name}`);
  });
  console.log('];');
  
  console.log(`\n📋 总结: 建议保留 ${functionalPages.length} 个功能页面，移除 ${toRemove.length} 个非功能页面`);
  
  await connection.end();
})().catch(console.error);
