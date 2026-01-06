const mysql = require('mysql2/promise');

(async () => {
  const connection = await mysql.createConnection({
    host: 'dbconn.sealoshzh.site',
    port: 43906,
    user: 'root',
    password: 'pwk5ls7j',
    database: 'kargerdensales'
  });
  
  console.log('=== 第二步：归类菜单到对应分类 ===');
  
  // 分类ID映射
  const categoryIds = {
    'enrollment-management': 2008,  // 招生管理
    'activity-management': 2009,    // 活动管理
    'student-management': 2010,     // 学生管理
    'teacher-management': 2011,     // 教师管理
    'class-management': 2012,       // 班级管理
    'system-management': 2013       // 系统管理
  };
  
  // 定义菜单归类规则
  const menuClassification = [
    // 招生管理相关
    {
      categoryId: categoryIds['enrollment-management'],
      categoryName: '招生管理',
      patterns: [
        'enrollment', 'recruit', '招生', '报名', '咨询', 'inquiry', 
        'lead', 'prospect', '意向', '客户', 'customer', 'parent'
      ]
    },
    // 活动管理相关
    {
      categoryId: categoryIds['activity-management'],
      categoryName: '活动管理',
      patterns: [
        'activity', 'event', '活动', '赛事', 'competition', 'poster', 
        '海报', 'marketing', '营销', 'campaign'
      ]
    },
    // 学生管理相关
    {
      categoryId: categoryIds['student-management'],
      categoryName: '学生管理',
      patterns: [
        'student', 'child', '学生', '儿童', '幼儿', 'attendance', 
        '考勤', 'grade', '成绩', 'assessment', '评估'
      ]
    },
    // 教师管理相关
    {
      categoryId: categoryIds['teacher-management'],
      categoryName: '教师管理',
      patterns: [
        'teacher', 'staff', '教师', '员工', 'performance', '绩效',
        'training', '培训', 'schedule', '排课'
      ]
    },
    // 班级管理相关
    {
      categoryId: categoryIds['class-management'],
      categoryName: '班级管理',
      patterns: [
        'class', 'classroom', '班级', '教室', 'course', '课程',
        'curriculum', '课表', 'timetable'
      ]
    },
    // 系统管理相关
    {
      categoryId: categoryIds['system-management'],
      categoryName: '系统管理',
      patterns: [
        'system', 'admin', 'setting', 'config', '系统', '管理',
        'user', 'role', 'permission', '权限', '角色', '用户'
      ]
    }
  ];
  
  // 获取所有需要归类的根级菜单
  const [rootMenus] = await connection.execute(`
    SELECT id, name, chinese_name, code, path, component
    FROM permissions 
    WHERE parent_id IS NULL AND type = 'menu' AND status = 1
    ORDER BY id
  `);
  
  console.log('找到 ' + rootMenus.length + ' 个需要归类的根级菜单');
  
  let classifiedCount = 0;
  let unclassifiedMenus = [];
  
  // 对每个菜单进行分类
  for (const menu of rootMenus) {
    let classified = false;
    const menuText = (menu.name + ' ' + (menu.chinese_name || '') + ' ' + (menu.code || '') + ' ' + (menu.path || '') + ' ' + (menu.component || '')).toLowerCase();
    
    // 尝试匹配每个分类
    for (const category of menuClassification) {
      const matched = category.patterns.some(pattern => 
        menuText.includes(pattern.toLowerCase())
      );
      
      if (matched) {
        try {
          // 更新菜单的parent_id
          await connection.execute(
            'UPDATE permissions SET parent_id = ?, updated_at = NOW() WHERE id = ?',
            [category.categoryId, menu.id]
          );
          
          console.log('✅ [' + menu.id + '] ' + (menu.chinese_name || menu.name) + ' -> ' + category.categoryName);
          classifiedCount++;
          classified = true;
          break;
        } catch (error) {
          console.error('❌ 归类失败 [' + menu.id + '] ' + (menu.chinese_name || menu.name) + ': ' + error.message);
        }
      }
    }
    
    if (!classified) {
      unclassifiedMenus.push(menu);
    }
  }
  
  console.log('');
  console.log('📊 归类统计:');
  console.log('✅ 已归类: ' + classifiedCount + ' 个菜单');
  console.log('⚠️ 未归类: ' + unclassifiedMenus.length + ' 个菜单');
  
  if (unclassifiedMenus.length > 0) {
    console.log('');
    console.log('📋 未归类的菜单:');
    unclassifiedMenus.forEach(menu => {
      console.log('   [' + menu.id + '] ' + (menu.chinese_name || menu.name) + ' -> ' + menu.path);
    });
  }
  
  await connection.end();
})().catch(console.error);
