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
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     MessageTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 消息模板ID
 *         name:
 *           type: string
 *           description: 模板名称
 *         type:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *           description: 消息类型
 *         subject:
 *           type: string
 *           description: 消息主题（邮件标题等）
 *         content:
 *           type: string
 *           description: 消息内容模板
 *         variables:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板变量列表
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: 模板状态
 *         category:
 *           type: string
 *           description: 消息分类
 *         description:
 *           type: string
 *           description: 模板描述
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - name
 *         - type
 *         - content
 *
 *     MessageTemplateInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 模板名称
 *           maxLength: 100
 *         type:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *           description: 消息类型
 *         subject:
 *           type: string
 *           description: 消息主题
 *           maxLength: 200
 *         content:
 *           type: string
 *           description: 消息内容模板
 *         variables:
 *           type: array
 *           items:
 *             type: string
 *           description: 模板变量列表
 *         status:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *           description: 模板状态
 *           default: ACTIVE
 *         category:
 *           type: string
 *           description: 消息分类
 *           maxLength: 50
 *         description:
 *           type: string
 *           description: 模板描述
 *           maxLength: 500
 *       required:
 *         - name
 *         - type
 *         - content
 *
 *     MessageTemplateList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MessageTemplate'
 *         total:
 *           type: integer
 *           description: 总记录数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页大小
 *         totalPages:
 *           type: integer
 *           description: 总页数
 */
/**
 * @swagger
 * /api/message-templates:
 *   get:
 *     summary: 获取消息模板列表
 *     description: 获取消息模板列表，支持分页和过滤
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [SMS, EMAIL, PUSH, WECHAT]
 *         description: 消息类型过滤
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [ACTIVE, INACTIVE]
 *         description: 状态过滤
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 分类过滤
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索（模板名称、内容）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplateList'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var templates;
    return __generator(this, function (_a) {
        try {
            templates = [];
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: templates,
                    total: templates.length,
                    page: 1,
                    pageSize: templates.length,
                    totalPages: 1
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取消息模板列表失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/message-templates:
 *   post:
 *     summary: 创建消息模板
 *     description: 创建新的消息模板
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageTemplateInput'
 *           example:
 *             name: "注册成功通知"
 *             type: "SMS"
 *             subject: "欢迎注册"
 *             content: "尊敬的{name}，欢迎注册我们的服务！您的账号：{account}"
 *             variables: ["name", "account"]
 *             category: "用户通知"
 *             description: "用户注册成功后发送的短信通知模板"
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: 模板名称已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板名称已存在"
 *               code: "TEMPLATE_EXISTS"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "创建消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '创建消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '创建消息模板失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/message-templates/{id}:
 *   get:
 *     summary: 获取消息模板详情
 *     description: 根据ID获取特定消息模板的详细信息
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板详情功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '消息模板详情功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取消息模板详情失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/message-templates/{id}:
 *   put:
 *     summary: 更新消息模板
 *     description: 根据ID更新特定消息模板的信息
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageTemplateInput'
 *           example:
 *             name: "注册成功通知（更新版）"
 *             type: "EMAIL"
 *             subject: "欢迎注册我们的服务"
 *             content: "尊敬的{name}，感谢您注册我们的服务！您的账号：{account}，登录密码已发送至您的邮箱。"
 *             variables: ["name", "account"]
 *             status: "ACTIVE"
 *             category: "用户通知"
 *             description: "用户注册成功后发送的邮件通知模板（更新版）"
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/MessageTemplate'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       409:
 *         description: 模板名称已存在（当修改名称时）
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板名称已存在"
 *               code: "TEMPLATE_EXISTS"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "更新消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新消息模板失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/message-templates/{id}:
 *   delete:
 *     summary: 删除消息模板
 *     description: 根据ID删除特定的消息模板
 *     tags: [消息模板管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 消息模板ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "消息模板删除成功"
 *               data: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         description: 消息模板不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "消息模板不存在"
 *               code: "TEMPLATE_NOT_FOUND"
 *       409:
 *         description: 模板正在使用中，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "模板正在使用中，无法删除"
 *               code: "TEMPLATE_IN_USE"
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "删除消息模板功能暂未实现"
 *               code: "NOT_IMPLEMENTED"
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '删除消息模板功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '删除消息模板失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
