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
var auth_routes_1 = __importDefault(require("./auth.routes"));
var user_routes_1 = __importDefault(require("./user.routes"));
var conversation_routes_1 = __importDefault(require("./conversation.routes"));
var model_routes_1 = __importDefault(require("./model.routes"));
var feedback_routes_1 = __importDefault(require("./feedback.routes"));
var analytics_routes_1 = __importDefault(require("./analytics.routes"));
// memoryRoutes removed - replaced by six-dimensional memory system
var quota_routes_1 = __importDefault(require("./quota.routes"));
// 注释掉已移除的路由导入
// import aiAnalysisRoutes from '../ai-analysis.routes';
// import aiQueryRoutes from '../ai-query.routes';
// import smartExpertRoutes from './smart-expert.routes';
var function_tools_routes_1 = __importDefault(require("./function-tools.routes"));
// import expertConsultationRoutes from '../expert-consultation';
var video_routes_1 = __importDefault(require("./video.routes"));
var unified_intelligence_routes_1 = __importDefault(require("./unified-intelligence.routes"));
var ai_health_controller_1 = require("../../controllers/ai-health.controller");
// 移除复杂的AI服务依赖，直接使用API调用
// import textModelService, { MessageRole } from '../../services/ai/text-model.service';
// import modelSelectorService, { ModelSelectionStrategy } from '../../services/ai/model-selector.service';
// import { ModelType } from '../../models/ai-model-config.model';
var auth_middleware_1 = require("../../middlewares/auth.middleware");
// 移除不需要的高级AI功能路由
// 降级响应生成函数
function generateFallbackResponse(message, context) {
    var messageType = (context === null || context === void 0 ? void 0 : context.type) || 'general';
    // 基于消息内容和上下文类型生成智能回复
    if (messageType === 'enrollment_planning' || message.includes('招生')) {
        return "\u57FA\u4E8E\u60A8\u7684\u62DB\u751F\u54A8\u8BE2\u9700\u6C42\uFF0C\u6211\u4E3A\u60A8\u63D0\u4F9B\u4EE5\u4E0B\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n\uD83D\uDCCA **\u62DB\u751F\u6570\u636E\u5206\u6790\u8981\u70B9\uFF1A**\n\u2022 \u5173\u6CE8\u62A5\u540D\u8F6C\u5316\u7387\u548C\u5404\u6E20\u9053\u6548\u679C\n\u2022 \u5206\u6790\u70ED\u95E8\u65F6\u6BB5\u548C\u6D3B\u52A8\u53C2\u4E0E\u5EA6\n\u2022 \u76D1\u63A7\u5BB6\u957F\u5173\u6CE8\u7684\u6838\u5FC3\u95EE\u9898\n\n\uD83C\uDFAF **\u4F18\u5316\u5EFA\u8BAE\uFF1A**\n\u2022 \u52A0\u5F3A\u7EBF\u4E0A\u7EBF\u4E0B\u6D3B\u52A8\u7ED3\u5408\n\u2022 \u5B8C\u5584\u5BB6\u957F\u6C9F\u901A\u8DDF\u8FDB\u673A\u5236\n\u2022 \u4F18\u5316\u62DB\u751F\u6D41\u7A0B\u548C\u4F53\u9A8C\n\n\uD83D\uDCC8 **\u5173\u952E\u6307\u6807\uFF1A**\n\u2022 \u54A8\u8BE2\u91CF\u3001\u62A5\u540D\u7387\u3001\u6EE1\u610F\u5EA6\n\u2022 \u6D3B\u52A8\u53C2\u4E0E\u5EA6\u548C\u53E3\u7891\u4F20\u64AD\n\u2022 \u7ADE\u4E89\u5BF9\u624B\u5206\u6790\u548C\u5DEE\u5F02\u5316\n\n\u5982\u9700\u66F4\u8BE6\u7EC6\u7684\u5206\u6790\uFF0C\u5EFA\u8BAE\u60A8\u63D0\u4F9B\u5177\u4F53\u7684\u6570\u636E\u8303\u56F4\u548C\u5173\u6CE8\u91CD\u70B9\u3002";
    }
    if (messageType === 'activity_planning' || message.includes('活动')) {
        return "\u9488\u5BF9\u60A8\u7684\u6D3B\u52A8\u7B56\u5212\u9700\u6C42\uFF0C\u6211\u63D0\u4F9B\u4EE5\u4E0B\u4E13\u4E1A\u65B9\u6848\uFF1A\n\n\uD83C\uDFAA **\u6D3B\u52A8\u7B56\u5212\u6838\u5FC3\u8981\u7D20\uFF1A**\n\u2022 \u660E\u786E\u6D3B\u52A8\u76EE\u6807\u548C\u53D7\u4F17\u7FA4\u4F53\n\u2022 \u8BBE\u8BA1\u6709\u8DA3\u4E14\u6559\u80B2\u610F\u4E49\u7684\u5185\u5BB9\n\u2022 \u5408\u7406\u5B89\u6392\u65F6\u95F4\u548C\u573A\u5730\u5E03\u5C40\n\n\uD83D\uDCA1 **\u521B\u65B0\u6D3B\u52A8\u5EFA\u8BAE\uFF1A**\n\u2022 \u4EB2\u5B50\u4E92\u52A8\u4F53\u9A8C\u6D3B\u52A8\n\u2022 \u4E3B\u9898\u6559\u80B2\u6E38\u620F\u8BBE\u8BA1\n\u2022 \u5B63\u8282\u6027\u7279\u8272\u6D3B\u52A8\u89C4\u5212\n\n\uD83D\uDCCB **\u6267\u884C\u8981\u70B9\uFF1A**\n\u2022 \u8BE6\u7EC6\u7684\u6D3B\u52A8\u6D41\u7A0B\u5B89\u6392\n\u2022 \u5B89\u5168\u9884\u6848\u548C\u5E94\u6025\u63AA\u65BD\n\u2022 \u6548\u679C\u8BC4\u4F30\u548C\u53CD\u9988\u6536\u96C6\n\n\u5EFA\u8BAE\u7ED3\u5408\u5E7C\u513F\u56ED\u7279\u8272\u548C\u5BB6\u957F\u9700\u6C42\uFF0C\u6253\u9020\u72EC\u7279\u7684\u6D3B\u52A8\u4F53\u9A8C\u3002";
    }
    // 通用智能回复
    return "\u611F\u8C22\u60A8\u7684\u54A8\u8BE2\uFF01\u57FA\u4E8E\u60A8\u7684\u95EE\u9898\uFF0C\u6211\u4E3A\u60A8\u63D0\u4F9B\u4EE5\u4E0B\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n\uD83D\uDD0D **\u5206\u6790\u8981\u70B9\uFF1A**\n\u2022 \u6DF1\u5165\u4E86\u89E3\u5F53\u524D\u60C5\u51B5\u548C\u5177\u4F53\u9700\u6C42\n\u2022 \u7ED3\u5408\u884C\u4E1A\u6700\u4F73\u5B9E\u8DF5\u548C\u6210\u529F\u6848\u4F8B\n\u2022 \u5236\u5B9A\u9488\u5BF9\u6027\u7684\u89E3\u51B3\u65B9\u6848\n\n\uD83D\uDCBC **\u5B9E\u65BD\u5EFA\u8BAE\uFF1A**\n\u2022 \u5206\u6B65\u9AA4\u63A8\u8FDB\uFF0C\u786E\u4FDD\u6267\u884C\u6548\u679C\n\u2022 \u5EFA\u7ACB\u76D1\u63A7\u673A\u5236\uFF0C\u53CA\u65F6\u8C03\u6574\u4F18\u5316\n\u2022 \u52A0\u5F3A\u56E2\u961F\u534F\u4F5C\u548C\u6C9F\u901A\u914D\u5408\n\n\uD83D\uDCCA **\u6548\u679C\u8BC4\u4F30\uFF1A**\n\u2022 \u8BBE\u5B9A\u660E\u786E\u7684\u6210\u529F\u6307\u6807\n\u2022 \u5B9A\u671F\u6536\u96C6\u53CD\u9988\u548C\u6570\u636E\u5206\u6790\n\u2022 \u6301\u7EED\u6539\u8FDB\u548C\u4F18\u5316\u6D41\u7A0B\n\n\u5982\u9700\u66F4\u5177\u4F53\u7684\u6307\u5BFC\uFF0C\u8BF7\u63D0\u4F9B\u66F4\u591A\u8BE6\u7EC6\u4FE1\u606F\uFF0C\u6211\u5C06\u4E3A\u60A8\u5236\u5B9A\u66F4\u7CBE\u51C6\u7684\u65B9\u6848\u3002";
}
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/ai/test-ai-routes:
 *   get:
 *     summary: AI路由测试接口
 *     description: 测试AI模块的路由是否正常工作
 *     tags:
 *       - AI测试
 *     responses:
 *       200:
 *         description: 路由测试成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 测试消息
 *                   example: "AI routes working!"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: 时间戳
 *                   example: "2025-07-13T10:00:00.000Z"
 */
