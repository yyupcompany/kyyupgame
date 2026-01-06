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
exports.__esModule = true;
/**
 * 面试记录路由
 */
var express_1 = require("express");
var enrollmentInterviewController = __importStar(require("../controllers/enrollment-interview.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/enrollment-interviews:
 *   post:
 *     summary: 创建面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - interviewDate
 *               - interviewerId
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 申请ID
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               location:
 *                 type: string
 *                 description: 面试地点
 *               status:
 *                 type: string
 *                 description: 面试状态
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.createInterview);
/**
 * @swagger
 * /api/enrollment-interviews:
 *   get:
 *     summary: 获取面试记录列表
 *     tags: [面试记录]
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
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.getInterviews);
/**
 * @swagger
 * /api/enrollment-interviews/stats:
 *   get:
 *     summary: 获取面试记录统计数据
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.getInterviewStats);
/**
 * @swagger
 * /api/enrollment-interviews/{id}:
 *   get:
 *     summary: 获取面试记录详情
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.getInterviewById);
/**
 * @swagger
 * /api/enrollment-interviews/{id}:
 *   put:
 *     summary: 更新面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: 面试日期
 *               location:
 *                 type: string
 *                 description: 面试地点
 *               status:
 *                 type: string
 *                 description: 面试状态
 *               score:
 *                 type: number
 *                 description: 面试分数
 *               feedback:
 *                 type: string
 *                 description: 面试反馈
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.updateInterview);
/**
 * @swagger
 * /api/enrollment-interviews/{id}:
 *   delete:
 *     summary: 删除面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_INTERVIEW_MANAGE'), enrollmentInterviewController.deleteInterview);
exports["default"] = router;
