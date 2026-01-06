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
exports.generateSatisfactionReport = exports.getEvaluationStatistics = exports.getEvaluations = exports.replyEvaluation = exports.deleteEvaluation = exports.updateEvaluation = exports.getEvaluationById = exports.createEvaluation = void 0;
var activity_evaluation_service_1 = require("../services/activity/activity-evaluation.service");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var logger_1 = require("../utils/logger");
var activityEvaluationService = new activity_evaluation_service_1.ActivityEvaluationService();
/**
 * 创建活动评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var createEvaluation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, evaluationData, evaluation;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未授权的访问');
            }
            evaluationData = req.body;
            // 验证必填字段
            if (!evaluationData.activityId) {
                throw apiError_1.ApiError.badRequest('活动ID不能为空');
            }
            if (!evaluationData.evaluatorType) {
                throw apiError_1.ApiError.badRequest('评价者类型不能为空');
            }
            if (!evaluationData.evaluatorName) {
                throw apiError_1.ApiError.badRequest('评价者姓名不能为空');
            }
            if (evaluationData.overallRating === undefined || evaluationData.overallRating < 1 || evaluationData.overallRating > 5) {
                throw apiError_1.ApiError.badRequest('总体评分必须在1-5之间');
            }
            evaluation = __assign(__assign({ id: Date.now() }, evaluationData), { createdBy: userId, createdAt: new Date(), updatedAt: new Date() });
            apiResponse_1.ApiResponse.success(res, { evaluation: evaluation }, '评价创建成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('创建活动评价失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u521B\u5EFA\u8BC4\u4EF7\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('创建活动评价失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '创建评价失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.createEvaluation = createEvaluation;
/**
 * 获取评价详情
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var getEvaluationById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, evaluation;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的评价ID');
            }
            evaluation = {
                id: Number(id) || 0,
                activityId: 1,
                evaluatorType: 'parent',
                evaluatorName: '张三',
                overallRating: 5,
                contentRating: 5,
                organizationRating: 4,
                environmentRating: 5,
                serviceRating: 4,
                comments: '活动很棒，孩子很喜欢！',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, { evaluation: evaluation }, '获取评价详情成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('获取评价详情失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u83B7\u53D6\u8BC4\u4EF7\u8BE6\u60C5\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('获取评价详情失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '获取评价详情失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.getEvaluationById = getEvaluationById;
/**
 * 更新评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var updateEvaluation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, id, evaluationData, evaluation;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未授权的访问');
            }
            id = req.params.id;
            evaluationData = req.body;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的评价ID');
            }
            // 验证评分范围
            if (evaluationData.overallRating !== undefined && (evaluationData.overallRating < 1 || evaluationData.overallRating > 5)) {
                throw apiError_1.ApiError.badRequest('总体评分必须在1-5之间');
            }
            evaluation = __assign(__assign({ id: Number(id) || 0 }, evaluationData), { updatedBy: userId, updatedAt: new Date() });
            apiResponse_1.ApiResponse.success(res, { evaluation: evaluation }, '评价更新成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('更新评价失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u66F4\u65B0\u8BC4\u4EF7\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('更新评价失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '更新评价失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.updateEvaluation = updateEvaluation;
/**
 * 删除评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var deleteEvaluation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, id;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未授权的访问');
            }
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的评价ID');
            }
            apiResponse_1.ApiResponse.success(res, {}, '评价删除成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('删除评价失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u5220\u9664\u8BC4\u4EF7\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('删除评价失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '删除评价失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.deleteEvaluation = deleteEvaluation;
/**
 * 回复评价
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var replyEvaluation = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, id, reply, evaluation;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未授权的访问');
            }
            id = req.params.id;
            reply = req.body.reply;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的评价ID');
            }
            if (!reply || reply.trim() === '') {
                throw apiError_1.ApiError.badRequest('回复内容不能为空');
            }
            evaluation = {
                id: Number(id) || 0,
                reply: reply.trim(),
                repliedBy: userId,
                repliedAt: new Date()
            };
            apiResponse_1.ApiResponse.success(res, { evaluation: evaluation }, '回复评价成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('回复评价失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u56DE\u590D\u8BC4\u4EF7\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('回复评价失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '回复评价失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.replyEvaluation = replyEvaluation;
/**
 * 获取评价列表
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var getEvaluations = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, evaluations, result;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c;
            evaluations = [
                {
                    id: 1,
                    activityId: 1,
                    activityTitle: '春季亲子运动会',
                    evaluatorType: 'parent',
                    evaluatorName: '张三',
                    overallRating: 5,
                    comments: '活动很棒，孩子很喜欢！',
                    createdAt: new Date()
                },
                {
                    id: 2,
                    activityId: 1,
                    activityTitle: '春季亲子运动会',
                    evaluatorType: 'teacher',
                    evaluatorName: '李老师',
                    overallRating: 4,
                    comments: '组织得很好，但时间有点紧张。',
                    createdAt: new Date()
                }
            ];
            result = {
                items: evaluations,
                page: Number(page) || 0,
                pageSize: Number(pageSize) || 0,
                total: evaluations.length,
                totalPages: Math.ceil(evaluations.length / Number(pageSize) || 0)
            };
            apiResponse_1.ApiResponse.success(res, result, '获取评价列表成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('获取评价列表失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u83B7\u53D6\u8BC4\u4EF7\u5217\u8868\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('获取评价列表失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '获取评价列表失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.getEvaluations = getEvaluations;
/**
 * 获取评价统计
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var getEvaluationStatistics = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, statistics;
    return __generator(this, function (_a) {
        try {
            activityId = req.params.activityId;
            if (!activityId || isNaN(Number(activityId) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的活动ID');
            }
            statistics = {
                totalEvaluations: 25,
                averageRating: 4.2,
                ratingDistribution: {
                    5: 10,
                    4: 8,
                    3: 5,
                    2: 2,
                    1: 0
                },
                satisfactionRate: 0.84
            };
            apiResponse_1.ApiResponse.success(res, statistics, '获取评价统计成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('获取评价统计失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u83B7\u53D6\u8BC4\u4EF7\u7EDF\u8BA1\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('获取评价统计失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '获取评价统计失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.getEvaluationStatistics = getEvaluationStatistics;
/**
 * 生成满意度报告
 * @param {Request} req - 请求对象
 * @param {Response} res - 响应对象
 * @returns {Promise<void>} HTTP响应
 */
