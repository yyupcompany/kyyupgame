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
exports.MessageController = void 0;
var message_service_1 = require("../../services/ai/message.service");
var apiError_1 = require("../../utils/apiError");
/**
 * @openapi
 * tags:
 *   name: AI消息
 *   description: 管理AI系统会话中的消息，包括创建、获取和删除消息
 */
/**
 * AI消息控制器
 * 负责处理会话消息相关的HTTP请求
 */
var MessageController = /** @class */ (function () {
    function MessageController() {
        var _this = this;
        this.messageService = new message_service_1.MessageService();
        /**
         * @openapi
         * /api/v1/ai/conversations/{conversationId}/messages:
         *   get:
         *     summary: 获取消息列表
         *     description: 获取指定会话的所有消息列表，支持分页
         *     tags:
         *       - AI消息
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: conversationId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 会话ID
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
         *           default: 20
         *         description: 每页条数
         *     responses:
         *       200:
         *         description: 成功获取消息列表
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Message'
         *                 meta:
         *                   type: object
         *                   properties:
         *                     page:
         *                       type: integer
         *                       example: 1
         *                     pageSize:
         *                       type: integer
         *                       example: 20
         *                     totalItems:
         *                       type: integer
         *                       example: 35
         *                     totalPages:
         *                       type: integer
         *                       example: 2
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.listMessages = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var conversationId, userId, _a, _b, page, _c, pageSize, options, result, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        conversationId = req.params.conversationId;
                        userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c;
                        options = {
                            page: Number(page) || 0,
                            pageSize: Number(pageSize) || 0
                        };
                        return [4 /*yield*/, this.messageService.getConversationMessages(conversationId, userId, options)];
                    case 1:
                        result = _e.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _e.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/conversations/{conversationId}/messages:
         *   post:
         *     summary: 创建新消息
         *     description: 在指定会话中创建一条新消息
         *     tags:
         *       - AI消息
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: conversationId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 会话ID
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - role
         *               - content
         *             properties:
         *               role:
         *                 type: string
         *                 enum: [user, assistant, system]
         *                 description: 消息发送者角色
         *                 example: user
         *               content:
         *                 type: string
         *                 description: 消息内容
         *                 example: "我想了解更多关于AI的知识"
         *     responses:
         *       201:
         *         description: 消息创建成功
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Message'
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
         *                   example: 角色和内容不能为空
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.createMessage = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var conversationId, userId, _a, content, metadata, _b, stream, pagePath, streamResult, error_2, aiMessage, error_3;
            var _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 8, , 9]);
                        conversationId = req.params.conversationId;
                        userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                        _a = req.body, content = _a.content, metadata = _a.metadata, _b = _a.stream, stream = _b === void 0 ? false : _b, pagePath = _a.pagePath;
                        // 添加调试日志
                        console.log('\x1b[32m[MessageController] 接收到消息请求:\x1b[0m', {
                            conversationId: conversationId,
                            userId: userId,
                            contentLength: content === null || content === void 0 ? void 0 : content.length,
                            stream: stream,
                            metadata: metadata
                        });
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        if (!content) {
                            return [2 /*return*/, next(apiError_1.ApiError.badRequest('消息内容不能为空'))];
                        }
                        if (!stream) return [3 /*break*/, 5];
                        console.log('\x1b[33m[MessageController] 处理流式输出请求\x1b[0m');
                        // 设置流式响应头
                        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
                        res.setHeader('Cache-Control', 'no-cache');
                        res.setHeader('Connection', 'keep-alive');
                        res.setHeader('Access-Control-Allow-Origin', '*');
                        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.messageService.sendMessage({
                                conversationId: conversationId,
                                userId: userId,
                                content: content,
                                metadata: metadata,
                                pagePath: pagePath
                            }, true)];
                    case 2:
                        streamResult = _d.sent();
                        // 如果返回的是流，则管道到响应
                        if (streamResult && typeof streamResult.pipe === 'function') {
                            streamResult.pipe(res);
                            streamResult.on('end', function () {
                                res.end();
                            });
                            streamResult.on('error', function (error) {
                                console.error('流式输出错误:', error);
                                res.write("data: ".concat(JSON.stringify({ type: 'error', message: '流式输出失败' }), "\n\n"));
                                res.end();
                            });
                        }
                        else {
                            // 如果不是流，发送错误
                            res.write("data: ".concat(JSON.stringify({ type: 'error', message: '流式输出初始化失败' }), "\n\n"));
                            res.end();
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _d.sent();
                        console.error('流式消息处理失败:', error_2);
                        res.write("data: ".concat(JSON.stringify({ type: 'error', message: '流式消息处理失败' }), "\n\n"));
                        res.end();
                        return [3 /*break*/, 4];
                    case 4: return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.messageService.sendMessage({
                            conversationId: conversationId,
                            userId: userId,
                            content: content,
                            metadata: metadata,
                            pagePath: pagePath
                        })];
                    case 6:
                        aiMessage = _d.sent();
                        res.status(200).json({
                            code: 200,
                            message: 'success',
                            data: aiMessage
                        });
                        _d.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_3 = _d.sent();
                        next(error_3);
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/conversations/{conversationId}/messages/{messageId}:
         *   delete:
         *     summary: 删除消息
         *     description: 删除指定ID的消息
         *     tags:
         *       - AI消息
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: conversationId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 会话ID
         *       - in: path
         *         name: messageId
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 消息ID
         *     responses:
         *       204:
         *         description: 消息删除成功
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.deleteMessage = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var messageId, userId, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        messageId = req.params.messageId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        return [4 /*yield*/, this.messageService.deleteMessage(messageId, userId)];
                    case 1:
                        _b.sent();
                        res.status(204).send();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return MessageController;
}());
exports.MessageController = MessageController;
