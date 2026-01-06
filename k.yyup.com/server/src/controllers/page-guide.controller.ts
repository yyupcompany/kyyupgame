import { Request, Response } from 'express';
import { PageGuide, PageGuideSection } from '../models/page-guide.model';
import { sequelize } from '../config/database';

/**
 * 页面说明文档控制器
 */
export class PageGuideController {
  /**
   * 根据页面路径获取页面说明文档
   */
  public static async getPageGuide(req: Request, res: Response): Promise<void> {
    try {
      const { pagePath } = req.params;

      if (!pagePath) {
        res.status(400).json({
          success: false,
          message: '页面路径不能为空'
        });
        return;
      }

      // 解码URL路径
      const decodedPath = decodeURIComponent(pagePath);

      console.log('🔍 查找页面说明文档:', decodedPath);

      // 首先尝试精确匹配
      let pageGuide = await PageGuide.findOne({
        where: {
          pagePath: decodedPath,
          isActive: true
        },
        include: [
          {
            model: PageGuideSection,
            as: 'sections',
            where: { isActive: true },
            required: false,
            order: [['sortOrder', 'ASC']]
          }
        ]
      });

      // 如果精确匹配失败，尝试动态路径匹配
      if (!pageGuide) {
        console.log('🔄 精确匹配失败，尝试动态路径匹配...');

        // 获取所有活跃的页面说明文档
        const allPageGuides = await PageGuide.findAll({
          where: {
            isActive: true
          },
          include: [
            {
              model: PageGuideSection,
              as: 'sections',
              where: { isActive: true },
              required: false,
              order: [['sortOrder', 'ASC']]
            }
          ]
        });

        // 尝试匹配动态路径
        for (const guide of allPageGuides) {
          if (PageGuideController.matchDynamicPath(guide.pagePath, decodedPath)) {
            pageGuide = guide;
            console.log('✅ 动态路径匹配成功:', guide.pagePath, '->', decodedPath);
            break;
          }
        }
      }

      if (!pageGuide) {
        console.log('ℹ️  未找到页面说明文档，返回空对象:', decodedPath);
        // 返回空对象而不是404错误，避免前端显示错误提示
        res.status(200).json({
          success: true,
          data: null,
          message: '该页面暂无说明文档'
        });
        return;
      }

      console.log('✅ 找到页面说明文档:', pageGuide.pageName);
      res.status(200).json({
        success: true,
        data: pageGuide,
        message: '页面说明文档获取成功'
      });

    } catch (error) {
      console.error('❌ 获取页面说明文档失败:', error);
      res.status(500).json({
        success: false,
        message: '获取页面说明文档失败'
      });
    }
  }

