// 创建页面说明文档的脚本
const axios = require('axios');

const baseURL = 'http://localhost:3000/api';

// 九个中心的页面说明文档数据
const pageGuides = [
  {
    pagePath: '/centers/dashboard',
    pageName: '仪表板中心',
    pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
    category: '中心页面',
    importance: 9,
    relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
    contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
    isActive: true
  },
  {
    pagePath: '/centers/personnel',
    pageName: '人员中心',
    pageDescription: '人员中心是管理幼儿园所有人员信息的核心平台。在这里您可以管理教师、学生、家长等各类人员的基本信息、角色权限、工作安排等，实现人员信息的统一管理和高效协调。',
    category: '中心页面',
    importance: 8,
    relatedTables: ['teachers', 'students', 'parents', 'users', 'user_roles'],
    contextPrompt: '用户正在人员中心页面，主要关注人员管理相关功能。用户可能需要查看、添加、编辑人员信息，分配角色权限等。',
    isActive: true
  },
  {
    pagePath: '/centers/enrollment',
    pageName: '招生中心',
    pageDescription: '招生中心是幼儿园招生工作的专业管理平台。在这里您可以管理招生计划、处理入学申请、安排面试、发布录取通知等，全面支持招生流程的数字化管理。',
    category: '中心页面',
    importance: 9,
    relatedTables: ['enrollment_applications', 'enrollment_plans', 'enrollment_quotas', 'admission_results'],
    contextPrompt: '用户正在招生中心页面，专注于招生管理工作。用户可能需要处理申请、安排面试、管理招生计划等。',
    isActive: true
  },
  {
    pagePath: '/centers/activity',
    pageName: '活动中心',
    pageDescription: '活动中心是幼儿园活动管理的综合平台。在这里您可以策划、组织、管理各类教育活动、文体活动、节日庆典等，提供完整的活动生命周期管理功能。',
    category: '中心页面',
    importance: 8,
    relatedTables: ['activities', 'activity_registrations', 'activity_evaluations', 'activity_plans'],
    contextPrompt: '用户正在活动中心页面，关注活动管理相关功能。用户可能需要创建活动、管理报名、查看评价等。',
    isActive: true
  },
  {
    pagePath: '/centers/task',
    pageName: '任务中心',
    pageDescription: '任务中心是工作任务管理的集中平台。在这里您可以创建、分配、跟踪各类工作任务，实现任务的有序管理和高效执行，提升团队协作效率。',
    category: '中心页面',
    importance: 7,
    relatedTables: ['todos', 'schedules', 'performance_evaluations'],
    contextPrompt: '用户正在任务中心页面，专注于任务管理功能。用户可能需要创建任务、分配工作、跟踪进度等。',
    isActive: true
  },
  {
    pagePath: '/centers/ai',
    pageName: 'AI中心',
    pageDescription: 'AI中心是智能功能的控制台。在这里您可以使用AI助手、智能分析、自动化工具等先进功能，体验人工智能为幼儿园管理带来的便利和效率提升。',
    category: '中心页面',
    importance: 8,
    relatedTables: ['ai_sessions', 'ai_messages', 'ai_models', 'ai_quotas'],
    contextPrompt: '用户正在AI中心页面，希望使用智能功能。用户可能需要AI咨询、智能分析、自动化处理等服务。',
    isActive: true
  },
  {
    pagePath: '/centers/system',
    pageName: '系统中心',
    pageDescription: '系统中心是系统管理和配置的核心平台。在这里您可以进行系统设置、权限管理、数据备份、日志查看等系统级操作，确保系统稳定运行。',
    category: '中心页面',
    importance: 7,
    relatedTables: ['system_configs', 'system_logs', 'permissions', 'roles'],
    contextPrompt: '用户正在系统中心页面，进行系统管理工作。用户可能需要配置系统、管理权限、查看日志等。',
    isActive: true
  },
  {
    pagePath: '/centers/marketing',
    pageName: '营销中心',
    pageDescription: '营销中心是幼儿园营销推广的专业平台。在这里您可以管理营销活动、分析推广效果、处理客户咨询、制作宣传材料等，全面支持招生营销工作。',
    category: '中心页面',
    importance: 8,
    relatedTables: ['marketing_campaigns', 'advertisements', 'conversion_tracking', 'referral_codes'],
    contextPrompt: '用户正在营销中心页面，专注于营销推广工作。用户可能需要创建营销活动、分析效果、管理客户等。',
    isActive: true
  },
  {
    pagePath: '/centers/customer-pool',
    pageName: '客户池中心',
    pageDescription: '客户池中心是客户关系管理的核心平台。在这里您可以管理潜在客户、跟踪客户状态、分析客户需求、维护客户关系，实现精准的客户管理和服务。',
    category: '中心页面',
    importance: 8,
    relatedTables: ['customer_pool', 'chat_sessions', 'enrollment_consultations'],
    contextPrompt: '用户正在客户池中心页面，关注客户管理功能。用户可能需要查看客户信息、跟踪客户状态、分析客户需求等。',
    isActive: true
  },
  // 活动管理子页面
  {
    pagePath: '/activity/create',
    pageName: '创建活动',
    pageDescription: '活动创建页面是策划和组织幼儿园活动的专业工具。在这里您可以设计活动方案、配置活动参数、制作活动海报、设置报名规则等，支持AI智能策划功能，帮助您快速创建高质量的教育活动。',
    category: '活动管理',
    importance: 8,
    relatedTables: ['activities', 'activity_plans', 'activity_registrations', 'enrollment_plans'],
    contextPrompt: '用户正在创建活动页面，专注于活动策划工作。用户可能需要设计活动方案、配置活动参数、制作海报、设置报名规则等。支持AI智能策划功能，可以根据用户需求自动生成活动方案。',
    isActive: true
  }
];

async function createPageGuides() {
  console.log('🚀 开始创建页面说明文档...');
  
  for (const guide of pageGuides) {
    try {
      console.log(`📝 创建 ${guide.pageName} 的页面说明文档...`);
      
      const response = await axios.post(`${baseURL}/page-guides`, guide, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data.success) {
        console.log(`✅ ${guide.pageName} 页面说明文档创建成功`);
      } else {
        console.log(`❌ ${guide.pageName} 页面说明文档创建失败:`, response.data.message);
      }
    } catch (error) {
      console.error(`❌ ${guide.pageName} 页面说明文档创建出错:`, error.message);
    }
  }
  
  console.log('🎉 页面说明文档创建完成！');
}

// 执行创建
createPageGuides();
