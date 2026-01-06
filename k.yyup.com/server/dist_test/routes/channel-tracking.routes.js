"use strict";
exports.__esModule = true;
var express_1 = require("express");
var middlewares_1 = require("../middlewares");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     ChannelTracking:
 *       type: object
 *       required:
 *         - id
 *         - channel_name
 *         - channel_type
 *         - tracking_code
 *       properties:
 *         id:
 *           type: integer
 *           description: 渠道跟踪ID
 *           example: 1
 *         channel_name:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: 渠道名称
 *           example: "微信朋友圈推广"
 *         channel_type:
 *           type: string
 *           enum: [social_media, search_engine, referral, direct, email, advertisement]
 *           description: 渠道类型
 *           example: "social_media"
 *         tracking_code:
 *           type: string
 *           minLength: 3
 *           maxLength: 50
 *           description: 跟踪代码（唯一标识符）
 *           example: "WX001"
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: 渠道描述
 *           example: "通过微信朋友圈投放的广告，主要针对25-35岁的宝妈群体"
 *         target_audience:
 *           type: string
 *           maxLength: 200
 *           description: 目标受众
 *           example: "25-35岁宝妈群体"
 *         budget:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: 预算金额
 *           example: 5000.00
 *         spent_amount:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: 已花费金额
 *           example: 3250.50
 *         start_date:
 *           type: string
 *           format: date
 *           description: 开始日期
 *           example: "2024-01-01"
 *         end_date:
 *           type: string
 *           format: date
 *           description: 结束日期
 *           example: "2024-12-31"
 *         status:
 *           type: string
 *           enum: [active, inactive, pending]
 *           description: 状态
 *           example: "active"
 *         visits:
 *           type: integer
 *           minimum: 0
 *           description: 访问量
 *           example: 1250
 *         conversions:
 *           type: integer
 *           minimum: 0
 *           description: 转化数
 *           example: 45
 *         conversion_rate:
 *           type: number
 *           format: percentage
 *           minimum: 0
 *           maximum: 100
 *           description: 转化率（百分比）
 *           example: 3.6
 *         cost_per_conversion:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: 每次转化成本
 *           example: 72.23
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: 备注信息
 *           example: "表现良好，可考虑增加投入"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-15T10:30:00.000Z"
 *         created_by:
 *           type: integer
 *           description: 创建者用户ID
 *           example: 1
 *         updated_by:
 *           type: integer
 *           description: 最后更新者用户ID
 *           example: 1
 *   tags:
 *     - name: Channel Tracking
 *       description: 渠道跟踪管理API - 用于管理和监控各种营销渠道的效果和投资回报率
 */
