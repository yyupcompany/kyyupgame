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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var unified_intelligence_service_1 = __importDefault(require("../../services/ai-operator/unified-intelligence.service"));
var router = express_1["default"].Router();
/**
 * SSE流式AI聊天接口
 * POST /api/ai/unified/stream-chat
 */
router.post('/stream-chat', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, userId, conversationId, context, userRequest, error_1, errorData;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📥 [后端接收] 接收到流式聊天请求');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                _a = req.body, message = _a.message, userId = _a.userId, conversationId = _a.conversationId, context = _a.context;
                console.log('📝 [后端接收] 消息内容:', message);
                console.log('👤 [后端接收] 用户ID:', userId);
                console.log('💬 [后端接收] 会话ID:', conversationId);
                console.log('🔧 [后端接收] 上下文:', JSON.stringify(context, null, 2));
                console.log('🔑 [后端接收] JWT用户:', req.user);
                // 验证必要参数
                if (!message) {
                    console.log('❌ [后端接收] 缺少必要参数: message');
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '缺少必要参数: message'
                        })];
                }
                userRequest = {
                    content: message,
                    userId: userId || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 'anonymous',
                    conversationId: conversationId || 'default',
                    context: __assign(__assign({}, (context || {})), { 
                        // 🔧 Bug修复：如果前端没有传role，从JWT token中获取
                        role: (context === null || context === void 0 ? void 0 : context.role) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) || 'parent' })
                };
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🚀 [后端接收] 构建的用户请求:', JSON.stringify(userRequest, null, 2));
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                // 调用流式处理服务
                return [4 /*yield*/, unified_intelligence_service_1["default"].processUserRequestStream(userRequest, res)];
            case 1:
                // 调用流式处理服务
                _d.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _d.sent();
                console.error('❌ [SSE Route] 流式处理路由错误:', error_1);
                // 如果响应还没有开始，发送错误响应
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: '服务器内部错误',
                        error: error_1.message
                    });
                }
                else {
                    errorData = "event: error\ndata: ".concat(JSON.stringify({
                        message: '处理过程中出现错误: ' + error_1.message,
                        error: error_1.toString()
                    }), "\n\n");
                    res.write(errorData);
                    res.end();
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * 🆕 SSE流式AI聊天接口 - 单次调用版本（用于前端多轮调用架构）
 * POST /api/ai/unified/stream-chat-single
 */
router.post('/stream-chat-single', auth_middleware_1.authMiddleware, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, message, userId, conversationId, context, userRequest, error_2, errorData;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎯 [单次调用] 接收到流式聊天请求（单次调用模式）');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                _a = req.body, message = _a.message, userId = _a.userId, conversationId = _a.conversationId, context = _a.context;
                console.log('📝 [单次调用] 消息内容:', message);
                console.log('👤 [单次调用] 用户ID:', userId);
                console.log('💬 [单次调用] 会话ID:', conversationId);
                console.log('🔢 [单次调用] 当前轮次:', (context === null || context === void 0 ? void 0 : context.currentRound) || 1);
                console.log('📨 [单次调用] 消息历史长度:', ((_b = context === null || context === void 0 ? void 0 : context.messages) === null || _b === void 0 ? void 0 : _b.length) || 0);
                console.log('🔧 [单次调用] 上下文:', JSON.stringify(context, null, 2));
                // 验证必要参数
                if (!message && (!(context === null || context === void 0 ? void 0 : context.messages) || context.messages.length === 0)) {
                    console.log('❌ [单次调用] 缺少必要参数: message 或 messages');
                    return [2 /*return*/, res.status(400).json({
                            success: false,
                            message: '缺少必要参数: message 或 messages'
                        })];
                }
                userRequest = {
                    content: message || '',
                    userId: userId || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id) || 'anonymous',
                    conversationId: conversationId || 'default',
                    context: __assign(__assign({}, (context || {})), { role: (context === null || context === void 0 ? void 0 : context.role) || ((_d = req.user) === null || _d === void 0 ? void 0 : _d.role) || 'parent' })
                };
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🚀 [单次调用] 构建的用户请求:', JSON.stringify(userRequest, null, 2));
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                // 调用单次流式处理服务
                return [4 /*yield*/, unified_intelligence_service_1["default"].processUserRequestStreamSingleRound(userRequest, res)];
            case 1:
                // 调用单次流式处理服务
                _e.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _e.sent();
                console.error('❌ [单次调用] 流式处理路由错误:', error_2);
                // 如果响应还没有开始，发送错误响应
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: '服务器内部错误',
                        error: error_2.message
                    });
                }
                else {
                    errorData = "event: error\ndata: ".concat(JSON.stringify({
                        message: '处理过程中出现错误: ' + error_2.message,
                        error: error_2.toString()
                    }), "\n\n");
                    res.write(errorData);
                    res.end();
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * 健康检查接口
 * GET /api/ai/unified/stream-health
 */
router.get('/stream-health', function (req, res) {
    res.json({
        success: true,
        message: 'SSE流式服务运行正常',
        timestamp: new Date().toISOString(),
        service: 'unified-intelligence-stream'
    });
});
exports["default"] = router;
