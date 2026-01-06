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
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Performance Evaluations
 *   description: 性能评估管理
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     PerformanceEvaluation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 性能评估ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 评估名称
 *           example: "Q1季度教师绩效评估"
 *         description:
 *           type: string
 *           description: 评估描述
 *           example: "第一季度教师教学和管理绩效评估"
 *         evaluationType:
 *           type: string
 *           enum: [teacher, student, staff, system]
 *           description: 评估类型
 *           example: "teacher"
 *         status:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *           description: 评估状态
 *           example: "active"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 评估开始日期
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 评估结束日期
 *           example: "2024-03-31"
 *         criteria:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 评估标准名称
 *               weight:
 *                 type: number
 *                 description: 权重
 *               maxScore:
 *                 type: number
 *                 description: 最高分数
 *           description: 评估标准
 *         createdBy:
 *           type: integer
 *           description: 创建者ID
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     PerformanceEvaluationList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PerformanceEvaluation'
 *         total:
 *           type: integer
 *           description: 总数量
 *           example: 0
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *           example: 10
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *           example: 0
 *
 *     CreatePerformanceEvaluationRequest:
 *       type: object
 *       required:
 *         - name
 *         - evaluationType
 *         - startDate
 *         - endDate
 *       properties:
 *         name:
 *           type: string
 *           description: 评估名称
 *           example: "Q1季度教师绩效评估"
 *         description:
 *           type: string
 *           description: 评估描述
 *           example: "第一季度教师教学和管理绩效评估"
 *         evaluationType:
 *           type: string
 *           enum: [teacher, student, staff, system]
 *           description: 评估类型
 *           example: "teacher"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 评估开始日期
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 评估结束日期
 *           example: "2024-03-31"
 *         criteria:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 评估标准名称
 *               weight:
 *                 type: number
 *                 description: 权重
 *               maxScore:
 *                 type: number
 *                 description: 最高分数
 *           description: 评估标准
 *
 *     UpdatePerformanceEvaluationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 评估名称
 *           example: "Q1季度教师绩效评估"
 *         description:
 *           type: string
 *           description: 评估描述
 *           example: "第一季度教师教学和管理绩效评估"
 *         status:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *           description: 评估状态
 *           example: "active"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 评估开始日期
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 评估结束日期
 *           example: "2024-03-31"
 *         criteria:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 评估标准名称
 *               weight:
 *                 type: number
 *                 description: 权重
 *               maxScore:
 *                 type: number
 *                 description: 最高分数
 *           description: 评估标准
 */
