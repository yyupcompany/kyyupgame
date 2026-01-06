"use strict";
/**
 * 字段模板路由
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var field_template_controller_1 = require("../controllers/field-template.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
/**
 * @route GET /api/field-templates/popular/:entityType
 * @desc 获取热门模板
 * @access Private
 */
router.get('/popular/:entityType', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.getPopularTemplates.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route GET /api/field-templates/recent
 * @desc 获取最近使用的模板
 * @access Private
 */
router.get('/recent', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.getRecentTemplates.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route POST /api/field-templates
 * @desc 创建字段模板
 * @access Private
 */
router.post('/', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.createTemplate.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route GET /api/field-templates
 * @desc 获取模板列表
 * @access Private
 */
router.get('/', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.getTemplateList.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route GET /api/field-templates/:id
 * @desc 获取模板详情
 * @access Private
 */
router.get('/:id', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.getTemplateById.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route POST /api/field-templates/:id/apply
 * @desc 应用模板
 * @access Private
 */
router.post('/:id/apply', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.applyTemplate.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route PUT /api/field-templates/:id
 * @desc 更新模板
 * @access Private
 */
router.put('/:id', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.updateTemplate.bind(field_template_controller_1.fieldTemplateController));
/**
 * @route DELETE /api/field-templates/:id
 * @desc 删除模板
 * @access Private
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, field_template_controller_1.fieldTemplateController.deleteTemplate.bind(field_template_controller_1.fieldTemplateController));
exports["default"] = router;
