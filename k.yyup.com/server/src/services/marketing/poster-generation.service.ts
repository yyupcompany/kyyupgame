import { NotificationType } from '../../models/notification.model';
import { Op } from 'sequelize';
import { PosterGeneration, PosterGenerationCreationAttributes } from '../../models/poster-generation.model';
import { PosterTemplate } from '../../models/poster-template.model';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';
import { 
  PosterGenerationCreateParams, 
  PosterGenerationUpdateParams, 
  PosterGenerationQueryParams, 
  PosterShareParams 
} from '../../types/poster';
import { PosterTemplateService } from './poster-template.service';

/**
 * 海报生成服务实现类
 */
export class PosterGenerationService {
  private posterTemplateService: PosterTemplateService;

  constructor() {
    this.posterTemplateService = new PosterTemplateService();
  }

  /**
   * 生成海报
   * @param data 海报生成数据
   * @param userId 创建者ID
   * @returns 生成的海报
   */
  async generatePoster(data: PosterGenerationCreateParams, userId: number): Promise<PosterGeneration> {
    try {
      const template = await PosterTemplate.findByPk(data.templateId);
      if (!template) {
        throw new Error('模板不存在');
      }

      await template.increment('usageCount');

      const posterData: PosterGenerationCreationAttributes = {
        ...data,
        parameters: JSON.stringify(data.parameters),
        creatorId: userId,
        updaterId: userId,
        posterUrl: 'placeholder-url-will-be-updated',
        viewCount: 0,
        downloadCount: 0,
        shareCount: 0,
      };

      const poster = await PosterGeneration.create(posterData);

      const imageUrl = await this.generatePosterImage(poster.id, data.templateId, data.parameters);
      const thumbnailUrl = await this.generateThumbnail(imageUrl);
      
      await poster.update({
        imageUrl,
        thumbnailUrl,
        posterUrl: imageUrl
      });

      return this.getPosterById(poster.id);
    } catch (error) {
      logger.error('生成海报失败', { error });
      throw error;
    }
  }

  /**
   * 获取海报详情
   * @param id 海报ID
   * @returns 海报详情
   */
  async getPosterById(id: number): Promise<PosterGeneration> {
    try {
      const poster = await PosterGeneration.findByPk(id, {
        include: [
          { model: PosterTemplate, as: 'template' },
          { model: User, as: 'creator', attributes: ['id', 'username', 'name'] }
        ]
      });

      if (!poster) {
        throw new Error('海报不存在');
      }

      await poster.increment('viewCount');

      return poster;
    } catch (error) {
      logger.error('获取海报详情失败', { error, id });
      throw error;
    }
  }

  /**
   * 更新海报
   * @param id 海报ID
   * @param data 更新数据
   * @param userId 更新者ID
   * @returns 更新后的海报
   */
  async updatePoster(id: number, data: PosterGenerationUpdateParams, userId: number): Promise<PosterGeneration> {
    try {
      const poster = await PosterGeneration.findByPk(id);
      if (!poster) {
        throw new Error('海报不存在');
      }

      const { parameters, ...restData } = data;
      const updateData: Partial<PosterGenerationCreationAttributes> = { 
        ...restData, 
        updaterId: userId 
      };
      
      if (parameters) {
        updateData.parameters = JSON.stringify(parameters);
        const imageUrl = await this.generatePosterImage(id, poster.templateId, parameters);
        const thumbnailUrl = await this.generateThumbnail(imageUrl);
        updateData.imageUrl = imageUrl;
        updateData.thumbnailUrl = thumbnailUrl;
      }

      await poster.update(updateData);

      return this.getPosterById(id);
    } catch (error) {
      logger.error('更新海报失败', { error, id });
      throw error;
    }
  }

  /**
   * 删除海报
   * @param id 海报ID
   * @returns 删除结果
   */
  async deletePoster(id: number): Promise<boolean> {
    try {
      const poster = await PosterGeneration.findByPk(id);
      if (!poster) {
        throw new Error('海报不存在');
      }
      await poster.destroy();
      return true;
    } catch (error) {
      logger.error('删除海报失败', { error, id });
      throw error;
    }
  }