var generateSatisfactionReport = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, report;
    return __generator(this, function (_a) {
        try {
            activityId = req.params.activityId;
            if (!activityId || isNaN(Number(activityId) || 0)) {
                throw apiError_1.ApiError.badRequest('无效的活动ID');
            }
            report = {
                activityId: Number(activityId) || 0,
                activityTitle: '春季亲子运动会',
                reportDate: new Date(),
                overallSatisfaction: 4.2,
                participantCount: 25,
                responseRate: 0.83,
                recommendations: [
                    '增加活动时间',
                    '改善场地设施',
                    '提供更多互动环节'
                ]
            };
            apiResponse_1.ApiResponse.success(res, report, '生成满意度报告成功');
        }
        catch (error) {
            if (error instanceof apiError_1.ApiError) {
                apiResponse_1.ApiResponse.error(res, error.message, error.code, error.statusCode);
            }
            else if (error instanceof Error) {
                logger_1.logger.error('生成满意度报告失败', { error: error.message, stack: error.stack });
                apiResponse_1.ApiResponse.serverError(res, "\u751F\u6210\u6EE1\u610F\u5EA6\u62A5\u544A\u5931\u8D25: ".concat(error.message));
            }
            else {
                logger_1.logger.error('生成满意度报告失败', { error: error });
                apiResponse_1.ApiResponse.serverError(res, '生成满意度报告失败: 未知错误');
            }
        }
        return [2 /*return*/];
    });
}); };
exports.generateSatisfactionReport = generateSatisfactionReport;
