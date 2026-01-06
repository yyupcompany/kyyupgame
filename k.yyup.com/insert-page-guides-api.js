const axios = require('axios');

// 页面说明文档数据
const pageGuides = [
  {
    pagePath: '/centers/dashboard',
    pageName: '仪表板中心',
    pageDescription: '仪表板中心是幼儿园管理系统的核心控制台，提供全园数据的综合概览和关键指标监控。这里汇集了学生、教师、财务、活动等各个模块的核心数据，为管理者提供一站式的数据分析和决策支持平台。',
    category: '中心页面',
    importance: 10,
    relatedTables: ["students", "teachers", "classes", "activities", "enrollments", "finances", "system_statistics"],
    contextPrompt: '用户正在仪表板中心页面，这是系统的核心控制台。用户可能需要查看全园概况、关键指标、数据趋势等。请提供全面的数据分析和管理建议。',
    isActive: true
  },
  {
    pagePath: '/centers/personnel',
    pageName: '人事中心',
    pageDescription: '人事中心是幼儿园人力资源管理的核心平台，提供教师、学生、家长等所有人员信息的统一管理。这里可以进行人员档案管理、权限分配、绩效评估等全方位的人员管理功能。',
    category: '中心页面',
    importance: 9,
    relatedTables: ["teachers", "students", "parents", "users", "roles", "permissions", "teacher_performance"],
    contextPrompt: '用户正在人事中心页面，这是人力资源管理的核心平台。用户可能需要管理人员信息、分配权限、评估绩效等。请提供专业的人事管理建议。',
    isActive: true
  },
  {
    pagePath: '/centers/activity',
    pageName: '活动中心',
    pageDescription: '活动中心是幼儿园活动管理的专业平台，涵盖活动策划、报名管理、执行跟踪、效果评估等全流程功能。这里可以统一管理所有活动相关的功能，包括教学活动、文体活动、亲子活动等多种类型的活动。',
    category: '中心页面',
    importance: 9,
    relatedTables: ["activities", "activity_registrations", "activity_templates", "activity_evaluations", "activity_checkins"],
    contextPrompt: '用户正在活动中心页面，这是活动管理的专业平台。用户可能需要策划活动、管理报名、跟踪执行、分析效果等。请提供活动管理的专业指导。',
    isActive: true
  },
  {
    pagePath: '/centers/enrollment',
    pageName: '招生中心',
    pageDescription: '招生中心是幼儿园招生工作的核心平台，整合了招生计划、申请管理、咨询服务等全流程功能，为招生工作提供一站式解决方案。这里可以制定招生策略、处理入园申请、管理咨询服务、分析招生数据。',
    category: '中心页面',
    importance: 10,
    relatedTables: ["enrollment_plans", "enrollment_applications", "enrollment_consultations", "enrollment_statistics"],
    contextPrompt: '用户正在招生中心页面，这是招生工作的核心管理平台。用户可能需要查看招生数据、管理招生计划、处理申请等。请结合招生相关数据提供专业指导。',
    isActive: true
  },
  {
    pagePath: '/centers/marketing',
    pageName: '营销中心',
    pageDescription: '营销中心是幼儿园品牌建设和市场推广的专业平台，提供广告管理、营销活动、品牌宣传、市场分析等全方位的营销推广功能。这里可以进行招生宣传、品牌建设、市场调研等营销活动管理。',
    category: '中心页面',
    importance: 8,
    relatedTables: ["marketing_campaigns", "advertisements", "marketing_analytics", "customer_analytics", "poster_templates"],
    contextPrompt: '用户正在营销中心页面，这是品牌建设和市场推广的专业平台。用户可能需要策划营销活动、管理广告投放、分析市场效果等。请提供营销推广的专业建议。',
    isActive: true
  },
  {
    pagePath: '/centers/ai',
    pageName: 'AI中心',
    pageDescription: 'AI中心是人工智能功能的集中管理平台，包含AI查询、智能分析、模型管理等功能，为幼儿园提供智能化的数据分析和决策支持。这里可以进行自然语言查询、智能数据分析、AI模型配置等高级功能。',
    category: '中心页面',
    importance: 8,
    relatedTables: ["ai_query_history", "ai_model_configs", "ai_conversations", "ai_shortcuts"],
    contextPrompt: '用户正在AI中心页面，这里提供各种AI功能和服务。用户可能需要进行数据查询、AI分析或管理AI功能。请提供AI相关的专业建议。',
    isActive: true
  },
  {
    pagePath: '/centers/system',
    pageName: '系统管理',
    pageDescription: '系统管理是幼儿园管理系统的后台管理中心，提供用户管理、权限配置、系统设置、数据备份等核心管理功能。这里可以进行系统配置、用户权限管理、数据维护等系统级操作。',
    category: '中心页面',
    importance: 7,
    relatedTables: ["users", "roles", "permissions", "system_configs", "system_logs", "system_backups"],
    contextPrompt: '用户正在系统管理页面，这是系统的后台管理中心。用户可能需要管理用户权限、配置系统参数、维护数据等。请提供系统管理的专业指导。',
    isActive: true
  },
  {
    pagePath: '/centers/task',
    pageName: '任务中心',
    pageDescription: '任务中心是幼儿园工作任务管理的专业平台，提供任务创建、分配、跟踪、完成等全流程管理功能。这里可以统一管理各类工作任务，提高工作效率和协作水平。',
    category: '中心页面',
    importance: 7,
    relatedTables: ["tasks", "task_assignments", "task_comments", "task_attachments"],
    contextPrompt: '用户正在任务中心页面，这是工作任务管理的专业平台。用户可能需要创建任务、分配工作、跟踪进度等。请提供任务管理的专业建议。',
    isActive: true
  }
];

