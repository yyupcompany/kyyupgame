/**
 * 添加AI专家咨询页面的页面说明文档
 */

const { Sequelize } = require('sequelize');
const { initPageGuide, initPageGuideSection, initPageGuideAssociations, PageGuide, PageGuideSection } = require('../dist/models/page-guide.model');

// 数据库配置
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: 'dbconn.sealoshzh.site',
  port: 43906,
  database: 'kargerdensales',
  username: 'root',
  password: 'pwk5ls7j',
  logging: console.log,
  timezone: '+08:00',
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  },
  define: {
    charset: 'utf8mb4',
    dialectOptions: {
      collate: 'utf8mb4_unicode_ci'
    }
  }
});

async function addExpertConsultationPageGuide() {
  try {
    console.log('🔗 连接数据库...');
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 初始化模型
    console.log('🔧 初始化模型...');
    initPageGuide(sequelize);
    initPageGuideSection(sequelize);
    initPageGuideAssociations();
    console.log('✅ 模型初始化完成');

    // 检查是否已存在AI专家咨询页面的说明文档
    const existingGuide = await PageGuide.findOne({
      where: { pagePath: '/ai-center/expert-consultation' }
    });

    if (existingGuide) {
      console.log('✅ AI专家咨询页面说明文档已存在，跳过创建');
      return;
    }

    console.log('📝 创建AI专家咨询页面说明文档...');

    // 创建AI专家咨询页面说明文档
    const expertConsultationGuide = await PageGuide.create({
      pagePath: '/ai-center/expert-consultation',
      pageName: 'AI专家咨询',
      pageDescription: '欢迎使用婴婴向上智能招生系统的AI专家咨询功能！这是一个革命性的智能咨询平台，汇聚了招生策划、心理学、投资分析、园长管理、执行教师、家长体验等6位专业AI专家。您只需提出问题，我们的专家团队将从不同角度为您提供全方位的专业分析和建议，帮助您制定最优的招生策略和管理方案。',
      category: 'AI功能页面',
      importance: 9,
      relatedTables: [
        'expert_consultations',
        'expert_speeches', 
        'consultation_summaries',
        'action_plans',
        'enrollment_applications',
        'marketing_campaigns',
        'activities',
        'students',
        'teachers'
      ],
      contextPrompt: '用户正在AI专家咨询页面，这是一个多专家智能咨询平台。用户可能需要获得招生策略建议、管理指导、活动策划等专业咨询。请结合用户的具体问题，协助专家团队提供全面的分析和建议。',
      isActive: true
    });

    console.log('✅ AI专家咨询页面说明文档创建成功，ID:', expertConsultationGuide.id);

    // 创建功能板块
    console.log('📝 创建功能板块...');
    
    await PageGuideSection.bulkCreate([
      {
        pageGuideId: expertConsultationGuide.id,
        sectionName: '专家咨询对话',
        sectionDescription: '与6位AI专家进行实时对话咨询，获得多角度的专业分析和建议',
        sectionPath: '/ai-center/expert-consultation#chat',
        features: [
          '多专家同时咨询',
          '实时对话交互', 
          '专业分析报告',
          '个性化建议',
          '咨询历史记录'
        ],
        sortOrder: 1,
        isActive: true
      },
      {
        pageGuideId: expertConsultationGuide.id,
        sectionName: '专家团队',
        sectionDescription: '查看6位专业AI专家的详细信息、专长领域和服务能力',
        sectionPath: '/ai-center/expert-consultation#experts',
        features: [
          '招生策划专家',
          '心理学专家',
          '投资分析专家',
          '园长管理专家',
          '执行教师专家',
          '家长体验专家'
        ],
        sortOrder: 2,
        isActive: true
      },
      {
        pageGuideId: expertConsultationGuide.id,
        sectionName: '快速测试',
        sectionDescription: '预设的常见咨询场景，快速体验专家咨询功能',
        sectionPath: '/ai-center/expert-consultation#quick-test',
        features: [
          '秋季招生活动',
          '家长转化问题',
          '竞品分析策略',
          '综合方案规划'
        ],
        sortOrder: 3,
        isActive: true
      },
      {
        pageGuideId: expertConsultationGuide.id,
        sectionName: '咨询汇总',
        sectionDescription: '自动生成的专家咨询汇总报告，包含综合分析和行动建议',
        sectionPath: '/ai-center/expert-consultation#summary',
        features: [
          '综合分析报告',
          '核心洞察提取',
          '最终建议汇总',
          '行动计划生成',
          '效果评估指标'
        ],
        sortOrder: 4,
        isActive: true
      }
    ]);

    console.log('✅ 功能板块创建成功');

    // 验证创建结果
    const createdGuide = await PageGuide.findOne({
      where: { pagePath: '/ai-center/expert-consultation' },
      include: [{ model: PageGuideSection, as: 'sections' }]
    });

    if (createdGuide) {
      console.log('✅ 验证成功 - 页面说明文档已创建');
      console.log(`   页面名称: ${createdGuide.pageName}`);
      console.log(`   功能板块数量: ${createdGuide.sections?.length || 0}`);
    }

    console.log('🎉 AI专家咨询页面说明文档添加完成！');

  } catch (error) {
    console.error('❌ 添加页面说明文档失败:', error);
    throw error;
  } finally {
    await sequelize.close();
    console.log('🔒 数据库连接已关闭');
  }
}

// 执行脚本
if (require.main === module) {
  addExpertConsultationPageGuide()
    .then(() => {
      console.log('✅ 脚本执行完成');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      process.exit(1);
    });
}

module.exports = { addExpertConsultationPageGuide };
