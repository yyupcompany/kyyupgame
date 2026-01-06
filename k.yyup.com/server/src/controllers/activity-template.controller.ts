import { Request, Response } from 'express';
import { ActivityTemplate } from '../models/activity-template.model';
import { Op } from 'sequelize';

export class ActivityTemplateController {
  // 获取所有活动模板
  async getAll(req: Request, res: Response) {
    try {
      const { category, status, page = 1, limit = 10 } = req.query;
      
      const whereClause: any = {};
      
      if (category) {
        whereClause.category = category;
      }
      
      if (status) {
        whereClause.status = status;
      } else {
        whereClause.status = 'active'; // 默认只显示活跃的模板
      }

      const offset = (Number(page) - 1) * Number(limit);

      const { rows: templates, count: total } = await ActivityTemplate.findAndCountAll({
        where: whereClause,
        order: [['usageCount', 'DESC'], ['createdAt', 'DESC']],
        limit: Number(limit),
        offset,
      });

      res.json({
        success: true,
        data: templates,
        pagination: {
          total,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('获取活动模板失败:', error);
      res.status(500).json({
        success: false,
        message: '获取活动模板失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 根据ID获取单个模板
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const template = await ActivityTemplate.findByPk(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: '模板不存在',
        });
      }

      res.json({
        success: true,
        data: template,
      });
    } catch (error) {
      console.error('获取模板详情失败:', error);
      res.status(500).json({
        success: false,
        message: '获取模板详情失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 创建新模板
  async create(req: Request, res: Response) {
    try {
      const { name, description, category, coverImage, templateData } = req.body;
      const createdBy = (req as any).user?.id || 1; // 从认证中间件获取用户ID

      const template = await ActivityTemplate.create({
        name,
        description,
        category,
        coverImage,
        templateData,
        createdBy,
      });

      res.status(201).json({
        success: true,
        data: template,
        message: '模板创建成功',
      });
    } catch (error) {
      console.error('创建模板失败:', error);
      res.status(500).json({
        success: false,
        message: '创建模板失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 更新模板
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, category, coverImage, templateData, status } = req.body;

      const template = await ActivityTemplate.findByPk(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: '模板不存在',
        });
      }

      await template.update({
        name,
        description,
        category,
        coverImage,
        templateData,
        status,
      });

      res.json({
        success: true,
        data: template,
        message: '模板更新成功',
      });
    } catch (error) {
      console.error('更新模板失败:', error);
      res.status(500).json({
        success: false,
        message: '更新模板失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 删除模板
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await ActivityTemplate.findByPk(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: '模板不存在',
        });
      }

      await template.destroy();

      res.json({
        success: true,
        message: '模板删除成功',
      });
    } catch (error) {
      console.error('删除模板失败:', error);
      res.status(500).json({
        success: false,
        message: '删除模板失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }

  // 使用模板（增加使用次数）
  async use(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await ActivityTemplate.findByPk(id);
      
      if (!template) {
        return res.status(404).json({
          success: false,
          message: '模板不存在',
        });
      }

      await template.increment('usageCount');

      res.json({
        success: true,
        data: template,
        message: '模板使用成功',
      });
    } catch (error) {
      console.error('使用模板失败:', error);
      res.status(500).json({
        success: false,
        message: '使用模板失败',
        error: error instanceof Error ? error.message : '未知错误',
      });
    }
  }
}

export default new ActivityTemplateController();
