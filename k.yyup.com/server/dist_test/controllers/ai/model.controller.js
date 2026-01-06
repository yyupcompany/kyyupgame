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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.ModelController = void 0;
var model_service_1 = __importDefault(require("../../services/ai/model.service"));
var apiError_1 = require("../../utils/apiError");
/**
 * @openapi
 * tags:
 *   name: AI模型
 *   description: 管理AI系统支持的模型配置和计费规则
 */
/**
 * AI模型控制器
 * 负责处理模型配置和计费相关的HTTP请求
 */
var ModelController = /** @class */ (function () {
    function ModelController() {
        var _this = this;
        this.modelService = model_service_1["default"];
        /**
         * @openapi
         * /api/v1/ai/models:
         *   get:
         *     summary: 获取可用模型列表
         *     description: 获取系统中所有可用的AI模型配置，支持按类型和状态过滤
         *     tags:
         *       - AI模型
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: query
         *         name: type
         *         schema:
         *           type: string
         *           enum: [text, speech, image, video, multimodal]
         *         description: 模型类型过滤
         *       - in: query
         *         name: status
         *         schema:
         *           type: string
         *           enum: [active, inactive, testing]
         *         description: 模型状态过滤，默认只返回active状态
         *     responses:
         *       200:
         *         description: 成功获取模型列表
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/ModelConfig'
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.listModels = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, type, status_1, filters, models, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, type = _a.type, status_1 = _a.status;
                        filters = {
                            modelType: type,
                            status: status_1
                        };
                        return [4 /*yield*/, this.modelService.getAllModels(filters)];
                    case 1:
                        models = _b.sent();
                        res.status(200).json(models);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/models/default:
         *   get:
         *     summary: 获取默认AI模型
         *     description: 获取系统设置的默认AI模型配置，如果没有设置默认模型则返回第一个可用模型
         *     tags:
         *       - AI模型
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: 成功获取默认模型
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/ModelConfig'
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         description: 没有可用的AI模型
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 code:
         *                   type: integer
         *                   example: 404
         *                 message:
         *                   type: string
         *                   example: 没有可用的AI模型
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.getDefaultModel = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var defaultModel, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.modelService.getDefaultModel()];
                    case 1:
                        defaultModel = _a.sent();
                        res.status(200).json(defaultModel);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/models/{modelId}/billing:
         *   get:
         *     summary: 获取模型计费规则
         *     description: 获取指定模型的计费规则详情
         *     tags:
         *       - AI模型
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: modelId
         *         required: true
         *         schema:
         *           type: integer
         *         description: 模型ID
         *     responses:
         *       200:
         *         description: 成功获取计费规则
         *         content:
         *           application/json:
         *             schema:
         *               type: array
         *               items:
         *                 $ref: '#/components/schemas/ModelBilling'
         *       400:
         *         description: 请求参数错误
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 code:
         *                   type: integer
         *                   example: 400
         *                 message:
         *                   type: string
         *                   example: 模型ID不能为空
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.getModelBilling = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var modelId, billingRules, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        modelId = req.params.modelId;
                        if (!modelId) {
                            return [2 /*return*/, next(apiError_1.ApiError.badRequest('模型ID不能为空'))];
                        }
                        return [4 /*yield*/, this.modelService.getModelBilling(Number(modelId) || 0)];
                    case 1:
                        billingRules = _a.sent();
                        res.status(200).json(billingRules);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return ModelController;
}());
exports.ModelController = ModelController;
