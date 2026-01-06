"use strict";
exports.__esModule = true;
var express_1 = require("express");
var page_guide_controller_1 = require("../controllers/page-guide.controller");
var router = (0, express_1.Router)();
/**
 * 页面说明文档路由
 */
// 根据页面路径获取页面说明文档
router.get('/by-path/:pagePath', page_guide_controller_1.PageGuideController.getPageGuide);
// 获取页面说明文档列表
router.get('/', page_guide_controller_1.PageGuideController.getPageGuideList);
// 创建页面说明文档
router.post('/', page_guide_controller_1.PageGuideController.createPageGuide);
// 更新页面说明文档
router.put('/:id', page_guide_controller_1.PageGuideController.updatePageGuide);
// 删除页面说明文档
router["delete"]('/:id', page_guide_controller_1.PageGuideController.deletePageGuide);
// 批量创建营销中心页面感知配置（临时路由）
router.post('/create-marketing-guides', page_guide_controller_1.PageGuideController.createMarketingPageGuides);
// 快速创建剩余营销页面配置（临时路由）
router.post('/create-remaining-pages', page_guide_controller_1.PageGuideController.createRemainingMarketingPages);
exports["default"] = router;
