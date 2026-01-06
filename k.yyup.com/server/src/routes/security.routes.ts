/**
* @swagger
 * components:
 *   schemas:
 *     Security:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Security ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Security 名称
 *           example: "示例Security"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateSecurityRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Security 名称
 *           example: "新Security"
 *     UpdateSecurityRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Security 名称
 *           example: "更新后的Security"
 *     SecurityListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Security'
 *         message:
 *           type: string
 *           example: "获取security列表成功"
 *     SecurityResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Security'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * security管理路由文件
 * 提供security的基础CRUD操作
*
 * 功能包括：
 * - 获取security列表
 * - 创建新security
 * - 获取security详情
 * - 更新security信息
 * - 删除security
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 安全监控路由
 * 提供系统安全监控、威胁检测、安全配置等API
*/

import express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { SecurityService } from '../services/security.service';
import { SystemMonitorService } from '../services/system-monitor.service';

const router = express.Router();
const securityService = new SecurityService();
const systemMonitor = SystemMonitorService.getInstance();

/**
* @swagger
 * /api/security/overview:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全概览
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全概览
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 securityScore:
 *                   type: number
 *                   description: 安全评分 (0-100)
 *                 threatLevel:
 *                   type: string
 *                   enum: [low, medium, high, critical]
 *                 activeThreats:
 *                   type: number
 *                   description: 活跃威胁数量
 *                 vulnerabilities:
 *                   type: number
 *                   description: 漏洞数量
 *                 riskLevel:
 *                   type: number
 *                   description: 风险等级百分比
*/
router.get('/overview', verifyToken, permissionMiddleware(['SECURITY_VIEW']), async (req, res) => {
  try {
    const overview = await securityService.getSecurityOverview();
    return ApiResponse.success(res, overview, '获取安全概览成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取安全概览失败');
  }
});

/**
* @swagger
 * /api/security/threats:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取威胁列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *     responses:
 *       200:
 *         description: 成功获取威胁列表
*/
router.get('/threats', verifyToken, permissionMiddleware(['SECURITY_VIEW']), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, severity } = req.query;
    const threats = await securityService.getThreats({
      page: Number(page),
      pageSize: Number(pageSize),
      severity: severity as string
    });
    return ApiResponse.success(res, threats, '获取威胁列表成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取威胁列表失败');
  }
});

/**
* @swagger
 * /api/security/threats/{id}/handle:
 *   post:
 *     tags: [安全监控]
 *     summary: 处理威胁
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [resolve, ignore, block]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: 威胁处理成功
*/
router.post('/threats/:id/handle', verifyToken, permissionMiddleware(['SECURITY_MANAGE']), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const userId = (req as any).user?.id;
    
    const result = await securityService.handleThreat(id, action, notes, userId);
    return ApiResponse.success(res, result, '威胁处理成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '威胁处理失败');
  }
});

/**
* @swagger
 * /api/security/scan:
 *   post:
 *     tags: [安全监控]
 *     summary: 执行安全扫描
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scanType:
 *                 type: string
 *                 enum: [quick, full, custom]
 *                 default: quick
 *               targets:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 安全扫描启动成功
*/
router.post('/scan', verifyToken, permissionMiddleware(['SECURITY_SCAN']), async (req, res) => {
  try {
    const { scanType = 'quick', targets = [] } = req.body;
    const userId = (req as any).user?.id;

    const scanResult = await securityService.performSecurityScan(scanType, targets, userId);
    return ApiResponse.success(res, scanResult, '安全扫描启动成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '安全扫描失败');
  }
});

/**
* @swagger
 * /api/security/vulnerabilities:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取漏洞列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: severity
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, fixed, ignored]
 *     responses:
 *       200:
 *         description: 成功获取漏洞列表
*/
router.get('/vulnerabilities', verifyToken, permissionMiddleware(['SECURITY_VIEW']), async (req, res) => {
  try {
    const { page = 1, pageSize = 20, severity, status } = req.query;
    const vulnerabilities = await securityService.getVulnerabilities({
      page: Number(page),
      pageSize: Number(pageSize),
      severity: severity as string,
      status: status as string
    });
    return ApiResponse.success(res, vulnerabilities, '获取漏洞列表成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取漏洞列表失败');
  }
});

/**
* @swagger
 * /api/security/recommendations:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全建议
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全建议
*/
router.get('/recommendations', verifyToken, permissionMiddleware(['SECURITY_VIEW']), async (req, res) => {
  try {
    const recommendations = await securityService.getSecurityRecommendations();
    return ApiResponse.success(res, recommendations, '获取安全建议成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取安全建议失败');
  }
});

/**
* @swagger
 * /api/security/recommendations/generate:
 *   post:
 *     tags: [安全监控]
 *     summary: 生成AI安全建议
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI安全建议生成成功
*/
router.post('/recommendations/generate', verifyToken, permissionMiddleware(['SECURITY_MANAGE']), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const recommendations = await securityService.generateAIRecommendations(userId);
    return ApiResponse.success(res, recommendations, 'AI安全建议生成成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, 'AI安全建议生成失败');
  }
});

/**
* @swagger
 * /api/security/config:
 *   get:
 *     tags: [安全监控]
 *     summary: 获取安全配置
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取安全配置
*/
router.get('/config', verifyToken, permissionMiddleware(['SECURITY_CONFIG']), async (req, res) => {
  try {
    const config = await securityService.getSecurityConfig();
    return ApiResponse.success(res, config, '获取安全配置成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取安全配置失败');
  }
});

/**
* @swagger
 * /api/security/config:
 *   put:
 *     tags: [安全监控]
 *     summary: 更新安全配置
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               passwordPolicy:
 *                 type: object
 *               sessionTimeout:
 *                 type: number
 *               loginAttempts:
 *                 type: number
 *               enableMFA:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 安全配置更新成功
*/
router.put('/config', verifyToken, permissionMiddleware(['SECURITY_CONFIG']), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const config = await securityService.updateSecurityConfig(req.body, userId);
    return ApiResponse.success(res, config, '安全配置更新成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '安全配置更新失败');
  }
});

export default router;
