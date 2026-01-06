"use strict";
exports.__esModule = true;
var express_1 = require("express");
var kindergarten_basic_info_controller_1 = require("../controllers/kindergarten-basic-info.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/kindergarten/basic-info:
 *   get:
 *     summary: 获取幼儿园基本资料
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取基本资料
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
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                       description: 幼儿园名称
 *                     description:
 *                       type: string
 *                       description: 园区介绍
 *                     studentCount:
 *                       type: integer
 *                       description: 学生人数
 *                     teacherCount:
 *                       type: integer
 *                       description: 教师人数
 *                     classCount:
 *                       type: integer
 *                       description: 班级数量
 *                     logoUrl:
 *                       type: string
 *                       description: logo图片URL
 *                     coverImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 园区配图URLs
 *                     contactPerson:
 *                       type: string
 *                       description: 联系人
 *                     consultationPhone:
 *                       type: string
 *                       description: 咨询电话
 *                     address:
 *                       type: string
 *                       description: 园区地址
 */
router.get('/basic-info', auth_middleware_1.authenticate, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.getBasicInfo);
/**
 * @swagger
 * /api/kindergarten/basic-info:
 *   put:
 *     summary: 更新幼儿园基本资料
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 幼儿园名称
 *               description:
 *                 type: string
 *                 description: 园区介绍
 *               studentCount:
 *                 type: integer
 *                 description: 学生人数
 *               teacherCount:
 *                 type: integer
 *                 description: 教师人数
 *               classCount:
 *                 type: integer
 *                 description: 班级数量
 *               logoUrl:
 *                 type: string
 *                 description: logo图片URL
 *               coverImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 园区配图URLs
 *               contactPerson:
 *                 type: string
 *                 description: 联系人
 *               consultationPhone:
 *                 type: string
 *                 description: 咨询电话
 *               address:
 *                 type: string
 *                 description: 园区地址
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/basic-info', auth_middleware_1.authenticate, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.updateBasicInfo);
/**
 * @swagger
 * /api/kindergarten/upload-image:
 *   post:
 *     summary: 上传单张图片（logo）
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: 图片文件
 *     responses:
 *       200:
 *         description: 上传成功
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
 *                     url:
 *                       type: string
 *                       description: 图片URL
 *                     filename:
 *                       type: string
 *                       description: 文件名
 */
router.post('/upload-image', auth_middleware_1.authenticate, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.uploadSingle, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.uploadImage);
/**
 * @swagger
 * /api/kindergarten/upload-images:
 *   post:
 *     summary: 上传多张图片（园区配图）
 *     tags: [幼儿园基本资料]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 图片文件数组（最多10张）
 *     responses:
 *       200:
 *         description: 上传成功
 */
router.post('/upload-images', auth_middleware_1.authenticate, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.uploadMultiple, kindergarten_basic_info_controller_1.KindergartenBasicInfoController.uploadImages);
exports["default"] = router;
