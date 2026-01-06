import { PageGuide, PageGuideSection } from '../models/page-guide.model';

/**
 * 页面说明文档种子数据服务
 */
export class PageGuideSeedService {
  /**
   * 初始化页面说明文档数据
   */
  public static async seedPageGuides(): Promise<void> {
    try {
      console.log('🌱 开始初始化页面说明文档数据...');

      // 检查是否已有数据
      const existingCount = await PageGuide.count();
      if (existingCount > 0) {
        console.log('✅ 页面说明文档数据已存在，跳过初始化');
        return;
      }

      // 创建活动中心页面说明文档
      const activityCenter = await PageGuide.create({
        pagePath: '/centers/activity',
        pageName: '活动中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是活动中心页面，这是招生环节非常重要的功能模块。我们为您提供全方位的活动管理解决方案，在这里您可以统一管理所有活动相关的功能，包括活动策划、活动发布、报名管理、签到统计、效果分析等，让每一场活动都能发挥最大的招生价值。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['activities', 'activity_registrations', 'activity_templates', 'activity_evaluations', 'activity_checkins'],
        contextPrompt: '用户正在活动中心页面，这是一个综合性的活动管理平台。用户可能需要查看活动数据、管理活动、分析活动效果等。请根据用户的具体问题，结合活动相关的数据库信息提供专业建议。',
        isActive: true
      });

      // 创建活动中心的功能板块
      await PageGuideSection.bulkCreate([
        {
          pageGuideId: activityCenter.id,
          sectionName: '活动中心首页',
          sectionDescription: '实时了解我们当前所有活动的最新看板数据，包括活动统计、参与情况、效果分析等关键指标',
          sectionPath: '/centers/activity?tab=overview',
          features: ['活动总数统计', '进行中活动', '报名人数统计', '平均评分', '实时数据看板', '快速操作入口'],
          sortOrder: 1,
          isActive: true
        },
        {
          pageGuideId: activityCenter.id,
          sectionName: '活动管理',
          sectionDescription: '全面的活动管理功能，包括活动列表查看、活动创建、编辑、删除等核心操作',
          sectionPath: '/centers/activity?tab=activities',
          features: ['活动列表', '活动创建', '活动编辑', '活动删除', '活动状态管理', '活动搜索筛选'],
          sortOrder: 2,
          isActive: true
        },
        {
          pageGuideId: activityCenter.id,
          sectionName: '活动模板',
          sectionDescription: '丰富的活动模板库，提供各种类型的活动模板，帮助快速创建标准化活动',
          sectionPath: '/centers/activity?tab=templates',
          features: ['模板库管理', '模板预览', '模板使用', '自定义模板', '模板分类', '模板统计'],
          sortOrder: 3,
          isActive: true
        },
        {
          pageGuideId: activityCenter.id,
          sectionName: '报名管理',
          sectionDescription: '完整的活动报名管理系统，处理报名申请、审核、统计等相关功能',
          sectionPath: '/centers/activity?tab=registrations',
          features: ['报名列表', '报名审核', '报名统计', '报名导出', '报名通知', '报名设置'],
          sortOrder: 4,
          isActive: true
        },
        {
          pageGuideId: activityCenter.id,
          sectionName: '数据分析',
          sectionDescription: '深度的活动数据分析，包括参与趋势、效果评估、满意度分析等',
          sectionPath: '/centers/activity?tab=analytics',
          features: ['参与趋势分析', '活动类型分布', '满意度统计', '效果对比', '数据可视化', '报表导出'],
          sortOrder: 5,
          isActive: true
        },
        {
          pageGuideId: activityCenter.id,
          sectionName: '海报管理',
          sectionDescription: '活动宣传海报的设计、生成、管理功能，支持多种模板和自定义设计',
          sectionPath: '/activity/poster',
          features: ['海报模板', '海报设计', '海报生成', '海报预览', '海报发布', '海报管理'],
          sortOrder: 6,
          isActive: true
        }
      ]);

      // 创建招生中心页面说明文档
      const enrollmentCenter = await PageGuide.create({
        pagePath: '/centers/enrollment',
        pageName: '招生中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是招生中心页面，这是幼儿园招生工作的核心平台。在这里您可以管理招生计划、处理入园申请、提供咨询服务、分析招生数据，我们整合了招生全流程功能，为您提供一站式的智能招生解决方案，让招生工作更高效、更精准。',
        category: '中心页面',
        importance: 10,
        relatedTables: ['enrollment_plans', 'enrollment_applications', 'enrollment_consultations', 'enrollment_statistics'],
        contextPrompt: '用户正在招生中心页面，这是招生工作的核心管理平台。用户可能需要查看招生数据、管理招生计划、处理申请等。请结合招生相关数据提供专业指导。',
        isActive: true
      });

      // 创建招生中心的功能板块
      await PageGuideSection.bulkCreate([
        {
          pageGuideId: enrollmentCenter.id,
          sectionName: '招生概览',
          sectionDescription: '招生工作的整体数据概览，包括招生进度、申请统计、转化率等关键指标',
          sectionPath: '/centers/enrollment?tab=overview',
          features: ['招生计划进度', '申请数量统计', '转化率分析', '招生趋势', '关键指标看板'],
          sortOrder: 1,
          isActive: true
        },
        {
          pageGuideId: enrollmentCenter.id,
          sectionName: '招生计划',
          sectionDescription: '招生计划的制定、管理和执行，包括名额分配、时间安排、策略制定等',
          sectionPath: '/centers/enrollment?tab=plans',
          features: ['计划制定', '名额管理', '时间安排', '策略配置', '计划执行监控'],
          sortOrder: 2,
          isActive: true
        },
        {
          pageGuideId: enrollmentCenter.id,
          sectionName: '申请管理',
          sectionDescription: '处理入园申请的完整流程，包括申请审核、资料管理、录取决策等',
          sectionPath: '/centers/enrollment?tab=applications',
          features: ['申请列表', '申请审核', '资料管理', '录取决策', '申请统计'],
          sortOrder: 3,
          isActive: true
        },
        {
          pageGuideId: enrollmentCenter.id,
          sectionName: '咨询服务',
          sectionDescription: '家长咨询的管理和跟进，包括咨询记录、回访安排、满意度调查等',
          sectionPath: '/centers/enrollment?tab=consultations',
          features: ['咨询记录', '回访管理', '满意度调查', '咨询统计', '服务质量监控'],
          sortOrder: 4,
          isActive: true
        }
      ]);

      // 创建AI中心页面说明文档
      const aiCenter = await PageGuide.create({
        pagePath: '/centers/ai',
        pageName: 'AI中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是AI中心页面，这是人工智能功能的集中管理平台。在这里您可以体验AI查询、智能分析、模型管理等前沿功能，我们的AI助手将为您提供智能化的数据分析和决策支持，让数据洞察变得更简单、更智能。',
        category: '中心页面',
        importance: 8,
        relatedTables: ['ai_query_history', 'ai_model_configs', 'ai_conversations', 'ai_shortcuts'],
        contextPrompt: '用户正在AI中心页面，这里提供各种AI功能和服务。用户可能需要进行数据查询、AI分析或管理AI功能。请提供AI相关的专业建议。',
        isActive: true
      });

      // 创建AI中心的功能板块
      await PageGuideSection.bulkCreate([
        {
          pageGuideId: aiCenter.id,
          sectionName: 'AI查询',
          sectionDescription: '智能数据查询功能，支持自然语言查询数据库，获取各种统计分析结果',
          sectionPath: '/centers/ai?tab=query',
          features: ['自然语言查询', '数据库查询', '查询历史', '结果导出', '查询模板'],
          sortOrder: 1,
          isActive: true
        },
        {
          pageGuideId: aiCenter.id,
          sectionName: '智能分析',
          sectionDescription: '基于AI的数据分析功能，提供深度洞察和预测分析',
          sectionPath: '/centers/ai?tab=analysis',
          features: ['趋势分析', '预测模型', '异常检测', '关联分析', '智能报告'],
          sortOrder: 2,
          isActive: true
        },
        {
          pageGuideId: aiCenter.id,
          sectionName: '模型管理',
          sectionDescription: 'AI模型的配置和管理，包括模型选择、参数调优、性能监控等',
          sectionPath: '/centers/ai?tab=models',
          features: ['模型配置', '性能监控', '参数调优', '模型切换', '使用统计'],
          sortOrder: 3,
          isActive: true
        },
        {
          pageGuideId: aiCenter.id,
          sectionName: '快捷操作',
          sectionDescription: '预设的AI快捷操作，提供常用的分析模板和操作流程',
          sectionPath: '/centers/ai?tab=shortcuts',
          features: ['快捷模板', '操作流程', '自定义快捷操作', '使用统计', '效果评估'],
          sortOrder: 4,
          isActive: true
        }
      ]);

      // 创建数据概览页面说明文档
      await PageGuide.create({
        pagePath: '/dashboard',
        pageName: '数据概览',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是数据概览页面，这是系统的主仪表板，为您提供幼儿园运营的全局数据概览。在这里您可以查看关键指标、趋势分析、进行快速操作，全面掌握幼儿园的运营状况。',
        category: '仪表板',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes'],
        contextPrompt: '用户正在主仪表板页面，这里显示幼儿园的整体运营数据。用户可能需要了解总体情况、查看关键指标或进行快速操作。',
        isActive: true
      });

      // 创建仪表板中心页面说明文档
      await PageGuide.create({
        pagePath: '/centers/dashboard',
        pageName: '仪表板中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是仪表板中心页面，这是系统的数据分析和决策支持中心。在这里您可以查看各类统计图表、关键业务指标、实时数据监控，以及获得智能分析建议，帮助您做出更好的管理决策。',
        category: '中心页面',
        importance: 9,
        relatedTables: ['students', 'teachers', 'activities', 'enrollment_applications', 'classes', 'statistics'],
        contextPrompt: '用户正在仪表板中心页面，这是一个综合性的数据分析平台。用户可能需要查看统计数据、分析趋势、获取决策建议等。',
        isActive: true
      });

      // 创建人事中心页面说明文档
      await PageGuide.create({
        pagePath: '/centers/personnel',
        pageName: '人事中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是人事中心页面，这是幼儿园人力资源管理的核心平台。在这里您可以管理教师信息、查看教师绩效、安排工作任务、进行人员培训管理，全面提升幼儿园的人力资源管理效率。',
        category: '中心页面',
        importance: 8,
        relatedTables: ['teachers', 'teacher_performance', 'teacher_schedules', 'teacher_training'],
        contextPrompt: '用户正在人事中心页面，这是人力资源管理的专业平台。用户可能需要管理教师信息、查看绩效数据、安排工作等。',
        isActive: true
      });

      // 创建营销中心页面说明文档
      await PageGuide.create({
        pagePath: '/centers/marketing',
        pageName: '营销中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是营销中心页面，这是幼儿园品牌推广和营销活动的专业平台。在这里您可以制定营销策略、管理推广活动、分析营销效果、优化投放渠道，全面提升幼儿园的品牌影响力和招生转化率。',
        category: '中心页面',
        importance: 8,
        relatedTables: ['marketing_campaigns', 'advertisements', 'marketing_analytics', 'customer_pool'],
        contextPrompt: '用户正在营销中心页面，这是营销推广的专业管理平台。用户可能需要制定营销策略、管理推广活动、分析营销效果等。',
        isActive: true
      });

      // 创建系统管理中心页面说明文档
      await PageGuide.create({
        pagePath: '/centers/system',
        pageName: '系统管理中心',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是系统管理中心页面，这是整个系统的控制核心。在这里您可以进行系统配置、用户管理、权限设置、数据备份、安全管理等关键操作，确保系统稳定高效运行。',
        category: '中心页面',
        importance: 7,
        relatedTables: ['users', 'roles', 'permissions', 'system_configs', 'system_logs'],
        contextPrompt: '用户正在系统管理中心页面，这是系统管理员的专业工作台。用户可能需要进行系统配置、用户管理、安全设置等管理操作。',
        isActive: true
      });

      // 创建登录页面说明文档
      await PageGuide.create({
        pagePath: '/login',
        pageName: '用户登录',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户登录页面，这是进入系统的安全入口。请使用您的账号和密码登录，系统支持多种用户角色（园长、教师、招生专员等），登录后您将根据权限访问相应的功能模块，开始您的智能招生管理之旅。',
        category: '认证页面',
        importance: 9,
        relatedTables: ['users', 'user_sessions', 'login_logs'],
        contextPrompt: '用户正在登录页面，准备进入系统。用户可能需要了解登录流程、忘记密码处理、账号权限说明等。请提供友好的登录指导。',
        isActive: true
      });

      // 创建注册页面说明文档
      await PageGuide.create({
        pagePath: '/register',
        pageName: '用户注册',
        pageDescription: '欢迎使用婴婴向上智能招生系统！您现在来到的是用户注册页面，这是创建新账户的地方。请填写准确的个人信息和联系方式，选择合适的用户角色，我们将为您创建专属账户，让您快速开始使用我们的智能招生管理功能。',
        category: '认证页面',
        importance: 8,
        relatedTables: ['users', 'user_profiles', 'registration_logs'],
        contextPrompt: '用户正在注册页面，准备创建新账户。用户可能需要了解注册流程、角色权限、信息填写要求等。请提供详细的注册指导。',
        isActive: true
      });

      console.log('✅ 页面说明文档数据初始化完成');
    } catch (error) {
      console.error('❌ 页面说明文档数据初始化失败:', error);
      throw error;
    }
  }
}
