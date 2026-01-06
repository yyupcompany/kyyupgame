"use strict";
/**
 * 自动配图控制器
 * 处理AI自动生成图像的API请求
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.generateBatchImagesValidation = exports.generateTemplateImageValidation = exports.generatePosterImageValidation = exports.generateActivityImageValidation = exports.generateImageValidation = exports.AutoImageController = void 0;
var express_validator_1 = require("express-validator");
var auto_image_generation_service_1 = __importDefault(require("../services/ai/auto-image-generation.service"));
var response_handler_1 = require("../utils/response-handler");
var logger_1 = require("../utils/logger");
var AutoImageController = /** @class */ (function () {
    function AutoImageController() {
    }
    /**
     * 生成单张图像
     */
    AutoImageController.generateImage = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var errors, _b, prompt_1, category, style, size, quality, watermark, result, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.validation(res, '参数验证失败', errors.array())];
                        }
                        _b = req.body, prompt_1 = _b.prompt, category = _b.category, style = _b.style, size = _b.size, quality = _b.quality, watermark = _b.watermark;
                        logger_1.logger.info('收到图像生成请求', {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                            prompt: prompt_1,
                            category: category,
                            style: style
                        });
                        return [4 /*yield*/, auto_image_generation_service_1["default"].generateImage({
                                prompt: prompt_1,
                                category: category,
                                style: style,
                                size: size,
                                quality: quality,
                                watermark: watermark
                            })];
                    case 1:
                        result = _c.sent();
                        if (result.success) {
                            return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                    imageUrl: result.imageUrl,
                                    usage: result.usage,
                                    metadata: result.metadata
                                }, '图像生成成功')];
                        }
                        else {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, result.error || '图像生成失败', 500)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        logger_1.logger.error('图像生成控制器异常', { error: error_1 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务器内部错误')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为活动生成配图
     */
    AutoImageController.generateActivityImage = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var errors, _b, activityTitle, activityDescription, result, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.validation(res, '参数验证失败', errors.array())];
                        }
                        _b = req.body, activityTitle = _b.activityTitle, activityDescription = _b.activityDescription;
                        logger_1.logger.info('收到活动配图生成请求', {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                            activityTitle: activityTitle
                        });
                        return [4 /*yield*/, auto_image_generation_service_1["default"].generateActivityImage(activityTitle, activityDescription)];
                    case 1:
                        result = _c.sent();
                        if (result.success) {
                            return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                    imageUrl: result.imageUrl,
                                    usage: result.usage,
                                    metadata: result.metadata
                                }, '活动配图生成成功')];
                        }
                        else {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, result.error || '活动配图生成失败', 500)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        logger_1.logger.error('活动配图生成控制器异常', { error: error_2 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务器内部错误')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为海报生成配图
     */
    AutoImageController.generatePosterImage = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var errors, _b, posterTitle, posterContent, style, size, quality, result, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.validation(res, '参数验证失败', errors.array())];
                        }
                        _b = req.body, posterTitle = _b.posterTitle, posterContent = _b.posterContent, style = _b.style, size = _b.size, quality = _b.quality;
                        logger_1.logger.info('收到海报配图生成请求', {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                            posterTitle: posterTitle,
                            style: style
                        });
                        return [4 /*yield*/, auto_image_generation_service_1["default"].generatePosterImage(posterTitle, posterContent, { style: style, size: size, quality: quality })];
                    case 1:
                        result = _c.sent();
                        if (result.success) {
                            return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                    imageUrl: result.imageUrl,
                                    usage: result.usage,
                                    metadata: result.metadata
                                }, '海报配图生成成功')];
                        }
                        else {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, result.error || '海报配图生成失败', 500)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        logger_1.logger.error('海报配图生成控制器异常', { error: error_3 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务器内部错误')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为模板生成配图 - 支持智能提示词生成
     */
    AutoImageController.generateTemplateImage = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var errors, _b, templateName, templateDescription, templateData, result, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.validation(res, '参数验证失败', errors.array())];
                        }
                        _b = req.body, templateName = _b.templateName, templateDescription = _b.templateDescription, templateData = _b.templateData;
                        logger_1.logger.info('收到模板配图生成请求', {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                            templateName: templateName,
                            hasTemplateData: !!templateData
                        });
                        return [4 /*yield*/, auto_image_generation_service_1["default"].generateTemplateImage(templateName, templateDescription, templateData)];
                    case 1:
                        result = _c.sent();
                        if (result.success) {
                            return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                    imageUrl: result.imageUrl,
                                    usage: result.usage,
                                    metadata: result.metadata
                                }, '模板配图生成成功')];
                        }
                        else {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, result.error || '模板配图生成失败', 500)];
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _c.sent();
                        logger_1.logger.error('模板配图生成控制器异常', { error: error_4 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务器内部错误')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量生成图像
     */
    AutoImageController.generateBatchImages = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var errors, requests, results, successCount, failureCount, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        errors = (0, express_validator_1.validationResult)(req);
                        if (!errors.isEmpty()) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.validation(res, '参数验证失败', errors.array())];
                        }
                        requests = req.body.requests;
                        if (!Array.isArray(requests) || requests.length === 0) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '请求列表不能为空', 400)];
                        }
                        if (requests.length > 10) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '批量生成最多支持10张图像', 400)];
                        }
                        logger_1.logger.info('收到批量图像生成请求', {
                            userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                            count: requests.length
                        });
                        return [4 /*yield*/, auto_image_generation_service_1["default"].generateBatchImages(requests)];
                    case 1:
                        results = _b.sent();
                        successCount = results.filter(function (r) { return r.success; }).length;
                        failureCount = results.length - successCount;
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                results: results,
                                summary: {
                                    total: results.length,
                                    success: successCount,
                                    failure: failureCount
                                }
                            }, "\u6279\u91CF\u751F\u6210\u5B8C\u6210\uFF0C\u6210\u529F".concat(successCount, "\u5F20\uFF0C\u5931\u8D25").concat(failureCount, "\u5F20"))];
                    case 2:
                        error_5 = _b.sent();
                        logger_1.logger.error('批量图像生成控制器异常', { error: error_5 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务器内部错误')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查服务状态
     */
    AutoImageController.checkServiceStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, auto_image_generation_service_1["default"].checkServiceStatus()];
                    case 1:
                        status_1 = _a.sent();
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, status_1, '服务状态检查完成')];
                    case 2:
                        error_6 = _a.sent();
                        logger_1.logger.error('服务状态检查异常', { error: error_6 });
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '服务状态检查失败')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AutoImageController;
}());
exports.AutoImageController = AutoImageController;
// 验证规则
exports.generateImageValidation = [
    (0, express_validator_1.body)('prompt')
        .notEmpty()
        .withMessage('提示词不能为空')
        .isLength({ min: 1, max: 1000 })
        .withMessage('提示词长度应在1-1000字符之间'),
    (0, express_validator_1.body)('category')
        .optional()
        .isIn(['activity', 'poster', 'template', 'marketing', 'education'])
        .withMessage('分类必须是有效值'),
    (0, express_validator_1.body)('style')
        .optional()
        .isIn(['natural', 'cartoon', 'realistic', 'artistic'])
        .withMessage('风格必须是有效值'),
    (0, express_validator_1.body)('size')
        .optional()
        .isIn(['512x512', '1024x1024', '1024x768', '768x1024'])
        .withMessage('尺寸必须是有效值'),
    (0, express_validator_1.body)('quality')
        .optional()
        .isIn(['standard', 'hd'])
        .withMessage('质量必须是有效值'),
    (0, express_validator_1.body)('watermark')
        .optional()
        .isBoolean()
        .withMessage('水印设置必须是布尔值')
];
exports.generateActivityImageValidation = [
    (0, express_validator_1.body)('activityTitle')
        .notEmpty()
        .withMessage('活动标题不能为空')
        .isLength({ min: 1, max: 100 })
        .withMessage('活动标题长度应在1-100字符之间'),
    (0, express_validator_1.body)('activityDescription')
        .notEmpty()
        .withMessage('活动描述不能为空')
        .isLength({ min: 1, max: 500 })
        .withMessage('活动描述长度应在1-500字符之间')
];
exports.generatePosterImageValidation = [
    (0, express_validator_1.body)('posterTitle')
        .notEmpty()
        .withMessage('海报标题不能为空')
        .isLength({ min: 1, max: 100 })
        .withMessage('海报标题长度应在1-100字符之间'),
    (0, express_validator_1.body)('posterContent')
        .notEmpty()
        .withMessage('海报内容不能为空')
        .isLength({ min: 1, max: 500 })
        .withMessage('海报内容长度应在1-500字符之间')
];
exports.generateTemplateImageValidation = [
    (0, express_validator_1.body)('templateName')
        .notEmpty()
        .withMessage('模板名称不能为空')
        .isLength({ min: 1, max: 100 })
        .withMessage('模板名称长度应在1-100字符之间'),
    (0, express_validator_1.body)('templateDescription')
        .notEmpty()
        .withMessage('模板描述不能为空')
        .isLength({ min: 1, max: 500 })
        .withMessage('模板描述长度应在1-500字符之间')
];
exports.generateBatchImagesValidation = [
    (0, express_validator_1.body)('requests')
        .isArray({ min: 1, max: 10 })
        .withMessage('请求列表必须是1-10个元素的数组'),
    (0, express_validator_1.body)('requests.*.prompt')
        .notEmpty()
        .withMessage('每个请求的提示词不能为空')
        .isLength({ min: 1, max: 1000 })
        .withMessage('提示词长度应在1-1000字符之间')
];
