import { DatabaseService } from './database.service';

export interface TaskTemplate {
  id?: number;
  name: string;
  description?: string;
  type: 'enrollment' | 'activity' | 'daily' | 'management';
  category?: string;
  template_content: any;
  default_priority: 'low' | 'medium' | 'high' | 'urgent';
  default_estimated_hours?: number;
  usage_count: number;
  is_active: boolean;
  is_public: boolean;
  created_by: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface TemplateFilters {
  type?: string;
  category?: string;
  is_active?: boolean;
  is_public?: boolean;
  created_by?: number;
}

export class TaskTemplateService {
  private db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * 获取模板列表
   */
  async getTemplates(filters: TemplateFilters = {}): Promise<TaskTemplate[]> {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (filters.type) {
      whereClause += ' AND type = ?';
      params.push(filters.type);
    }

    if (filters.category) {
      whereClause += ' AND category = ?';
      params.push(filters.category);
    }

    if (filters.is_active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(filters.is_active ? 1 : 0);
    }

    if (filters.is_public !== undefined) {
      whereClause += ' AND is_public = ?';
      params.push(filters.is_public ? 1 : 0);
    }

    if (filters.created_by) {
      whereClause += ' AND created_by = ?';
      params.push(filters.created_by);
    }

    const query = `
      SELECT 
        tt.*,
        u.name as creator_name
      FROM task_templates tt
      LEFT JOIN users u ON tt.created_by = u.id
      ${whereClause}
      ORDER BY tt.usage_count DESC, tt.created_at DESC
    `;

    return await this.db.query(query, params);
  }

  /**
   * 根据ID获取模板
   */
  async getTemplateById(id: number): Promise<TaskTemplate | null> {
    const query = `
      SELECT 
        tt.*,
        u.name as creator_name
      FROM task_templates tt
      LEFT JOIN users u ON tt.created_by = u.id
      WHERE tt.id = ?
    `;

    const [template] = await this.db.query(query, [id]);
    return template || null;
  }

  /**
   * 创建模板
   */
  async createTemplate(templateData: Partial<TaskTemplate>): Promise<TaskTemplate> {
    const {
      name,
      description,
      type,
      category,
      template_content,
      default_priority = 'medium',
      default_estimated_hours,
      is_active = true,
      is_public = true,
      created_by
    } = templateData;

    const query = `
      INSERT INTO task_templates (
        name, description, type, category, template_content,
        default_priority, default_estimated_hours, is_active, is_public, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      name,
      description,
      type,
      category,
      JSON.stringify(template_content),
      default_priority,
      default_estimated_hours,
      is_active ? 1 : 0,
      is_public ? 1 : 0,
      created_by
    ];

    const result = await this.db.query(query, params);
    const templateId = result.insertId;

    return this.getTemplateById(templateId) as Promise<TaskTemplate>;
  }

  /**
   * 更新模板
   */
  async updateTemplate(id: number, updateData: Partial<TaskTemplate>, userId: number): Promise<TaskTemplate> {
    // 检查权限
    const existingTemplate = await this.getTemplateById(id);
    if (!existingTemplate) {
      throw new Error('模板不存在');
    }

    if (existingTemplate.created_by !== userId) {
      throw new Error('无权限修改此模板');
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const params: any[] = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key as keyof TaskTemplate] !== undefined) {
        updateFields.push(`${key} = ?`);
        
        if (key === 'template_content') {
          params.push(JSON.stringify(updateData[key as keyof TaskTemplate]));
        } else if (key === 'is_active' || key === 'is_public') {
          params.push(updateData[key as keyof TaskTemplate] ? 1 : 0);
        } else {
          params.push(updateData[key as keyof TaskTemplate]);
        }
      }
    });

    if (updateFields.length === 0) {
      return existingTemplate;
    }

    const query = `
      UPDATE task_templates 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    await this.db.query(query, [...params, id]);

    return this.getTemplateById(id) as Promise<TaskTemplate>;
  }

  /**
   * 删除模板
   */
  async deleteTemplate(id: number, userId: number): Promise<void> {
    // 检查权限
    const existingTemplate = await this.getTemplateById(id);
    if (!existingTemplate) {
      throw new Error('模板不存在');
    }

    if (existingTemplate.created_by !== userId) {
      throw new Error('无权限删除此模板');
    }

    // 软删除：设置为不活跃状态
    const query = 'UPDATE task_templates SET is_active = 0 WHERE id = ?';
    await this.db.query(query, [id]);
  }

