"use strict";
/**
 * 自动配图路由
 * 提供AI自动生成图像的API端点
 */
exports.__esModule = true;
var express_1 = require("express");
var express_validator_1 = require("express-validator");
var auto_image_controller_1 = require("../controllers/auto-image.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 简单的验证错误处理中间件
var handleValidationErrors = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: '参数验证失败',
            errors: errors.array()
        });
    }
    next();
};
/**
 * @swagger
 * tags:
 *   name: 自动配图
 *   description: AI自动生成图像服务
 */
/**
 * @swagger
 * /api/auto-image/generate:
 *   post:
 *     summary: 生成单张图像
 *     description: 根据提示词使用AI生成图像
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 图像生成提示词
 *                 example: "一个温馨的幼儿园教室，孩子们在快乐地学习"
 *               category:
 *                 type: string
 *                 enum: [activity, poster, template, marketing, education]
 *                 description: 图像分类
 *                 example: "activity"
 *               style:
 *                 type: string
 *                 enum: [natural, cartoon, realistic, artistic]
 *                 description: 图像风格
 *                 example: "natural"
 *               size:
 *                 type: string
 *                 enum: [512x512, 1024x1024, 1024x768, 768x1024]
 *                 description: 图像尺寸
 *                 example: "1024x768"
 *               quality:
 *                 type: string
 *                 enum: [standard, hd]
 *                 description: 图像质量
 *                 example: "standard"
 *               watermark:
 *                 type: boolean
 *                 description: 是否添加水印
 *                 example: true
 *     responses:
 *       200:
 *         description: 图像生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       description: 生成的图像URL
 *                     usage:
 *                       type: object
 *                       description: 使用统计
 *                     metadata:
 *                       type: object
 *                       description: 生成元数据
 *                 message:
 *                   type: string
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/generate', auth_middleware_1.authMiddleware, auto_image_controller_1.generateImageValidation, handleValidationErrors, auto_image_controller_1.AutoImageController.generateImage);
/**
 * @swagger
 * /api/auto-image/activity:
 *   post:
 *     summary: 为活动生成配图
 *     description: 根据活动信息自动生成配图
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityTitle
 *               - activityDescription
 *             properties:
 *               activityTitle:
 *                 type: string
 *                 description: 活动标题
 *                 example: "春季亲子运动会"
 *               activityDescription:
 *                 type: string
 *                 description: 活动描述
 *                 example: "家长和孩子一起参与的户外运动活动，增进亲子关系"
 *     responses:
 *       200:
 *         description: 活动配图生成成功
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/activity', auth_middleware_1.authMiddleware, auto_image_controller_1.generateActivityImageValidation, handleValidationErrors, auto_image_controller_1.AutoImageController.generateActivityImage);
/**
 * @swagger
 * /api/auto-image/poster:
 *   post:
 *     summary: 为海报生成配图
 *     description: 根据海报信息自动生成配图
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - posterTitle
 *               - posterContent
 *             properties:
 *               posterTitle:
 *                 type: string
 *                 description: 海报标题
 *                 example: "2024年春季招生"
 *               posterContent:
 *                 type: string
 *                 description: 海报内容
 *                 example: "优质教育环境，专业师资团队，欢迎报名咨询"
 *     responses:
 *       200:
 *         description: 海报配图生成成功
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/poster', auth_middleware_1.authMiddleware, auto_image_controller_1.generatePosterImageValidation, handleValidationErrors, auto_image_controller_1.AutoImageController.generatePosterImage);
/**
 * @swagger
 * /api/auto-image/template:
 *   post:
 *     summary: 为模板生成配图
 *     description: 根据模板信息自动生成配图
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateName
 *               - templateDescription
 *             properties:
 *               templateName:
 *                 type: string
 *                 description: 模板名称
 *                 example: "亲子活动模板"
 *               templateDescription:
 *                 type: string
 *                 description: 模板描述
 *                 example: "适用于各种亲子互动活动的通用模板"
 *     responses:
 *       200:
 *         description: 模板配图生成成功
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/template', auth_middleware_1.authMiddleware, auto_image_controller_1.generateTemplateImageValidation, handleValidationErrors, auto_image_controller_1.AutoImageController.generateTemplateImage);
/**
 * @swagger
 * /api/auto-image/batch:
 *   post:
 *     summary: 批量生成图像
 *     description: 批量生成多张图像（最多10张）
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - requests
 *             properties:
 *               requests:
 *                 type: array
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required:
 *                     - prompt
 *                   properties:
 *                     prompt:
 *                       type: string
 *                       description: 图像生成提示词
 *                     category:
 *                       type: string
 *                       enum: [activity, poster, template, marketing, education]
 *                     style:
 *                       type: string
 *                       enum: [natural, cartoon, realistic, artistic]
 *                     size:
 *                       type: string
 *                       enum: [512x512, 1024x1024, 1024x768, 768x1024]
 *                     quality:
 *                       type: string
 *                       enum: [standard, hd]
 *                     watermark:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: 批量生成完成
 *       400:
 *         description: 参数验证失败
 *       500:
 *         description: 服务器错误
 */
router.post('/batch', auth_middleware_1.authMiddleware, auto_image_controller_1.generateBatchImagesValidation, handleValidationErrors, auto_image_controller_1.AutoImageController.generateBatchImages);
/**
 * @swagger
 * /api/auto-image/status:
 *   get:
 *     summary: 检查服务状态
 *     description: 检查AI自动配图服务的可用性
 *     tags:
 *       - 自动配图
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 服务状态检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 *                       description: 服务是否可用
 *                     model:
 *                       type: string
 *                       description: 使用的模型名称
 *                     error:
 *                       type: string
 *                       description: 错误信息（如果有）
 *                 message:
 *                   type: string
 *       500:
 *         description: 服务器错误
 */
router.get('/status', auth_middleware_1.authMiddleware, auto_image_controller_1.AutoImageController.checkServiceStatus);
exports["default"] = router;
