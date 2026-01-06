import { Request, Response } from 'express';
import { QueryTypes } from 'sequelize';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../init';
import SystemConfigService, { 
  CreateSystemConfigDto, 
  UpdateSystemConfigDto, 
  SystemConfigQueryParams 
} from '../services/system/system-config.service';
import { ConfigValueType } from '../models/system-config.model';

// 获取数据库实例
const getSequelizeInstance = () => {
  return sequelize;
};

/**
 * @swagger
 * /api/system-configs:
 *   get:
 *     summary: 获取系统配置列表
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: query
 *         name: groupKey
 *         schema:
 *           type: string
 *         description: 配置分组键名
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: isSystem
 *         schema:
 *           type: boolean
 *         description: 是否系统配置
 *       - in: query
 *         name: isReadonly
 *         schema:
 *           type: boolean
 *         description: 是否只读配置
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: updated_at
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemConfig'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
export const getSystemConfigs = async (req: Request, res: Response) => {
  try {
    const params: SystemConfigQueryParams = {
      groupKey: req.query.groupKey as string,
      keyword: req.query.keyword as string,
      isSystem: req.query.isSystem ? req.query.isSystem === 'true' : undefined,
      isReadonly: req.query.isReadonly ? req.query.isReadonly === 'true' : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) || 0 : 1,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string, 10) || 0 : 10,
      sortBy: req.query.sortBy as string || 'updated_at',
      sortOrder: (req.query.sortOrder as 'ASC' | 'DESC') || 'DESC'
    };

    const result = await SystemConfigService.getSystemConfigs(params);
    const totalPages = Math.ceil(result.count / params.pageSize!);

    return ApiResponse.success(res, {
      items: result.rows,
      total: result.count,
      page: params.page,
      pageSize: params.pageSize,
      totalPages
    });
  } catch (error) {
    console.error('SystemConfig error:', error);
    return ApiResponse.handleError(res, error, '获取系统配置列表失败');
  }
};

/**
 * @swagger
 * /api/system-configs:
 *   post:
 *     summary: 创建系统配置
 *     tags: [SystemConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupKey
 *               - configKey
 *               - configValue
 *               - valueType
 *               - description
 *             properties:
 *               groupKey:
 *                 type: string
 *                 description: 配置分组键名
 *                 example: "system"
 *               configKey:
 *                 type: string
 *                 description: 配置项键名
 *                 example: "site_name"
 *               configValue:
 *                 type: string
 *                 description: 配置项值
 *                 example: "幼儿园管理系统"
 *               valueType:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *                 description: 值类型
 *                 example: "string"
 *               description:
 *                 type: string
 *                 description: 配置描述
 *                 example: "网站名称"
 *               isSystem:
 *                 type: boolean
 *                 description: 是否系统配置
 *                 default: false
 *               isReadonly:
 *                 type: boolean
 *                 description: 是否只读配置
 *                 default: false
 *               sortOrder:
 *                 type: integer
 *                 description: 排序顺序
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 配置键已存在
 */
export const createSystemConfig = async (req: Request, res: Response) => {
  try {
    const data: CreateSystemConfigDto = {
      groupKey: req.body.groupKey,
      configKey: req.body.configKey,
      configValue: req.body.configValue,
      valueType: req.body.valueType as ConfigValueType,
      description: req.body.description,
      isSystem: req.body.isSystem,
      isReadonly: req.body.isReadonly,
      sortOrder: req.body.sortOrder,
      creatorId: (req as any).user?.id
    };

    const config = await SystemConfigService.createSystemConfig(data);
    return ApiResponse.success(res, config, '创建系统配置成功', 201);
  } catch (error) {
    return ApiResponse.handleError(res, error, '创建系统配置失败');
  }
};

/**
 * @swagger
 * /api/system-configs/{id}:
 *   get:
 *     summary: 获取系统配置详情
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: 配置不存在
 */
export const getSystemConfig = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    const config = await SystemConfigService.getSystemConfigById(id);
    return ApiResponse.success(res, config);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取系统配置详情失败');
  }
};

/**
 * @swagger
 * /api/system-configs/{id}:
 *   put:
 *     summary: 更新系统配置
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupKey:
 *                 type: string
 *                 description: 配置分组键名
 *               configKey:
 *                 type: string
 *                 description: 配置项键名
 *               configValue:
 *                 type: string
 *                 description: 配置项值
 *               valueType:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *                 description: 值类型
 *               description:
 *                 type: string
 *                 description: 配置描述
 *               isSystem:
 *                 type: boolean
 *                 description: 是否系统配置
 *               isReadonly:
 *                 type: boolean
 *                 description: 是否只读配置
 *               sortOrder:
 *                 type: integer
 *                 description: 排序顺序
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: 请求参数错误或只读配置不能修改
 *       404:
 *         description: 配置不存在
 *       409:
 *         description: 配置键已存在
 */
export const updateSystemConfig = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    const data: UpdateSystemConfigDto = {
      ...req.body,
      updaterId: (req as any).user?.id
    };

    const config = await SystemConfigService.updateSystemConfig(id, data);
    return ApiResponse.success(res, config, '更新系统配置成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '更新系统配置失败');
  }
};

/**
 * @swagger
 * /api/system-configs/{id}:
 *   delete:
 *     summary: 删除系统配置
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 系统配置不能删除
 *       404:
 *         description: 配置不存在
 */
export const deleteSystemConfig = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10) || 0;
    await SystemConfigService.deleteSystemConfig(id);
    return ApiResponse.success(res, null, '删除系统配置成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '删除系统配置失败');
  }
}; 