  /**
   * 获取模板分类
   */
  async getTemplateCategories(type?: string): Promise<string[]> {
    let whereClause = 'WHERE is_active = 1 AND category IS NOT NULL';
    const params: any[] = [];

    if (type) {
      whereClause += ' AND type = ?';
      params.push(type);
    }

    const query = `
      SELECT DISTINCT category
      FROM task_templates
      ${whereClause}
      ORDER BY category
    `;

    const results = await this.db.query(query, params);
    return results.map((row: any) => row.category);
  }

  /**
   * 获取热门模板
   */
  async getPopularTemplates(limit: number = 10): Promise<TaskTemplate[]> {
    const query = `
      SELECT 
        tt.*,
        u.name as creator_name
      FROM task_templates tt
      LEFT JOIN users u ON tt.created_by = u.id
      WHERE tt.is_active = 1 AND tt.is_public = 1
      ORDER BY tt.usage_count DESC, tt.created_at DESC
      LIMIT ?
    `;

    return await this.db.query(query, [limit]);
  }

  /**
   * 搜索模板
   */
  async searchTemplates(keyword: string, filters: TemplateFilters = {}): Promise<TaskTemplate[]> {
    let whereClause = 'WHERE (tt.name LIKE ? OR tt.description LIKE ?)';
    const params: any[] = [`%${keyword}%`, `%${keyword}%`];

    if (filters.type) {
      whereClause += ' AND tt.type = ?';
      params.push(filters.type);
    }

    if (filters.category) {
      whereClause += ' AND tt.category = ?';
      params.push(filters.category);
    }

    if (filters.is_active !== undefined) {
      whereClause += ' AND tt.is_active = ?';
      params.push(filters.is_active ? 1 : 0);
    }

    const query = `
      SELECT 
        tt.*,
        u.name as creator_name
      FROM task_templates tt
      LEFT JOIN users u ON tt.created_by = u.id
      ${whereClause}
      ORDER BY tt.usage_count DESC, tt.created_at DESC
    `;

    return await this.db.query(query, params);
  }

  /**
   * 复制模板
   */
  async duplicateTemplate(id: number, userId: number, newName?: string): Promise<TaskTemplate> {
    const originalTemplate = await this.getTemplateById(id);
    if (!originalTemplate) {
      throw new Error('模板不存在');
    }

    const templateData: Partial<TaskTemplate> = {
      name: newName || `${originalTemplate.name} (副本)`,
      description: originalTemplate.description,
      type: originalTemplate.type,
      category: originalTemplate.category,
      template_content: JSON.parse(originalTemplate.template_content as string),
      default_priority: originalTemplate.default_priority,
      default_estimated_hours: originalTemplate.default_estimated_hours,
      is_active: true,
      is_public: false, // 复制的模板默认为私有
      created_by: userId
    };

    return this.createTemplate(templateData);
  }

  /**
   * 增加模板使用次数
   */
  async incrementUsageCount(id: number): Promise<void> {
    const query = 'UPDATE task_templates SET usage_count = usage_count + 1 WHERE id = ?';
    await this.db.query(query, [id]);
  }

  /**
   * 获取模板统计信息
   */
  async getTemplateStats(userId?: number) {
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (userId) {
      whereClause += ' AND created_by = ?';
      params.push(userId);
    }

    const query = `
      SELECT 
        COUNT(*) as total_templates,
        SUM(CASE WHEN type = 'enrollment' THEN 1 ELSE 0 END) as enrollment_templates,
        SUM(CASE WHEN type = 'activity' THEN 1 ELSE 0 END) as activity_templates,
        SUM(CASE WHEN type = 'daily' THEN 1 ELSE 0 END) as daily_templates,
        SUM(CASE WHEN type = 'management' THEN 1 ELSE 0 END) as management_templates,
        SUM(usage_count) as total_usage,
        AVG(usage_count) as avg_usage,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_templates,
        SUM(CASE WHEN is_public = 1 THEN 1 ELSE 0 END) as public_templates
      FROM task_templates
      ${whereClause}
    `;

    const [stats] = await this.db.query(query, params);
    return stats;
  }
}
