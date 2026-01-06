import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { PosterTemplateService } from '../services/marketing/poster-template.service';
import { PosterTemplate } from '../models/poster-template.model';
import { PosterCategory } from '../models/poster-category.model';

const posterTemplateService = new PosterTemplateService();

/**
 * 创建海报模板
 */
export const createTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }

    // 验证必填字段
    const { name, width, height } = req.body;
    if (!name) {
      throw ApiError.badRequest('模板名称不能为空');
    }
    if (!width || !height) {
      throw ApiError.badRequest('模板尺寸不能为空');
    }

    // 使用服务层创建模板
    const template = await posterTemplateService.createTemplate(req.body, userId);

    ApiResponse.success(res, template, '创建海报模板成功', 201);
  } catch (error) {
    ApiResponse.handleError(res, error, '创建海报模板失败');
  }
};

/**
 * 获取海报模板详情
 */
export const getTemplateById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的模板ID');
    }

    // 暂时返回模拟数据
    const template = {
      id: Number(id) || 0,
      name: '春季招生海报模板',
      description: '适用于春季招生活动的海报模板',
      category: 'enrollment',
      width: 750,
      height: 1334,
      elements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    ApiResponse.success(res, template, '获取海报模板详情成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取海报模板详情失败');
  }
};

/**
 * 更新海报模板
 */
export const updateTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的模板ID');
    }

    // 暂时返回模拟数据
    const template = {
      id: Number(id) || 0,
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    ApiResponse.success(res, template, '更新海报模板成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '更新海报模板失败');
  }
};

/**
 * 删除海报模板
 */
export const deleteTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的模板ID');
    }

    ApiResponse.success(res, null, '删除海报模板成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '删除海报模板失败');
  }
};

/**
 * 获取海报模板列表
 */
export const getTemplates = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, pageSize = 12, category, keyword } = req.query;

    // 使用文件顶部静态导入的模型
    // 构建查询条件
    const whereClause: any = {
      status: 1 // 只查询启用的模板
    };

    if (category) {
      whereClause.category = category;
    }

    if (keyword) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 查询模板列表（带分页）
    const { count, rows: templates } = await PosterTemplate.findAndCountAll({
      where: whereClause,
      limit: Number(pageSize),
      offset: (Number(page) - 1) * Number(pageSize),
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'name', 'description', 'category',
        'width', 'height', 'background', 'thumbnail',
        'kindergartenId', 'status', 'usageCount', 'remark',
        'creatorId', 'updaterId', 'createdAt', 'updatedAt'
      ]
    });

    // 格式化返回数据以匹配前端期望的格式
    const formattedResult = {
      templates: templates.map(t => t.toJSON()),
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: count,
        totalPages: Math.ceil(count / Number(pageSize))
      }
    };

    ApiResponse.success(res, formattedResult, '获取海报模板列表成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取海报模板列表失败');
  }
};

/**
 * 预览海报模板
 */
export const previewTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的模板ID');
    }

    // 暂时返回模拟数据
    const previewData = {
      templateId: Number(id) || 0,
      previewUrl: `/api/poster-templates/${id}/preview.png`,
      width: 750,
      height: 1334,
      generatedAt: new Date()
    };

    ApiResponse.success(res, previewData, '生成海报模板预览成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '生成海报模板预览失败');
  }
};

/**
 * 添加模板元素
 */
export const addElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0)) {
      throw ApiError.badRequest('无效的模板ID');
    }

    // 暂时返回模拟数据
    const element = {
      id: Date.now(),
      templateId: Number(id) || 0,
      ...req.body,
      createdBy: userId,
      createdAt: new Date()
    };

    ApiResponse.success(res, element, '添加模板元素成功', 201);
  } catch (error) {
    ApiResponse.handleError(res, error, '添加模板元素失败');
  }
};

/**
 * 更新模板元素
 */
export const updateElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, elementId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0) || !elementId || isNaN(Number(elementId) || 0)) {
      throw ApiError.badRequest('无效的模板ID或元素ID');
    }

    // 暂时返回模拟数据
    const element = {
      id: Number(elementId) || 0,
      templateId: Number(id) || 0,
      ...req.body,
      updatedBy: userId,
      updatedAt: new Date()
    };

    ApiResponse.success(res, element, '更新模板元素成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '更新模板元素失败');
  }
};

/**
 * 删除模板元素
 */
export const deleteElement = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, elementId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      throw ApiError.unauthorized('未登录或登录已过期');
    }
    
    if (!id || isNaN(Number(id) || 0) || !elementId || isNaN(Number(elementId) || 0)) {
      throw ApiError.badRequest('无效的模板ID或元素ID');
    }

    ApiResponse.success(res, null, '删除模板元素成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '删除模板元素失败');
  }
};

/**
 * 获取模板分类
 */
export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    // 使用文件顶部静态导入的模型
    const categories = await PosterCategory.getCategoryTree();

    ApiResponse.success(res, categories, '获取模板分类成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取模板分类失败');
  }
};

/**
 * 获取子分类
 */
export const getSubCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { parentId } = req.params;
    // 使用文件顶部静态导入的模型
    const subCategories = await PosterCategory.getChildCategories(Number(parentId));

    ApiResponse.success(res, subCategories, '获取子分类成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取子分类失败');
  }
};

/**
 * 根据代码获取分类
 */
export const getCategoryByCode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    // 使用文件顶部静态导入的模型
    const category = await PosterCategory.getCategoryByCode(code);

    if (!category) {
      throw ApiError.notFound('分类不存在');
    }

    ApiResponse.success(res, category, '获取分类成功');
  } catch (error) {
    ApiResponse.handleError(res, error, '获取分类失败');
  }
};