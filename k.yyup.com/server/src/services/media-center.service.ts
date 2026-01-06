import { Op, fn, col } from 'sequelize';
import { MediaContent, MediaContentType } from '../models/media-content.model';
import { User } from '../models/user.model';

/**
 * 媒体中心服务类
 */
export class MediaCenterService {
  /**
   * 获取最近创作列表
   */
  static async getRecentCreations(userId?: number, limit: number = 10) {
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }

    const creations = await MediaContent.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
    });

    return creations.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      platform: item.platform,
      createdAt: item.createdAt,
      preview: item.preview,
      content: item.content,
      keywords: item.keywords || [],
      settings: item.settings || {},
      creator: item.get('creator'),
    }));
  }

  /**
   * 获取创作历史（带筛选）
   */
  static async getCreationHistory(params: {
    userId?: number;
    type?: MediaContentType;
    platform?: string;
    keyword?: string;
    page?: number;
    pageSize?: number;
  }) {
    const {
      userId,
      type,
      platform,
      keyword,
      page = 1,
      pageSize = 20,
    } = params;

    const whereClause: any = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (platform) {
      whereClause.platform = {
        [Op.like]: `%${platform}%`,
      };
    }

    if (keyword) {
      whereClause.title = {
        [Op.like]: `%${keyword}%`,
      };
    }

    const { count, rows } = await MediaContent.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (page - 1) * pageSize,
    });

    return {
      items: rows.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        platform: item.platform,
        createdAt: item.createdAt,
        preview: item.preview,
        content: item.content,
        keywords: item.keywords || [],
        settings: item.settings || {},
        creator: item.get('creator'),
      })),
      total: count,
      page,
      pageSize,
    };
  }

  /**
   * 创建媒体内容
   */
  static async createContent(data: {
    title: string;
    type: MediaContentType;
    platform: string;
    content: string;
    preview?: string;
    keywords?: string[];
    style?: string;
    settings?: Record<string, any>;
    userId: number;
  }) {
    const content = await MediaContent.create({
      title: data.title,
      type: data.type,
      platform: data.platform,
      content: data.content,
      preview: data.preview || data.content.substring(0, 100),
      keywords: data.keywords || [],
      style: data.style as any,
      settings: data.settings || {},
      userId: data.userId,
    });

    return {
      id: content.id,
      title: content.title,
      type: content.type,
      platform: content.platform,
      createdAt: content.createdAt,
      preview: content.preview,
      content: content.content,
      keywords: content.keywords,
      settings: content.settings,
    };
  }

  /**
   * 更新媒体内容
   */
  static async updateContent(
    id: number,
    data: {
      title?: string;
      content?: string;
      platform?: string;
      keywords?: string[];
      settings?: Record<string, any>;
    }
  ) {
    const content = await MediaContent.findByPk(id);
    if (!content) {
      throw new Error('媒体内容不存在');
    }

    await content.update({
      ...data,
      preview: data.content
        ? data.content.substring(0, 100)
        : content.preview,
    });

    return {
      id: content.id,
      title: content.title,
      type: content.type,
      platform: content.platform,
      createdAt: content.createdAt,
      preview: content.preview,
      content: content.content,
      keywords: content.keywords,
      settings: content.settings,
    };
  }

  /**
   * 删除媒体内容
   */
  static async deleteContent(id: number) {
    const content = await MediaContent.findByPk(id);
    if (!content) {
      throw new Error('媒体内容不存在');
    }

    await content.destroy();
    return { success: true };
  }

  /**
   * 获取媒体中心统计数据
   */
  static async getStatistics(userId?: number) {
    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }

    // 总内容数
    const totalContents = await MediaContent.count({
      where: whereClause,
    });

    // 按类型统计
    const contentsByType = await MediaContent.findAll({
      where: whereClause,
      attributes: [
        'type',
        [fn('COUNT', col('*')), 'count'],
      ],
      group: ['type'],
      raw: true,
    });

    // 按平台统计
    const contentsByPlatform = await MediaContent.findAll({
      where: whereClause,
      attributes: [
        'platform',
        [fn('COUNT', col('*')), 'count'],
      ],
      group: ['platform'],
      raw: true,
    });

    // 最近7天创作数
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentContents = await MediaContent.count({
      where: {
        ...whereClause,
        createdAt: {
          [Op.gte]: sevenDaysAgo,
        },
      },
    });

    return {
      totalContents,
      recentContents,
      contentsByType: contentsByType.map((item: any) => ({
        type: item.type,
        count: parseInt(item.count),
      })),
      contentsByPlatform: contentsByPlatform.map((item: any) => ({
        platform: item.platform,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * 获取内容详情
   */
  static async getContentDetail(id: number) {
    const content = await MediaContent.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'real_name'],
        },
      ],
    });

    if (!content) {
      throw new Error('媒体内容不存在');
    }

    return {
      id: content.id,
      title: content.title,
      type: content.type,
      platform: content.platform,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt,
      preview: content.preview,
      content: content.content,
      keywords: content.keywords || [],
      style: content.style,
      settings: content.settings || {},
      creator: content.get('creator'),
    };
  }
}

