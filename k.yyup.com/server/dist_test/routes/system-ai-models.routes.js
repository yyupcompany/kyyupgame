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
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var ai_controller_1 = __importDefault(require("../controllers/ai.controller"));
var ai_model_config_service_1 = __importDefault(require("../services/ai/ai-model-config.service"));
console.log('[路由] system-ai-models.routes.ts 已加载');
var router = (0, express_1.Router)();
/**
 * @swagger
 * /system/ai-models:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取所有AI模型
 *     description: 获取系统中所有AI模型的分页列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *         description: 只返回激活的模型
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
 *     responses:
 *       200:
 *         description: 获取模型列表成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AIModel'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// 获取所有模型 - 返回分页格式
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_VIEW'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, activeOnly, _b, page, _c, pageSize, models, currentPage, size, startIndex, endIndex, paginatedModels, error_1;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                _a = req.query, activeOnly = _a.activeOnly, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, ai_model_config_service_1["default"].getAllModels(activeOnly === 'true')];
            case 1:
                models = _d.sent();
                currentPage = parseInt(page);
                size = parseInt(pageSize);
                startIndex = (currentPage - 1) * size;
                endIndex = startIndex + size;
                paginatedModels = models.slice(startIndex, endIndex);
                res.json({
                    success: true,
                    message: '获取模型列表成功',
                    data: {
                        items: paginatedModels,
                        total: models.length,
                        page: currentPage,
                        pageSize: size,
                        totalPages: Math.ceil(models.length / size)
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _d.sent();
                res.status(500).json({
                    success: false,
                    message: '获取模型列表失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/ai-models/stats:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取AI模型统计信息
 *     description: 获取AI模型的统计数据，包括使用量、性能指标等
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计信息成功
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
 *                     totalModels:
 *                       type: integer
 *                       description: 模型总数
 *                     activeModels:
 *                       type: integer
 *                       description: 激活模型数
 *                     totalUsage:
 *                       type: integer
 *                       description: 总使用次数
 *                     averageResponseTime:
 *                       type: number
 *                       description: 平均响应时间
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// 获取模型统计信息
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_VIEW'), ai_controller_1["default"].getStats.bind(ai_controller_1["default"]));
/**
 * @swagger
 * /system/ai-models/{id}/status:
 *   put:
 *     tags: [AI Models]
 *     summary: 更新AI模型状态
 *     description: 更新指定AI模型的启用/禁用状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 模型状态
 *     responses:
 *       200:
 *         description: 模型状态更新成功
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
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// 更新模型状态
router.put('/:id/status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, status_1, result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                status_1 = req.body.status;
                return [4 /*yield*/, ai_controller_1["default"].updateModelStatus(id, status_1)];
            case 1:
                result = _a.sent();
                res.json({
                    success: true,
                    message: '模型状态更新成功',
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                res.status(500).json({
                    success: false,
                    message: '模型状态更新失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /system/ai-models/{id}:
 *   get:
 *     tags: [AI Models]
 *     summary: 获取单个AI模型详情
 *     description: 根据ID获取指定AI模型的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 获取模型详情成功
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
 *                   $ref: '#/components/schemas/AIModel'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     tags: [AI Models]
 *     summary: 更新AI模型信息
 *     description: 更新指定AI模型的配置信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modelName:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 提供商
 *               apiEndpoint:
 *                 type: string
 *                 description: API端点
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               temperature:
 *                 type: number
 *                 description: 温度参数
 *               isActive:
 *                 type: boolean
 *                 description: 是否激活
 *     responses:
 *       200:
 *         description: 模型更新成功
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
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     tags: [AI Models]
 *     summary: 删除AI模型
 *     description: 删除指定的AI模型配置
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 模型删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
// 其他路由保持不变
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_VIEW'), ai_controller_1["default"].getModelById.bind(ai_controller_1["default"]));
/**
 * @swagger
 * /system/ai-models:
 *   post:
 *     tags: [AI Models]
 *     summary: 创建新的AI模型
 *     description: 在系统中创建新的AI模型配置
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelName
 *               - provider
 *               - apiEndpoint
 *             properties:
 *               modelName:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 提供商
 *               apiEndpoint:
 *                 type: string
 *                 description: API端点
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               temperature:
 *                 type: number
 *                 description: 温度参数
 *               isActive:
 *                 type: boolean
 *                 description: 是否激活
 *     responses:
 *       201:
 *         description: 模型创建成功
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
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_MANAGE'), ai_controller_1["default"].createModel.bind(ai_controller_1["default"]));
/**
 * @swagger
 * /api/system/ai-models/{id}:
 *   put:
 *     summary: 更新AI模型
 *     tags: [AI模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIModelInput'
 *     responses:
 *       200:
 *         description: 模型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AIModelResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_MANAGE'), ai_controller_1["default"].updateModel.bind(ai_controller_1["default"]));
/**
 * @swagger
 * /api/system/ai-models/{id}:
 *   delete:
 *     summary: 删除AI模型
 *     tags: [AI模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 模型删除成功
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
 *                   example: 删除成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('AI_MODEL_MANAGE'), function (req, res) {
    console.log("[\u8DEF\u7531] \u6536\u5230\u5220\u9664\u8BF7\u6C42: DELETE /system/ai-models/".concat(req.params.id));
    ai_controller_1["default"].deleteModel(req, res);
});
exports["default"] = router;
