"use strict";
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: EnrollmentQuotas
 *   description: 招生名额管理
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentQuota:
 *       type: object
 *       required:
 *         - id
 *         - planId
 *         - classId
 *         - totalQuota
 *       properties:
 *         id:
 *           type: integer
 *           description: 名额ID
 *         planId:
 *           type: integer
 *           description: 招生计划ID
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         totalQuota:
 *           type: integer
 *           description: 总名额
 *         usedQuota:
 *           type: integer
 *           description: 已使用名额
 *         reservedQuota:
 *           type: integer
 *           description: 预留名额
 *         availableQuota:
 *           type: integer
 *           description: 可用名额
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     QuotaAllocation:
 *       type: object
 *       required:
 *         - planId
 *         - classId
 *         - allocatedQuota
 *       properties:
 *         id:
 *           type: integer
 *           description: 分配记录ID
 *         planId:
 *           type: integer
 *           description: 招生计划ID
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         allocatedQuota:
 *           type: integer
 *           description: 分配名额数量
 *         allocatedAt:
 *           type: string
 *           format: date-time
 *           description: 分配时间
 *
 *     QuotaStatistics:
 *       type: object
 *       properties:
 *         planId:
 *           type: integer
 *           description: 招生计划ID
 *         totalQuota:
 *           type: integer
 *           description: 总名额
 *         usedQuota:
 *           type: integer
 *           description: 已使用名额
 *         reservedQuota:
 *           type: integer
 *           description: 预留名额
 *         availableQuota:
 *           type: integer
 *           description: 可用名额
 *         utilizationRate:
 *           type: number
 *           format: float
 *           description: 使用率
 *         classes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               classId:
 *                 type: integer
 *               className:
 *                 type: string
 *               totalQuota:
 *                 type: integer
 *               usedQuota:
 *                 type: integer
 */
/**
 * @swagger
 * /api/enrollment/quotas:
 *   get:
 *     summary: 获取招生名额列表
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID过滤
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID过滤
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EnrollmentQuota'
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    res.json({
        success: true,
        message: '获取招生名额列表成功',
        data: {
            total: 0,
            items: [],
            page: 1,
            pageSize: 10
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas:
 *   post:
 *     summary: 创建招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - classId
 *               - totalQuota
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *               totalQuota:
 *                 type: integer
 *                 minimum: 1
 *                 description: 总名额
 *               reservedQuota:
 *                 type: integer
 *                 minimum: 0
 *                 description: 预留名额
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentQuota'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    res.status(201).json({
        success: true,
        message: '招生名额创建成功',
        data: {
            id: Math.floor(Math.random() * 1000),
            planId: req.body.planId || 1,
            classId: req.body.classId || 1,
            totalQuota: req.body.totalQuota || 30,
            usedQuota: 0,
            reservedQuota: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/by-plan/{planId}:
 *   get:
 *     summary: 按计划获取招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/EnrollmentQuota'
 *                       - type: object
 *                         properties:
 *                           class:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               grade:
 *                                 type: string
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 计划不存在
 */
