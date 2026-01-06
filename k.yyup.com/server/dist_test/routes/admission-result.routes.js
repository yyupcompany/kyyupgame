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
 * 录取结果路由
 */
var express_1 = require("express");
var admissionResultController = __importStar(require("../controllers/admission-result.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/admission-results:
 *   post:
 *     summary: 创建录取结果
 *     tags: [录取结果]
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
 *               - studentName
 *               - parentId
 *               - planId
 *               - status
 *               - type
 *               - admissionDate
 *               - decisionMakerId
 *               - decisionDate
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 报名申请ID
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 分配班级ID
 *               status:
 *                 type: string
 *                 enum: [pending, admitted, rejected, waitlisted, confirmed, canceled]
 *                 description: 录取状态
 *               type:
 *                 type: string
 *                 enum: [regular, special, priority, transfer]
 *                 description: 录取类型
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: 录取日期
 *               score:
 *                 type: number
 *                 description: 评分
 *               rank:
 *                 type: integer
 *                 description: 排名
 *               interviewResult:
 *                 type: string
 *                 description: 面试结果
 *               interviewDate:
 *                 type: string
 *                 format: date
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               decisionMakerId:
 *                 type: integer
 *                 description: 决策者ID
 *               decisionDate:
 *                 type: string
 *                 format: date
 *                 description: 决策日期
 *               decisionReason:
 *                 type: string
 *                 description: 决策原因
 *               specialRequirements:
 *                 type: string
 *                 description: 特殊要求
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
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.createResult);
/**
 * @swagger
 * /api/admission-results:
 *   get:
 *     summary: 获取录取结果列表
 *     tags: [录取结果]
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
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 录取状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 录取类型
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: admissionDateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 录取开始日期
 *       - in: query
 *         name: admissionDateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 录取结束日期
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.getResults);
/**
 * @swagger
 * /api/admission-results/by-application/{applicationId}:
 *   get:
 *     summary: 按申请获取录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
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
router.get('/by-application/:applicationId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.getResultsByApplication);
/**
 * @swagger
 * /api/admission-results/by-class/{classId}:
 *   get:
 *     summary: 按班级获取录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 班级ID
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
router.get('/by-class/:classId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.getResultsByClass);
/**
 * @swagger
 * /api/admission-results/statistics:
 *   get:
 *     summary: 获取录取统计数据
 *     tags: [录取结果]
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
router.get('/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.getStatistics);
/**
 * @swagger
 * /api/admission-results/{id}:
 *   get:
 *     summary: 获取录取结果详情
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
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
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.getResultById);
/**
 * @swagger
 * /api/admission-results/{id}:
 *   put:
 *     summary: 更新录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 分配班级ID
 *               status:
 *                 type: string
 *                 enum: [pending, admitted, rejected, waitlisted, confirmed, canceled]
 *                 description: 录取状态
 *               type:
 *                 type: string
 *                 enum: [regular, special, priority, transfer]
 *                 description: 录取类型
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: 录取日期
 *               score:
 *                 type: number
 *                 description: 评分
 *               rank:
 *                 type: integer
 *                 description: 排名
 *               interviewResult:
 *                 type: string
 *                 description: 面试结果
 *               interviewDate:
 *                 type: string
 *                 format: date
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               decisionReason:
 *                 type: string
 *                 description: 决策原因
 *               specialRequirements:
 *                 type: string
 *                 description: 特殊要求
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
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.updateResult);
/**
 * @swagger
 * /api/admission-results/{id}:
 *   delete:
 *     summary: 删除录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
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
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ADMISSION_RESULT_MANAGE'), admissionResultController.deleteResult);
exports["default"] = router;
