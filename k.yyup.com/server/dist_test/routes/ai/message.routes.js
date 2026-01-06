"use strict";
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
exports.__esModule = true;
var express_1 = require("express");
var message_controller_1 = require("../../controllers/ai/message.controller");
var auth_middleware_1 = require("../../middlewares/auth.middleware");
/**
 * @swagger
 * tags:
 *   name: AI消息
 *   description: 管理AI系统会话中的消息，包括创建、获取和删除消息
 */
// 使用 mergeParams: true 来获取父级路由中的 :conversationId
var router = (0, express_1.Router)({ mergeParams: true });
var messageController = new message_controller_1.MessageController();
/**
 * @swagger
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
 *               $ref: '#/components/schemas/MessageListResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', auth_middleware_1.authMiddleware, messageController.listMessages);
/**
 * @swagger
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
router.post('/', auth_middleware_1.authMiddleware, messageController.createMessage);
/**
 * @swagger
 * /api/v1/ai/conversations/{conversationId}/messages/{messageId}/metadata:
 *   patch:
 *     summary: 更新消息元数据
 *     description: 合并更新指定消息的metadata字段
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
 *         description: 会话ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 消息ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: 更新成功
 */
/**
 * @swagger
 * /api/v1/ai/conversations/{conversationId}/messages/{messageId}/metadata:
 *   patch:
 *     summary: 更新消息元数据
 *     description: 合并更新指定消息的metadata字段
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
 *         description: 会话ID
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 消息ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.patch('/:messageId/metadata', auth_middleware_1.authMiddleware, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, conversationId, messageId, metadata, userId, MessageService, service, updated, err_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.params, conversationId = _a.conversationId, messageId = _a.messageId;
                metadata = ((_b = req.body) === null || _b === void 0 ? void 0 : _b.metadata) || {};
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../services/ai/message.service')); })];
            case 1:
                MessageService = (_d.sent()).MessageService;
                service = new MessageService();
                return [4 /*yield*/, service.updateMessageMetadata(conversationId, userId, Number(messageId), metadata)];
            case 2:
                updated = _d.sent();
                res.json({ success: true, data: updated });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _d.sent();
                next(err_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
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
router["delete"]('/:messageId', auth_middleware_1.authMiddleware, messageController.deleteMessage);
exports["default"] = router;