  /**
   * 匹配动态路径
   * @param pattern 路径模式，如 /activity/detail/:id
   * @param path 实际路径，如 /activity/detail/15
   * @returns 是否匹配
   */
  private static matchDynamicPath(pattern: string, path: string): boolean {
    // 将路径模式转换为正则表达式
    // :id -> ([^/]+)
    // :slug -> ([^/]+)
    // * -> (.*)
    const regexPattern = pattern
      .replace(/:[^/]+/g, '([^/]+)')  // 参数占位符
      .replace(/\*/g, '(.*)')         // 通配符
      .replace(/\//g, '\\/');         // 转义斜杠

    const regex = new RegExp(`^${regexPattern}$`);
    const isMatch = regex.test(path);

    if (isMatch) {
      console.log(`🎯 路径匹配成功: ${pattern} -> ${path}`);
    }

    return isMatch;
  }

  /**
   * 获取所有页面说明文档列表
   */
  public static async getPageGuideList(req: Request, res: Response): Promise<void> {
    try {
      const { page = 1, pageSize = 20, category } = req.query;
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      // 构建查询条件
      const whereCondition: any = { isActive: true };
      if (category) {
        whereCondition.category = category;
      }

      // 查询页面说明文档
      const { count, rows } = await PageGuide.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: PageGuideSection,
            as: 'sections',
            where: { isActive: true },
            required: false,
            order: [['sortOrder', 'ASC']]
          }
        ],
        order: [['importance', 'DESC'], ['createdAt', 'DESC']],
        offset,
        limit
      });

      const result = {
        data: rows,
        pagination: {
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      };

      res.status(200).json({
        success: true,
        data: result,
        message: '页面说明文档列表获取成功'
      });
    } catch (error) {
      console.error('❌ 获取页面说明文档列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取页面说明文档列表失败'
      });
    }
  }

  /**
   * 创建页面说明文档
   */
  public static async createPageGuide(req: Request, res: Response): Promise<void> {
    try {
      const {
        pagePath,
        pageName,
        pageDescription,
        category,
        importance,
        relatedTables,
        contextPrompt,
        isActive
      } = req.body;

      if (!pagePath || !pageName) {
        res.status(400).json({
          success: false,
          message: '页面路径和页面名称不能为空'
        });
        return;
      }

      console.log('📝 创建页面说明文档:', pagePath);

      // 检查是否已存在
      const existingGuide = await PageGuide.findOne({
        where: { pagePath }
      });

      if (existingGuide) {
        // 更新现有记录
        await existingGuide.update({
          pageName,
          pageDescription,
          category,
          importance: importance || 5,
          relatedTables: relatedTables || [],
          contextPrompt,
          isActive: isActive !== undefined ? isActive : true
        });

        console.log('✅ 页面说明文档更新成功:', pagePath);
        res.json({
          success: true,
          message: '页面说明文档更新成功',
          data: existingGuide
        });
      } else {
        // 创建新记录
        const newGuide = await PageGuide.create({
          pagePath,
          pageName,
          pageDescription,
          category,
          importance: importance || 5,
          relatedTables: relatedTables || [],
          contextPrompt,
          isActive: isActive !== undefined ? isActive : true
        });

        console.log('✅ 页面说明文档创建成功:', pagePath);
        res.status(201).json({
          success: true,
          message: '页面说明文档创建成功',
          data: newGuide
        });
      }
    } catch (error) {
      console.error('❌ 创建页面说明文档失败:', error);
      res.status(500).json({
        success: false,
        message: '创建页面说明文档失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 更新页面说明文档
   */
  public static async updatePageGuide(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({
        success: false,
        message: '页面说明文档更新功能暂未实现'
      });
    } catch (error) {
      console.error('❌ 更新页面说明文档失败:', error);
      res.status(500).json({
        success: false,
        message: '更新页面说明文档失败'
      });
    }
  }

  /**
   * 删除页面说明文档
   */
  public static async deletePageGuide(req: Request, res: Response): Promise<void> {
    try {
      res.status(501).json({
        success: false,
        message: '页面说明文档删除功能暂未实现'
      });
    } catch (error) {
      console.error('❌ 删除页面说明文档失败:', error);
      res.status(500).json({
        success: false,
        message: '删除页面说明文档失败'
      });
    }
  }

  /**
   * 批量创建营销中心页面感知配置（临时方法）
   */
  public static async createMarketingPageGuides(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 开始批量创建营销中心页面感知配置...');

      const createdGuides: any[] = [];

      // 1. 营销渠道页面 - 检查是否已存在
      let channelsGuide = await PageGuide.findOne({ where: { pagePath: '/marketing/channels' } });
      if (!channelsGuide) {
        channelsGuide = await PageGuide.create({
        pagePath: '/marketing/channels',
        pageName: '营销渠道',
        pageDescription: '营销渠道管理是营销中心的核心功能之一。在这里您可以管理所有的营销推广渠道，包括线上线下各种渠道的配置、效果监控、成本分析和ROI计算。系统支持渠道分类管理、联系人维护、标签管理和详细的数据分析功能。',
        category: '营销页面',
        importance: 9,
        relatedTables: ["channel_trackings", "conversion_trackings", "marketing_campaigns", "users", "teachers", "parents"],
        contextPrompt: '用户正在营销渠道页面，专注于渠道管理和效果分析。用户可能需要查看渠道数据、分析ROI、管理渠道配置、优化推广效果等。请根据渠道跟踪和转化数据提供专业的营销建议。',
        isActive: true
      });
      } else {
        console.log('✅ 营销渠道页面配置已存在，跳过创建');
      }

      // 创建或更新营销渠道页面的功能板块
      const existingSections = await PageGuideSection.findAll({ where: { pageGuideId: channelsGuide.id } });
      if (existingSections.length === 0) {
        await PageGuideSection.bulkCreate([
        {
          pageGuideId: channelsGuide.id,
          sectionName: '渠道概览',
          sectionDescription: '展示所有营销渠道的整体效果统计，包括访问量、线索数、转化数和ROI等关键指标',
          sectionPath: '/marketing/channels',
          features: ["渠道统计", "效果对比", "成本分析", "ROI计算", "趋势分析", "渠道排名"],
          sortOrder: 1,
          isActive: true
        },
        {
          pageGuideId: channelsGuide.id,
          sectionName: '渠道管理',
          sectionDescription: '管理各个营销渠道的基本信息、配置参数和状态控制',
          sectionPath: '/marketing/channels',
          features: ["渠道新建", "信息编辑", "状态管理", "分类设置", "参数配置", "批量操作"],
          sortOrder: 2,
          isActive: true
        },
        {
          pageGuideId: channelsGuide.id,
          sectionName: '联系人管理',
          sectionDescription: '维护各渠道的联系人信息，支持联系人的增删改查和关系管理',
          sectionPath: '/marketing/channels',
          features: ["联系人添加", "信息维护", "关系绑定", "批量导入", "通讯录管理", "联系记录"],
          sortOrder: 3,
          isActive: true
        },
        {
          pageGuideId: channelsGuide.id,
          sectionName: '标签管理',
          sectionDescription: '为渠道添加标签进行分类管理，支持标签的创建、编辑和批量操作',
          sectionPath: '/marketing/channels',
          features: ["标签创建", "分类管理", "批量标记", "标签筛选", "智能推荐", "标签统计"],
          sortOrder: 4,
          isActive: true
        },
        {
          pageGuideId: channelsGuide.id,
          sectionName: '数据分析',
          sectionDescription: '深入分析渠道效果数据，提供多维度的数据可视化和报表功能',
          sectionPath: '/marketing/channels',
          features: ["效果分析", "图表展示", "数据导出", "对比分析", "预测模型", "报表生成"],
          sortOrder: 5,
          isActive: true
        }
      ]);
      } else {
        console.log('✅ 营销渠道页面功能板块已存在，跳过创建');
      }

      console.log('✅ 营销渠道页面配置处理完成');
      createdGuides.push({ name: '营销渠道', id: channelsGuide.id });

      // 2. 老带新页面 - 检查是否已存在
      let referralsGuide = await PageGuide.findOne({ where: { pagePath: '/marketing/referrals' } });
      if (!referralsGuide) {
        referralsGuide = await PageGuide.create({
        pagePath: '/marketing/referrals',
        pageName: '老带新',
        pageDescription: '老带新推荐系统是幼儿园获取新生源的重要渠道。通过现有家长的推荐，可以有效降低获客成本，提高转化率。系统提供完整的推荐关系管理、奖励机制设置、效果跟踪和数据分析功能，帮助幼儿园建立可持续的推荐营销体系。',
        category: '营销页面',
        importance: 8,
        relatedTables: ["referral_relationships", "parents", "students", "users", "marketing_campaigns", "enrollment_applications"],
        contextPrompt: '用户正在老带新页面，专注于推荐营销管理。用户可能需要查看推荐数据、管理推荐关系、设置奖励机制、分析推荐效果等。请结合推荐关系和家长数据提供针对性的建议。',
        isActive: true
      });
      } else {
        console.log('✅ 老带新页面配置已存在，跳过创建');
      }

      // 创建或更新老带新页面的功能板块
      const existingReferralSections = await PageGuideSection.findAll({ where: { pageGuideId: referralsGuide.id } });
      if (existingReferralSections.length === 0) {
        await PageGuideSection.bulkCreate([
        {
          pageGuideId: referralsGuide.id,
          sectionName: '推荐概览',
          sectionDescription: '展示老带新推荐的整体效果，包括推荐数量、成功率、奖励发放等关键指标',
          sectionPath: '/marketing/referrals',
          features: ["推荐统计", "成功率分析", "奖励统计", "趋势分析", "排行榜", "效果对比"],
          sortOrder: 1,
          isActive: true
        },
        {
          pageGuideId: referralsGuide.id,
          sectionName: '推荐关系',
          sectionDescription: '管理推荐人和被推荐人之间的关系，跟踪推荐状态和进展',
          sectionPath: '/marketing/referrals',
          features: ["关系建立", "状态跟踪", "进展管理", "关系图谱", "批量导入", "关系验证"],
          sortOrder: 2,
          isActive: true
        },
        {
          pageGuideId: referralsGuide.id,
          sectionName: '奖励机制',
          sectionDescription: '设置和管理推荐奖励规则，包括奖励类型、发放条件和奖励记录',
          sectionPath: '/marketing/referrals',
          features: ["奖励设置", "规则配置", "发放管理", "记录查询", "统计分析", "自动发放"],
          sortOrder: 3,
          isActive: true
        },
        {
          pageGuideId: referralsGuide.id,
          sectionName: '效果分析',
          sectionDescription: '分析老带新推荐的效果数据，提供多维度的统计和可视化分析',
          sectionPath: '/marketing/referrals',
          features: ["效果统计", "转化分析", "成本效益", "趋势预测", "对比分析", "报表导出"],
          sortOrder: 4,
          isActive: true
        }
      ]);
      } else {
        console.log('✅ 老带新页面功能板块已存在，跳过创建');
      }

      console.log('✅ 老带新页面配置处理完成');
      createdGuides.push({ name: '老带新', id: referralsGuide.id });

      res.json({
        success: true,
        message: '营销中心页面感知配置创建完成',
        data: {
          createdGuides,
          totalCreated: createdGuides.length
        }
      });
    } catch (error) {
      console.error('❌ 批量创建页面感知配置失败:', error);
      res.status(500).json({
        success: false,
        message: '批量创建页面感知配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }

  /**
   * 快速创建剩余营销页面配置（临时方法）
   */
  public static async createRemainingMarketingPages(req: Request, res: Response): Promise<void> {
    try {
      console.log('🚀 开始创建剩余营销页面配置...');

      const createdGuides: any[] = [];

      // 定义剩余页面配置
      const remainingPages = [
        {
          pagePath: '/marketing/conversions',
          pageName: '转换统计',
          pageDescription: '转换统计页面提供全面的营销转换数据分析，帮助了解从线索到最终报名的完整转换过程。通过多维度的数据分析和可视化图表，可以识别转换瓶颈，优化营销策略，提高整体转换效率。',
          category: '营销页面',
          importance: 9,
          relatedTables: ["conversion_trackings", "channel_trackings", "marketing_campaigns", "enrollment_applications", "admission_results"],
          contextPrompt: '用户正在转换统计页面，专注于营销转换分析。用户可能需要查看转换数据、分析转换漏斗、优化转换路径、提升转换率等。请基于转换数据提供专业的优化建议。'
        },
        {
          pagePath: '/marketing/funnel',
          pageName: '销售漏斗',
          pageDescription: '销售漏斗分析是营销效果评估的重要工具，通过可视化展示从初次接触到最终报名的完整客户旅程。帮助识别各阶段的转换率，发现流失原因，优化销售流程，提升整体转换效果。',
          category: '营销页面',
          importance: 9,
          relatedTables: ["channel_trackings", "conversion_trackings", "enrollment_applications", "admission_results", "marketing_campaigns"],
          contextPrompt: '用户正在销售漏斗页面，专注于销售流程分析。用户可能需要查看漏斗数据、分析转换率、优化销售流程、提升转换效果等。请基于漏斗数据提供销售优化建议。'
        },
        {
          pagePath: '/marketing',
          pageName: '营销活动',
          pageDescription: '营销活动管理是营销中心的核心功能，提供完整的活动生命周期管理。从活动策划、创建、执行到效果评估，系统支持多种活动类型和推广方式，帮助幼儿园有效开展各类营销推广活动。',
          category: '营销页面',
          importance: 8,
          relatedTables: ["marketing_campaigns", "activities", "channel_trackings", "conversion_trackings", "enrollment_applications"],
          contextPrompt: '用户正在营销活动页面，专注于活动管理和推广。用户可能需要创建活动、管理活动、分析活动效果、优化活动策略等。请基于活动数据提供专业的营销活动建议。'
        },
        {
          pagePath: '/advertisement',
          pageName: '推广渠道',
          pageDescription: '推广渠道管理专注于广告投放和推广活动的管理。系统支持多种广告形式和投放渠道，提供广告创意管理、投放计划制定、效果监控和成本控制等功能，帮助优化广告投放效果。',
          category: '营销页面',
          importance: 7,
          relatedTables: ["advertisements", "marketing_campaigns", "channel_trackings", "conversion_trackings"],
          contextPrompt: '用户正在推广渠道页面，专注于广告投放和推广管理。用户可能需要管理广告、制定投放计划、监控投放效果、优化广告策略等。请基于广告数据提供专业的投放建议。'
        },
        {
          pagePath: '/centers/marketing/consultations',
          pageName: '咨询管理',
          pageDescription: '咨询管理系统专门处理家长的入园咨询和报名咨询。通过系统化的咨询流程管理、专业的咨询记录和跟进机制，提升咨询转换率，为家长提供优质的咨询服务体验。',
          category: '营销页面',
          importance: 8,
          relatedTables: ["enrollment_consultations", "consultation_records", "parents", "students", "teachers", "enrollment_applications"],
          contextPrompt: '用户正在咨询管理页面，专注于咨询服务和转换管理。用户可能需要处理咨询记录、跟进咨询进展、分析咨询效果、优化咨询流程等。请基于咨询数据提供专业的咨询服务建议。'
        }
      ];

      // 批量创建页面配置
      for (const pageConfig of remainingPages) {
        let existingGuide = await PageGuide.findOne({ where: { pagePath: pageConfig.pagePath } });
        if (!existingGuide) {
          existingGuide = await PageGuide.create(pageConfig);
          console.log(`✅ ${pageConfig.pageName} 页面配置创建完成`);
          createdGuides.push({ name: pageConfig.pageName, id: existingGuide.id });
        } else {
          console.log(`✅ ${pageConfig.pageName} 页面配置已存在，跳过创建`);
          createdGuides.push({ name: pageConfig.pageName, id: existingGuide.id, existed: true });
        }
      }

      res.json({
        success: true,
        message: '剩余营销页面感知配置创建完成',
        data: {
          createdGuides,
          totalProcessed: createdGuides.length
        }
      });
    } catch (error) {
      console.error('❌ 创建剩余页面配置失败:', error);
      res.status(500).json({
        success: false,
        message: '创建剩余页面配置失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
}
