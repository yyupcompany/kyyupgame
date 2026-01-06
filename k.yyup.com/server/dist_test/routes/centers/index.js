"use strict";
/**
 * 中心聚合API路由索引
 * 统一管理所有中心的聚合API路由
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var activity_center_routes_1 = __importDefault(require("./activity-center.routes"));
var customer_pool_center_routes_1 = __importDefault(require("./customer-pool-center.routes"));
var router = (0, express_1.Router)();
// 活动中心聚合API
router.use('/activity', activity_center_routes_1["default"]);
// 客户池中心聚合API
router.use('/customer-pool', customer_pool_center_routes_1["default"]);
exports["default"] = router;