/**
 * @swagger
 * /api/performance-evaluations:
 *   get:
 *     summary: 获取性能评估列表
 *     description: 获取系统中的性能评估列表，支持分页和筛选
 *     tags: [Performance Evaluations]
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [teacher, student, staff, system]
 *         description: 按评估类型筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, active, completed, archived]
 *         description: 按状态筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（名称和描述）
 *     responses:
 *       200:
 *         description: 获取性能评估列表成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PerformanceEvaluationList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: [],
                    total: 0,
                    page: 1,
                    pageSize: 10,
                    totalPages: 0
                }, '获取性能评估列表成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取性能评估失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-evaluations:
 *   post:
 *     summary: 创建性能评估
 *     description: 创建新的性能评估，需要性能管理权限
 *     tags: [Performance Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePerformanceEvaluationRequest'
 *           examples:
 *             teacher_evaluation:
 *               summary: 教师绩效评估
 *               value:
 *                 name: "2024年第一季度教师绩效评估"
 *                 description: "评估教师在教学质量、学生管理、专业发展等方面的表现"
 *                 evaluationType: "teacher"
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-03-31"
 *                 criteria:
 *                   - name: "教学质量"
 *                     weight: 0.4
 *                     maxScore: 100
 *                   - name: "学生管理"
 *                     weight: 0.3
 *                     maxScore: 100
 *                   - name: "专业发展"
 *                     weight: 0.3
 *                     maxScore: 100
 *             student_evaluation:
 *               summary: 学生学习评估
 *               value:
 *                 name: "2024年春季学期学生学习评估"
 *                 description: "评估学生在各科目学习和综合能力发展方面的表现"
 *                 evaluationType: "student"
 *                 startDate: "2024-02-15"
 *                 endDate: "2024-06-30"
 *                 criteria:
 *                   - name: "学科成绩"
 *                     weight: 0.5
 *                     maxScore: 100
 *                   - name: "行为表现"
 *                     weight: 0.3
 *                     maxScore: 100
 *                   - name: "创新能力"
 *                     weight: 0.2
 *                     maxScore: 100
 *     responses:
 *       201:
 *         description: 创建性能评估成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PerformanceEvaluation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 权限不足，需要性能管理权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "权限不足"
 *               code: "FORBIDDEN"
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "创建功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PERFORMANCE_RULE_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '创建功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '创建性能评估失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-evaluations/{id}:
 *   get:
 *     summary: 获取性能评估详情
 *     description: 根据ID获取指定性能评估的详细信息
 *     tags: [Performance Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 性能评估ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 获取性能评估详情成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PerformanceEvaluation'
 *             example:
 *               success: true
 *               message: "获取性能评估详情成功"
 *               data:
 *                 id: 1
 *                 name: "2024年第一季度教师绩效评估"
 *                 description: "评估教师在教学质量、学生管理、专业发展等方面的表现"
 *                 evaluationType: "teacher"
 *                 status: "active"
 *                 startDate: "2024-01-01"
 *                 endDate: "2024-03-31"
 *                 criteria:
 *                   - name: "教学质量"
 *                     weight: 0.4
 *                     maxScore: 100
 *                   - name: "学生管理"
 *                     weight: 0.3
 *                     maxScore: 100
 *                 createdBy: 1
 *                 createdAt: "2024-01-01T00:00:00Z"
 *                 updatedAt: "2024-01-01T00:00:00Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 性能评估不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "性能评估不存在"
 *               code: "NOT_FOUND"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '性能评估不存在', 'NOT_FOUND', 404)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取性能评估详情失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-evaluations/{id}:
 *   put:
 *     summary: 更新性能评估
 *     description: 更新指定ID的性能评估信息，需要性能管理权限
 *     tags: [Performance Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 性能评估ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePerformanceEvaluationRequest'
 *           examples:
 *             update_status:
 *               summary: 更新评估状态
 *               value:
 *                 status: "completed"
 *             update_criteria:
 *               summary: 更新评估标准
 *               value:
 *                 name: "2024年第一季度教师绩效评估（更新版）"
 *                 description: "更新后的评估描述"
 *                 criteria:
 *                   - name: "教学质量"
 *                     weight: 0.5
 *                     maxScore: 100
 *                   - name: "学生管理"
 *                     weight: 0.3
 *                     maxScore: 100
 *                   - name: "专业发展"
 *                     weight: 0.2
 *                     maxScore: 100
 *             extend_period:
 *               summary: 延长评估期限
 *               value:
 *                 endDate: "2024-04-30"
 *                 status: "active"
 *     responses:
 *       200:
 *         description: 更新性能评估成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/PerformanceEvaluation'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 权限不足，需要性能管理权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "权限不足"
 *               code: "FORBIDDEN"
 *       404:
 *         description: 性能评估不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "性能评估不存在"
 *               code: "NOT_FOUND"
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "更新功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PERFORMANCE_RULE_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新性能评估失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/performance-evaluations/{id}:
 *   delete:
 *     summary: 删除性能评估
 *     description: 删除指定ID的性能评估，需要性能管理权限。注意：删除评估可能会影响相关的评估结果和报告
 *     tags: [Performance Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 性能评估ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 删除性能评估成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "删除性能评估成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: 权限不足，需要性能管理权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "权限不足"
 *               code: "FORBIDDEN"
 *       404:
 *         description: 性能评估不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "性能评估不存在"
 *               code: "NOT_FOUND"
 *       409:
 *         description: 评估正在使用中，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "评估正在使用中，无法删除"
 *               code: "CONFLICT"
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "删除功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('PERFORMANCE_RULE_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '删除功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '删除性能评估失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
