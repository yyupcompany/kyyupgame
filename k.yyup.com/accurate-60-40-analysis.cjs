const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 按60%组件页面、40%菜单页面比例分析 ===');
  
  // 获取所有菜单项
  const [allMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path, component, type
    FROM permissions 
    WHERE type = 'menu' AND status = 1
    ORDER BY id
  `);
  
  console.log(`总共 ${allMenus.length} 个菜单项`);
  console.log(`按40%比例，应保留约 ${Math.round(allMenus.length * 0.4)} 个功能页面菜单`);
  console.log(`按60%比例，应移除约 ${Math.round(allMenus.length * 0.6)} 个组件页面\n`);
  
  // 真正的功能页面菜单（主要业务入口页面）
  const functionalMenus = [];
  // 组件页面（详情页、编辑页、表单页、子页面等）
  const componentPages = [];
  
  for (const menu of allMenus) {
    const menuName = menu.name || '';
    const chineseName = menu.chinese_name || '';
    const path = menu.path || '';
    
    let isComponent = false;
    let reason = '';
    
    // 1. 明显的组件页面特征
    if (
      // 详情页
      chineseName.includes('详情') ||
      menuName.includes('Detail') ||
      
      // 编辑页
      chineseName.includes('编辑') ||
      menuName.includes('Edit') ||
      
      // 创建/添加页
      chineseName.includes('创建') || chineseName.includes('添加') ||
      menuName.includes('Create') || menuName.includes('Add') ||
      
      // 表单组件
      menuName.includes('Form') ||
      
      // 对话框组件
      menuName.includes('Dialog') ||
      
      // 系统页面
      menuName.match(/^(403|404|Login|ExamplePage|StandardTemplate|MessageTemplate)$/) ||
      
      // 测试演示页
      menuName.includes('Demo') || menuName.includes('Test') || menuName.includes('Template') ||
      
      // 子功能页面（通常从主页面跳转）
      chineseName.includes('分析详情') || chineseName.includes('绩效详情') ||
      
      // 动态路由页面
      path.includes('/:') || path.includes('/_') || path.includes('[id]') ||
      
      // 特定的组件页面
      menuName.match(/(Interface|Management|Analytics|Optimization|Evaluation|Assessment|Development)$/) ||
      
      // 子模块页面
      path.includes('/analytics/') || path.includes('/evaluation/') || 
      path.includes('/optimization/') || path.includes('/management/') ||
      path.includes('/assessment/') || path.includes('/development/') ||
      
      // 智能功能子页面
      chineseName.includes('智能分析') || chineseName.includes('智能管理') || 
      chineseName.includes('智能优化') || chineseName.includes('智能引擎') ||
      
      // 特殊功能页面
      menuName.match(/(ChatInterface|ExpertConsultationPage|MemoryManagementPage|ModelManagementPage)/) ||
      menuName.match(/(AssignActivity|ChildGrowth|FollowUp|PosterEditor|PosterGenerator|PosterTemplates)/) ||
      
      // 报表和统计子页面
      chineseName.includes('统计报表') && !chineseName.includes('管理') ||
      chineseName.includes('数据分析') && !chineseName.includes('概览') ||
      
      // 其他明显的子页面
      chineseName.match(/(跟进记录|儿童成长|儿童列表|绩效规则|海报编辑|海报生成|海报模板)/) ||
      
      // 路径层级较深的页面（通常是子功能）
      (path.split('/').length > 3)
    ) {
      isComponent = true;
      reason = '组件/子页面';
    }
    
    if (isComponent) {
      componentPages.push({ ...menu, reason });
    } else {
      functionalMenus.push({ ...menu, reason: '功能页面' });
    }
  }
  
  console.log('📊 分析结果统计:');
  console.log(`✅ 功能页面菜单: ${functionalMenus.length} 个 (${Math.round(functionalMenus.length/allMenus.length*100)}%)`);
  console.log(`❌ 组件页面: ${componentPages.length} 个 (${Math.round(componentPages.length/allMenus.length*100)}%)`);
  
  console.log('\n=== 应保留的功能页面菜单 ===');
  functionalMenus.forEach(menu => {
    console.log(`✅ [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  console.log('\n=== 应移除的组件页面 ===');
  componentPages.forEach(menu => {
    console.log(`❌ [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path}`);
  });
  
  console.log('\n=== 需要移除的菜单ID列表 ===');
  console.log('const itemsToRemove = [');
  componentPages.forEach(menu => {
    console.log(`  ${menu.id}, // ${menu.chinese_name || menu.name}`);
  });
  console.log('];');
  
  console.log(`\n📋 总结: 保留 ${functionalMenus.length} 个功能页面菜单，移除 ${componentPages.length} 个组件页面`);
  console.log(`比例: ${Math.round(functionalMenus.length/allMenus.length*100)}% 功能页面，${Math.round(componentPages.length/allMenus.length*100)}% 组件页面`);
  
  await connection.end();
})().catch(console.error);
