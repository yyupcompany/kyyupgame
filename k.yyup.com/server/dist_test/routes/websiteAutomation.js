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
exports.websiteAutomationRouter = void 0;
var express_1 = require("express");
var websiteAutomationController_1 = require("../controllers/websiteAutomationController");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
// 简单的验证中间件
var validateRequest = function (validations) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var errors;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Promise.all(validations.map(function (validation) { return validation.run(req); }))];
                case 1:
                    _a.sent();
                    errors = (0, express_validator_1.validationResult)(req);
                    if (errors.isEmpty()) {
                        return [2 /*return*/, next()];
                    }
                    res.status(400).json({
                        success: false,
                        message: '请求参数验证失败',
                        errors: errors.array()
                    });
                    return [2 /*return*/];
            }
        });
    }); };
};
var router = (0, express_1.Router)();
exports.websiteAutomationRouter = router;
/**
 * @swagger
 * /api/website-automation/tasks:
 *   get:
 *     summary: 获取所有自动化任务
 *     description: 获取所有网站自动化任务列表
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tasks', auth_middleware_1.verifyToken, websiteAutomationController_1.websiteAutomationController.getAllTasks);
/**
 * @swagger
 * /api/website-automation/tasks:
 *   post:
 *     summary: 创建自动化任务
 *     description: 创建新的网站自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 description: 任务名称
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: 目标URL
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                 description: 自动化步骤
 *               config:
 *                 type: object
 *                 description: 任务配置
 *     responses:
 *       200:
 *         description: 创建成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.body)('name').notEmpty().withMessage('任务名称不能为空'),
    (0, express_validator_1.body)('url').isURL().withMessage('请提供有效的URL'),
    (0, express_validator_1.body)('steps').isArray().withMessage('步骤必须是数组格式'),
    (0, express_validator_1.body)('config').optional().isObject().withMessage('配置必须是对象格式')
]), websiteAutomationController_1.websiteAutomationController.createTask);
/**
 * @swagger
 * /api/website-automation/tasks/{id}:
 *   put:
 *     summary: 更新自动化任务
 *     description: 更新指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               url:
 *                 type: string
 *                 format: uri
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/tasks/:id', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的任务ID'),
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('任务名称不能为空'),
    (0, express_validator_1.body)('url').optional().isURL().withMessage('请提供有效的URL'),
    (0, express_validator_1.body)('steps').optional().isArray().withMessage('步骤必须是数组格式')
]), websiteAutomationController_1.websiteAutomationController.updateTask);
/**
 * @swagger
 * /api/website-automation/tasks/{id}:
 *   delete:
 *     summary: 删除自动化任务
 *     description: 删除指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/tasks/:id', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的任务ID')
]), websiteAutomationController_1.websiteAutomationController.deleteTask);
/**
 * @swagger
 * /api/website-automation/tasks/{id}/execute:
 *   post:
 *     summary: 执行自动化任务
 *     description: 执行指定的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 执行成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks/:id/execute', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的任务ID')
]), websiteAutomationController_1.websiteAutomationController.executeTask);
/**
 * @swagger
 * /api/website-automation/tasks/{id}/stop:
 *   post:
 *     summary: 停止自动化任务
 *     description: 停止正在执行的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 停止成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/tasks/:id/stop', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的任务ID')
]), websiteAutomationController_1.websiteAutomationController.stopTask);
/**
 * @swagger
 * /api/website-automation/tasks/{id}/history:
 *   get:
 *     summary: 获取任务执行历史
 *     description: 获取指定任务的执行历史记录
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/tasks/:id/history', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的任务ID')
]), websiteAutomationController_1.websiteAutomationController.getTaskHistory);
/**
 * @swagger
 * /api/website-automation/templates:
 *   get:
 *     summary: 获取所有模板
 *     description: 获取所有自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/templates', auth_middleware_1.verifyToken, websiteAutomationController_1.websiteAutomationController.getAllTemplates);
/**
 * @swagger
 * /api/website-automation/templates:
 *   post:
 *     summary: 创建模板
 *     description: 创建新的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - complexity
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [web, form, data, test, custom]
 *               complexity:
 *                 type: string
 *                 enum: [simple, medium, complex]
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *               parameters:
 *                 type: array
 *                 items:
 *                   type: object
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 创建成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/templates', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.body)('name').notEmpty().withMessage('模板名称不能为空'),
    (0, express_validator_1.body)('category').isIn(['web', 'form', 'data', 'test', 'custom']).withMessage('无效的模板分类'),
    (0, express_validator_1.body)('complexity').isIn(['simple', 'medium', 'complex']).withMessage('无效的复杂度级别'),
    (0, express_validator_1.body)('steps').isArray().withMessage('步骤必须是数组格式'),
    (0, express_validator_1.body)('parameters').optional().isArray().withMessage('参数必须是数组格式'),
    (0, express_validator_1.body)('config').optional().isObject().withMessage('配置必须是对象格式')
]), websiteAutomationController_1.websiteAutomationController.createTemplate);
/**
 * @swagger
 * /api/website-automation/templates/{id}:
 *   put:
 *     summary: 更新模板
 *     description: 更新指定的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [web, form, data, test, custom]
 *               complexity:
 *                 type: string
 *                 enum: [simple, medium, complex]
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/templates/:id', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的模板ID'),
    (0, express_validator_1.body)('name').optional().notEmpty().withMessage('模板名称不能为空'),
    (0, express_validator_1.body)('category').optional().isIn(['web', 'form', 'data', 'test', 'custom']).withMessage('无效的模板分类'),
    (0, express_validator_1.body)('complexity').optional().isIn(['simple', 'medium', 'complex']).withMessage('无效的复杂度级别')
]), websiteAutomationController_1.websiteAutomationController.updateTemplate);
/**
 * @swagger
 * /api/website-automation/templates/{id}:
 *   delete:
 *     summary: 删除模板
 *     description: 删除指定的自动化任务模板
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/templates/:id', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('id').isUUID().withMessage('无效的模板ID')
]), websiteAutomationController_1.websiteAutomationController.deleteTemplate);
/**
 * @swagger
 * /api/website-automation/templates/{templateId}/create-task:
 *   post:
 *     summary: 从模板创建任务
 *     description: 基于模板创建新的自动化任务
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parameters:
 *                 type: object
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/templates/:templateId/create-task', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.param)('templateId').isUUID().withMessage('无效的模板ID'),
    (0, express_validator_1.body)('parameters').optional().isObject().withMessage('参数必须是对象格式')
]), websiteAutomationController_1.websiteAutomationController.createTaskFromTemplate);
/**
 * @swagger
 * /api/website-automation/screenshot:
 *   post:
 *     summary: 截取网页截图
 *     description: 截取指定URL的网页截图
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               options:
 *                 type: object
 *     responses:
 *       200:
 *         description: 截图成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/screenshot', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.body)('url').isURL().withMessage('请提供有效的URL'),
    (0, express_validator_1.body)('options').optional().isObject().withMessage('选项必须是对象格式')
]), websiteAutomationController_1.websiteAutomationController.captureScreenshot);
/**
 * @swagger
 * /api/website-automation/analyze:
 *   post:
 *     summary: 分析页面元素
 *     description: 分析网页的页面元素
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               screenshot:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       200:
 *         description: 分析成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/analyze', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.body)('url').isURL().withMessage('请提供有效的URL'),
    (0, express_validator_1.body)('screenshot').optional().notEmpty().withMessage('截图数据不能为空'),
    (0, express_validator_1.body)('config').optional().isObject().withMessage('配置必须是对象格式')
]), websiteAutomationController_1.websiteAutomationController.analyzePageElements);
/**
 * @swagger
 * /api/website-automation/find-element:
 *   post:
 *     summary: 查找页面元素
 *     description: 根据描述查找页面元素
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *               - description
 *             properties:
 *               url:
 *                 type: string
 *                 format: uri
 *               description:
 *                 type: string
 *               screenshot:
 *                 type: string
 *     responses:
 *       200:
 *         description: 查找成功
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/find-element', auth_middleware_1.verifyToken, validateRequest([
    (0, express_validator_1.body)('url').isURL().withMessage('请提供有效的URL'),
    (0, express_validator_1.body)('description').notEmpty().withMessage('元素描述不能为空'),
    (0, express_validator_1.body)('screenshot').optional().notEmpty().withMessage('截图数据不能为空')
]), websiteAutomationController_1.websiteAutomationController.findElementByDescription);
/**
 * @swagger
 * /api/website-automation/statistics:
 *   get:
 *     summary: 获取统计数据
 *     description: 获取网站自动化的统计数据
 *     tags:
 *       - 网站自动化
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/statistics', auth_middleware_1.verifyToken, websiteAutomationController_1.websiteAutomationController.getStatistics);
