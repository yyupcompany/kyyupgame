"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var activityEvaluationController = __importStar(require("../controllers/activity-evaluation.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
// 创建一个包装器，将返回Promise<Response>的控制器函数转换为Express中间件
var asyncHandler = function (fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res))["catch"](next);
    };
};
/**
 * @swagger
 * /api/activity-evaluations/by-activity/{activityId}:
 *   get:
 *     summary: 按活动获取评估列表
 *     tags: [活动评价]
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
router.get('/by-activity/:activityId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, evaluations, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                activityId = req.params.activityId;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT ae.*, a.title as activity_title\n      FROM activity_evaluations ae\n      LEFT JOIN activities a ON ae.activity_id = a.id\n      WHERE ae.activity_id = :activityId AND ae.deleted_at IS NULL\n      ORDER BY ae.created_at DESC\n    ", {
                        replacements: { activityId: Number(activityId) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                evaluations = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        activityId: Number(activityId),
                        items: evaluations,
                        total: evaluations.length
                    }, '按活动获取评估列表成功')];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '按活动获取评估列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-evaluations/by-rating/{rating}:
 *   get:
 *     summary: 按评分获取评估列表
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rating
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评分
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/by-rating/:rating', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var rating, evaluations, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                rating = req.params.rating;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT ae.*, a.title as activity_title\n      FROM activity_evaluations ae\n      LEFT JOIN activities a ON ae.activity_id = a.id\n      WHERE ae.overall_rating = :rating AND ae.deleted_at IS NULL\n      ORDER BY ae.created_at DESC\n    ", {
                        replacements: { rating: Number(rating) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                evaluations = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        rating: Number(rating),
                        items: evaluations,
                        total: evaluations.length
                    }, '按评分获取评估列表成功')];
            case 2:
                error_2 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '按评分获取评估列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-evaluations/statistics/{activityId}:
 *   get:
 *     summary: 获取活动评估统计
 *     tags: [活动评价]
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
router.get('/statistics/:activityId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, stats, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                activityId = req.params.activityId;
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        COUNT(*) as total_evaluations,\n        AVG(overall_rating) as avg_overall_rating,\n        AVG(content_rating) as avg_content_rating,\n        AVG(organization_rating) as avg_organization_rating,\n        AVG(environment_rating) as avg_environment_rating,\n        AVG(service_rating) as avg_service_rating,\n        SUM(CASE WHEN overall_rating = 5 THEN 1 ELSE 0 END) as five_star_count,\n        SUM(CASE WHEN overall_rating = 4 THEN 1 ELSE 0 END) as four_star_count,\n        SUM(CASE WHEN overall_rating = 3 THEN 1 ELSE 0 END) as three_star_count,\n        SUM(CASE WHEN overall_rating = 2 THEN 1 ELSE 0 END) as two_star_count,\n        SUM(CASE WHEN overall_rating = 1 THEN 1 ELSE 0 END) as one_star_count\n      FROM activity_evaluations \n      WHERE activity_id = :activityId AND deleted_at IS NULL\n    ", {
                        replacements: { activityId: Number(activityId) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                stats = (_a.sent())[0];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, __assign({ activityId: Number(activityId) }, stats), '获取活动评估统计成功')];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取活动评估统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-evaluations:
 *   post:
 *     summary: 创建活动评价
 *     description: 创建一个新的活动评价记录
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *               - evaluatorType
 *               - evaluatorName
 *               - overallRating
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               registrationId:
 *                 type: integer
 *                 description: 报名记录ID
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               teacherId:
 *                 type: integer
 *                 description: 教师ID
 *               evaluatorType:
 *                 type: integer
 *                 description: 评价者类型（1-家长，2-教师，3-其他）
 *               evaluatorName:
 *                 type: string
 *                 description: 评价者姓名
 *               overallRating:
 *                 type: integer
 *                 description: 总体评分（1-5星）
 *               contentRating:
 *                 type: integer
 *                 description: 内容评分（1-5星）
 *               organizationRating:
 *                 type: integer
 *                 description: 组织评分（1-5星）
 *               environmentRating:
 *                 type: integer
 *                 description: 环境评分（1-5星）
 *               serviceRating:
 *                 type: integer
 *                 description: 服务评分（1-5星）
 *               comment:
 *                 type: string
 *                 description: 评价内容
 *               strengths:
 *                 type: string
 *                 description: 活动优点
 *               weaknesses:
 *                 type: string
 *                 description: 活动不足
 *               suggestions:
 *                 type: string
 *                 description: 改进建议
 *               images:
 *                 type: string
 *                 description: 图片（JSON字符串，包含图片URL数组）
 *               isPublic:
 *                 type: integer
 *                 description: 是否公开（0-不公开，1-公开）
 *     responses:
 *       200:
 *         description: 评价创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, activityId, registrationId, parentId, teacherId, evaluatorType, evaluatorName, overallRating, contentRating, organizationRating, environmentRating, serviceRating, comment, strengths, weaknesses, suggestions, images, _b, isPublic, result, error_4;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                _a = req.body, activityId = _a.activityId, registrationId = _a.registrationId, parentId = _a.parentId, teacherId = _a.teacherId, evaluatorType = _a.evaluatorType, evaluatorName = _a.evaluatorName, overallRating = _a.overallRating, contentRating = _a.contentRating, organizationRating = _a.organizationRating, environmentRating = _a.environmentRating, serviceRating = _a.serviceRating, comment = _a.comment, strengths = _a.strengths, weaknesses = _a.weaknesses, suggestions = _a.suggestions, images = _a.images, _b = _a.isPublic, isPublic = _b === void 0 ? 1 : _b;
                if (!activityId || !evaluatorType || !evaluatorName || !overallRating) {
                    res.status(400).json({ success: false, message: '缺少必填参数' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      INSERT INTO activity_evaluations (\n        activity_id, registration_id, parent_id, teacher_id,\n        evaluator_type, evaluator_name, evaluation_time,\n        overall_rating, content_rating, organization_rating,\n        environment_rating, service_rating, comment,\n        strengths, weaknesses, suggestions, images,\n        is_public, status, creator_id, created_at, updated_at\n      ) VALUES (\n        :activityId, :registrationId, :parentId, :teacherId,\n        :evaluatorType, :evaluatorName, NOW(),\n        :overallRating, :contentRating, :organizationRating,\n        :environmentRating, :serviceRating, :comment,\n        :strengths, :weaknesses, :suggestions, :images,\n        :isPublic, 1, :userId, NOW(), NOW()\n      )\n    ", {
                        replacements: {
                            activityId: activityId,
                            registrationId: registrationId || null,
                            parentId: parentId || null,
                            teacherId: teacherId || null,
                            evaluatorType: evaluatorType,
                            evaluatorName: evaluatorName,
                            overallRating: overallRating,
                            contentRating: contentRating || null,
                            organizationRating: organizationRating || null,
                            environmentRating: environmentRating || null,
                            serviceRating: serviceRating || null,
                            comment: comment || null,
                            strengths: strengths || null,
                            weaknesses: weaknesses || null,
                            suggestions: suggestions || null,
                            images: images || null,
                            isPublic: isPublic,
                            userId: userId
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                result = (_d.sent())[0];
                res.json({
                    success: true,
                    message: '创建活动评估成功',
                    data: {
                        id: result,
                        activityId: activityId,
                        evaluatorName: evaluatorName,
                        overallRating: overallRating,
                        createTime: new Date()
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _d.sent();
                console.error('创建活动评估失败:', error_4);
                res.status(500).json({ success: false, message: '创建活动评估失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-evaluations:
 *   get:
 *     summary: 获取评价列表
 *     description: 获取活动评价列表，支持分页和筛选
 *     tags: [活动评价]
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
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID
 *       - in: query
 *         name: registrationId
 *         schema:
 *           type: integer
 *         description: 报名记录ID
 *       - in: query
 *         name: evaluatorType
 *         schema:
 *           type: integer
 *         description: 评价者类型
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: integer
 *         description: 最低评分
 *       - in: query
 *         name: maxRating
 *         schema:
 *           type: integer
 *         description: 最高评分
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 状态
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: integer
 *         description: 是否公开
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
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
 *         description: 获取评价列表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.getEvaluations));
/**
 * @swagger
 * /api/activity-evaluations/{id}:
 *   get:
 *     summary: 获取评价详情
 *     description: 根据ID获取活动评价详情
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     responses:
 *       200:
 *         description: 获取评价详情成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.getEvaluationById));
/**
 * @swagger
 * /api/activity-evaluations/{id}:
 *   put:
 *     summary: 更新评价
 *     description: 根据ID更新活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               overallRating:
 *                 type: integer
 *                 description: 总体评分（1-5星）
 *               contentRating:
 *                 type: integer
 *                 description: 内容评分（1-5星）
 *               organizationRating:
 *                 type: integer
 *                 description: 组织评分（1-5星）
 *               environmentRating:
 *                 type: integer
 *                 description: 环境评分（1-5星）
 *               serviceRating:
 *                 type: integer
 *                 description: 服务评分（1-5星）
 *               comment:
 *                 type: string
 *                 description: 评价内容
 *               strengths:
 *                 type: string
 *                 description: 活动优点
 *               weaknesses:
 *                 type: string
 *                 description: 活动不足
 *               suggestions:
 *                 type: string
 *                 description: 改进建议
 *               images:
 *                 type: string
 *                 description: 图片（JSON字符串，包含图片URL数组）
 *               isPublic:
 *                 type: integer
 *                 description: 是否公开（0-不公开，1-公开）
 *     responses:
 *       200:
 *         description: 评价更新成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.updateEvaluation));
/**
 * @swagger
 * /api/activity-evaluations/{id}:
 *   delete:
 *     summary: 删除评价
 *     description: 根据ID删除活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     responses:
 *       200:
 *         description: 评价删除成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 无权限
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.deleteEvaluation));
/**
 * @swagger
 * /api/activity-evaluations/{id}/reply:
 *   post:
 *     summary: 回复评价
 *     description: 回复活动评价
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 评价ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 回复内容
 *     responses:
 *       200:
 *         description: 回复评价成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 评价不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/reply', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.replyEvaluation));
/**
 * @swagger
 * /api/activity-evaluations/activity/{activityId}/statistics:
 *   get:
 *     summary: 获取评价统计
 *     description: 获取特定活动的评价统计数据
 *     tags: [活动评价]
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
 *         description: 获取评价统计成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/activity/:activityId/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.getEvaluationStatistics));
/**
 * @swagger
 * /api/activity-evaluations/satisfaction-report:
 *   get:
 *     summary: 生成满意度报表
 *     description: 根据条件生成活动满意度报表
 *     tags: [活动评价]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *       - in: query
 *         name: kindergartenId
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 生成满意度报表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/satisfaction-report', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ACTIVITY_MANAGE'), asyncHandler(activityEvaluationController.generateSatisfactionReport));
exports["default"] = router;
