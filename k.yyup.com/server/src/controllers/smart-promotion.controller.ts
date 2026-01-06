import { Request, Response } from 'express';
import { ResponseHandler } from '../utils/response-handler';
import { logger } from '../utils/logger';
import { aiBridgeService } from '../services/ai/bridge/ai-bridge.service';
import autoImageGenerationService from '../services/ai/auto-image-generation.service';
import { ConversionTracking } from '../models/conversion-tracking.model';
import { User } from '../models/user.model';
import { MarketingCampaign } from '../models/marketing-campaign.model';
import { sequelize } from '../init';

// 简化的用户请求类型
interface UserRequest extends Omit<Request, 'user'> {
  user?: {
    id: number;
    name?: string;
    email?: string;
  };
}

/**
 * AI智能推广控制器
 */
export class SmartPromotionController {

  /**
   * AI生成推广海报
   */
  static async generatePromotionPoster(req: UserRequest, res: Response) {
    try {
      const { prompt, activityData, referralCode, style } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      if (!prompt) {
        return ResponseHandler.error(res, '请提供海报生成提示词', 400);
      }

      logger.info('🎨 开始AI生成推广海报', {
        userId,
        prompt: prompt.substring(0, 100),
        activityData: activityData?.name,
        referralCode,
        style
      });

      // 构建AI对话提示词
      const aiPrompt = `
你是一个专业的推广海报设计师AI助手。用户需求：${prompt}

活动信息：${activityData ? JSON.stringify(activityData) : '通用推广'}
推广码：${referralCode || ''}
风格偏好：${style || 'warm'}

请根据用户需求，生成一个推广海报设计方案。请用友好的语气回复用户，说明设计思路，包括：
1. 海报的整体风格和色彩搭配
2. 文字内容和排版建议
3. 图片元素和布局
4. 二维码的最佳位置

回复格式要求：
- 用友好、专业的语气
- 提供具体的设计建议
- 解释设计理念
`;

      // 调用AI生成对话回复
      const aiResponse = await aiBridgeService.generateChatCompletion({
        messages: [
          {
            role: 'system',
            content: '你是一个专业的推广海报设计师AI助手，擅长为幼儿园活动设计吸引人的推广海报。'
          },
          {
            role: 'user',
            content: aiPrompt
          }
        ],
        model: 'doubao-pro-32k',
        temperature: 0.8,
        max_tokens: 1000
      });

      // 生成海报背景图
      const imagePrompt = `
幼儿园推广海报背景图，${style === 'warm' ? '温馨亲子风格' : style === 'professional' ? '专业商务风格' : style === 'playful' ? '活泼卡通风格' : '简约现代风格'}，
${activityData?.name || '通用推广'}，适合放置文字和二维码，高质量，专业设计
`;

      const imageResult = await autoImageGenerationService.generateActivityImage(
        activityData?.name || '推广活动',
        imagePrompt,
        {
          style: style === 'warm' ? 'natural' : style === 'playful' ? 'cartoon' : 'realistic',
          size: '1024x768'
        }
      );

      // 构建海报数据
      const posterData = {
        id: `poster_${Date.now()}`,
        preview: imageResult.imageUrl || '/api/placeholder-poster.jpg',
        imageUrl: imageResult.imageUrl || '/api/placeholder-poster.jpg',
        thumbnailUrl: imageResult.thumbnailUrl,
        style: {
          primaryColor: style === 'warm' ? '#ff6b6b' : style === 'professional' ? '#1890ff' : style === 'playful' ? '#52c41a' : '#722ed1',
          fontSize: 16,
          styleType: style || 'warm'
        },
        content: {
          title: activityData?.name || '精彩活动等你来',
          subtitle: activityData?.description || '专为您的孩子量身定制的成长体验',
          referralCode: referralCode
        },
        qrPosition: { x: 300, y: 50 },
        qrSize: { width: 150, height: 150 }
      };

      const response = {
        message: aiResponse.choices?.[0]?.message?.content || '海报设计方案已生成，请查看预览效果。',
        posterData: posterData,
        usage: {
          textTokens: aiResponse.usage?.total_tokens || 0,
          imageTokens: imageResult.usage?.generated_images || 0
        }
      };

      logger.info('✅ AI推广海报生成成功', {
        userId,
        posterDataId: posterData.id,
        hasImage: !!imageResult.imageUrl
      });

      return ResponseHandler.success(res, response, 'AI推广海报生成成功');

    } catch (error: any) {
      logger.error('❌ AI推广海报生成失败', {
        error: error.message,
        stack: error.stack
      });
      return ResponseHandler.error(res, error.message || 'AI推广海报生成失败', 500, error);
    }
  }