  /**
   * 获取海报列表
   * @param query 查询参数
   * @returns 海报列表和总数
   */
  async getPosters(query: PosterGenerationQueryParams): Promise<{ rows: PosterGeneration[], count: number }> {
    try {
      const { page = 1, pageSize = 10, name, templateId, status, kindergartenId, creatorId, startDate, endDate } = query;
      const where: any = {};

      if (name) where.name = { [Op.like]: `%${name}%` };
      if (templateId) where.templateId = templateId;
      if (status !== undefined) where.status = status;
      if (kindergartenId) where.kindergartenId = kindergartenId;
      if (creatorId) where.creatorId = creatorId;
      if (startDate && endDate) {
        where.createdAt = { [Op.between]: [new Date(startDate), new Date(endDate)] };
      }
      
      return PosterGeneration.findAndCountAll({
        where,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        order: [['createdAt', 'DESC']],
        include: [
          { model: PosterTemplate, as: 'template' },
          { model: User, as: 'creator', attributes: ['id', 'username', 'name'] }
        ]
      });
    } catch (error) {
      logger.error('获取海报列表失败', { error });
      throw error;
    }
  }

  /**
   * 预览海报
   * @param id 模板或海报ID
   * @param params 参数
   * @param isTemplate 是否是模板
   */
  async previewPoster(id: number, params: Record<string, any>, isTemplate: boolean): Promise<{ previewUrl: string }> {
    logger.info('Previewing poster', { id, isTemplate });
    // In a real scenario, this would generate a temporary image based on template/poster and params
    const previewUrl = await this.generatePosterImage(isTemplate ? 0 : id, isTemplate ? id : 0, params);
    return { previewUrl };
  }

  /**
   * 下载海报
   * @param id 海报ID
   * @param userId 用户ID
   */
  async downloadPoster(id: number, userId: number): Promise<string> {
    const poster = await this.getPosterById(id);
    await poster.increment('downloadCount');
    logger.info(`User ${userId} downloaded poster ${id}`);
    return poster.imageUrl!;
  }

  /**
   * 分享海报
   * @param id 海报ID
   * @param shareParams 分享参数
   * @param userId 用户ID
   */
  async sharePoster(id: number, shareParams: PosterShareParams, userId: number): Promise<{ success: boolean; link?: string }> {
    const poster = await this.getPosterById(id);
    await poster.increment('shareCount');
    logger.info(`User ${userId} shared poster ${id} to ${shareParams.channel}`);
    // In a real scenario, this would interact with social media APIs
    return { success: true, link: `https://example.com/shared_poster_${id}` };
  }

  /**
   * 获取海报统计数据
   * @param query 查询参数
   */
  async getPosterStats(query: Omit<PosterGenerationQueryParams, 'page' | 'pageSize' | 'sortBy' | 'sortOrder'>): Promise<any> {
    const { kindergartenId, startDate, endDate } = query;
    const where: any = {};
    if (kindergartenId) where.kindergartenId = kindergartenId;
    if (startDate && endDate) {
      where.createdAt = { [Op.between]: [startDate, endDate] };
    }

    const totalGenerated = await PosterGeneration.count({ where });
    const totalViews = await PosterGeneration.sum('viewCount', { where });
    const totalDownloads = await PosterGeneration.sum('downloadCount', { where });
    const totalShares = await PosterGeneration.sum('shareCount', { where });

    return {
      totalGenerated,
      totalViews: totalViews || 0,
      totalDownloads: totalDownloads || 0,
      totalShares: totalShares || 0,
    };
  }

  private async generatePosterImage(posterId: number, templateId: number, parameters: Record<string, any>): Promise<string> {
    logger.info(`Generating poster image for posterId: ${posterId}`, { templateId, parameters });
    // Simulate image generation
    return Promise.resolve(`https://example.com/poster_${posterId || templateId}.png`);
  }

  private async generateThumbnail(imageUrl: string): Promise<string> {
    logger.info(`Generating thumbnail for image: ${imageUrl}`);
    // Simulate thumbnail generation
    return Promise.resolve(imageUrl.replace('.png', '_thumb.png'));
  }
}

// 导出服务实例
export default new PosterGenerationService();