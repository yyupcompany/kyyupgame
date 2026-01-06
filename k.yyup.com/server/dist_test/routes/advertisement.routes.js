"use strict";
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var advertisement_controller_1 = require("../controllers/advertisement.controller");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Advertisement:
 *       type: object
 *       required:
 *         - title
 *         - type
 *         - content
 *         - targetAudience
 *         - startDate
 *         - endDate
 *       properties:
 *         id:
 *           type: integer
 *           description: 广告ID
 *         title:
 *           type: string
 *           description: 广告标题
 *         type:
 *           type: string
 *           enum: [banner, popup, video, image, text]
 *           description: 广告类型
 *         content:
 *           type: string
 *           description: 广告内容
 *         imageUrl:
 *           type: string
 *           description: 图片URL
 *         linkUrl:
 *           type: string
 *           description: 链接URL
 *         targetAudience:
 *           type: string
 *           enum: [all, parent, teacher, admin]
 *           description: 目标受众
 *         priority:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: 优先级
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *         status:
 *           type: string
 *           enum: [active, paused, expired, draft]
 *           description: 状态
 *         clickCount:
 *           type: integer
 *           description: 点击次数
 *         viewCount:
 *           type: integer
 *           description: 查看次数
 *         createdBy:
 *           type: integer
 *           description: 创建者ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     AdvertisementStatistics:
 *       type: object
 *       properties:
 *         totalAds:
 *           type: integer
 *           description: 总广告数
 *         activeAds:
 *           type: integer
 *           description: 活跃广告数
 *         pausedAds:
 *           type: integer
 *           description: 暂停广告数
 *         expiredAds:
 *           type: integer
 *           description: 过期广告数
 *         totalViews:
 *           type: integer
 *           description: 总查看次数
 *         totalClicks:
 *           type: integer
 *           description: 总点击次数
 *         clickThroughRate:
 *           type: number
 *           format: float
 *           description: 点击率
 *   tags:
 *     - name: Advertisements
 *       description: 广告管理
 */
