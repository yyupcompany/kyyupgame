"use strict";
exports.__esModule = true;
var express_1 = require("express");
var organization_status_controller_1 = require("../controllers/organization-status.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/organization-status/default:
 *   get:
 *     summary: 获取默认幼儿园的机构现状
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取机构现状
 *       404:
 *         description: 系统中没有幼儿园数据
 */
router.get('/default', auth_middleware_1.authenticate, organization_status_controller_1.OrganizationStatusController.getDefaultStatus);
/**
 * @swagger
 * /api/organization-status/{kindergartenId}:
 *   get:
 *     summary: 获取指定幼儿园的机构现状
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 成功获取机构现状
 *       404:
 *         description: 幼儿园不存在
 */
router.get('/:kindergartenId', auth_middleware_1.authenticate, organization_status_controller_1.OrganizationStatusController.getStatus);
/**
 * @swagger
 * /api/organization-status/{kindergartenId}/refresh:
 *   post:
 *     summary: 刷新机构现状数据
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 数据刷新成功
 *       404:
 *         description: 幼儿园不存在
 */
router.post('/:kindergartenId/refresh', auth_middleware_1.authenticate, organization_status_controller_1.OrganizationStatusController.refreshStatus);
/**
 * @swagger
 * /api/organization-status/{kindergartenId}/ai-format:
 *   get:
 *     summary: 获取AI格式化的机构现状文本
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 成功获取AI格式化文本
 *       404:
 *         description: 幼儿园不存在
 */
router.get('/:kindergartenId/ai-format', auth_middleware_1.authenticate, organization_status_controller_1.OrganizationStatusController.getAIFormattedStatus);
exports["default"] = router;