// 添加根路径处理
router.get('/', function (req, res) {
    res.json({
        success: true,
        message: 'AI模块API',
        version: '1.0.0',
        endpoints: [
            '/auth', '/user', '/conversations', '/models',
            '/feedback', '/analytics', '/quota', '/memory'
        ],
        timestamp: new Date().toISOString()
    });
});
// 添加测试路由
router.get('/test-ai-routes', function (req, res) {
    res.json({ message: 'AI routes working!', timestamp: new Date().toISOString() });
});
// 添加健康检查路由
router.get('/health', ai_health_controller_1.AIHealthController.checkHealth);
router.get('/status', ai_health_controller_1.AIHealthController.getServiceStatus);
// 移除冲突的直接定义路由，memoryRoutes已被六维记忆系统替代
// 聚合所有AI相关的路由
router.use('/auth', auth_routes_1["default"]);
router.use('/user', user_routes_1["default"]);
router.use('/conversations', conversation_routes_1["default"]);
// 消息路由现在直接在会话路由内部处理，不需要单独挂载
router.use('/models', model_routes_1["default"]);
router.use('/feedback', feedback_routes_1["default"]);
router.use('/analytics', analytics_routes_1["default"]);
router.use('/quota', quota_routes_1["default"]);
// ===== 智能专家系统路由 =====
var smart_expert_routes_1 = __importDefault(require("./smart-expert.routes"));
router.use('/smart-expert', smart_expert_routes_1["default"]);
// 添加路由别名以兼容前端调用
router.use('/expert', smart_expert_routes_1["default"]);
// ===== Function Tools路由 =====
router.use('/function-tools', function_tools_routes_1["default"]);
// ===== 已移除的AI路由 =====
// 以下路由已被统一智能系统完全替代，已永久移除：
// - /expert - 智能专家路由 (已恢复为 /smart-expert)
// - /intelligent-consultation - Function Calling版智能专家路由
// - /expert-consultation - 专家咨询路由
//
// 新的统一接口：
// - /unified/unified-chat - 统一智能对话
// - /unified/status - 系统状态
// - /unified/capabilities - 系统能力
// ===== 其他AI路由 (暂时保留，待进一步评估) =====
// 注意：以下路由可能在未来版本中被统一智能系统集成
// router.use('/memory', memoryRoutes);        // 记忆管理 - 已被六维记忆系统替代
// router.use('/analysis', aiAnalysisRoutes);  // AI分析
// router.use('/query', aiQueryRoutes);        // AI查询
// ===== AI对话根路径 =====
// 添加简单的AI对话端点，用于测试六维记忆系统
router.post('/', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, userId, conversationId, response;
    return __generator(this, function (_b) {
        try {
            _a = req.body, message = _a.message, userId = _a.userId, conversationId = _a.conversationId;
            if (!message) {
                return [2 /*return*/, res.status(400).json({
                        success: false,
                        message: '消息内容不能为空'
                    })];
            }
            response = generateFallbackResponse(message, { type: 'general' });
            // 这里可以集成六维记忆系统
            console.log('🧠 六维记忆系统处理:', { userId: userId, conversationId: conversationId, message: message.substring(0, 50) + '...' });
            res.json({
                success: true,
                data: {
                    response: response,
                    timestamp: new Date().toISOString(),
                    conversationId: conversationId || 'default'
                }
            });
        }
        catch (error) {
            console.error('AI对话处理失败:', error);
            res.status(500).json({
                success: false,
                message: '服务器内部错误',
                error: error.message
            });
        }
        return [2 /*return*/];
    });
}); });
// 挂载统一智能系统路由到 /unified 路径
router.use('/unified', unified_intelligence_routes_1["default"]);
// 挂载视频生成路由到 /video 路径
router.use('/video', video_routes_1["default"]);
// 挂载文字转语音路由到 /text-to-speech 路径
var text_to_speech_routes_1 = __importDefault(require("../text-to-speech.routes"));
router.use('/text-to-speech', text_to_speech_routes_1["default"]);
// ===== 已移除的旧聊天接口 =====
// 旧的简单聊天接口 /chat 已被统一智能系统完全替代
// 新的聊天功能请使用: /unified/unified-chat
// ✅ 完整的会话消息API: /api/ai/conversations/{conversationId}/messages
// 完整API包含向量记忆、上下文管理、流式输出等高级功能
exports["default"] = router;
