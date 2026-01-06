/**
 * 字段模板服务
 * 管理字段模板的创建、查询、应用等功能
 */

export interface FieldTemplate {
  id: number;
  name: string;
  description?: string;
  entityType: string;
  fieldValues: Record<string, any>;
  userId: number;
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateParams {
  name: string;
  description?: string;
  entityType: string;
  fieldValues: Record<string, any>;
  userId: number;
  isPublic?: boolean;
}

export interface TemplateListParams {
  userId?: number;
  entityType?: string;
  isPublic?: boolean;
  page?: number;
  pageSize?: number;
  keyword?: string;
}

// 内存存储（实际应使用数据库）
const templates: FieldTemplate[] = [];
let nextId = 1;

class FieldTemplateService {
  /**
   * 创建模板
   */
  async createTemplate(params: CreateTemplateParams): Promise<FieldTemplate> {
    console.log('📝 [字段模板服务] 创建模板:', params.name);

    const template: FieldTemplate = {
      id: nextId++,
      name: params.name,
      description: params.description,
      entityType: params.entityType,
      fieldValues: params.fieldValues,
      userId: params.userId,
      isPublic: params.isPublic || false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    templates.push(template);
    return template;
  }

  /**
   * 获取模板列表
   */
  async getTemplateList(params: TemplateListParams): Promise<{ list: FieldTemplate[]; total: number }> {
    let filtered = templates.filter(t => {
      if (params.entityType && t.entityType !== params.entityType) return false;
      if (params.isPublic !== undefined && t.isPublic !== params.isPublic) return false;
      if (params.userId && !t.isPublic && t.userId !== params.userId) return false;
      if (params.keyword && !t.name.includes(params.keyword)) return false;
      return true;
    });

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const start = (page - 1) * pageSize;

    return {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  }

  /**
   * 根据ID获取模板
   */
  async getTemplateById(id: number, userId?: number): Promise<FieldTemplate | null> {
    const template = templates.find(t => t.id === id);
    if (!template) return null;
    if (!template.isPublic && template.userId !== userId) return null;
    return template;
  }

  /**
   * 应用模板
   */
  async applyTemplate(id: number, userId?: number): Promise<Record<string, any>> {
    const template = await this.getTemplateById(id, userId);
    if (!template) throw new Error('模板不存在');

    template.usageCount++;
    template.updatedAt = new Date();

    return template.fieldValues;
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: number, userId: number, updates: Partial<FieldTemplate>): Promise<FieldTemplate> {
    const template = templates.find(t => t.id === id && t.userId === userId);
    if (!template) throw new Error('模板不存在或无权限');

    Object.assign(template, updates, { updatedAt: new Date() });
    return template;
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: number, userId: number): Promise<void> {
    const index = templates.findIndex(t => t.id === id && t.userId === userId);
    if (index === -1) throw new Error('模板不存在或无权限');
    templates.splice(index, 1);
  }

  /**
   * 获取热门模板
   */
  async getPopularTemplates(entityType: string, limit = 10): Promise<FieldTemplate[]> {
    return templates
      .filter(t => t.isPublic && t.entityType === entityType)
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  /**
   * 获取最近使用的模板
   */
  async getRecentTemplates(userId: number, entityType?: string, limit = 10): Promise<FieldTemplate[]> {
    return templates
      .filter(t => t.userId === userId && (!entityType || t.entityType === entityType))
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }
}

export const fieldTemplateService = new FieldTemplateService();
export default fieldTemplateService;