  /**
   * 生成AI推广文案
   */
  static async generatePromotionContent(req: UserRequest, res: Response) {
    try {
      const { activityId, targetAudience, style, includeIncentives } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      if (!activityId) {
        return ResponseHandler.error(res, '活动ID不能为空', 400);
      }

      logger.info('🎨 开始生成AI推广文案', { 
        userId, 
        activityId, 
        targetAudience, 
        style 
      });

      // 模拟生成推广内容
      const content = {
        mainTitle: '🎉 精彩活动等你来！',
        subtitle: '专为您的孩子量身定制的成长体验',
        highlights: [
          '专业教师团队指导',
          '安全舒适的活动环境',
          '丰富多彩的互动体验'
        ],
        callToAction: '立即报名，给孩子一个难忘的体验！',
        socialProof: '已有200+家长选择我们',
        urgency: '限时优惠，仅剩10个名额！'
      };

      logger.info('✅ AI推广文案生成成功', { userId, activityId });

      return ResponseHandler.success(res, {
        content,
        activityId,
        generatedAt: new Date().toISOString()
      }, '推广文案生成成功');
    } catch (error) {
      logger.error('❌ 生成AI推广文案失败:', error);
      return ResponseHandler.error(res, '生成推广文案失败', 500);
    }
  }

  /**
   * 生成社交媒体推广内容
   */
  static async generateSocialMediaContent(req: UserRequest, res: Response) {
    try {
      const { activityId, referralCode } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      if (!activityId || !referralCode) {
        return ResponseHandler.error(res, '活动ID和推广码不能为空', 400);
      }

      logger.info('📱 开始生成社交媒体推广内容', { 
        userId, 
        activityId, 
        referralCode 
      });

      // 模拟生成社交媒体内容
      const socialContent = {
        wechatMoments: '🎉 超棒的亲子活动来啦！专业老师指导，安全环境保障，快来给孩子一个难忘的体验吧！',
        wechatGroups: '各位家长好！推荐一个很棒的亲子活动，我家孩子参加过，效果很好！',
        personalMessage: 'Hi，我发现了一个很不错的亲子活动，想推荐给你，你家孩子应该会喜欢的！'
      };

      logger.info('✅ 社交媒体推广内容生成成功', { userId, activityId });

      return ResponseHandler.success(res, {
        socialContent,
        referralCode,
        generatedAt: new Date().toISOString()
      }, '社交媒体内容生成成功');
    } catch (error) {
      logger.error('❌ 生成社交媒体推广内容失败:', error);
      return ResponseHandler.error(res, '生成社交媒体内容失败', 500);
    }
  }

