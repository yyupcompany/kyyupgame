"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.deleteSystemConfig = exports.updateSystemConfig = exports.getSystemConfig = exports.createSystemConfig = exports.getSystemConfigs = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var init_1 = require("../init");
var system_config_service_1 = __importDefault(require("../services/system/system-config.service"));
// 获取数据库实例
var getSequelizeInstance = function () {
    return init_1.sequelize;
};
/**
 * @swagger
 * /api/system-configs:
 *   get:
 *     summary: 获取系统配置列表
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: query
 *         name: groupKey
 *         schema:
 *           type: string
 *         description: 配置分组键名
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: isSystem
 *         schema:
 *           type: boolean
 *         description: 是否系统配置
 *       - in: query
 *         name: isReadonly
 *         schema:
 *           type: boolean
 *         description: 是否只读配置
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: updated_at
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
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
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemConfig'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
var getSystemConfigs = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, totalPages, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = {
                    groupKey: req.query.groupKey,
                    keyword: req.query.keyword,
                    isSystem: req.query.isSystem ? req.query.isSystem === 'true' : undefined,
                    isReadonly: req.query.isReadonly ? req.query.isReadonly === 'true' : undefined,
                    page: req.query.page ? parseInt(req.query.page, 10) || 0 : 1,
                    pageSize: req.query.pageSize ? parseInt(req.query.pageSize, 10) || 0 : 10,
                    sortBy: req.query.sortBy || 'updated_at',
                    sortOrder: req.query.sortOrder || 'DESC'
                };
                return [4 /*yield*/, system_config_service_1["default"].getSystemConfigs(params)];
            case 1:
                result = _a.sent();
                totalPages = Math.ceil(result.count / params.pageSize);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: result.rows,
                        total: result.count,
                        page: params.page,
                        pageSize: params.pageSize,
                        totalPages: totalPages
                    })];
            case 2:
                error_1 = _a.sent();
                console.error('SystemConfig error:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取系统配置列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSystemConfigs = getSystemConfigs;
/**
 * @swagger
 * /api/system-configs:
 *   post:
 *     summary: 创建系统配置
 *     tags: [SystemConfigs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupKey
 *               - configKey
 *               - configValue
 *               - valueType
 *               - description
 *             properties:
 *               groupKey:
 *                 type: string
 *                 description: 配置分组键名
 *                 example: "system"
 *               configKey:
 *                 type: string
 *                 description: 配置项键名
 *                 example: "site_name"
 *               configValue:
 *                 type: string
 *                 description: 配置项值
 *                 example: "幼儿园管理系统"
 *               valueType:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *                 description: 值类型
 *                 example: "string"
 *               description:
 *                 type: string
 *                 description: 配置描述
 *                 example: "网站名称"
 *               isSystem:
 *                 type: boolean
 *                 description: 是否系统配置
 *                 default: false
 *               isReadonly:
 *                 type: boolean
 *                 description: 是否只读配置
 *                 default: false
 *               sortOrder:
 *                 type: integer
 *                 description: 排序顺序
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: 请求参数错误
 *       409:
 *         description: 配置键已存在
 */
var createSystemConfig = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, config, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                data = {
                    groupKey: req.body.groupKey,
                    configKey: req.body.configKey,
                    configValue: req.body.configValue,
                    valueType: req.body.valueType,
                    description: req.body.description,
                    isSystem: req.body.isSystem,
                    isReadonly: req.body.isReadonly,
                    sortOrder: req.body.sortOrder,
                    creatorId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id
                };
                return [4 /*yield*/, system_config_service_1["default"].createSystemConfig(data)];
            case 1:
                config = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config, '创建系统配置成功', 201)];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '创建系统配置失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createSystemConfig = createSystemConfig;
/**
 * @swagger
 * /api/system-configs/{id}:
 *   get:
 *     summary: 获取系统配置详情
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
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
 *                   $ref: '#/components/schemas/SystemConfig'
 *       404:
 *         description: 配置不存在
 */
var getSystemConfig = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, config, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id, 10) || 0;
                return [4 /*yield*/, system_config_service_1["default"].getSystemConfigById(id)];
            case 1:
                config = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config)];
            case 2:
                error_3 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取系统配置详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getSystemConfig = getSystemConfig;
/**
 * @swagger
 * /api/system-configs/{id}:
 *   put:
 *     summary: 更新系统配置
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupKey:
 *                 type: string
 *                 description: 配置分组键名
 *               configKey:
 *                 type: string
 *                 description: 配置项键名
 *               configValue:
 *                 type: string
 *                 description: 配置项值
 *               valueType:
 *                 type: string
 *                 enum: [string, number, boolean, json]
 *                 description: 值类型
 *               description:
 *                 type: string
 *                 description: 配置描述
 *               isSystem:
 *                 type: boolean
 *                 description: 是否系统配置
 *               isReadonly:
 *                 type: boolean
 *                 description: 是否只读配置
 *               sortOrder:
 *                 type: integer
 *                 description: 排序顺序
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemConfig'
 *       400:
 *         description: 请求参数错误或只读配置不能修改
 *       404:
 *         description: 配置不存在
 *       409:
 *         description: 配置键已存在
 */
var updateSystemConfig = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, data, config, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id, 10) || 0;
                data = __assign(__assign({}, req.body), { updaterId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id });
                return [4 /*yield*/, system_config_service_1["default"].updateSystemConfig(id, data)];
            case 1:
                config = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, config, '更新系统配置成功')];
            case 2:
                error_4 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '更新系统配置失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateSystemConfig = updateSystemConfig;
/**
 * @swagger
 * /api/system-configs/{id}:
 *   delete:
 *     summary: 删除系统配置
 *     tags: [SystemConfigs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 系统配置不能删除
 *       404:
 *         description: 配置不存在
 */
var deleteSystemConfig = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id, 10) || 0;
                return [4 /*yield*/, system_config_service_1["default"].deleteSystemConfig(id)];
            case 1:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除系统配置成功')];
            case 2:
                error_5 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '删除系统配置失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.deleteSystemConfig = deleteSystemConfig;
