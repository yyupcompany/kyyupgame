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
exports.FeedbackController = void 0;
var feedback_service_1 = require("../../services/ai/feedback.service");
var apiError_1 = require("../../utils/apiError");
/**
 * @openapi
 * tags:
 *   name: AI反馈
 *   description: 管理用户对AI系统的反馈和评价
 */
/**
 * AI反馈控制器
 * 负责处理用户反馈相关的HTTP请求
 */
var FeedbackController = /** @class */ (function () {
    function FeedbackController() {
        var _this = this;
        this.feedbackService = new feedback_service_1.FeedbackService();
        /**
         * @openapi
         * /api/v1/ai/feedback:
         *   post:
         *     summary: 提交反馈
         *     description: 提交用户对AI系统的反馈信息
         *     tags:
         *       - AI反馈
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - feedbackType
         *               - sourceType
         *               - content
         *             properties:
         *               feedbackType:
         *                 type: string
         *                 enum: [general, response, suggestion, bug, feature]
         *                 description: 反馈类型
         *                 example: "suggestion"
         *               sourceType:
         *                 type: string
         *                 enum: [conversation, message, application, system]
         *                 description: 反馈来源类型
         *                 example: "conversation"
         *               sourceId:
         *                 type: string
         *                 nullable: true
         *                 description: 反馈来源ID（如会话ID、消息ID）
         *                 example: "conv-12345-abcde"
         *               content:
         *                 type: string
         *                 description: 反馈内容
         *                 example: "希望能增加更多的模型选择"
         *               rating:
         *                 type: integer
         *                 minimum: 1
         *                 maximum: 5
         *                 nullable: true
         *                 description: 反馈评分（1-5分）
         *                 example: 4
         *     responses:
         *       201:
         *         description: 反馈提交成功
         *         content:
         *           application/json:
         *             schema:
         *               $ref: '#/components/schemas/Feedback'
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
         *                   example: 反馈类型、来源和内容不能为空
         *       401:
         *         $ref: '#/components/responses/UnauthorizedError'
         *       500:
         *         $ref: '#/components/responses/ServerError'
         */
        this.submitFeedback = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, _a, feedbackType, sourceType, sourceId, content, rating, feedbackDto, newFeedback, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户未授权'))];
                        }
                        _a = req.body, feedbackType = _a.feedbackType, sourceType = _a.sourceType, sourceId = _a.sourceId, content = _a.content, rating = _a.rating;
                        if (!feedbackType || !sourceType || !content) {
                            return [2 /*return*/, next(apiError_1.ApiError.badRequest('反馈类型、来源和内容不能为空'))];
                        }
                        feedbackDto = {
                            userId: userId,
                            feedbackType: feedbackType,
                            sourceType: sourceType,
                            sourceId: sourceId,
                            content: content,
                            rating: rating ? Number(rating) || 0 : undefined
                        };
                        return [4 /*yield*/, this.feedbackService.createFeedback(feedbackDto)];
                    case 1:
                        newFeedback = _c.sent();
                        res.status(201).json(newFeedback);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return FeedbackController;
}());
exports.FeedbackController = FeedbackController;