router.get('/by-plan/:planId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var planId = parseInt(req.params.planId);
    res.json({
        success: true,
        message: '获取计划招生名额成功',
        data: [
            {
                id: 1,
                planId: planId,
                classId: 1,
                totalQuota: 30,
                usedQuota: 5,
                reservedQuota: 2,
                availableQuota: 23,
                "class": { id: 1, name: '小一班', grade: 'junior' }
            }
        ]
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/by-class/{classId}:
 *   get:
 *     summary: 按班级获取招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
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
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/EnrollmentQuota'
 *                       - type: object
 *                         properties:
 *                           plan:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               title:
 *                                 type: string
 *                               year:
 *                                 type: integer
 *                               semester:
 *                                 type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 班级不存在
 */
router.get('/by-class/:classId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var classId = parseInt(req.params.classId);
    res.json({
        success: true,
        message: '获取班级招生名额成功',
        data: [
            {
                id: 1,
                planId: 1,
                classId: classId,
                totalQuota: 30,
                usedQuota: 5,
                reservedQuota: 2,
                availableQuota: 23,
                plan: { id: 1, title: '2024年春季招生', year: 2024, semester: 1 }
            }
        ]
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/{id}:
 *   get:
 *     summary: 获取招生名额详情
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生名额ID
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
 *                 message:
 *                   type: string
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/EnrollmentQuota'
 *                     - type: object
 *                       properties:
 *                         plan:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             title:
 *                               type: string
 *                             year:
 *                               type: integer
 *                             semester:
 *                               type: integer
 *                         class:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             grade:
 *                               type: string
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 名额不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var id = parseInt(req.params.id);
    res.json({
        success: true,
        message: '获取招生名额详情成功',
        data: {
            id: id,
            planId: 1,
            classId: 1,
            totalQuota: 30,
            usedQuota: 5,
            reservedQuota: 2,
            availableQuota: 23,
            plan: { id: 1, title: '2024年春季招生', year: 2024, semester: 1 },
            "class": { id: 1, name: '小一班', grade: 'junior' },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/{id}:
 *   put:
 *     summary: 更新招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生名额ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *               totalQuota:
 *                 type: integer
 *                 minimum: 1
 *                 description: 总名额
 *               usedQuota:
 *                 type: integer
 *                 minimum: 0
 *                 description: 已使用名额
 *               reservedQuota:
 *                 type: integer
 *                 minimum: 0
 *                 description: 预留名额
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentQuota'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 名额不存在
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var id = parseInt(req.params.id);
    res.json({
        success: true,
        message: '招生名额更新成功',
        data: {
            id: id,
            planId: req.body.planId || 1,
            classId: req.body.classId || 1,
            totalQuota: req.body.totalQuota || 30,
            usedQuota: req.body.usedQuota || 5,
            reservedQuota: req.body.reservedQuota || 2,
            updatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/{id}:
 *   delete:
 *     summary: 删除招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生名额ID
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
 *                 data:
 *                   type: "null"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 名额不存在
 *       409:
 *         description: 名额已被使用，无法删除
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var id = parseInt(req.params.id);
    res.json({
        success: true,
        message: '招生名额删除成功',
        data: null
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/allocate:
 *   post:
 *     summary: 分配招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - classId
 *               - allocatedQuota
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *               allocatedQuota:
 *                 type: integer
 *                 minimum: 1
 *                 description: 分配名额数量
 *     responses:
 *       200:
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QuotaAllocation'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       409:
 *         description: 名额不足
 */
router.post('/allocate', auth_middleware_1.verifyToken, function (req, res) {
    res.json({
        success: true,
        message: '名额分配成功',
        data: {
            id: Math.floor(Math.random() * 1000),
            planId: req.body.planId || 1,
            classId: req.body.classId || 1,
            allocatedQuota: req.body.allocatedQuota || 5,
            allocatedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/statistics/{planId}:
 *   get:
 *     summary: 获取招生名额统计
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
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
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/QuotaStatistics'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 计划不存在
 */
router.get('/statistics/:planId', auth_middleware_1.verifyToken, function (req, res) {
    var planId = parseInt(req.params.planId);
    res.json({
        success: true,
        message: '获取名额统计成功',
        data: {
            planId: planId,
            totalQuota: 150,
            usedQuota: 45,
            reservedQuota: 15,
            availableQuota: 90,
            utilizationRate: 0.3,
            classes: [
                { classId: 1, className: '小一班', totalQuota: 30, usedQuota: 15 },
                { classId: 2, className: '小二班', totalQuota: 30, usedQuota: 10 }
            ]
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/batch-adjust:
 *   post:
 *     summary: 批量调整招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustments
 *             properties:
 *               adjustments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - newQuota
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 名额ID
 *                     newQuota:
 *                       type: integer
 *                       minimum: 1
 *                       description: 新名额
 *                     reason:
 *                       type: string
 *                       description: 调整原因
 *     responses:
 *       200:
 *         description: 调整成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     adjustedCount:
 *                       type: integer
 *                       description: 调整数量
 *                     adjustedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 调整时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */
router.post('/batch-adjust', auth_middleware_1.verifyToken, function (req, res) {
    var _a;
    res.json({
        success: true,
        message: '名额批量调整成功',
        data: {
            adjustedCount: ((_a = req.body.adjustments) === null || _a === void 0 ? void 0 : _a.length) || 0,
            adjustedAt: new Date()
        }
    });
});
/**
 * @swagger
 * /api/enrollment/quotas/{id}/adjust:
 *   patch:
 *     summary: 调整招生名额
 *     tags: [EnrollmentQuotas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生名额ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newQuota
 *             properties:
 *               newQuota:
 *                 type: integer
 *                 minimum: 1
 *                 description: 新名额
 *               reason:
 *                 type: string
 *                 description: 调整原因
 *     responses:
 *       200:
 *         description: 调整成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 名额ID
 *                     oldQuota:
 *                       type: integer
 *                       description: 原名额
 *                     newQuota:
 *                       type: integer
 *                       description: 新名额
 *                     adjustmentReason:
 *                       type: string
 *                       description: 调整原因
 *                     adjustedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 调整时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 名额不存在
 */
router.patch('/:id/adjust', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_MANAGE'), function (req, res) {
    var id = parseInt(req.params.id);
    res.json({
        success: true,
        message: '名额调整成功',
        data: {
            id: id,
            oldQuota: 30,
            newQuota: req.body.newQuota || 35,
            adjustmentReason: req.body.reason || '系统调整',
            adjustedAt: new Date()
        }
    });
});
exports["default"] = router;
