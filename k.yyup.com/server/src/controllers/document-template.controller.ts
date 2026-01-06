import { Request, Response } from 'express';
import DocumentTemplate from '../models/document-template.model';
import { Op } from 'sequelize';

/**
 * 文档模板控制器
 */
export class DocumentTemplateController {
  
  /**
   * 获取模板列表
   * GET /api/document-templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const {
        page = 1,
        pageSize = 20,
        category,
        subCategory,
        frequency,
        priority,
        keyword,
        isDetailed,
        sortBy = 'createdAt',
        sortOrder = 'DESC'
      } = req.query;

      // 构建查询条件
      const where: any = {
        isActive: true
      };

      if (category) {
        where.category = category;
      }

      if (subCategory) {
        where.subCategory = subCategory;
      }

      if (frequency) {
        where.frequency = frequency;
      }

      if (priority) {
        where.priority = priority;
      }

      if (isDetailed !== undefined) {
        where.isDetailed = isDetailed === 'true';
      }

      // 关键词搜索
      if (keyword) {
        where[Op.or] = [
          { name: { [Op.like]: `%${keyword}%` } },
          { code: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ];
      }

      // 分页
      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      // 查询
      const { count, rows } = await DocumentTemplate.findAndCountAll({
        where,
        offset,
        limit,
        order: [[sortBy as string, sortOrder as string]],
        attributes: [
          'id', 'code', 'name', 'description', 'category', 'subCategory',
          'frequency', 'priority', 'isDetailed', 'lineCount', 
          'estimatedFillTime', 'useCount', 'lastUsedAt', 'version',
          'createdAt', 'updatedAt'
        ]
      });

      return res.json({
        success: true,
        data: {
          items: rows,
          total: count,
          page: Number(page),
          pageSize: Number(pageSize),
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });
    } catch (error: any) {
      console.error('获取模板列表失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取模板列表失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取模板详情
   * GET /api/document-templates/:id
   */
  static async getTemplateById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const template = await DocumentTemplate.findByPk(id);

      if (!template) {
        return res.status(404).json({
          success: false,
          error: {
            code: 404,
            message: '模板不存在'
          }
        });
      }

      // 更新使用统计
      await template.increment('useCount');
      await template.update({
        lastUsedAt: new Date()
      });

      return res.json({
        success: true,
        data: template
      });
    } catch (error: any) {
      console.error('获取模板详情失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取模板详情失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 搜索模板
   * GET /api/document-templates/search
   */
  static async searchTemplates(req: Request, res: Response) {
    try {
      const { keyword, limit = 10 } = req.query;

      if (!keyword) {
        return res.status(400).json({
          success: false,
          error: {
            code: 400,
            message: '请提供搜索关键词'
          }
        });
      }

      const templates = await DocumentTemplate.findAll({
        where: {
          isActive: true,
          [Op.or]: [
            { name: { [Op.like]: `%${keyword}%` } },
            { code: { [Op.like]: `%${keyword}%` } }
          ]
        },
        limit: Number(limit),
        order: [['useCount', 'DESC']],
        attributes: [
          'id', 'code', 'name', 'category',
          'frequency', 'priority', 'useCount'
        ]
      });

      return res.json({
        success: true,
        data: {
          keyword,
          results: templates,
          count: templates.length
        }
      });
    } catch (error: any) {
      console.error('搜索模板失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '搜索模板失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 获取分类列表
   * GET /api/document-templates/categories
   */
  static async getCategories(req: Request, res: Response) {
    try {
      // 查询所有分类及其模板数量
      const categories = await DocumentTemplate.findAll({
        where: { isActive: true },
        attributes: [
          'category',
          [DocumentTemplate.sequelize!.fn('COUNT', DocumentTemplate.sequelize!.col('id')), 'count']
        ],
        group: ['category'],
        raw: true
      });

      // 分类映射
      const categoryMap: Record<string, string> = {
        'annual': '年度检查类',
        'special': '专项检查类',
        'routine': '常态化督导类',
        'staff': '教职工管理类',
        'student': '幼儿管理类',
        'finance': '财务管理类',
        'education': '保教工作类'
      };

      const result = categories.map((cat: any) => ({
        code: cat.category,
        name: categoryMap[cat.category] || cat.category,
        count: Number(cat.count)
      }));

      return res.json({
        success: true,
        data: {
          categories: result,
          total: result.reduce((sum, cat) => sum + cat.count, 0)
        }
      });
    } catch (error: any) {
      console.error('获取分类列表失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取分类列表失败',
          details: error.message
        }
      });
    }
  }

  /**
   * 智能推荐模板
   * GET /api/document-templates/recommend
   */
  static async recommendTemplates(req: Request, res: Response) {
    try {
      const { type = 'all', limit = 5 } = req.query;
      const kindergartenId = (req as any).user?.kindergartenId;

      const result: any = {};

      // 最近使用
      if (type === 'recent' || type === 'all') {
        result.recentUsed = await DocumentTemplate.findAll({
          where: { isActive: true },
          order: [['lastUsedAt', 'DESC']],
          limit: Number(limit),
          attributes: ['id', 'code', 'name', 'category', 'lastUsedAt']
        });
      }

      // 常用模板
      if (type === 'frequent' || type === 'all') {
        result.frequentUsed = await DocumentTemplate.findAll({
          where: { isActive: true },
          order: [['useCount', 'DESC']],
          limit: Number(limit),
          attributes: ['id', 'code', 'name', 'category', 'useCount']
        });
      }

      // 即将需要（根据当前月份推荐）
      if (type === 'upcoming' || type === 'all') {
        const currentMonth = new Date().getMonth() + 1;
        let frequency = 'as_needed';
        
        // 简单的时间推荐逻辑
        if (currentMonth >= 9 && currentMonth <= 12) {
          frequency = 'yearly'; // 年检季节
        }

        result.upcoming = await DocumentTemplate.findAll({
          where: {
            isActive: true,
            frequency: frequency
          },
          limit: Number(limit),
          attributes: ['id', 'code', 'name', 'category', 'frequency', 'priority']
        });
      }

      return res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('获取推荐模板失败:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: '获取推荐模板失败',
          details: error.message
        }
      });
    }
  }
}

