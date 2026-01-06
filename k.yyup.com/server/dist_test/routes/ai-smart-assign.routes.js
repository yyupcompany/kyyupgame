"use strict";
/**
 * AI智能分配路由
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var aiSmartAssignController = __importStar(require("../controllers/ai-smart-assign.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
// 所有路由都需要认证
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/ai-smart-assign/smart-assign:
 *   post:
 *     summary: AI智能分配客户
 *     description: 使用AI算法智能分配客户给教师
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 分配成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/smart-assign', aiSmartAssignController.smartAssign);
/**
 * @swagger
 * /api/ai-smart-assign/batch-assign:
 *   post:
 *     summary: 执行批量分配
 *     description: 批量分配多个客户给教师
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 批量分配成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/batch-assign', aiSmartAssignController.batchAssign);
/**
 * @swagger
 * /api/ai-smart-assign/teacher-capacity:
 *   get:
 *     summary: 获取教师能力分析
 *     description: 获取教师的能力分析数据
 *     tags:
 *       - AI智能分配
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/teacher-capacity', aiSmartAssignController.getTeacherCapacity);
exports["default"] = router;
