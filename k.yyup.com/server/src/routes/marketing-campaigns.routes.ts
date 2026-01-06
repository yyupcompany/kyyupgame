/**
* @swagger
 * components:
 *   schemas:
 *     MarketingCampaign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 营销活动唯一标识符
 *           example: 1
 *         name:
 *           type: string
 *           description: 活动名称
 *           example: "春季招生优惠活动"
 *         description:
 *           type: string
 *           description: 活动详细描述
 *           example: "针对3-6岁幼儿的春季招生优惠政策，包括学费减免和礼品赠送"
 *         type:
 *           type: string
 *           enum: ["enrollment", "promotion", "event", "referral", "brand"]
 *           description: 活动类型
 *           example: "enrollment"
 *         status:
 *           type: string
 *           enum: ["draft", "active", "paused", "completed", "cancelled"]
 *           description: 活动状态
 *           example: "active"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2024-03-01T00:00:00Z"
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2024-03-31T23:59:59Z"
 *         budget:
 *           type: number
 *           format: float
 *           description: 活动预算
 *           example: 50000.00
 *         actual_cost:
 *           type: number
 *           format: float
 *           description: 实际花费
 *           example: 32000.00
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *           example: "2-4岁幼儿家长"
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *           description: 推广渠道
 *           example: ["微信", "官方网站", "社区推广"]
 *         expected_leads:
 *           type: integer
 *           description: 预期线索数量
 *           example: 200
 *         actual_leads:
 *           type: integer
 *           description: 实际线索数量
 *           example: 186
 *         conversion_rate:
 *           type: number
 *           format: float
 *           description: 转化率（百分比）
 *           example: 25.5
 *         roi:
 *           type: number
 *           format: float
 *           description: 投资回报率
 *           example: 3.2
 *         created_by:
 *           type: integer
 *           description: 创建人ID
 *           example: 123
 *         creator:
 *           type: object
 *           description: 创建人信息
 *           properties:
 *             id:
 *               type: integer
 *               example: 123
 *             name:
 *               type: string
 *               example: "市场部经理"
 *             avatar:
 *               type: string
 *               example: "avatar.jpg"
 *         manager_id:
 *           type: integer
 *           description: 负责人ID
 *           example: 456
 *         manager:
 *           type: object
 *           description: 负责人信息
 *           properties:
 *             id:
 *               type: integer
 *               example: 456
 *             name:
 *               type: string
 *               example: "张主管"
 *             avatar:
 *               type: string
 *               example: "avatar.jpg"
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 活动标签
 *           example: ["招生", "优惠", "春季"]
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "http://example.com/campaign-image.jpg"
 *               alt:
 *                 type: string
 *                 example: "春季招生活动宣传图"
 *           description: 活动图片
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "活动方案.pdf"
 *               url:
 *                 type: string
 *                 example: "http://example.com/plan.pdf"
 *           description: 附件资料
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-02-15T09:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-03-01T15:30:00Z"
*
 *     CampaignStats:
 *       type: object
 *       properties:
 *         total_campaigns:
 *           type: integer
 *           description: 总活动数
 *           example: 25
 *         active_campaigns:
 *           type: integer
 *           description: 进行中的活动数
 *           example: 8
 *         completed_campaigns:
 *           type: integer
 *           description: 已完成的活动数
 *           example: 15
 *         total_budget:
 *           type: number
 *           format: float
 *           description: 总预算
 *           example: 500000.00
 *         total_spent:
 *           type: number
 *           format: float
 *           description: 总花费
 *           example: 420000.00
 *         total_leads:
 *           type: integer
 *           description: 总线索数
 *           example: 1250
 *         avg_conversion_rate:
 *           type: number
 *           format: float
 *           description: 平均转化率
 *           example: 28.5
 *         avg_roi:
 *           type: number
 *           format: float
 *           description: 平均投资回报率
 *           example: 3.8
 *         campaigns_this_month:
 *           type: integer
 *           description: 本月新增活动数
 *           example: 3
 *         best_performing_campaign:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             name:
 *               type: string
 *               example: "秋季招生活动"
 *             roi:
 *               type: number
 *               format: float
 *               example: 5.2
 *           description: 表现最佳的活动
 *         type_distribution:
 *           type: object
 *           properties:
 *             enrollment:
 *               type: integer
 *               example: 10
 *             promotion:
 *               type: integer
 *               example: 8
 *             event:
 *               type: integer
 *               example: 4
 *             referral:
 *               type: integer
 *               example: 2
 *             brand:
 *               type: integer
 *               example: 1
 *           description: 活动类型分布
*
 *     CreateCampaignRequest:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - type
 *         - start_date
 *         - end_date
 *         - budget
 *       properties:
 *         name:
 *           type: string
 *           description: 活动名称
 *           example: "夏季夏令营活动"
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: 活动详细描述
 *           example: "为期一个月的夏季夏令营活动"
 *           maxLength: 1000
 *         type:
 *           type: string
 *           enum: ["enrollment", "promotion", "event", "referral", "brand"]
 *           description: 活动类型
 *           example: "event"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2024-07-01T00:00:00Z"
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2024-07-31T23:59:59Z"
 *         budget:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: 活动预算
 *           example: 80000.00
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *           example: "4-6岁幼儿"
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *           description: 推广渠道
 *           example: ["微信公众号", "社区海报"]
 *         expected_leads:
 *           type: integer
 *           minimum: 0
 *           description: 预期线索数量
 *           example: 150
 *         manager_id:
 *           type: integer
 *           description: 负责人ID
 *           example: 456
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 活动标签
 *           example: ["夏令营", "暑期", "活动"]
*
 *     UpdateCampaignRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 活动名称
 *           example: "更新后的夏季活动"
 *           minLength: 1
 *           maxLength: 100
 *         description:
 *           type: string
 *           description: 活动详细描述
 *           example: "更新后的活动描述"
 *           maxLength: 1000
 *         status:
 *           type: string
 *           enum: ["draft", "active", "paused", "completed", "cancelled"]
 *           description: 活动状态
 *           example: "completed"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2024-07-01T00:00:00Z"
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2024-08-15T23:59:59Z"
 *         actual_cost:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: 实际花费
 *           example: 75000.00
 *         actual_leads:
 *           type: integer
 *           minimum: 0
 *           description: 实际线索数量
 *           example: 142
 *         conversion_rate:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *           description: 转化率（百分比）
 *           example: 22.8
 *         roi:
 *           type: number
 *           format: float
 *           description: 投资回报率
 *           example: 4.1
*
 *     CampaignListQuery:
 *       type: object
 *       properties:
 *         page:
 *           type: integer
 *           minimum: 1
 *           description: 页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           description: 每页数量
 *           example: 20
 *         status:
 *           type: string
 *           enum: ["draft", "active", "paused", "completed", "cancelled"]
 *           description: 按状态筛选
 *           example: "active"
 *         type:
 *           type: string
 *           enum: ["enrollment", "promotion", "event", "referral", "brand"]
 *           description: 按类型筛选
 *           example: "enrollment"
 *         manager_id:
 *           type: integer
 *           description: 按负责人筛选
 *           example: 456
 *         date_range:
 *           type: string
 *           enum: ["this_week", "this_month", "this_quarter", "this_year"]
 *           description: 时间范围筛选
 *           example: "this_month"
 *         keyword:
 *           type: string
 *           description: 关键词搜索（名称、描述）
 *           example: "春季"
 *         sort_by:
 *           type: string
 *           enum: ["created_at", "start_date", "budget", "roi", "conversion_rate"]
 *           description: 排序字段
 *           example: "roi"
 *         sort_order:
 *           type: string
 *           enum: ["asc", "desc"]
 *           description: 排序顺序
 *           example: "desc"
*
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*
 *   responses:
 *     Unauthorized:
 *       description: 未授权访问
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "UNAUTHORIZED"
 *                   message:
 *                     type: string
 *                     example: "访问被拒绝，请提供有效的访问令牌"
 *     Forbidden:
 *       description: 权限不足
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "FORBIDDEN"
 *                   message:
 *                     type: string
 *                     example: "权限不足，无法访问该资源"
 *     NotFound:
 *       description: 资源不存在
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "NOT_FOUND"
 *                   message:
 *                     type: string
 *                     example: "请求的资源不存在"
 *     BadRequest:
 *       description: 请求参数错误
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "BAD_REQUEST"
 *                   message:
 *                     type: string
 *                     example: "请求参数格式错误或缺少必要参数"
 *     InternalServerError:
 *       description: 服务器内部错误
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               success:
 *                 type: boolean
 *                 example: false
 *               error:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                     example: "INTERNAL_ERROR"
 *                   message:
 *                     type: string
 *                     example: "服务器内部错误，请稍后重试"
*/