// 子页面数据
const subPages = [
  {
    pagePath: '/centers/personnel/students/overview',
    pageName: '学生概览',
    pageDescription: '学生管理的总览页面，展示学生总数、班级分布、年龄结构等关键统计信息',
    category: '子页面',
    importance: 8,
    relatedTables: ["students", "classes", "student_health", "student_growth"],
    contextPrompt: '用户正在查看学生概览页面，需要了解学生的整体情况和统计数据。',
    isActive: true
  },
  {
    pagePath: '/centers/personnel/students/list',
    pageName: '学生列表',
    pageDescription: '学生信息的详细列表页面，支持搜索、筛选、排序等功能',
    category: '子页面',
    importance: 9,
    relatedTables: ["students", "classes", "parents"],
    contextPrompt: '用户正在查看学生列表，可能需要查找特定学生或管理学生信息。',
    isActive: true
  },
  {
    pagePath: '/centers/personnel/teachers/overview',
    pageName: '教师概览',
    pageDescription: '教师管理的总览页面，展示教师总数、资质分布、绩效统计等关键信息',
    category: '子页面',
    importance: 8,
    relatedTables: ["teachers", "teacher_qualifications", "teacher_performance"],
    contextPrompt: '用户正在查看教师概览页面，需要了解教师队伍的整体情况。',
    isActive: true
  },
  {
    pagePath: '/centers/activity/planning/overview',
    pageName: '策划概览',
    pageDescription: '活动策划的总览页面，展示策划中的活动、策划进度、资源需求等信息',
    category: '子页面',
    importance: 7,
    relatedTables: ["activities", "activity_plans", "activity_resources"],
    contextPrompt: '用户正在查看活动策划概览，需要了解策划工作的整体进展。',
    isActive: true
  }
];

async function insertPageGuides() {
  const baseURL = 'http://localhost:3000/api';
  
  // 获取认证token（假设使用admin账户）
  let token;
  try {
    const loginResponse = await axios.post(`${baseURL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    token = loginResponse.data.token;
    console.log('✅ 登录成功，获取到token');
  } catch (error) {
    console.error('❌ 登录失败:', error.message);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 插入主页面说明文档
  console.log('📝 开始插入主页面说明文档...');
  for (const pageGuide of pageGuides) {
    try {
      const response = await axios.post(`${baseURL}/page-guides`, pageGuide, { headers });
      console.log(`✅ 插入成功: ${pageGuide.pageName} (${pageGuide.pagePath})`);
    } catch (error) {
      console.error(`❌ 插入失败: ${pageGuide.pageName} - ${error.response?.data?.message || error.message}`);
    }
  }

  // 插入子页面说明文档
  console.log('\n📝 开始插入子页面说明文档...');
  for (const subPage of subPages) {
    try {
      const response = await axios.post(`${baseURL}/page-guides`, subPage, { headers });
      console.log(`✅ 插入成功: ${subPage.pageName} (${subPage.pagePath})`);
    } catch (error) {
      console.error(`❌ 插入失败: ${subPage.pageName} - ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n🎉 页面说明文档插入完成！');
}

// 执行插入
insertPageGuides().catch(console.error);
