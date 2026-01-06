"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var script_category_controller_1 = __importDefault(require("../controllers/script-category.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 简化的路由定义
// 路由定义
router.get('/', auth_middleware_1.verifyToken, script_category_controller_1["default"].getCategories);
router.get('/stats', auth_middleware_1.verifyToken, script_category_controller_1["default"].getCategoryStats);
router.post('/init-default', auth_middleware_1.verifyToken, script_category_controller_1["default"].initDefaultCategories);
router.put('/sort', auth_middleware_1.verifyToken, script_category_controller_1["default"].updateCategoriesSort);
router.get('/:id', auth_middleware_1.verifyToken, script_category_controller_1["default"].getCategoryById);
router.post('/', auth_middleware_1.verifyToken, script_category_controller_1["default"].createCategory);
router.put('/:id', auth_middleware_1.verifyToken, script_category_controller_1["default"].updateCategory);
router["delete"]('/:id', auth_middleware_1.verifyToken, script_category_controller_1["default"].deleteCategory);
exports["default"] = router;
