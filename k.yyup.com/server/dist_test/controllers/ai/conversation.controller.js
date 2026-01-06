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
exports.ConversationController = void 0;
var conversation_service_1 = require("../../services/ai/conversation.service");
var apiError_1 = require("../../utils/apiError");
/**
 * @openapi
 * tags:
 *   name: AI会话
 *   description: 管理AI系统的会话，包括创建、获取、更新和删除会话
 */
/**
 * AI会话控制器
 * 负责处理会话相关的HTTP请求
 */
var ConversationController = /** @class */ (function () {
    function ConversationController() {
        var _this = this;
        this.conversationService = new conversation_service_1.ConversationService();
        /**
         * @openapi
         * /api/v1/ai/conversations:
         *   get:
         *     summary: 获取会话列表
         *     description: 获取当前用户的所有会话列表，支持分页和归档状态过滤
         *     tags:
         *       - AI会话
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
         *         name: pageSize
         *         schema:
         *           type: integer
         *           default: 10
         *         description: 每页条数
         *       - in: query
         *         name: isArchived
         *         schema:
         *           type: boolean
         *         description: 是否归档，不传则返回所有状态的会话
         *     responses:
         *       200:
         *         description: 成功获取会话列表
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 data:
         *                   type: array
         *                   items:
         *                     $ref: '#/components/schemas/Conversation'
         *                 meta:
         *                   type: object
         *                   properties:
         *                     page:
         *                       type: integer
         *                       example: 1
         *                     pageSize:
         *                       type: integer
         *                       example: 10
         *                     totalItems:
         *                       type: integer
         *                       example: 35
         *                     totalPages:
         *                       type: integer
         *                       example: 4
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.listConversations = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, _a, _b, page, _c, pageSize, isArchived, keyword, options, result, error_1;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, isArchived = _a.isArchived, keyword = _a.keyword;
                        options = {
                            page: Number(page) || 1,
                            pageSize: Number(pageSize) || 10,
                            isArchived: isArchived !== undefined ? String(isArchived) === 'true' : undefined,
                            keyword: keyword ? String(keyword) : undefined
                        };
                        return [4 /*yield*/, this.conversationService.getUserConversations(userId, options)];
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
         * /api/v1/ai/conversations/{id}:
         *   get:
         *     summary: 获取单个会话详情
         *     description: 根据ID获取特定会话的详细信息
         *     tags:
         *       - AI会话
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 会话ID
         *     responses:
         *       200:
         *         description: 成功获取会话详情
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Conversation'
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         description: 会话不存在
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.getConversationById = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, conversationId, conversation, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        conversationId = req.params.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        return [4 /*yield*/, this.conversationService.getConversationDetails(conversationId, userId)];
                    case 1:
                        conversation = _b.sent();
                        res.status(200).json(conversation);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/conversations:
         *   post:
         *     summary: 创建新会话
         *     description: 创建一个新的AI会话
         *     tags:
         *       - AI会话
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: false
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               title:
         *                 type: string
         *                 description: 会话标题，可选
         *                 example: "教学计划讨论"
         *     responses:
         *       201:
         *         description: 会话创建成功
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Conversation'
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.createConversation = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, title, newConversation, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        title = req.body.title;
                        return [4 /*yield*/, this.conversationService.createConversation(userId, title)];
                    case 1:
                        newConversation = _b.sent();
                        res.status(201).json(newConversation);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/conversations/{id}:
         *   patch:
         *     summary: 更新会话
         *     description: 更新现有会话的标题、归档状态等信息
         *     tags:
         *       - AI会话
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
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
         *             properties:
         *               title:
         *                 type: string
         *                 description: 新的会话标题
         *               isArchived:
         *                 type: boolean
         *                 description: 是否归档
         *     responses:
         *       200:
         *         description: 会话更新成功
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Conversation'
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.updateConversation = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, conversationId, updateData, updatedConversation, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        conversationId = req.params.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        updateData = req.body;
                        return [4 /*yield*/, this.conversationService.updateConversation(conversationId, userId, updateData)];
                    case 1:
                        updatedConversation = _b.sent();
                        res.status(200).json(updatedConversation);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @openapi
         * /api/v1/ai/conversations/{id}:
         *   delete:
         *     summary: 删除会话
         *     description: 永久删除指定ID的会话及其相关的消息记录
         *     tags:
         *       - AI会话
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         required: true
         *         schema:
         *           type: string
         *           format: uuid
         *         description: 会话ID
         *     responses:
         *       204:
         *         description: 会话删除成功
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       404:
         *         $ref: '#/components/responses/NotFoundError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.deleteConversation = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, conversationId, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        conversationId = req.params.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        return [4 /*yield*/, this.conversationService.deleteConversation(conversationId, userId)];
                    case 1:
                        _b.sent();
                        res.status(204).send();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return ConversationController;
}());
exports.ConversationController = ConversationController;