/**
 * 营销活动管理路由文件
 * 支持营销活动的创建、管理、统计和分析功能
*/

import * as express from 'express';
import { Op } from 'sequelize';
import { verifyToken } from '../middlewares/auth.middleware';
import { MarketingCampaign, CampaignStatus } from '../models/marketing-campaign.model';
import { ApiResponse } from '../utils/apiResponse';
import { sequelize } from '../init';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/marketing-campaigns:
 *   get:
 *     summary: 获取营销活动列表
 *     description: 分页获取营销活动列表，支持多种筛选和排序条件
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: ["draft", "active", "paused", "completed", "cancelled"]
 *         description: 按状态筛选
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ["enrollment", "promotion", "event", "referral", "brand"]
 *         description: 按类型筛选
 *       - in: query
 *         name: manager_id
 *         schema:
 *           type: integer
 *         description: 按负责人筛选
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索（名称、描述）
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: ["created_at", "start_date", "budget", "roi"]
 *           default: "created_at"
 *         description: 排序字段
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: ["asc", "desc"]
 *           default: "desc"
 *         description: 排序顺序
 *     responses:
 *       200:
 *         description: 成功获取营销活动列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 20
 *                 message:
 *                   type: string
 *                   example: "获取营销活动列表成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const managerId = req.query.manager_id as string;
    const keyword = req.query.keyword as string;
    const sortBy = req.query.sort_by as string || 'created_at';
    const sortOrder = req.query.sort_order as string || 'desc';

    // 构建查询条件
    const whereConditions: any = {};

    if (status) {
      whereConditions.status = status;
    }

    if (type) {
      whereConditions.type = type;
    }

    if (managerId) {
      whereConditions.manager_id = parseInt(managerId);
    }

    if (keyword) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } }
      ];
    }

    // 构建排序条件
    const order: any[] = [];
    order.push([sortBy, sortOrder.toUpperCase()]);

    // 获取总数
    const total = await MarketingCampaign.count({ where: whereConditions });

    // 获取分页数据
    const offset = (page - 1) * pageSize;
    const list = await MarketingCampaign.findAll({
      where: whereConditions,
      order,
      limit: pageSize,
      offset
    });

    return ApiResponse.success(res, {
      list,
      total,
      page,
      pageSize
    }, '获取营销活动列表成功');
  } catch (error) {
    console.error('[AI]: 获取营销活动列表失败:', error);
    return ApiResponse.error(res, '获取营销活动列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/marketing-campaigns:
 *   post:
 *     summary: 创建营销活动
 *     description: 创建一个新的营销活动，自动分配创建者和时间戳
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCampaignRequest'
 *           example:
 *             name: "秋季招生优惠活动"
 *             description: "针对新生的秋季招生优惠政策"
 *             type: "enrollment"
 *             start_date: "2024-09-01T00:00:00Z"
 *             end_date: "2024-09-30T23:59:59Z"
 *             budget: 60000.00
 *             target_audience: "3-5岁幼儿家长"
 *             channels: ["微信公众号", "社区推广"]
 *             expected_leads: 200
 *             manager_id: 456
 *             tags: ["招生", "秋季", "优惠"]
 *     responses:
 *       201:
 *         description: 成功创建营销活动
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *                 message:
 *                   type: string
 *                   example: "创建营销活动成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/', async (req, res) => {
  try {
    // 验证必要字段
    const requiredFields = ['name', 'description', 'type', 'start_date', 'end_date', 'budget'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return ApiResponse.error(res, `缺少必要字段: ${field}`, 'BAD_REQUEST', 400);
      }
    }

    // 验证日期
    const startDate = new Date(req.body.start_date);
    const endDate = new Date(req.body.end_date);
    if (startDate >= endDate) {
      return ApiResponse.error(res, '结束时间必须晚于开始时间', 'BAD_REQUEST', 400);
    }

    // 验证预算
    if (req.body.budget <= 0) {
      return ApiResponse.error(res, '预算必须大于0', 'BAD_REQUEST', 400);
    }

    const item = await MarketingCampaign.create({
      ...req.body,
      status: 'draft',
      actual_cost: 0,
      actual_leads: 0,
      conversion_rate: 0,
      roi: 0,
      created_by: req.user?.id || 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    return ApiResponse.success(res, item, '创建营销活动成功');
  } catch (error) {
    console.error('[AI]: 创建营销活动失败:', error);
    return ApiResponse.error(res, '创建营销活动失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/marketing-campaigns/{id}:
 *   get:
 *     summary: 获取营销活动详情
 *     description: 根据活动ID获取特定营销活动的详细信息
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取营销活动详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *                 message:
 *                   type: string
 *                   example: "获取营销活动详情成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await MarketingCampaign.findByPk(id);

    if (!item) {
      return ApiResponse.notFound(res, '营销活动不存在');
    }

    return ApiResponse.success(res, item, '获取营销活动详情成功');
  } catch (error) {
    console.error('[AI]: 获取营销活动详情失败:', error);
    return ApiResponse.error(res, '获取营销活动详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/marketing-campaigns/{id}:
 *   put:
 *     summary: 更新营销活动
 *     description: 根据活动ID更新营销活动的详细信息，支持部分更新
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCampaignRequest'
 *           example:
 *             status: "completed"
 *             actual_cost: 55000.00
 *             actual_leads: 186
 *             conversion_rate: 28.5
 *             roi: 4.2
 *     responses:
 *       200:
 *         description: 成功更新营销活动
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *                 message:
 *                   type: string
 *                   example: "更新营销活动成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 验证活动是否存在
    const existingItem = await MarketingCampaign.findByPk(id);
    if (!existingItem) {
      return ApiResponse.notFound(res, '营销活动不存在');
    }

    // 验证日期逻辑
    if (req.body.start_date && req.body.end_date) {
      const startDate = new Date(req.body.start_date);
      const endDate = new Date(req.body.end_date);
      if (startDate >= endDate) {
        return ApiResponse.error(res, '结束时间必须晚于开始时间', 'BAD_REQUEST', 400);
      }
    }

    // 验证数值字段
    if (req.body.budget !== undefined && req.body.budget <= 0) {
      return ApiResponse.error(res, '预算必须大于0', 'BAD_REQUEST', 400);
    }

    if (req.body.actual_cost !== undefined && req.body.actual_cost < 0) {
      return ApiResponse.error(res, '实际花费不能为负数', 'BAD_REQUEST', 400);
    }

    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const [updatedRowsCount] = await MarketingCampaign.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, '营销活动不存在');
    }

    const updatedItem = await MarketingCampaign.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新营销活动成功');
  } catch (error) {
    console.error('[AI]: 更新营销活动失败:', error);
    return ApiResponse.error(res, '更新营销活动失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/marketing-campaigns/{id}:
 *   delete:
 *     summary: 删除营销活动
 *     description: 根据活动ID删除指定的营销活动（软删除）
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除营销活动
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   nullable: true
 *                 message:
 *                   type: string
 *                   example: "删除营销活动成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 活动正在进行中，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                       example: "FORBIDDEN"
 *                     message:
 *                       type: string
 *                       example: "正在进行中的活动无法删除"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 检查活动是否存在
    const existingItem = await MarketingCampaign.findByPk(id);
    if (!existingItem) {
      return ApiResponse.notFound(res, '营销活动不存在');
    }

    // 检查活动状态，进行中的活动不能删除
    if (existingItem.status === CampaignStatus.ONGOING) {
      return ApiResponse.error(res, '正在进行中的活动无法删除', 'FORBIDDEN', 403);
    }

    const deletedRowsCount = await MarketingCampaign.destroy({
      where: { id }
    });

    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, '营销活动不存在');
    }

    return ApiResponse.success(res, null, '删除营销活动成功');
  } catch (error) {
    console.error('[AI]: 删除营销活动失败:', error);
    return ApiResponse.error(res, '删除营销活动失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/marketing-campaigns/stats:
 *   get:
 *     summary: 获取营销活动统计数据
 *     description: 获取营销活动的各项统计数据，包括总数、状态分布、ROI等
 *     tags:
 *       - Marketing Campaigns
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取营销活动统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CampaignStats'
 *                 message:
 *                   type: string
 *                   example: "获取营销活动统计数据成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/stats', async (req, res) => {
  try {
    // 总活动数
    const totalCampaigns = await MarketingCampaign.count();

    // 各状态统计
    const activeCampaigns = await MarketingCampaign.count({ where: { status: 'active' } });
    const completedCampaigns = await MarketingCampaign.count({ where: { status: 'completed' } });

    // 预算和花费统计
    const budgetResult = await MarketingCampaign.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('budget')), 'totalBudget'],
        [sequelize.fn('SUM', sequelize.col('actual_cost')), 'totalSpent']
      ],
      raw: true
    }) as any[];

    // 线索和转化统计
    const leadsResult = await MarketingCampaign.findAll({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('actual_leads')), 'totalLeads'],
        [sequelize.fn('AVG', sequelize.col('conversion_rate')), 'avgConversionRate'],
        [sequelize.fn('AVG', sequelize.col('roi')), 'avgRoi']
      ],
      raw: true
    }) as any[];

    const stats = {
      total_campaigns: totalCampaigns,
      active_campaigns: activeCampaigns,
      completed_campaigns: completedCampaigns,
      total_budget: parseFloat(budgetResult[0]?.totalBudget || 0),
      total_spent: parseFloat(budgetResult[0]?.totalSpent || 0),
      total_leads: parseInt(leadsResult[0]?.totalLeads || 0),
      avg_conversion_rate: parseFloat(leadsResult[0]?.avgConversionRate || 0),
      avg_roi: parseFloat(leadsResult[0]?.avgRoi || 0)
    };

    return ApiResponse.success(res, stats, '获取营销活动统计数据成功');
  } catch (error) {
    console.error('[AI]: 获取营销活动统计数据失败:', error);
    return ApiResponse.error(res, '获取营销活动统计数据失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
