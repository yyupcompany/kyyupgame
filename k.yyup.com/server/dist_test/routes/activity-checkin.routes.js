"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var activity_checkin_controller_1 = require("../controllers/activity-checkin.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var auth_middleware_2 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 创建异步处理器函数来包装控制器方法
var asyncHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next))["catch"](next);
    };
};
/**
 * @swagger
 * /api/activity-checkins/registration/{id}:
 *   post:
 *     summary: 活动报名签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 报名ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - location
 *             properties:
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 签到成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 报名记录不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/registration/:id', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(activity_checkin_controller_1.checkIn));
/**
 * @swagger
 * /api/activity-checkins/batch:
 *   post:
 *     summary: 批量签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationIds
 *               - location
 *             properties:
 *               registrationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 报名ID列表
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 批量签到处理完成
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/batch', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(activity_checkin_controller_1.batchCheckIn));
/**
 * @swagger
 * /api/activity-checkins/{activityId}/phone:
 *   post:
 *     summary: 根据手机号签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - location
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *               location:
 *                 type: string
 *                 description: 签到地点
 *     responses:
 *       200:
 *         description: 签到成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动或报名记录不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:activityId/phone', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(activity_checkin_controller_1.checkInByPhone));
/**
 * @swagger
 * /api/activity-checkins/{activityId}/stats:
 *   get:
 *     summary: 获取活动签到统计数据
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 获取活动签到统计数据成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:activityId/stats', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(activity_checkin_controller_1.getCheckinStats));
/**
 * @swagger
 * /api/activity-checkins/{activityId}/export:
 *   get:
 *     summary: 导出活动签到数据
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 导出签到数据成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:activityId/export', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(activity_checkin_controller_1.exportCheckinData));
/**
 * @swagger
 * /api/activity-checkins/by-activity/{activityId}:
 *   get:
 *     summary: 按活动获取签到列表
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 活动ID
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-activity/:activityId', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(function (req, res) {
    // 将activityId作为查询参数传递给getCheckins
    req.query.activityId = req.params.activityId;
    return (0, activity_checkin_controller_1.getCheckins)(req, res);
}));
/**
 * @swagger
 * /api/activity-checkins:
 *   get:
 *     summary: 获取活动签到列表
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取活动签到列表成功
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), asyncHandler(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stats, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!req.query.activityId) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            a.id as activity_id,\n            a.title as activity_title,\n            COUNT(ar.id) as total_registrations,\n            SUM(CASE WHEN ar.check_in_time IS NOT NULL THEN 1 ELSE 0 END) as checked_in_count,\n            SUM(CASE WHEN ar.check_in_time IS NULL THEN 1 ELSE 0 END) as not_checked_in_count\n          FROM activities a\n          LEFT JOIN activity_registrations ar ON a.id = ar.activity_id AND ar.deleted_at IS NULL\n          WHERE a.deleted_at IS NULL\n          GROUP BY a.id, a.title\n          ORDER BY a.created_at DESC\n          LIMIT 20\n        ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                stats = (_a.sent())[0];
                res.json({
                    success: true,
                    message: '获取活动签到统计成功',
                    data: {
                        items: stats || [],
                        total: (stats === null || stats === void 0 ? void 0 : stats.length) || 0,
                        note: '请提供activityId参数获取具体活动的签到详情'
                    }
                });
                return [2 /*return*/];
            case 3:
                error_1 = _a.sent();
                console.error('获取活动签到统计失败:', error_1);
                res.status(500).json({ success: false, message: '获取活动签到统计失败' });
                return [2 /*return*/];
            case 4: 
            // 如果提供了activityId，调用原有的getCheckins函数
            return [2 /*return*/, (0, activity_checkin_controller_1.getCheckins)(req, res)];
        }
    });
}); }));
/**
 * @swagger
 * /api/activity-checkins:
 *   post:
 *     summary: 创建活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), function (req, res) {
    res.status(201).json({
        success: true,
        message: '创建活动签到成功',
        data: {
            id: Math.floor(Math.random() * 1000) + 1,
            createTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/activity-checkins/{id}:
 *   get:
 *     summary: 获取活动签到详情
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '获取活动签到详情成功',
        data: {
            id: parseInt(id),
            activityId: 1,
            studentName: '测试学生',
            checkInTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/activity-checkins/{id}:
 *   put:
 *     summary: 更新活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '更新活动签到成功',
        data: {
            id: parseInt(id),
            updateTime: new Date()
        }
    });
});
/**
 * @swagger
 * /api/activity-checkins/{id}:
 *   delete:
 *     summary: 删除活动签到
 *     tags: [活动签到]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 签到ID
 *     responses:
 *       200:
 *         description: 删除成功
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_2.checkPermission)('ACTIVITY_CHECKIN_MANAGE'), function (req, res) {
    var id = req.params.id;
    res.json({
        success: true,
        message: '删除活动签到成功',
        data: {
            id: parseInt(id)
        }
    });
});
exports["default"] = router;