/**
 * @swagger
 * /api/advertisements/stats:
 *   get:
 *     tags: [Advertisements]
 *     summary: 获取全部广告统计数据
 *     description: 获取系统中所有广告的统计信息，包括总数、活跃数、点击率等
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告统计数据成功"
 *                 data:
 *                   $ref: '#/components/schemas/AdvertisementStatistics'
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAllAdvertisementStatistics);
/**
 * @swagger
 * /api/advertisements/by-type/{type}:
 *   get:
 *     tags: [Advertisements]
 *     summary: 按类型获取广告列表
 *     description: 根据广告类型获取对应的广告列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [banner, popup, video, image, text]
 *         description: 广告类型
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
 *     responses:
 *       200:
 *         description: 获取广告列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     advertisements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Advertisement'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: 无效的广告类型
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/by-type/:type', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAdvertisementsByType);
/**
 * @swagger
 * /api/advertisements/by-status/{status}:
 *   get:
 *     tags: [Advertisements]
 *     summary: 按状态获取广告列表
 *     description: 根据广告状态获取对应的广告列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [active, paused, expired, draft]
 *         description: 广告状态
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
 *     responses:
 *       200:
 *         description: 获取广告列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     advertisements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Advertisement'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       400:
 *         description: 无效的广告状态
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/by-status/:status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAdvertisementsByStatus);
/**
 * @swagger
 * /api/advertisements:
 *   get:
 *     tags: [Advertisements]
 *     summary: 获取广告列表
 *     description: 获取所有广告的分页列表，支持搜索和排序
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
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（标题、内容）
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [banner, popup, video, image, text]
 *         description: 过滤广告类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, paused, expired, draft]
 *         description: 过滤广告状态
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, priority, clickCount, viewCount]
 *           default: createdAt
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: 排序顺序
 *     responses:
 *       200:
 *         description: 获取广告列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     advertisements:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Advertisement'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAdvertisements);
/**
 * @swagger
 * /api/advertisements:
 *   post:
 *     tags: [Advertisements]
 *     summary: 创建广告
 *     description: 创建一个新的广告
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - content
 *               - targetAudience
 *               - startDate
 *               - endDate
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 广告标题
 *                 example: "新学期招生宣传"
 *               type:
 *                 type: string
 *                 enum: [banner, popup, video, image, text]
 *                 description: 广告类型
 *                 example: "banner"
 *               content:
 *                 type: string
 *                 description: 广告内容
 *                 example: "欢迎家长们报名参加我们的新学期招生活动"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: 图片URL
 *                 example: "https://example.com/image.jpg"
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *                 description: 链接URL
 *                 example: "https://example.com/enrollment"
 *               targetAudience:
 *                 type: string
 *                 enum: [all, parent, teacher, admin]
 *                 description: 目标受众
 *                 example: "parent"
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 description: 优先级
 *                 example: 8
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *                 example: "2024-01-01T00:00:00Z"
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: 创建广告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "创建广告成功"
 *                 data:
 *                   $ref: '#/components/schemas/Advertisement'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.createAdvertisement);
/**
 * @swagger
 * /api/advertisements/{id}/statistics:
 *   get:
 *     tags: [Advertisements]
 *     summary: 获取广告统计数据
 *     description: 获取指定广告的详细统计信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计结束日期
 *     responses:
 *       200:
 *         description: 获取统计数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告统计数据成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     advertisement:
 *                       $ref: '#/components/schemas/Advertisement'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         dailyViews:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               views:
 *                                 type: integer
 *                               clicks:
 *                                 type: integer
 *                         totalViews:
 *                           type: integer
 *                         totalClicks:
 *                           type: integer
 *                         clickThroughRate:
 *                           type: number
 *                           format: float
 *                         conversionRate:
 *                           type: number
 *                           format: float
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAdvertisementStatistics);
/**
 * @swagger
 * /api/advertisements/{id}/pause:
 *   post:
 *     tags: [Advertisements]
 *     summary: 暂停广告
 *     description: 暂停指定的广告，将状态设置为暂停
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *     responses:
 *       200:
 *         description: 暂停广告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "暂停广告成功"
 *                 data:
 *                   $ref: '#/components/schemas/Advertisement'
 *       400:
 *         description: 广告状态不允许暂停
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.post('/:id/pause', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.pauseAdvertisement);
/**
 * @swagger
 * /api/advertisements/{id}/resume:
 *   post:
 *     tags: [Advertisements]
 *     summary: 恢复广告
 *     description: 恢复暂停的广告，将状态设置为活跃
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *     responses:
 *       200:
 *         description: 恢复广告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "恢复广告成功"
 *                 data:
 *                   $ref: '#/components/schemas/Advertisement'
 *       400:
 *         description: 广告状态不允许恢复
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.post('/:id/resume', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.resumeAdvertisement);
/**
 * @swagger
 * /api/advertisements/{id}:
 *   get:
 *     tags: [Advertisements]
 *     summary: 获取广告详情
 *     description: 根据ID获取广告的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *     responses:
 *       200:
 *         description: 获取广告详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "获取广告详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Advertisement'
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.getAdvertisement);
/**
 * @swagger
 * /api/advertisements/{id}:
 *   put:
 *     tags: [Advertisements]
 *     summary: 更新广告
 *     description: 更新指定广告的信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 200
 *                 description: 广告标题
 *               type:
 *                 type: string
 *                 enum: [banner, popup, video, image, text]
 *                 description: 广告类型
 *               content:
 *                 type: string
 *                 description: 广告内容
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 description: 图片URL
 *               linkUrl:
 *                 type: string
 *                 format: uri
 *                 description: 链接URL
 *               targetAudience:
 *                 type: string
 *                 enum: [all, parent, teacher, admin]
 *                 description: 目标受众
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 description: 优先级
 *               startDate:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endDate:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               status:
 *                 type: string
 *                 enum: [active, paused, expired, draft]
 *                 description: 状态
 *     responses:
 *       200:
 *         description: 更新广告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "更新广告成功"
 *                 data:
 *                   $ref: '#/components/schemas/Advertisement'
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.updateAdvertisement);
/**
 * @swagger
 * /api/advertisements/{id}:
 *   delete:
 *     tags: [Advertisements]
 *     summary: 删除广告
 *     description: 删除指定的广告（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 广告ID
 *     responses:
 *       200:
 *         description: 删除广告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "删除广告成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedId:
 *                       type: integer
 *                       description: 已删除的广告ID
 *       404:
 *         description: 广告不存在
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 广告正在使用中，无法删除
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADVERTISEMENT_MANAGE'), advertisement_controller_1.deleteAdvertisement);
exports["default"] = router;
