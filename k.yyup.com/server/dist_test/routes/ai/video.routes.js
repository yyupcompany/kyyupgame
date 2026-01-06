"use strict";
/**
 * AI视频生成路由
 * 提供文生视频和图生视频功能
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var refactored_multimodal_service_1 = __importDefault(require("../../services/ai/refactored-multimodal.service"));
var router = (0, express_1.Router)();
/**
 * POST /api/ai/video/text-to-video
 * 文生视频 - 根据文本描述生成视频
 */
router.post('/text-to-video', auth_middleware_1.authMiddleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, prompt_1, duration, size, fps, quality, style, model, result, error_1;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: '未授权，请先登录'
                        })];
                }
                _a = req.body, prompt_1 = _a.prompt, duration = _a.duration, size = _a.size, fps = _a.fps, quality = _a.quality, style = _a.style, model = _a.model;
                // 验证必要参数
                if (!prompt_1) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '缺少必要参数: prompt（视频描述）'
                        })];
                }
                console.log('🎬 [文生视频] 收到请求:', {
                    userId: userId,
                    prompt: prompt_1.substring(0, 100) + '...',
                    duration: duration,
                    size: size,
                    model: model
                });
                return [4 /*yield*/, refactored_multimodal_service_1["default"].generateVideo(userId, {
                        model: model,
                        prompt: prompt_1,
                        duration: duration,
                        size: size,
                        fps: fps,
                        quality: quality,
                        style: style
                    })];
            case 1:
                result = _c.sent();
                console.log('🎬 [文生视频] 生成成功:', result.videoUrl);
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _c.sent();
                console.error('🎬 [文生视频] 生成失败:', error_1.message);
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * POST /api/ai/video/image-to-video
 * 图生视频 - 根据图片生成动态视频
 */
router.post('/image-to-video', auth_middleware_1.authMiddleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, prompt_2, imageUrl, duration, size, fps, quality, style, model, result, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 2, , 3]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            error: '未授权，请先登录'
                        })];
                }
                _a = req.body, prompt_2 = _a.prompt, imageUrl = _a.imageUrl, duration = _a.duration, size = _a.size, fps = _a.fps, quality = _a.quality, style = _a.style, model = _a.model;
                // 验证必要参数
                if (!imageUrl) {
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            error: '缺少必要参数: imageUrl（图片URL）'
                        })];
                }
                console.log('🎬 [图生视频] 收到请求:', {
                    userId: userId,
                    imageUrl: imageUrl,
                    prompt: prompt_2 === null || prompt_2 === void 0 ? void 0 : prompt_2.substring(0, 100),
                    duration: duration,
                    size: size,
                    model: model
                });
                return [4 /*yield*/, refactored_multimodal_service_1["default"].generateVideo(userId, {
                        model: model,
                        prompt: prompt_2 || '基于这张图片生成动态视频',
                        imageUrl: imageUrl,
                        duration: duration,
                        size: size,
                        fps: fps,
                        quality: quality,
                        style: style
                    })];
            case 1:
                result = _c.sent();
                console.log('🎬 [图生视频] 生成成功:', result.videoUrl);
                res.json({
                    success: true,
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _c.sent();
                console.error('🎬 [图生视频] 生成失败:', error_2.message);
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * GET /api/ai/video/models
 * 获取可用的视频生成模型列表
 */
router.get('/models', auth_middleware_1.authMiddleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var AIModelConfig, models, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
            case 1:
                AIModelConfig = (_a.sent()).AIModelConfig;
                return [4 /*yield*/, AIModelConfig.findAll({
                        where: {
                            modelType: 'video',
                            status: 'active'
                        },
                        attributes: ['id', 'name', 'displayName', 'description', 'isDefault', 'maxTokens', 'costPer1kTokens']
                    })];
            case 2:
                models = _a.sent();
                res.json({
                    success: true,
                    data: models
                });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.error('🎬 [视频模型列表] 获取失败:', error_3.message);
                next(error_3);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
