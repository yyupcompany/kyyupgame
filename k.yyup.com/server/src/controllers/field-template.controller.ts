/**
 * 字段模板控制器
 */

import { Request, Response } from 'express';
import { fieldTemplateService } from '../services/ai/field-template.service';

/**
 * 字段模板控制器类
 */
class FieldTemplateController {
  /**
   * 创建字段模板
   * POST /api/field-templates
   */
  async createTemplate(req: Request, res: Response) {
    try {
      const { name, description, entityType, fieldValues, isPublic } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      if (!name || !entityType || !fieldValues) {
        return res.status(400).json({
          success: false,
          message: '缺少必填参数：name, entityType, fieldValues'
        });
      }

      const template = await fieldTemplateService.createTemplate({
        name,
        description,
        entityType,
        fieldValues,
        userId,
        isPublic
      });

      res.status(201).json({
        success: true,
        message: '模板创建成功',
        data: template
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 创建失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '创建模板失败'
      });
    }
  }

  /**
   * 获取模板列表
   * GET /api/field-templates
   */
  async getTemplateList(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const {
        entityType,
        isPublic,
        page,
        pageSize,
        keyword
      } = req.query;

      const result = await fieldTemplateService.getTemplateList({
        userId,
        entityType: entityType as string,
        isPublic: isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string) : undefined,
        keyword: keyword as string
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 获取列表失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取模板列表失败'
      });
    }
  }

  /**
   * 获取模板详情
   * GET /api/field-templates/:id
   */
  async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const template = await fieldTemplateService.getTemplateById(parseInt(id), userId);

      res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 获取详情失败:', error);
      res.status(error.message === '模板不存在' ? 404 : 500).json({
        success: false,
        message: error.message || '获取模板详情失败'
      });
    }
  }

  /**
   * 应用模板
   * POST /api/field-templates/:id/apply
   */
  async applyTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const fieldValues = await fieldTemplateService.applyTemplate(parseInt(id), userId);

      res.json({
        success: true,
        message: '模板应用成功',
        data: fieldValues
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 应用失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '应用模板失败'
      });
    }
  }

  /**
   * 更新模板
   * PUT /api/field-templates/:id
   */
  async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { name, description, fieldValues, isPublic } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const template = await fieldTemplateService.updateTemplate(
        parseInt(id),
        userId,
        { name, description, fieldValues, isPublic }
      );

      res.json({
        success: true,
        message: '模板更新成功',
        data: template
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 更新失败:', error);
      res.status(error.message === '模板不存在' ? 404 : 500).json({
        success: false,
        message: error.message || '更新模板失败'
      });
    }
  }

  /**
   * 删除模板
   * DELETE /api/field-templates/:id
   */
  async deleteTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      await fieldTemplateService.deleteTemplate(parseInt(id), userId);

      res.json({
        success: true,
        message: '模板删除成功'
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 删除失败:', error);
      res.status(error.message === '模板不存在' ? 404 : 500).json({
        success: false,
        message: error.message || '删除模板失败'
      });
    }
  }

  /**
   * 获取热门模板
   * GET /api/field-templates/popular/:entityType
   */
  async getPopularTemplates(req: Request, res: Response) {
    try {
      const { entityType } = req.params;
      const { limit } = req.query;

      const templates = await fieldTemplateService.getPopularTemplates(
        entityType,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 获取热门模板失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取热门模板失败'
      });
    }
  }

  /**
   * 获取最近使用的模板
   * GET /api/field-templates/recent
   */
  async getRecentTemplates(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { entityType, limit } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '未授权'
        });
      }

      const templates = await fieldTemplateService.getRecentTemplates(
        userId,
        entityType as string,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        data: templates
      });
    } catch (error: any) {
      console.error('❌ [字段模板] 获取最近模板失败:', error);
      res.status(500).json({
        success: false,
        message: error.message || '获取最近模板失败'
      });
    }
  }
}

// 导出单例
export const fieldTemplateController = new FieldTemplateController();