  /**
   * 一键生成完整推广海报
   */
  static async generateCompletePoster(req: UserRequest, res: Response) {
    try {
      const { activityId, referralCode, preferences } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      if (!activityId || !referralCode) {
        return ResponseHandler.error(res, '活动ID和推广码不能为空', 400);
      }

      logger.info('🎨 开始一键生成完整推广海报', { 
        userId, 
        activityId, 
        referralCode,
        preferences 
      });

      // 模拟生成完整推广海报
      const result = {
        posterUrl: 'https://example.com/poster.jpg',
        qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://k.yyup.cc/activity/${activityId}?ref=${referralCode}`)}`,
        shareUrl: `https://k.yyup.cc/activity/${activityId}?ref=${referralCode}`,
        referralCode,
        analytics: {
          estimatedReach: 500,
          estimatedConversion: 25,
          suggestedChannels: ['微信朋友圈', '微信群', '私信推荐']
        }
      };

      logger.info('✅ 完整推广海报生成成功', { userId, activityId });

      return ResponseHandler.success(res, result, '推广海报生成成功');
    } catch (error) {
      logger.error('❌ 一键生成完整推广海报失败:', error);
      return ResponseHandler.error(res, '生成推广海报失败', 500);
    }
  }

  /**
   * 计算推广员奖励
   */
  static async calculateReward(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      // 模拟计算推广员奖励
      const reward = {
        currentLevel: 'silver',
        totalEarnings: 1250.50,
        totalReferrals: 23,
        nextLevelThreshold: 50,
        nextLevelProgress: 46,
        recentEarnings: [
          { date: '2024-01-15', amount: 50.00, type: 'referral' },
          { date: '2024-01-14', amount: 100.00, type: 'bonus' }
        ]
      };

      logger.info('✅ 推广员奖励计算成功', { userId });

      return ResponseHandler.success(res, reward, '奖励计算成功');
    } catch (error) {
      logger.error('❌ 计算推广员奖励失败:', error);
      return ResponseHandler.error(res, '计算奖励失败', 500);
    }
  }

  /**
   * 生成个性化激励策略
   */
  static async generatePersonalizedIncentive(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      // 模拟生成个性化激励策略
      const incentive = {
        strategy: 'social_sharing',
        recommendations: [
          '在微信朋友圈分享，可获得额外10%奖励',
          '邀请3位好友参与，解锁专属推广员徽章',
          '本周推广成功5人，获得200元奖金'
        ],
        personalizedMessage: '根据您的推广历史，建议重点关注亲子活动类型的推广'
      };

      logger.info('✅ 个性化激励策略生成成功', { userId });

      return ResponseHandler.success(res, incentive, '激励策略生成成功');
    } catch (error) {
      logger.error('❌ 生成个性化激励策略失败:', error);
      return ResponseHandler.error(res, '生成激励策略失败', 500);
    }
  }

  /**
   * 追踪病毒式传播
   */
  static async trackViralSpread(req: UserRequest, res: Response) {
    try {
      const { referralCode } = req.params;

      if (!referralCode) {
        return ResponseHandler.error(res, '推广码不能为空', 400);
      }

      // 模拟追踪病毒式传播
      const viralData = {
        referralCode,
        totalViews: 1250,
        totalClicks: 156,
        totalConversions: 23,
        viralCoefficient: 1.8,
        generationData: {
          generation1: { views: 500, clicks: 80, conversions: 12 },
          generation2: { views: 450, clicks: 50, conversions: 8 },
          generation3: { views: 300, clicks: 26, conversions: 3 }
        },
        topChannels: [
          { channel: '微信朋友圈', conversions: 12 },
          { channel: '微信群', conversions: 8 },
          { channel: '私信推荐', conversions: 3 }
        ]
      };

      logger.info('✅ 病毒式传播追踪成功', { referralCode });

      return ResponseHandler.success(res, viralData, '传播数据获取成功');
    } catch (error) {
      logger.error('❌ 追踪病毒式传播失败:', error);
      return ResponseHandler.error(res, '获取传播数据失败', 500);
    }
  }

  /**
   * 优化病毒式传播策略
   */
  static async optimizeViralStrategy(req: UserRequest, res: Response) {
    try {
      const { referralCode } = req.params;

      if (!referralCode) {
        return ResponseHandler.error(res, '推广码不能为空', 400);
      }

      // 模拟优化病毒式传播策略
      const optimization = {
        predictedGrowth: 35,
        bottlenecks: [
          '转化率偏低，建议优化落地页设计',
          '微信群传播效果不佳，需要更吸引人的文案'
        ],
        opportunities: [
          '朋友圈传播效果很好，可以加大投入',
          '可以尝试短视频形式的推广内容'
        ],
        recommendations: [
          '优化推广文案，突出核心卖点',
          '增加用户评价和成功案例',
          '设置限时优惠增加紧迫感',
          '制作更多样化的推广素材'
        ]
      };

      logger.info('✅ 病毒式传播策略优化成功', { referralCode });

      return ResponseHandler.success(res, optimization, '传播策略优化成功');
    } catch (error) {
      logger.error('❌ 优化病毒式传播策略失败:', error);
      return ResponseHandler.error(res, '优化传播策略失败', 500);
    }
  }

  /**
   * 获取推广统计数据
   */
  static async getPromotionStats(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      // 使用模拟推广统计数据（暂时）
      const stats = {
        totalEarnings: 1250.50,
        totalReferrals: 23,
        currentLevel: 'silver',
        nextLevelProgress: 65,
        recentActivity: [
          { date: '2024-01-15', type: 'referral', amount: 50.00 },
          { date: '2024-01-14', type: 'bonus', amount: 100.00 },
          { date: '2024-01-13', type: 'referral', amount: 25.00 }
        ]
      };

      logger.info('✅ 推广统计数据获取成功', { userId });

      return ResponseHandler.success(res, stats, '统计数据获取成功');
    } catch (error) {
      logger.error('❌ 获取推广统计数据失败:', error);
      return ResponseHandler.error(res, '获取统计数据失败', 500);
    }
  }

  /**
   * 获取海报模板列表
   */
  static async getPosterTemplates(req: UserRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return ResponseHandler.error(res, '用户未认证', 401);
      }

      logger.info('📋 获取海报模板列表', { userId });

      // 模拟海报模板数据
      const templates = [
        {
          id: 'template_1',
          name: '温馨亲子',
          category: '亲子活动',
          style: 'warm',
          preview: '/api/poster-templates/warm-family.jpg',
          thumbnail: '/api/poster-templates/warm-family-thumb.jpg',
          description: '温馨的亲子活动海报模板，适合家庭活动推广',
          tags: ['亲子', '温馨', '家庭'],
          usage: 156
        },
        {
          id: 'template_2',
          name: '活力运动',
          category: '体育活动',
          style: 'energetic',
          preview: '/api/poster-templates/energetic-sports.jpg',
          thumbnail: '/api/poster-templates/energetic-sports-thumb.jpg',
          description: '充满活力的运动主题海报，适合体育活动推广',
          tags: ['运动', '活力', '健康'],
          usage: 89
        },
        {
          id: 'template_3',
          name: '艺术创意',
          category: '艺术活动',
          style: 'creative',
          preview: '/api/poster-templates/creative-art.jpg',
          thumbnail: '/api/poster-templates/creative-art-thumb.jpg',
          description: '富有创意的艺术主题海报，适合艺术类活动',
          tags: ['艺术', '创意', '色彩'],
          usage: 134
        },
        {
          id: 'template_4',
          name: '节日庆典',
          category: '节日活动',
          style: 'festive',
          preview: '/api/poster-templates/festive-celebration.jpg',
          thumbnail: '/api/poster-templates/festive-celebration-thumb.jpg',
          description: '喜庆的节日主题海报，适合各种节日活动',
          tags: ['节日', '庆典', '喜庆'],
          usage: 203
        }
      ];

      logger.info('✅ 海报模板列表获取成功', { userId, templateCount: templates.length });

      return ResponseHandler.success(res, templates, '海报模板获取成功');
    } catch (error) {
      logger.error('❌ 获取海报模板列表失败:', error);
      return ResponseHandler.error(res, '获取海报模板失败', 500);
    }
  }
}
