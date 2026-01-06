import { NotificationType } from '../../models/notification.model';
import { Op, InferCreationAttributes } from 'sequelize';
import { PosterTemplate } from '../../models/poster-template.model';
import { PosterElement } from '../../models/poster-element.model';
import { User } from '../../models/user.model';
import { logger } from '../../utils/logger';

type PosterTemplateCreation = InferCreationAttributes<PosterTemplate>;
type PosterElementCreation = InferCreationAttributes<PosterElement>;

/**
 * 海报模板服务实现类
 */
export class PosterTemplateService {
  /**
   * 创建海报模板
   * @param data 模板数据，可包含元素
   * @param userId 创建者ID
   * @returns 创建的模板
   */
  async createTemplate(data: PosterTemplateCreation & { elements?: PosterElementCreation[] }, userId: number): Promise<PosterTemplate> {
    try {
      const { elements, ...templateData } = data;

      const template = await PosterTemplate.create({
        ...templateData,
        creatorId: userId,
        updaterId: userId,
      });

      if (elements && elements.length > 0) {
        const elementData = elements.map(el => ({
          ...el,
          templateId: template.id,
          creatorId: userId,
          updaterId: userId,
        }));
        await PosterElement.bulkCreate(elementData);
      }

      return this.getTemplateById(template.id);
    } catch (error) {
      logger.error('创建海报模板失败', { error });
      throw error;
    }
  }

  /**
   * 获取模板详情
   * @param id 模板ID
   * @returns 模板详情
   */
  async getTemplateById(id: number): Promise<PosterTemplate> {
    const template = await PosterTemplate.findByPk(id, {
      include: [
        { model: PosterElement, as: 'elements' }
        // 暂时移除User关联，避免关联关系错误
        // { model: User, as: 'creator', attributes: ['id', 'username', 'name'] }
      ]
    });

    if (!template) {
      throw new Error('模板不存在');
    }

    return template;
  }

  /**
   * 更新模板
   * @param id 模板ID
   * @param data 更新数据，可包含元素
   * @param userId 更新者ID
   * @returns 更新后的模板
   */
  async updateTemplate(id: number, data: Partial<PosterTemplateCreation> & { elements?: Partial<PosterElementCreation>[] }, userId: number): Promise<PosterTemplate> {
    try {
      const template = await PosterTemplate.findByPk(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      const { elements, ...templateData } = data;

      await template.update({ ...templateData, updaterId: userId });

      if (elements) {
        logger.info('正在更新模板元素...', { templateId: id, elementCount: elements.length });
        // 在此处添加完整的元素更新逻辑（创建/更新/删除）
      }

      return this.getTemplateById(id);
    } catch (error) {
      logger.error('更新模板失败', { error, id });
      throw error;
    }
  }

  /**
   * 删除模板
   * @param id 模板ID
   * @returns 删除结果
   */
  async deleteTemplate(id: number): Promise<boolean> {
    try {
      const template = await PosterTemplate.findByPk(id);
      if (!template) {
        throw new Error('模板不存在');
      }

      await PosterElement.destroy({ where: { templateId: id } });
      await template.destroy();

      return true;
    } catch (error) {
      logger.error('删除模板失败', { error, id });
      throw error;
    }
  }

  /**
   * 获取模板列表
   * @param query 查询参数
   * @returns 模板列表和总数
   */
  async getTemplates(query: any): Promise<{ rows: PosterTemplate[], count: number }> {
    const { page = 1, limit = 10, name, category, status, kindergartenId, creatorId } = query;
    const where: any = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (category) where.category = category;
    if (status !== undefined) where.status = status;
    if (kindergartenId) where.kindergartenId = kindergartenId;
    if (creatorId) where.creatorId = creatorId;

    // 暂时移除User关联，避免关联关系错误
    return PosterTemplate.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
      // 注释掉User关联，直到关联关系正确建立
      // include: [{ model: User, as: 'creator', attributes: ['id', 'username', 'name'] }]
    });
  }

  /**
   * 预览模板
   * @param id 模板ID
   * @param params 动态参数
   * @returns 渲染后的预览数据 (简化模拟)
   */
  async previewTemplate(id: number, params: Record<string, any>): Promise<any> {
    const template = await this.getTemplateById(id);
    return {
      template,
      renderedParams: params,
      previewUrl: `https://example.com/preview/${id}?` + new URLSearchParams(params),
    };
  }

  /**
   * 添加模板元素
   */
  async addTemplateElement(templateId: number, elementData: PosterElementCreation, userId: number): Promise<PosterElement> {
    const template = await PosterTemplate.findByPk(templateId);
    if (!template) {
      throw new Error('模板不存在');
    }

    return PosterElement.create({
      ...elementData,
      templateId,
      creatorId: userId,
      updaterId: userId,
    });
  }

  /**
   * 更新模板元素
   */
  async updateTemplateElement(elementId: number, elementData: Partial<PosterElementCreation>, userId: number): Promise<PosterElement> {
    const element = await PosterElement.findByPk(elementId);
    if (!element) {
      throw new Error('元素不存在');
    }
    await element.update({ ...elementData, updaterId: userId });
    return element;
  }

  /**
   * 删除模板元素
   */
  async deleteTemplateElement(elementId: number, userId: number): Promise<boolean> {
    const element = await PosterElement.findByPk(elementId);
    if (!element) {
      throw new Error('元素不存在');
    }
    await element.destroy();
    return true;
  }

  /**
   * 获取模板分类
   */
  async getTemplateCategories(): Promise<string[]> {
    const categories = await PosterTemplate.findAll({
      attributes: ['category'],
      group: ['category'],
    });
    return categories.map(c => c.category).filter(Boolean) as string[];
  }
}

// 导出服务实例
export default new PosterTemplateService();