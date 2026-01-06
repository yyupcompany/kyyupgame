"use strict";
exports.__esModule = true;
var express_1 = require("express");
var page_guide_section_controller_1 = require("../controllers/page-guide-section.controller");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/page-guide-sections:
 *   get:
 *     summary: 获取页面功能板块列表
 *     description: 获取所有页面功能板块
 *     tags:
 *       - 页面功能板块
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', page_guide_section_controller_1.PageGuideSectionController.getPageGuideSections);
/**
 * @swagger
 * /api/page-guide-sections:
 *   post:
 *     summary: 创建页面功能板块
 *     description: 创建新的页面功能板块
 *     tags:
 *       - 页面功能板块
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 创建成功
 */
router.post('/', page_guide_section_controller_1.PageGuideSectionController.createPageGuideSection);
/**
 * @swagger
 * /api/page-guide-sections/{id}:
 *   put:
 *     summary: 更新页面功能板块
 *     description: 更新指定的页面功能板块
 *     tags:
 *       - 页面功能板块
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
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id', page_guide_section_controller_1.PageGuideSectionController.updatePageGuideSection);
/**
 * @swagger
 * /api/page-guide-sections/{id}:
 *   delete:
 *     summary: 删除页面功能板块
 *     description: 删除指定的页面功能板块
 *     tags:
 *       - 页面功能板块
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 */
router["delete"]('/:id', page_guide_section_controller_1.PageGuideSectionController.deletePageGuideSection);
exports["default"] = router;
