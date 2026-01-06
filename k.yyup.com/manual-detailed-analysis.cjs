const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 手动详细分析页面类型 ===');
  
  // 获取所有菜单项
  const [allMenus] = await connection.execute(`
    SELECT id, name, chinese_name, path, component, type
    FROM permissions 
    WHERE type = 'menu' AND status = 1
    ORDER BY chinese_name, name
  `);
  
  console.log(`总共找到 ${allMenus.length} 个菜单项\n`);
  
  // 手动识别明显的详情页、编辑页、组件页
  const shouldRemove = [];
  const shouldKeep = [];
  
  for (const menu of allMenus) {
    const menuName = menu.name || '';
    const chineseName = menu.chinese_name || '';
    const path = menu.path || '';
    const component = menu.component || '';
    
    let shouldRemoveThis = false;
    let reason = '';
    
    // 1. 明显的详情页（基于中文名称）
    if (chineseName.includes('详情') && !chineseName.includes('概览')) {
      shouldRemoveThis = true;
      reason = '详情页面';
    }
    
    // 2. 明显的编辑页
    else if (chineseName.includes('编辑') || menuName.includes('Edit')) {
      shouldRemoveThis = true;
      reason = '编辑页面';
    }
    
    // 3. 明显的创建页
    else if (chineseName.includes('创建') || menuName.includes('Create')) {
      shouldRemoveThis = true;
      reason = '创建页面';
    }
    
    // 4. 明显的添加页
    else if (chineseName.includes('添加') || menuName.includes('Add')) {
      shouldRemoveThis = true;
      reason = '添加页面';
    }
    
    // 5. 表单组件
    else if (menuName.includes('Form') || chineseName.includes('表单')) {
      shouldRemoveThis = true;
      reason = '表单组件';
    }
    
    // 6. 对话框组件
    else if (menuName.includes('Dialog') || chineseName.includes('对话框')) {
      shouldRemoveThis = true;
      reason = '对话框组件';
    }
    
    // 7. 系统错误页面
    else if (menuName.match(/^(403|404|Login|ExamplePage|StandardTemplate|MessageTemplate)$/)) {
      shouldRemoveThis = true;
      reason = '系统页面';
    }
    
    // 8. 测试演示页面
    else if (menuName.includes('Demo') || menuName.includes('Test') || menuName.includes('Template')) {
      shouldRemoveThis = true;
      reason = '测试演示页';
    }
    
    // 9. 特殊的详情页面（基于路径和名称分析）
    else if (
      // 申请相关详情页
      (chineseName === '申请详情' || menuName === 'ApplicationDetail') ||
      (chineseName === '申请列表' && path.includes('Detail')) ||
      (menuName === 'ApplicationInterview') ||
      (menuName === 'ApplicationReview') ||
      
      // 活动相关详情页
      (chineseName === '活动详情' || menuName === 'ActivityDetail') ||
      (menuName === 'ActivityEdit') ||
      (menuName === 'ActivityCreate') ||
      
      // 学生相关详情页
      (chineseName.includes('学生详情') || menuName === 'StudentDetail') ||
      
      // 教师相关详情页
      (chineseName.includes('教师详情') || menuName === 'TeacherDetail') ||
      (chineseName.includes('教师绩效详情')) ||
      (menuName === 'TeacherEdit') ||
      
      // 班级相关详情页
      (chineseName.includes('班级详情') || menuName === 'ClassDetail') ||
      (menuName === 'ClassCreate') ||
      
      // 家长相关详情页
      (chineseName.includes('家长详情') || menuName === 'ParentDetail') ||
      (menuName === 'ParentEdit') ||
      
      // 客户相关详情页
      (chineseName.includes('客户详情')) ||
      
      // 计划相关详情页
      (chineseName.includes('计划详情') || menuName === 'PlanDetail') ||
      (menuName === 'PlanEdit') ||
      
      // 其他特殊页面
      (menuName === 'CampusOverview') ||
      (menuName === 'EnhancedExample')
    ) {
      shouldRemoveThis = true;
      reason = '详情/编辑页面';
    }
    
    // 10. 路径包含动态参数的
    else if (path.includes('/:') || path.includes('/_') || path.includes('[id]')) {
      shouldRemoveThis = true;
      reason = '动态路由页面';
    }
    
    if (shouldRemoveThis) {
      shouldRemove.push({ ...menu, reason });
    } else {
      shouldKeep.push({ ...menu, reason: '功能页面' });
    }
  }
  
  console.log('📊 分析结果统计:');
  console.log(`✅ 应保留的功能页面: ${shouldKeep.length} 个`);
  console.log(`❌ 应移除的页面: ${shouldRemove.length} 个`);
  
  console.log('\n=== 应移除的页面列表 ===');
  shouldRemove.forEach(menu => {
    console.log(`❌ [${menu.id}] ${menu.chinese_name || menu.name} -> ${menu.path} (${menu.reason})`);
  });
  
  console.log('\n=== 需要移除的菜单ID列表 ===');
  console.log('const itemsToRemove = [');
  shouldRemove.forEach(menu => {
    console.log(`  ${menu.id}, // ${menu.reason}: ${menu.chinese_name || menu.name}`);
  });
  console.log('];');
  
  console.log(`\n📋 总结: 建议保留 ${shouldKeep.length} 个功能页面，移除 ${shouldRemove.length} 个非功能页面`);
  
  await connection.end();
})().catch(console.error);
