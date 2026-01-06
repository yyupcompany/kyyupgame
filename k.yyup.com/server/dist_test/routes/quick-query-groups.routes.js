"use strict";
/**
 * 快捷查询分组路由
 * 提供 /查询 命令的快捷选择功能API
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var quick_query_groups_service_1 = require("../services/ai/quick-query-groups.service");
var apiResponse_1 = require("../utils/apiResponse");
var logger_1 = require("../utils/logger");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/quick-query-groups:
 *   get:
 *     summary: 获取所有快捷查询分组
 *     description: 获取所有快捷查询分组，用于 /查询 命令的分组选择
 *     tags: [快捷查询]
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         description: 分组ID
 *                       name:
 *                         type: string
 *                         description: 分组名称
 *                       icon:
 *                         type: string
 *                         description: 分组图标
 *                       description:
 *                         type: string
 *                         description: 分组描述
 *                       queries:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             keyword:
 *                               type: string
 *                               description: 查询关键词
 *                             description:
 *                               type: string
 *                               description: 查询描述
 *                             tokens:
 *                               type: number
 *                               description: 预估token消耗
 *                             category:
 *                               type: string
 *                               description: 查询类别
 */
router.get('/', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var groups;
    return __generator(this, function (_a) {
        try {
            logger_1.logger.info('[快捷查询分组] 获取所有分组');
            groups = quick_query_groups_service_1.quickQueryGroupsService.getAllGroups();
            apiResponse_1.ApiResponse.success(res, groups, '获取快捷查询分组成功');
        }
        catch (error) {
            logger_1.logger.error('[快捷查询分组] 获取分组失败:', error);
            apiResponse_1.ApiResponse.error(res, '获取快捷查询分组失败', 'QUERY_GROUPS_ERROR', 500);
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/quick-query-groups/overview:
 *   get:
 *     summary: 获取快捷查询分组概览
 *     description: 获取快捷查询分组概览信息，不包含具体查询列表
 *     tags: [快捷查询]
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/overview', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var overview;
    return __generator(this, function (_a) {
        try {
            logger_1.logger.info('[快捷查询分组] 获取分组概览');
            overview = quick_query_groups_service_1.quickQueryGroupsService.getGroupsOverview();
            apiResponse_1.ApiResponse.success(res, overview, '获取快捷查询分组概览成功');
        }
        catch (error) {
            logger_1.logger.error('[快捷查询分组] 获取分组概览失败:', error);
            apiResponse_1.ApiResponse.error(res, '获取快捷查询分组概览失败', 'QUERY_GROUPS_OVERVIEW_ERROR', 500);
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/quick-query-groups/{groupId}:
 *   get:
 *     summary: 获取指定分组的查询列表
 *     description: 根据分组ID获取该分组下的所有查询关键词
 *     tags: [快捷查询]
 *     parameters:
 *       - name: groupId
 *         in: path
 *         required: true
 *         description: 分组ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 分组不存在
 */
router.get('/:groupId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var groupId, group;
    return __generator(this, function (_a) {
        try {
            groupId = req.params.groupId;
            logger_1.logger.info('[快捷查询分组] 获取分组查询:', { groupId: groupId });
            group = quick_query_groups_service_1.quickQueryGroupsService.getGroupById(groupId);
            if (!group) {
                apiResponse_1.ApiResponse.error(res, '分组不存在', 'GROUP_NOT_FOUND', 404);
                return [2 /*return*/];
            }
            apiResponse_1.ApiResponse.success(res, group, '获取分组查询成功');
        }
        catch (error) {
            logger_1.logger.error('[快捷查询分组] 获取分组查询失败:', error);
            apiResponse_1.ApiResponse.error(res, '获取分组查询失败', 'GROUP_QUERY_ERROR', 500);
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/quick-query-groups/search:
 *   get:
 *     summary: 搜索查询关键词
 *     description: 根据关键词搜索相关的查询
 *     tags: [快捷查询]
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 搜索成功
 */
router.get('/search', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var q, results;
    return __generator(this, function (_a) {
        try {
            q = req.query.q;
            if (!q || typeof q !== 'string') {
                apiResponse_1.ApiResponse.error(res, '搜索关键词不能为空', 'INVALID_SEARCH_KEYWORD', 400);
                return [2 /*return*/];
            }
            logger_1.logger.info('[快捷查询分组] 搜索查询:', { keyword: q });
            results = quick_query_groups_service_1.quickQueryGroupsService.searchQueries(q);
            apiResponse_1.ApiResponse.success(res, results, '搜索查询成功');
        }
        catch (error) {
            logger_1.logger.error('[快捷查询分组] 搜索查询失败:', error);
            apiResponse_1.ApiResponse.error(res, '搜索查询失败', 'SEARCH_QUERY_ERROR', 500);
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/quick-query-groups/category/{category}:
 *   get:
 *     summary: 根据类别获取查询
 *     description: 根据查询类别获取相关查询
 *     tags: [快捷查询]
 *     parameters:
 *       - name: category
 *         in: path
 *         required: true
 *         description: 查询类别
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/category/:category', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, results;
    return __generator(this, function (_a) {
        try {
            category = req.params.category;
            logger_1.logger.info('[快捷查询分组] 根据类别获取查询:', { category: category });
            results = quick_query_groups_service_1.quickQueryGroupsService.getQueriesByCategory(category);
            apiResponse_1.ApiResponse.success(res, results, '根据类别获取查询成功');
        }
        catch (error) {
            logger_1.logger.error('[快捷查询分组] 根据类别获取查询失败:', error);
            apiResponse_1.ApiResponse.error(res, '根据类别获取查询失败', 'CATEGORY_QUERY_ERROR', 500);
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
