import { Request, Response } from 'express';
import { PageGuideSection } from '../models/page-guide.model';

/**
 * 页面功能板块控制器
 */
export class PageGuideSectionController {
  /**
   * 创建页面功能板块
   */
  public static async createPageGuideSection(req: Request, res: Response): Promise<void> {
    try {
      const {
        pageGuideId,
        sectionName,
        sectionDescription,
        sectionPath,
        features,
        sortOrder,
        isActive
      } = req.body;

      if (!pageGuideId || !sectionName || !sectionDescription) {
        res.status(400).json({
          success: false,
          message: '页面说明文档ID、板块名称和板块描述不能为空'
        });
        return;
      }

      console.log('📝 创建页面功能板块:', sectionName);

      const newSection = await PageGuideSection.create({
        pageGuideId,
        sectionName,
        sectionDescription,
        sectionPath,
        features: features || [],
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      });

      console.log('✅ 页面功能板块创建成功:', sectionName);
      res.status(201).json({
        success: true,
        message: '页面功能板块创建成功',
        data: newSection
      });
    } catch (error) {
      console.error('❌ 创建页面功能板块失败:', error);
      res.status(500).json({
        success: false,
        message: '创建页面功能板块失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取页面功能板块列表
   */
  public static async getPageGuideSections(req: Request, res: Response): Promise<void> {
    try {
      const { pageGuideId } = req.query;

      const whereCondition: any = { isActive: true };
      if (pageGuideId) {
        whereCondition.pageGuideId = pageGuideId;
      }

      const sections = await PageGuideSection.findAll({
        where: whereCondition,
        order: [['sortOrder', 'ASC'], ['createdAt', 'ASC']]
      });

      res.json({
        success: true,
        message: '获取页面功能板块列表成功',
        data: sections
      });
    } catch (error) {
      console.error('❌ 获取页面功能板块列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取页面功能板块列表失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 更新页面功能板块
   */
  public static async updatePageGuideSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const {
        sectionName,
        sectionDescription,
        sectionPath,
        features,
        sortOrder,
        isActive
      } = req.body;

      const section = await PageGuideSection.findByPk(id);
      if (!section) {
        res.status(404).json({
          success: false,
          message: '页面功能板块不存在'
        });
        return;
      }

      await section.update({
        sectionName: sectionName || section.sectionName,
        sectionDescription: sectionDescription || section.sectionDescription,
        sectionPath: sectionPath !== undefined ? sectionPath : section.sectionPath,
        features: features || section.features,
        sortOrder: sortOrder !== undefined ? sortOrder : section.sortOrder,
        isActive: isActive !== undefined ? isActive : section.isActive
      });

      console.log('✅ 页面功能板块更新成功:', section.sectionName);
      res.json({
        success: true,
        message: '页面功能板块更新成功',
        data: section
      });
    } catch (error) {
      console.error('❌ 更新页面功能板块失败:', error);
      res.status(500).json({
        success: false,
        message: '更新页面功能板块失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 删除页面功能板块
   */
  public static async deletePageGuideSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const section = await PageGuideSection.findByPk(id);
      if (!section) {
        res.status(404).json({
          success: false,
          message: '页面功能板块不存在'
        });
        return;
      }

      await section.update({ isActive: false });

      console.log('✅ 页面功能板块删除成功:', section.sectionName);
      res.json({
        success: true,
        message: '页面功能板块删除成功'
      });
    } catch (error) {
      console.error('❌ 删除页面功能板块失败:', error);
      res.status(500).json({
        success: false,
        message: '删除页面功能板块失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}