/**
 * @swagger
 * /channel-trackings:
 *   get:
 *     tags:
 *       - Channel Tracking
 *     summary: 获取渠道跟踪列表
 *     description: 获取所有渠道跟踪记录的列表，支持分页和筛选
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
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *         description: 按渠道名称筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, pending]
 *         description: 按状态筛选
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期筛选
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期筛选
 *     responses:
 *       200:
 *         description: 成功获取渠道跟踪列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChannelTracking'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     pages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(200).json({ message: '获取渠道跟踪列表' });
});
/**
 * @swagger
 * /channel-trackings/{id}:
 *   get:
 *     tags:
 *       - Channel Tracking
 *     summary: 获取单个渠道跟踪
 *     description: 根据ID获取特定的渠道跟踪详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 渠道跟踪ID
 *     responses:
 *       200:
 *         description: 成功获取渠道跟踪详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChannelTracking'
 *       400:
 *         description: 无效的ID参数
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 未找到指定的渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(200).json({ message: "\u83B7\u53D6\u6E20\u9053\u8DDF\u8E2A ".concat(req.params.id) });
});
/**
 * @swagger
 * /channel-trackings:
 *   post:
 *     tags:
 *       - Channel Tracking
 *     summary: 创建渠道跟踪
 *     description: 创建新的渠道跟踪记录
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channel_name
 *               - channel_type
 *               - tracking_code
 *             properties:
 *               channel_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: 渠道名称
 *                 example: "微信朋友圈推广"
 *               channel_type:
 *                 type: string
 *                 enum: [social_media, search_engine, referral, direct, email, advertisement]
 *                 description: 渠道类型
 *                 example: "social_media"
 *               tracking_code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: 跟踪代码
 *                 example: "WX001"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: 渠道描述
 *                 example: "通过微信朋友圈投放的广告"
 *               target_audience:
 *                 type: string
 *                 maxLength: 200
 *                 description: 目标受众
 *                 example: "25-35岁宝妈群体"
 *               budget:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: 预算金额
 *                 example: 5000.00
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 开始日期
 *                 example: "2024-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 结束日期
 *                 example: "2024-12-31"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 default: pending
 *                 description: 状态
 *                 example: "active"
 *     responses:
 *       201:
 *         description: 成功创建渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChannelTracking'
 *                 message:
 *                   type: string
 *                   example: "渠道跟踪创建成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: 跟踪代码已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(201).json({ message: '创建渠道跟踪成功' });
});
/**
 * @swagger
 * /channel-trackings/{id}:
 *   put:
 *     tags:
 *       - Channel Tracking
 *     summary: 更新渠道跟踪
 *     description: 根据ID更新指定的渠道跟踪记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 渠道跟踪ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel_name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: 渠道名称
 *                 example: "微信朋友圈推广"
 *               channel_type:
 *                 type: string
 *                 enum: [social_media, search_engine, referral, direct, email, advertisement]
 *                 description: 渠道类型
 *                 example: "social_media"
 *               tracking_code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: 跟踪代码
 *                 example: "WX001"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: 渠道描述
 *                 example: "通过微信朋友圈投放的广告"
 *               target_audience:
 *                 type: string
 *                 maxLength: 200
 *                 description: 目标受众
 *                 example: "25-35岁宝妈群体"
 *               budget:
 *                 type: number
 *                 format: decimal
 *                 minimum: 0
 *                 description: 预算金额
 *                 example: 5000.00
 *               start_date:
 *                 type: string
 *                 format: date
 *                 description: 开始日期
 *                 example: "2024-01-01"
 *               end_date:
 *                 type: string
 *                 format: date
 *                 description: 结束日期
 *                 example: "2024-12-31"
 *               status:
 *                 type: string
 *                 enum: [active, inactive, pending]
 *                 description: 状态
 *                 example: "active"
 *     responses:
 *       200:
 *         description: 成功更新渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ChannelTracking'
 *                 message:
 *                   type: string
 *                   example: "渠道跟踪更新成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 未找到指定的渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 跟踪代码已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(200).json({ message: "\u66F4\u65B0\u6E20\u9053\u8DDF\u8E2A ".concat(req.params.id) });
});
/**
 * @swagger
 * /channel-trackings/{id}:
 *   delete:
 *     tags:
 *       - Channel Tracking
 *     summary: 删除渠道跟踪
 *     description: 根据ID删除指定的渠道跟踪记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 渠道跟踪ID
 *     responses:
 *       200:
 *         description: 成功删除渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "渠道跟踪删除成功"
 *       400:
 *         description: 无效的ID参数
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 未找到指定的渠道跟踪
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: 无法删除，渠道跟踪正在使用中
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(200).json({ message: "\u5220\u9664\u6E20\u9053\u8DDF\u8E2A ".concat(req.params.id) });
});
/**
 * @swagger
 * /channel-trackings/statistics:
 *   get:
 *     tags:
 *       - Channel Tracking
 *     summary: 获取渠道跟踪统计信息
 *     description: 获取渠道跟踪的各种统计数据和分析报告
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: 统计周期
 *       - in: query
 *         name: channel_type
 *         schema:
 *           type: string
 *           enum: [social_media, search_engine, referral, direct, email, advertisement]
 *         description: 按渠道类型筛选
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 成功获取统计信息
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
 *                     total_channels:
 *                       type: integer
 *                       description: 总渠道数
 *                       example: 25
 *                     active_channels:
 *                       type: integer
 *                       description: 活跃渠道数
 *                       example: 18
 *                     total_budget:
 *                       type: number
 *                       format: decimal
 *                       description: 总预算
 *                       example: 125000.00
 *                     spent_budget:
 *                       type: number
 *                       format: decimal
 *                       description: 已花费预算
 *                       example: 89600.00
 *                     channel_performance:
 *                       type: array
 *                       description: 各渠道表现
 *                       items:
 *                         type: object
 *                         properties:
 *                           channel_name:
 *                             type: string
 *                             example: "微信朋友圈推广"
 *                           tracking_code:
 *                             type: string
 *                             example: "WX001"
 *                           visits:
 *                             type: integer
 *                             example: 1250
 *                           conversions:
 *                             type: integer
 *                             example: 45
 *                           conversion_rate:
 *                             type: number
 *                             format: percentage
 *                             example: 3.6
 *                           cost_per_conversion:
 *                             type: number
 *                             format: decimal
 *                             example: 89.50
 *                     channel_type_stats:
 *                       type: array
 *                       description: 按渠道类型统计
 *                       items:
 *                         type: object
 *                         properties:
 *                           channel_type:
 *                             type: string
 *                             example: "social_media"
 *                           count:
 *                             type: integer
 *                             example: 8
 *                           total_budget:
 *                             type: number
 *                             format: decimal
 *                             example: 45000.00
 *                           total_visits:
 *                             type: integer
 *                             example: 5680
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', [middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('CHANNEL_TRACKING_MANAGE')], function (req, res) {
    // 临时实现，后续需要替换为实际的控制器方法
    res.status(200).json({ message: '获取渠道跟踪统计信息' });
});
exports["default"] = router;
